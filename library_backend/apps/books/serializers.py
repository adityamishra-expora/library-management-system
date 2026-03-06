"""
Book Serializers for Library Management System.
"""

from rest_framework import serializers
from .models import Book, Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for book categories."""

    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'book_count', 'created_at']

    def get_book_count(self, obj) -> int:
        return obj.books.count()


class BookListSerializer(serializers.ModelSerializer):
    """Compact serializer for book list view."""

    category_name = serializers.CharField(source='category.name', read_only=True)
    is_available = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'category', 'category_name',
            'total_copies', 'available_copies', 'is_available', 'created_at'
        ]


class BookDetailSerializer(serializers.ModelSerializer):
    """Full serializer for book detail view."""

    category_name = serializers.CharField(source='category.name', read_only=True)
    is_available = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'category', 'category_name',
            'description', 'publisher', 'publication_year', 'cover_image',
            'total_copies', 'available_copies', 'is_available',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'available_copies', 'created_at', 'updated_at']


class BookCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating books (Librarian/Admin only)."""

    class Meta:
        model = Book
        fields = [
            'title', 'author', 'isbn', 'category', 'description',
            'publisher', 'publication_year', 'total_copies', 'cover_image'
        ]

    def validate_isbn(self, value: str) -> str:
        """Strip dashes and validate ISBN length."""
        cleaned = value.replace('-', '').replace(' ', '')
        if len(cleaned) not in (10, 13):
            raise serializers.ValidationError('ISBN must be 10 or 13 digits.')
        return cleaned

    def validate_total_copies(self, value: int) -> int:
        if value < 1:
            raise serializers.ValidationError('Must have at least 1 copy.')
        return value

    def create(self, validated_data):
        """On creation, available_copies = total_copies."""
        total = validated_data.get('total_copies', 1)
        validated_data['available_copies'] = total
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """When total_copies changes, adjust available_copies proportionally."""
        old_total = instance.total_copies
        new_total = validated_data.get('total_copies', old_total)

        if new_total != old_total:
            borrowed = old_total - instance.available_copies
            new_available = max(0, new_total - borrowed)
            validated_data['available_copies'] = new_available

        return super().update(instance, validated_data)
