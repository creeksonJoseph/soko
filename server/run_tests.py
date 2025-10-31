#!/usr/bin/env python3
"""
Automated test script using pytest for backend API testing.
Run with: python run_tests.py
"""
import pytest
import requests
import json
from flask import Flask
from models import db, User, Product, Category
from app import create_app
import tempfile
import os

class TestSokoDigitalAPI:
    """Test class for SokoDigital API endpoints"""

    @pytest.fixture(scope='class')
    def app(self):
        """Create test app with test database"""
        app = create_app('testing')
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()

    @pytest.fixture(scope='class')
    def client(self, app):
        """Test client"""
        return app.test_client()

    @pytest.fixture(scope='class')
    def test_data(self, app):
        """Create test data"""
        with app.app_context():
            # Create test category
            category = Category(name='Test Category', description='Test category')
            db.session.add(category)

            # Create test artisan
            artisan = User(
                full_name='Test Artisan',
                email='artisan@test.com',
                role='artisan',
                location='Test Location'
            )
            artisan.set_password('password123')
            db.session.add(artisan)

            # Create test buyer
            buyer = User(
                full_name='Test Buyer',
                email='buyer@test.com',
                role='buyer'
            )
            buyer.set_password('password123')
            db.session.add(buyer)

            # Create test product
            product = Product(
                title='Test Product',
                description='Test product description',
                price=100.00,
                category='Test Category',
                stock=10,
                artisan_id=1  # Will be set after commit
            )
            db.session.add(product)

            db.session.commit()

            # Update product with correct artisan_id
            product.artisan_id = artisan.id
            db.session.commit()

            return {
                'category': category,
                'artisan': artisan,
                'buyer': buyer,
                'product': product
            }

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'healthy'

    def test_get_categories(self, client):
        """Test get categories"""
        response = client.get('/categories/')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_products(self, client):
        """Test get products"""
        response = client.get('/products/')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_user_registration(self, client):
        """Test user registration"""
        user_data = {
            'full_name': 'New User',
            'email': 'newuser@test.com',
            'password': 'password123',
            'role': 'buyer'
        }
        response = client.post('/auth/register',
                             json=user_data,
                             content_type='application/json')
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['email'] == 'newuser@test.com'

    def test_user_login(self, client, test_data):
        """Test user login"""
        login_data = {
            'email': 'buyer@test.com',
            'password': 'password123'
        }
        response = client.post('/auth/login',
                             json=login_data,
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert 'authenticated' in data
        assert data['authenticated'] == True

    def test_create_product(self, client, test_data):
        """Test create product (requires authentication)"""
        # First login to get session
        with client:
            login_data = {
                'email': 'artisan@test.com',
                'password': 'password123'
            }
            login_response = client.post('/auth/login',
                                       json=login_data,
                                       content_type='application/json')
            assert login_response.status_code == 200

            # Now create product
            product_data = {
                'title': 'New Test Product',
                'description': 'New test product description',
                'price': 200.00,
                'category': 'Test Category',
                'stock': 5
            }
            response = client.post('/products/',
                                 json=product_data,
                                 content_type='application/json')
            assert response.status_code == 201
            data = json.loads(response.data)
            assert 'product' in data
            assert data['product']['title'] == 'New Test Product'

    def test_add_to_cart(self, client, test_data):
        """Test add to cart"""
        with client:
            # Login first
            login_data = {
                'email': 'buyer@test.com',
                'password': 'password123'
            }
            login_response = client.post('/auth/login',
                                       json=login_data,
                                       content_type='application/json')
            assert login_response.status_code == 200

            # Add to cart
            cart_data = {
                'product_id': test_data['product'].id,
                'quantity': 2
            }
            response = client.post('/cart/',
                                 json=cart_data,
                                 content_type='application/json')
            assert response.status_code == 201
            data = json.loads(response.data)
            assert 'success' in data
            assert data['success'] == True

    def test_get_cart(self, client, test_data):
        """Test get cart items"""
        with client:
            # Login first
            login_data = {
                'email': 'buyer@test.com',
                'password': 'password123'
            }
            login_response = client.post('/auth/login',
                                       json=login_data,
                                       content_type='application/json')
            assert login_response.status_code == 200

            # Get cart
            response = client.get('/cart/')
            assert response.status_code == 200
            data = json.loads(response.data)
            assert isinstance(data, list)
            assert len(data) > 0  # Should have the item we added

    def test_create_review(self, client, test_data):
        """Test create review"""
        with client:
            # Login first
            login_data = {
                'email': 'buyer@test.com',
                'password': 'password123'
            }
            login_response = client.post('/auth/login',
                                       json=login_data,
                                       content_type='application/json')
            assert login_response.status_code == 200

            # Create review
            review_data = {
                'product_id': test_data['product'].id,
                'rating': 5,
                'comment': 'Great product!'
            }
            response = client.post('/reviews/',
                                 json=review_data,
                                 content_type='application/json')
            assert response.status_code == 201
            data = json.loads(response.data)
            assert 'review' in data
            assert data['review']['rating'] == 5

if __name__ == '__main__':
    # Run tests
    pytest.main([__file__, '-v'])
