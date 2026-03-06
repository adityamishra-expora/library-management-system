"""
Transaction Models for Library Management System.
Handles book borrowing, returns, and fine calculation.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Transaction(models.Model):
    """
    Represents a book borrowing transaction.
    - On borrow: status=borrowed, due_date = issue_date + LOAN_PERIOD_DAYS
    - On return: status=returned, fine calculated if overdue
    - Scheduled task can mark overdue transactions
    """

    class Status(models.TextChoices):
        BORROWED = 'borrowed', 'Borrowed'
        RETURNED = 'returned', 'Returned'
        OVERDUE = 'overdue', 'Overdue'

    # Relations
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions',
    )
    book = models.ForeignKey(
        'books.Book',
        on_delete=models.CASCADE,
        related_name='transactions',
    )

    # Dates
    issue_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField(blank=True, null=True)  # Set on save
    return_date = models.DateTimeField(blank=True, null=True)

    # Status & Fines
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.BORROWED)
    fine_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    # Optional notes (e.g., damage notes)
    notes = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-issue_date']

    def __str__(self) -> str:
        return f"{self.user.email} borrowed '{self.book.title}' on {self.issue_date.date()}"

    def save(self, *args, **kwargs):
        """Auto-set due_date on first save."""
        if not self.due_date:
            loan_period = getattr(settings, 'LOAN_PERIOD_DAYS', 14)
            self.due_date = self.issue_date + timedelta(days=loan_period)
        super().save(*args, **kwargs)

    def calculate_fine(self) -> float:
        """
        Calculate fine based on overdue days.
        Fine = FINE_PER_DAY × max(0, overdue_days)
        """
        fine_per_day = getattr(settings, 'FINE_PER_DAY', 5)
        check_date = self.return_date or timezone.now()

        if check_date > self.due_date:
            overdue_delta = check_date - self.due_date
            overdue_days = overdue_delta.days
            return fine_per_day * max(0, overdue_days)
        return 0.0

    @property
    def is_overdue(self) -> bool:
        """True if not returned and past due date."""
        if self.status == self.Status.RETURNED:
            return False
        return timezone.now() > self.due_date

    @property
    def overdue_days(self) -> int:
        """Number of days overdue (0 if not overdue)."""
        if not self.is_overdue:
            return 0
        delta = timezone.now() - self.due_date
        return max(0, delta.days)
