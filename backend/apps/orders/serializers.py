from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductSerializer

class OrderItemRequestSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(min_value=1, required=True)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image_url = serializers.CharField(source='product.image_url', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_image_url', 'quantity', 'unit_price_at_purchase', 'subtotal')
        read_only_fields = fields

class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemRequestSerializer(many=True, required=True)

class OrderSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_number', 'customer', 'customer_username', 'status', 'total_price', 'items', 'created_at', 'updated_at')
        read_only_fields = ('id', 'order_number', 'customer', 'customer_username', 'total_price', 'items', 'created_at', 'updated_at')

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Enforces the documented order lifecycle: pending -> processing -> completed,
    with cancellation allowed from pending or processing. Completed/cancelled
    are terminal states. Re-submitting the current status is a harmless no-op.
    """
    VALID_TRANSITIONS = {
        Order.Status.PENDING: {Order.Status.PROCESSING, Order.Status.CANCELLED},
        Order.Status.PROCESSING: {Order.Status.COMPLETED, Order.Status.CANCELLED},
        Order.Status.COMPLETED: set(),
        Order.Status.CANCELLED: set(),
    }

    class Meta:
        model = Order
        fields = ('status',)

    def validate_status(self, value):
        current_status = self.instance.status if self.instance else None
        if current_status is not None and value != current_status:
            allowed = self.VALID_TRANSITIONS.get(current_status, set())
            if value not in allowed:
                raise serializers.ValidationError(
                    f"Cannot transition order from '{current_status}' to '{value}'."
                )
        return value
