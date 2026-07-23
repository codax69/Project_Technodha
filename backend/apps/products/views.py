from django.db.models import ProtectedError
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    StockUpdateSerializer,
    ProductAvailabilityCheckSerializer,
)
from apps.authentication.permissions import IsAdminRole

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete this category because one or more products still reference it."},
                status=status.HTTP_409_CONFLICT
            )

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'category__slug', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'stock_quantity', 'created_at', 'name']

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.all().select_related('category')
        # If not admin, return only active products
        if not (user and user.is_authenticated and (user.role == 'admin' or user.is_staff or user.is_superuser)):
            queryset = queryset.filter(is_active=True)
        return queryset

    def perform_destroy(self, instance):
        """
        Soft-delete only: deactivate the product instead of removing the row.
        This preserves referential integrity for existing OrderItems (which
        PROTECT their Product FK) and matches the API contract, which treats
        DELETE as `is_active = False` rather than a hard delete.
        """
        instance.is_active = False
        instance.save(update_fields=['is_active', 'updated_at'])

    @extend_schema(
        summary="Update product stock quantity directly",
        request=StockUpdateSerializer,
        responses={200: ProductSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole], url_path='stock')
    def update_stock(self, request, pk=None):
        product = self.get_object()
        serializer = StockUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product.stock_quantity = serializer.validated_data['stock_quantity']
        product.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Check availability of a single product",
        description=(
            "Checks whether the requested quantity of this product is "
            "currently active and in stock, without reserving/decrementing it."
        ),
        parameters=[
            OpenApiParameter(
                name='quantity',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Quantity to check availability for (default: 1)."
            )
        ],
    )
    @action(detail=True, methods=['get'], url_path='check-availability')
    def check_availability(self, request, pk=None):
        product = self.get_object()
        try:
            quantity = int(request.query_params.get('quantity', 1))
        except (TypeError, ValueError):
            return Response(
                {"quantity": "Quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if quantity < 1:
            return Response(
                {"quantity": "Quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(product.check_availability(quantity), status=status.HTTP_200_OK)

    @extend_schema(
        summary="Check availability for multiple products (bulk/cart check)",
        description=(
            "Validates a list of {product_id, quantity} pairs (e.g. a cart) "
            "and reports per-item availability plus an overall flag, without "
            "reserving/decrementing any stock. Useful for pre-checkout validation."
        ),
        request=ProductAvailabilityCheckSerializer,
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='check-stock')
    def check_stock(self, request):
        serializer = ProductAvailabilityCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data['items']
        product_ids = {item['product_id'] for item in items}
        # Reuse the same visibility rules as list/retrieve so a customer can't
        # use this bulk endpoint to enumerate inactive/hidden products.
        products_map = {p.id: p for p in self.get_queryset().filter(id__in=product_ids)}

        results = []
        for item in items:
            product = products_map.get(item['product_id'])
            if product is None:
                results.append({
                    'product_id': item['product_id'],
                    'product_name': None,
                    'requested_quantity': item['quantity'],
                    'available_stock': 0,
                    'is_active': False,
                    'is_available': False,
                    'is_low_stock': False,
                    'messages': [f"Product with ID {item['product_id']} does not exist."],
                })
            else:
                results.append(product.check_availability(item['quantity']))

        return Response({
            'all_available': all(r['is_available'] for r in results),
            'results': results,
        }, status=status.HTTP_200_OK)
