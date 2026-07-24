import pytest
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User

@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()

    def test_user_registration(self):
        url = '/api/v1/auth/register/'
        payload = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Password123!',
            'role': 'customer'
        }
        res = self.client.post(url, payload)
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data['username'] == 'newuser'
        assert res.data['role'] == 'customer'

    def test_registration_ignores_client_supplied_admin_role(self):
        """Public registration must never allow privilege escalation to admin."""
        url = '/api/v1/auth/register/'
        payload = {
            'username': 'sneaky',
            'email': 'sneaky@example.com',
            'password': 'Password123!',
            'role': 'admin'
        }
        res = self.client.post(url, payload)
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data['role'] == 'customer'

        user = User.objects.get(username='sneaky')
        assert user.role == 'customer'
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_user_login_returns_jwt_and_user_info(self):
        user = User.objects.create_user(
            username='testuser', email='test@example.com', password='Password123!', role='admin'
        )
        url = '/api/v1/auth/login/'
        payload = {'username': 'testuser', 'password': 'Password123!'}
        res = self.client.post(url, payload)
        assert res.status_code == status.HTTP_200_OK
        assert 'access' in res.data
        assert 'refresh' in res.data
        assert res.data['user']['role'] == 'admin'
