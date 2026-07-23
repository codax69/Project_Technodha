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

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'description', 'price', 'stock_quantity',
            'category', 'category_detail', 'image_url', 'is_active',
            'is_orderable', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'is_orderable', 'created_at', 'updated_at')

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
