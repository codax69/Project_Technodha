from decimal import Decimal
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import Order
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusUpdateSerializer
)
from .services import OrderService
from apps.products.models import Product
from apps.authentication.permissions import IsOwnerOrAdmin, IsAdminRole

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'total_price']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        
        # Enforce server-side isolation: Admin sees all, Customer sees ONLY their own orders
        if user.role == 'admin' or user.is_staff or user.is_superuser:
            return Order.objects.all().prefetch_related('items__product', 'customer')
        return Order.objects.filter(customer=user).prefetch_related('items__product', 'customer')

    @extend_schema(
        summary="Create a new order",
        request=OrderCreateSerializer,
        responses={201: OrderSerializer}
    )
    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = OrderService.create_order(
            customer=request.user,
            items_data=serializer.validated_data['items']
        )
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Cancel a pending order",
        responses={200: OrderSerializer}
    )
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()
        cancelled_order = OrderService.cancel_order(order, request.user)
        return Response(OrderSerializer(cancelled_order).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update order status (Admin only)",
        request=OrderStatusUpdateSerializer,
        responses={200: OrderSerializer}
    )
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole], url_path='status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data.get('status')
        
        if new_status == Order.Status.CANCELLED:
            # Route through cancel service for atomic restocking
            updated_order = OrderService.cancel_order(order, request.user)
        else:
            serializer.save()
            updated_order = order
            
        return Response(OrderSerializer(updated_order).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Get Dashboard Metrics",
        description="Returns role-specific analytics for Admin (products, low stock, revenue, order stats) or Customer (order summary)."
    )
    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard_metrics(self, request):
        user = request.user
        if user.role == 'admin' or user.is_staff or user.is_superuser:
            total_products = Product.objects.count()
            low_stock_products = Product.objects.filter(stock_quantity__lt=5, is_active=True).count()
            total_orders = Order.objects.count()
            
            revenue_data = Order.objects.exclude(status=Order.Status.CANCELLED).aggregate(
                total_revenue=Sum('total_price')
            )
            revenue = revenue_data['total_revenue'] or Decimal('0.00')

            status_counts = Order.objects.values('status').annotate(count=Count('id'))

            return Response({
                'role': 'admin',
                'total_products': total_products,
                'low_stock_products': low_stock_products,
                'total_orders': total_orders,
                'revenue': str(revenue),
                'orders_by_status': {item['status']: item['count'] for item in status_counts}
            })
        else:
            customer_orders = Order.objects.filter(customer=user)
            total_orders = customer_orders.count()
            recent_orders = OrderSerializer(customer_orders[:5], many=True).data
            
            spent_data = customer_orders.exclude(status=Order.Status.CANCELLED).aggregate(
                total_spent=Sum('total_price')
            )
            spent = spent_data['total_spent'] or Decimal('0.00')

            return Response({
                'role': 'customer',
                'total_orders': total_orders,
                'total_spent': str(spent),
                'recent_orders': recent_orders
            })
