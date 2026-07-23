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
        fields = ('id', 'customer', 'customer_username', 'status', 'total_price', 'items', 'created_at', 'updated_at')
        read_only_fields = ('id', 'customer', 'customer_username', 'total_price', 'items', 'created_at', 'updated_at')

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('status',)
