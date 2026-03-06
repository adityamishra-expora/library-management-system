"""
Admin Configuration for Transactions app.
"""

from django.contrib import admin
from django.utils import timezone
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'book', 'issue_date', 'due_date',
        'return_date', 'status', 'fine_amount', 'is_overdue'
    ]
    list_filter = ['status', 'issue_date', 'due_date']
    search_fields = ['user__email', 'user__first_name', 'book__title', 'book__isbn']
    readonly_fields = ['created_at', 'updated_at', 'fine_amount']
    ordering = ['-issue_date']
    date_hierarchy = 'issue_date'

    def is_overdue(self, obj) -> bool:
        return obj.is_overdue
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue?'

    actions = ['mark_as_returned', 'mark_as_overdue']

    def mark_as_returned(self, request, queryset):
        """Bulk mark selected transactions as returned."""
        for txn in queryset.filter(status__in=['borrowed', 'overdue']):
            txn.return_date = timezone.now()
            txn.status = Transaction.Status.RETURNED
            txn.fine_amount = txn.calculate_fine()
            txn.save()
            txn.book.return_book()
        self.message_user(request, 'Selected transactions marked as returned.')
    mark_as_returned.short_description = 'Mark selected as returned'

    def mark_as_overdue(self, request, queryset):
        """Bulk mark selected transactions as overdue."""
        queryset.filter(status='borrowed').update(status=Transaction.Status.OVERDUE)
        self.message_user(request, 'Selected transactions marked as overdue.')
    mark_as_overdue.short_description = 'Mark selected as overdue'
