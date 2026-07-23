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

    def test_product_list_supports_limit_offset_pagination(self):
        for i in range(15):
            Product.objects.create(
                name=f'Product {i}', price=Decimal('10.00'), stock_quantity=10, category=self.category
            )

        res = self.customer_client.get('/api/products/?limit=5&offset=0')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['count'] == 15
        assert len(res.data['results']) == 5
        assert res.data['next'] is not None

        res_page2 = self.customer_client.get('/api/products/?limit=5&offset=5')
        assert res_page2.status_code == status.HTTP_200_OK
        assert len(res_page2.data['results']) == 5
        # Ensure the offset actually moved the window (different items than page 1)
        ids_page1 = {p['id'] for p in res.data['results']}
        ids_page2 = {p['id'] for p in res_page2.data['results']}
        assert ids_page1.isdisjoint(ids_page2)

    def test_check_availability_single_product_success(self):
        product = Product.objects.create(
            name='Headphones', price=Decimal('50.00'), stock_quantity=10, category=self.category
        )
        res = self.customer_client.get(f'/api/products/{product.id}/check-availability/?quantity=3')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['is_available'] is True
        assert res.data['available_stock'] == 10
        assert res.data['requested_quantity'] == 3

    def test_check_availability_single_product_insufficient_stock(self):
        product = Product.objects.create(
            name='Keyboard', price=Decimal('30.00'), stock_quantity=2, category=self.category
        )
        res = self.customer_client.get(f'/api/products/{product.id}/check-availability/?quantity=5')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['is_available'] is False
        assert len(res.data['messages']) == 1

    def test_check_stock_bulk_endpoint(self):
        in_stock = Product.objects.create(
            name='Monitor', price=Decimal('150.00'), stock_quantity=10, category=self.category
        )
        low_stock = Product.objects.create(
            name='Webcam', price=Decimal('40.00'), stock_quantity=1, category=self.category, low_stock_threshold=5
        )

        payload = {
            'items': [
                {'product_id': in_stock.id, 'quantity': 2},
                {'product_id': low_stock.id, 'quantity': 100},
                {'product_id': 999999, 'quantity': 1},
            ]
        }
        res = self.customer_client.post('/api/products/check-stock/', payload, format='json')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['all_available'] is False
        results_by_id = {r['product_id']: r for r in res.data['results']}
        assert results_by_id[in_stock.id]['is_available'] is True
        assert results_by_id[low_stock.id]['is_available'] is False
        assert results_by_id[999999]['is_available'] is False
