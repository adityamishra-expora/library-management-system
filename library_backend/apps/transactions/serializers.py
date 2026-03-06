"""
Transaction Serializers for Library Management System.
"""

from django.utils import timezone
from rest_framework import serializers
from .models import Transaction
from apps.books.serializers import BookListSerializer
from apps.users.serializers import UserListSerializer


class TransactionListSerializer(serializers.ModelSerializer):
    """Compact serializer for transaction list views."""

    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    overdue_days = serializers.ReadOnlyField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'book', 'book_title', 'book_author',
            'user', 'user_email', 'user_name',
            'issue_date', 'due_date', 'return_date',
            'status', 'fine_amount', 'is_overdue', 'overdue_days',
            'created_at'
        ]


class TransactionDetailSerializer(serializers.ModelSerializer):
    """Full transaction detail with nested book and user."""

    book_detail = BookListSerializer(source='book', read_only=True)
    user_detail = UserListSerializer(source='user', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    overdue_days = serializers.ReadOnlyField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'book', 'book_detail',
            'user', 'user_detail',
            'issue_date', 'due_date', 'return_date',
            'status', 'fine_amount', 'notes',
            'is_overdue', 'overdue_days',
            'created_at', 'updated_at'
        ]


class BorrowBookSerializer(serializers.Serializer):
    """Serializer for borrowing a book."""

    book_id = serializers.IntegerField()

    def validate_book_id(self, value: int):
        """Check book exists and is available."""
        from apps.books.models import Book
        try:
            book = Book.objects.get(id=value)
        except Book.DoesNotExist:
            raise serializers.ValidationError('Book not found.')

        if not book.is_available:
            raise serializers.ValidationError(
                f'No copies of "{book.title}" are currently available.'
            )
        return value

    def validate(self, attrs):
        """Prevent a user from borrowing the same book twice."""
        user = self.context['request'].user
        book_id = attrs['book_id']

        already_borrowed = Transaction.objects.filter(
            user=user,
            book_id=book_id,
            status__in=[Transaction.Status.BORROWED, Transaction.Status.OVERDUE],
        ).exists()

        if already_borrowed:
            raise serializers.ValidationError(
                {'book_id': 'You already have an active borrow for this book.'}
            )
        return attrs


class ReturnBookSerializer(serializers.Serializer):
    """Serializer for returning a book."""

    transaction_id = serializers.IntegerField()

    def validate_transaction_id(self, value: int):
        """Check transaction exists and belongs to the user."""
        request = self.context['request']
        try:
            txn = Transaction.objects.select_related('book').get(id=value)
        except Transaction.DoesNotExist:
            raise serializers.ValidationError('Transaction not found.')

        # Students can only return their own books
        if request.user.role == 'student' and txn.user != request.user:
            raise serializers.ValidationError('Permission denied.')

        if txn.status == Transaction.Status.RETURNED:
            raise serializers.ValidationError('This book has already been returned.')

        return value
