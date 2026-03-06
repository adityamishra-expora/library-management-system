"""
Custom Permissions for Library Management System.
Role-based access control: Admin > Librarian > Student
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Allow access only to Admin users."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsLibrarianOrAdmin(BasePermission):
    """Allow access to Librarian or Admin users."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ('admin', 'librarian')
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow access to the owner of the object or Admins."""

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin can access any object
        if request.user.role == 'admin':
            return True
        # User can only access their own objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # For user profile objects
        return obj == request.user


class IsLibrarianAdminOrReadOnly(BasePermission):
    """
    Allow Admins/Librarians full access.
    Allow authenticated students read-only access.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('admin', 'librarian')
