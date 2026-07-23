import pytest
from decimal import Decimal
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User
from apps.products.models import Category, Product

@pytest.mark.django_db
class TestProducts:
    def setup_method(self):
        self.admin = User.objects.create_user(
            username='adminuser', email='admin@test.com', password='Password123!', role='admin'
        )
        self.customer = User.objects.create_user(
            username='custuser', email='cust@test.com', password='Password123!', role='customer'
        )
        self.category = Category.objects.create(name='Gadgets')

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)

        self.customer_client = APIClient()
        self.customer_client.force_authenticate(user=self.customer)

    def test_customer_cannot_create_product(self):
        url = '/api/products/'
        payload = {
            'name': 'Hacker Product',
            'price': '10.00',
            'stock_quantity': 5,
            'category': self.category.id
        }
        res = self.customer_client.post(url, payload)
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_create_and_update_stock(self):
        url = '/api/products/'
        payload = {
            'name': 'Smart Watch',
            'price': '299.99',
            'stock_quantity': 20,
            'category': self.category.id
        }
        res = self.admin_client.post(url, payload)
        assert res.status_code == status.HTTP_201_CREATED
        product_id = res.data['id']

        # Update stock via admin endpoint
        stock_url = f'/api/products/{product_id}/stock/'
        stock_res = self.admin_client.post(stock_url, {'stock_quantity': 45})
        assert stock_res.status_code == status.HTTP_200_OK
        assert stock_res.data['stock_quantity'] == 45
