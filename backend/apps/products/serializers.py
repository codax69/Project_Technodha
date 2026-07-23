from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')
        read_only_fields = ('id', 'slug')

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    is_orderable = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'description', 'price', 'stock_quantity',
            'category', 'category_detail', 'image_url', 'is_active',
            'low_stock_threshold', 'is_orderable', 'is_low_stock',
            'is_out_of_stock', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'is_orderable', 'is_low_stock', 'is_out_of_stock',
            'created_at', 'updated_at'
        )

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value

class StockUpdateSerializer(serializers.Serializer):
    stock_quantity = serializers.IntegerField(min_value=0, required=True)

class ProductAvailabilityItemSerializer(serializers.Serializer):
    """A single product/quantity pair to validate, e.g. one cart line item."""
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(min_value=1, required=True)

class ProductAvailabilityCheckSerializer(serializers.Serializer):
    """Request payload for bulk product availability/stock checking."""
    items = ProductAvailabilityItemSerializer(many=True, required=True, allow_empty=False)
