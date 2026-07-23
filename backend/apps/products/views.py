from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, StockUpdateSerializer
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
