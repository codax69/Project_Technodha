from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or 'category'
            slug = base_slug
            counter = 1
            # Guard against different names slugifying to the same value
            # (e.g. "Cafe" and "Café"), which would otherwise raise an
            # unhandled IntegrityError on the unique `slug` column.
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                counter += 1
                slug = f"{base_slug}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    low_stock_threshold = models.PositiveIntegerField(
        default=5,
        help_text="Stock level at or below which this product is flagged as low stock."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(price__gte=0),
                name='product_price_non_negative'
            ),
            models.CheckConstraint(
                condition=models.Q(stock_quantity__gte=0),
                name='product_stock_quantity_non_negative'
            ),
        ]

    @property
    def is_orderable(self) -> bool:
        return self.is_active and self.stock_quantity > 0

    @property
    def is_low_stock(self) -> bool:
        return self.is_active and 0 < self.stock_quantity <= self.low_stock_threshold

    @property
    def is_out_of_stock(self) -> bool:
        return self.stock_quantity <= 0

    def check_availability(self, requested_quantity: int) -> dict:
        """
        Checks whether `requested_quantity` units of this product can be
        purchased right now, without mutating any state.

        Returns a dict describing the availability outcome, suitable for
        direct use in API responses.
        """
        errors = []
        if not self.is_active:
            errors.append(f"Product '{self.name}' is currently inactive.")
        elif self.stock_quantity < requested_quantity:
            errors.append(
                f"Insufficient stock for '{self.name}'. "
                f"Requested: {requested_quantity}, Available: {self.stock_quantity}."
            )

        return {
            'product_id': self.id,
            'product_name': self.name,
            'requested_quantity': requested_quantity,
            'available_stock': self.stock_quantity,
            'is_active': self.is_active,
            'is_available': not errors,
            'is_low_stock': self.is_low_stock,
            'messages': errors,
        }

    def __str__(self):
        return f"{self.name} (${self.price}) [Stock: {self.stock_quantity}]"
