import random
import string
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.products.models import Product

def generate_unique_order_number():
    """Generates a random unique readable order reference code (e.g. TH-ORD-20260724-A8F2)."""
    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"TH-ORD-{date_str}-{random_str}"

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    order_number = models.CharField(
        max_length=32,
        unique=True,
        default=generate_unique_order_number,
        db_index=True,
        help_text="Unique readable order reference ID"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} ({self.id}) - {self.customer.username} - {self.status} (₹{self.total_price})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField()
    unit_price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name='order_item_quantity_positive'
            ),
        ]

    def __str__(self):
        return f"OrderItem #{self.id}: {self.quantity} x {self.product.name} @ ${self.unit_price_at_purchase}"
