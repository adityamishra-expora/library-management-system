"""
URL Configuration for Transactions app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BorrowBookView, ReturnBookView, MyTransactionsView, TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transactions')

urlpatterns = [
    path('borrow/', BorrowBookView.as_view(), name='borrow_book'),
    path('return/', ReturnBookView.as_view(), name='return_book'),
    path('my-transactions/', MyTransactionsView.as_view(), name='my_transactions'),
    path('', include(router.urls)),
]
