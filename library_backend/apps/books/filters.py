"""
Django Filters for Book search and filtering.
"""

import django_filters
from .models import Book


class BookFilter(django_filters.FilterSet):
    """Advanced filter set for books."""

    title = django_filters.CharFilter(lookup_expr='icontains')
    author = django_filters.CharFilter(lookup_expr='icontains')
    isbn = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.NumberFilter(field_name='category__id')
    category_name = django_filters.CharFilter(field_name='category__name', lookup_expr='icontains')
    available_only = django_filters.BooleanFilter(
        field_name='available_copies',
        method='filter_available_only',
        label='Available copies only',
    )
    publication_year = django_filters.NumberFilter()
    publication_year_gte = django_filters.NumberFilter(field_name='publication_year', lookup_expr='gte')
    publication_year_lte = django_filters.NumberFilter(field_name='publication_year', lookup_expr='lte')

    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'category', 'publication_year']

    def filter_available_only(self, queryset, name, value):
        if value:
            return queryset.filter(available_copies__gt=0)
        return queryset
