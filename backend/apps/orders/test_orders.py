import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User
from apps.products.models import Category, Product
from apps.orders.models import Order, OrderItem
from apps.orders.services import OrderService

@pytest.mark.django_db
class TestOrderBusinessLogic:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.admin = User.objects.create_user(
            username='adminuser', email='admin@test.com', password='Password123!', role=User.Role.ADMIN
        )
        self.customer1 = User.objects.create_user(
            username='customer1', email='cust1@test.com', password='Password123!', role=User.Role.CUSTOMER
        )
        self.customer2 = User.objects.create_user(
            username='customer2', email='cust2@test.com', password='Password123!', role=User.Role.CUSTOMER
        )
        self.category = Category.objects.create(name='Electronics')
        self.product1 = Product.objects.create(
            name='Laptop', price=Decimal('1000.00'), stock_quantity=10, category=self.category
        )
        self.product2 = Product.objects.create(
            name='Mouse', price=Decimal('25.00'), stock_quantity=5, category=self.category
        )
        self.zero_stock_product = Product.objects.create(
            name='Out of Stock Phone', price=Decimal('500.00'), stock_quantity=0, category=self.category
        )

        self.client1 = APIClient()
        self.client1.force_authenticate(user=self.customer1)

        self.client2 = APIClient()
        self.client2.force_authenticate(user=self.customer2)

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)

    def test_order_creation_success_and_stock_decrement(self):
        """Test standard order placement decrements stock and calculates server total accurately."""
        order = OrderService.create_order(
            customer=self.customer1,
            items_data=[
                {'product_id': self.product1.id, 'quantity': 2},
                {'product_id': self.product2.id, 'quantity': 1}
            ]
        )

        assert order.status == Order.Status.PENDING
        assert order.total_price == Decimal('2025.00')

        # Verify stock decrement in DB
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        assert self.product1.stock_quantity == 8
        assert self.product2.stock_quantity == 4

    def test_order_creation_rejects_insufficient_stock(self):
        """Test whole order rejection if item exceeds current stock quantity."""
        with pytest.raises(Exception) as exc_info:
            OrderService.create_order(
                customer=self.customer1,
                items_data=[
                    {'product_id': self.product1.id, 'quantity': 1},
                    {'product_id': self.product2.id, 'quantity': 100} # Exceeds stock (5)
                ]
            )
        assert 'insufficient stock' in str(exc_info.value).lower()

        # Verify no stock was decremented due to rollback
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        assert self.product1.stock_quantity == 10
        assert self.product2.stock_quantity == 5

    def test_zero_stock_product_not_orderable(self):
        """Test zero stock product is rejected during order creation."""
        with pytest.raises(Exception):
            OrderService.create_order(
                customer=self.customer1,
                items_data=[{'product_id': self.zero_stock_product.id, 'quantity': 1}]
            )

    def test_order_cancellation_restocks_items_atomically(self):
        """Test cancelling a pending order restocks item quantities back to products."""
        order = OrderService.create_order(
            customer=self.customer1,
            items_data=[
                {'product_id': self.product1.id, 'quantity': 3}
            ]
        )
        self.product1.refresh_from_db()
        assert self.product1.stock_quantity == 7

        # Cancel order
        OrderService.cancel_order(order, self.customer1)
        
        order.refresh_from_db()
        self.product1.refresh_from_db()
        assert order.status == Order.Status.CANCELLED
        assert self.product1.stock_quantity == 10 # Restocked!

    def test_admin_can_progress_order_through_valid_transitions(self):
        """pending -> processing -> completed is the only sanctioned forward path."""
        order = OrderService.create_order(
            customer=self.customer1,
            items_data=[{'product_id': self.product1.id, 'quantity': 1}]
        )
        url = f'/api/orders/{order.id}/status/'

        res1 = self.admin_client.patch(url, {'status': 'processing'})
        assert res1.status_code == status.HTTP_200_OK
        assert res1.data['status'] == 'processing'

        res2 = self.admin_client.patch(url, {'status': 'completed'})
        assert res2.status_code == status.HTTP_200_OK
        assert res2.data['status'] == 'completed'

    def test_admin_cannot_skip_or_reverse_order_status(self):
        """Illegal transitions (skipping stages or reversing) must be rejected."""
        order = OrderService.create_order(
            customer=self.customer1,
            items_data=[{'product_id': self.product1.id, 'quantity': 1}]
        )
        url = f'/api/orders/{order.id}/status/'

        # Cannot jump straight from pending to completed, skipping processing.
        res = self.admin_client.patch(url, {'status': 'completed'})
        assert res.status_code == status.HTTP_400_BAD_REQUEST

        # Progress legitimately, then attempt an illegal reversal.
        self.admin_client.patch(url, {'status': 'processing'})
        self.admin_client.patch(url, {'status': 'completed'})
        reversal_res = self.admin_client.patch(url, {'status': 'pending'})
        assert reversal_res.status_code == status.HTTP_400_BAD_REQUEST

        order.refresh_from_db()
        assert order.status == Order.Status.COMPLETED

    def test_customer_cannot_view_another_customers_order(self):
        """Test order history privacy: customer2 cannot read customer1's order."""
        order1 = OrderService.create_order(
            customer=self.customer1,
            items_data=[{'product_id': self.product2.id, 'quantity': 1}]
        )

        # Customer 1 list API sees order 1
        res1 = self.client1.get('/api/orders/')
        assert res1.status_code == status.HTTP_200_OK
        order_ids1 = [o['id'] for o in res1.data['results']]
        assert order1.id in order_ids1

        # Customer 2 list API does NOT see order 1
        res2 = self.client2.get('/api/orders/')
        assert res2.status_code == status.HTTP_200_OK
        order_ids2 = [o['id'] for o in res2.data['results']]
        assert order1.id not in order_ids2

        # Customer 2 direct detail GET fails with 404 or permission error
        detail_res = self.client2.get(f'/api/orders/{order1.id}/')
        assert detail_res.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]
