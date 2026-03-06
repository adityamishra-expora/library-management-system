"""
Admin Configuration for Books app.
"""

from django.contrib import admin
from .models import Book, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'isbn', 'category',
        'total_copies', 'available_copies', 'is_available', 'created_at'
    ]
    list_filter = ['category', 'publication_year', 'created_at']
    search_fields = ['title', 'author', 'isbn']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['title']

    fieldsets = (
        ('Book Information', {
            'fields': ('title', 'author', 'isbn', 'category', 'description', 'cover_image')
        }),
        ('Publication Details', {
            'fields': ('publisher', 'publication_year')
        }),
        ('Inventory', {
            'fields': ('total_copies', 'available_copies')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
