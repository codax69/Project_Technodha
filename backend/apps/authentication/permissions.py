from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Permission check for Admin role users only.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )

class IsCustomerRole(permissions.BasePermission):
    """
    Permission check for Customer role users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'customer'
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to allow customers to read/modify only their own objects,
    while Admins retain access to all objects.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser:
            return True
            
        # Match customer field on object (Order, etc.)
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif obj == request.user:
            return True
            
        return False
