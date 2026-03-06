"""
Transaction Views for Library Management System.
Handles borrow, return, history, and admin overview.
"""

from django.utils import timezone
from django.db import transaction as db_transaction
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Transaction
from .serializers import (
    TransactionListSerializer,
    TransactionDetailSerializer,
    BorrowBookSerializer,
    ReturnBookSerializer,
)
from apps.users.permissions import IsLibrarianOrAdmin, IsAdmin
from apps.books.models import Book


# ─── Filter ──────────────────────────────────────────────────────────────────

class TransactionFilter(django_filters.FilterSet):
    """Filter transactions by status, user, book, date ranges."""

    status = django_filters.ChoiceFilter(choices=Transaction.Status.choices)
    user = django_filters.NumberFilter(field_name='user__id')
    book = django_filters.NumberFilter(field_name='book__id')
    issue_date_gte = django_filters.DateTimeFilter(field_name='issue_date', lookup_expr='gte')
    issue_date_lte = django_filters.DateTimeFilter(field_name='issue_date', lookup_expr='lte')

    class Meta:
        model = Transaction
        fields = ['status', 'user', 'book']


# ─── Views ───────────────────────────────────────────────────────────────────

class BorrowBookView(generics.GenericAPIView):
    """
    POST /api/borrow/
    Borrow a book. Creates a transaction and decrements available_copies.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BorrowBookSerializer

    @db_transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        book = Book.objects.select_for_update().get(id=serializer.validated_data['book_id'])

        # Deduct available copy (raises if unavailable)
        book.borrow()

        # Create transaction record
        txn = Transaction.objects.create(user=request.user, book=book)

        return Response(
            {
                'message': f'Successfully borrowed "{book.title}".',
                'transaction': TransactionDetailSerializer(txn).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ReturnBookView(generics.GenericAPIView):
    """
    POST /api/return/
    Return a borrowed book. Calculates and records any fine.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ReturnBookSerializer

    @db_transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        txn = Transaction.objects.select_related('book').select_for_update().get(
            id=serializer.validated_data['transaction_id']
        )

        # Mark return
        txn.return_date = timezone.now()
        txn.status = Transaction.Status.RETURNED
        txn.fine_amount = txn.calculate_fine()
        txn.save()

        # Restore available copy
        txn.book.return_book()

        return Response(
            {
                'message': f'Successfully returned "{txn.book.title}".',
                'fine_amount': float(txn.fine_amount),
                'transaction': TransactionDetailSerializer(txn).data,
            },
            status=status.HTTP_200_OK,
        )


class MyTransactionsView(generics.ListAPIView):
    """
    GET /api/my-transactions/
    Returns the authenticated user's borrowing history.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionListSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['issue_date', 'due_date', 'status']
    ordering = ['-issue_date']

    def get_queryset(self):
        return Transaction.objects.select_related('book', 'user').filter(
            user=self.request.user
        )


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/transactions/       — All transactions (librarian/admin)
    GET /api/transactions/{id}/  — Transaction detail (librarian/admin)
    """
    permission_classes = [IsAuthenticated, IsLibrarianOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = ['user__email', 'user__first_name', 'book__title', 'book__isbn']
    ordering_fields = ['issue_date', 'due_date', 'status', 'fine_amount']
    ordering = ['-issue_date']

    def get_queryset(self):
        return Transaction.objects.select_related('book', 'user').all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TransactionDetailSerializer
        return TransactionListSerializer

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue_list(self, request):
        """GET /api/transactions/overdue/ — List all overdue transactions."""
        now = timezone.now()
        qs = self.get_queryset().filter(
            status__in=[Transaction.Status.BORROWED, Transaction.Status.OVERDUE],
            due_date__lt=now,
        )
        # Bulk-mark as overdue
        qs.update(status=Transaction.Status.OVERDUE)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = TransactionListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TransactionListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """GET /api/transactions/stats/ — Borrowing statistics (admin only)."""
        if request.user.role != 'admin':
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        total = Transaction.objects.count()
        borrowed = Transaction.objects.filter(status=Transaction.Status.BORROWED).count()
        returned = Transaction.objects.filter(status=Transaction.Status.RETURNED).count()
        overdue = Transaction.objects.filter(status=Transaction.Status.OVERDUE).count()

        from django.db.models import Sum
        total_fines = Transaction.objects.aggregate(total=Sum('fine_amount'))['total'] or 0

        return Response({
            'total_transactions': total,
            'currently_borrowed': borrowed,
            'returned': returned,
            'overdue': overdue,
            'total_fines_collected': float(total_fines),
        })
