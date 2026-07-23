from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        CUSTOMER = 'customer', 'Customer'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        help_text="Role determining user permissions."
    )
    email = models.EmailField(unique=True)

    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN or self.is_staff or self.is_superuser

    def is_customer(self) -> bool:
        return self.role == self.Role.CUSTOMER

    def save(self, *args, **kwargs):
        if self.is_superuser or self.is_staff:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"
