"""
Book Views for Library Management System.
Full CRUD for books with search, filter, and pagination.
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Book, Category
from .serializers import (
    BookListSerializer,
    BookDetailSerializer,
    BookCreateUpdateSerializer,
    CategorySerializer,
)
from .filters import BookFilter
from apps.users.permissions import IsLibrarianAdminOrReadOnly, IsLibrarianOrAdmin


class BookViewSet(viewsets.ModelViewSet):
    """
    GET    /api/books/       — List books (search, filter, paginate)
    POST   /api/books/       — Add book (librarian/admin only)
    GET    /api/books/{id}/  — Book detail
    PUT    /api/books/{id}/  — Full update (librarian/admin only)
    PATCH  /api/books/{id}/  — Partial update (librarian/admin only)
    DELETE /api/books/{id}/  — Delete book (librarian/admin only)
    """

    queryset = Book.objects.select_related('category').all()
    permission_classes = [IsAuthenticated, IsLibrarianAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BookFilter
    search_fields = ['title', 'author', 'isbn', 'description', 'category__name']
    ordering_fields = ['title', 'author', 'created_at', 'available_copies']
    ordering = ['title']

    def get_serializer_class(self):
        """Use different serializers for list vs detail vs create/update."""
        if self.action == 'list':
            return BookListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return BookCreateUpdateSerializer
        return BookDetailSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], url_path='available')
    def available_books(self, request):
        """GET /api/books/available/ — List only books with available copies."""
        qs = self.get_queryset().filter(available_copies__gt=0)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = BookListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = BookListSerializer(qs, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET    /api/categories/       — List all categories
    POST   /api/categories/       — Add category (librarian/admin)
    GET    /api/categories/{id}/  — Category detail
    PUT    /api/categories/{id}/  — Update (librarian/admin)
    DELETE /api/categories/{id}/  — Delete (librarian/admin)
    """

    queryset = Category.objects.prefetch_related('books').all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsLibrarianAdminOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
