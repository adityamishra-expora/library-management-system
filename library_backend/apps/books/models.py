"""
Book Models for Library Management System.
"""

from django.db import models
from django.core.validators import MinValueValidator


class Category(models.Model):
    """Book category/genre model."""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class Book(models.Model):
    """
    Book model with inventory tracking.
    available_copies is auto-calculated on save.
    """

    title = models.CharField(max_length=255, db_index=True)
    author = models.CharField(max_length=255, db_index=True)
    isbn = models.CharField(max_length=13, unique=True, db_index=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books',
    )
    description = models.TextField(blank=True, null=True)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    publication_year = models.PositiveIntegerField(blank=True, null=True)
    cover_image = models.ImageField(upload_to='book_covers/', blank=True, null=True)

    # Inventory
    total_copies = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    available_copies = models.PositiveIntegerField(default=1, validators=[MinValueValidator(0)])

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'books'
        verbose_name = 'Book'
        verbose_name_plural = 'Books'
        ordering = ['title']

    def __str__(self) -> str:
        return f"{self.title} by {self.author}"

    def save(self, *args, **kwargs):
        """Ensure available_copies never exceeds total_copies."""
        if self.available_copies > self.total_copies:
            self.available_copies = self.total_copies
        super().save(*args, **kwargs)

    @property
    def is_available(self) -> bool:
        """True if at least one copy is available for borrowing."""
        return self.available_copies > 0

    def borrow(self):
        """Decrement available copies when borrowed. Raises if unavailable."""
        if self.available_copies <= 0:
            raise ValueError(f'No copies of "{self.title}" are available.')
        self.available_copies -= 1
        self.save(update_fields=['available_copies'])

    def return_book(self):
        """Increment available copies when returned."""
        if self.available_copies < self.total_copies:
            self.available_copies += 1
            self.save(update_fields=['available_copies'])
