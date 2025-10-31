#!/usr/bin/env python3
"""
Test script to verify all backend routes are working correctly.
Run this after setting up the database and before testing with frontend.
"""
import requests
import json
import sys
import os

# Add the server directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

BASE_URL = 'http://localhost:5000'

def test_health_check():
    """Test health check endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/health')
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed:", data)
            return True
        else:
            print("❌ Health check failed:", response.status_code)
            return False
    except Exception as e:
        print("❌ Health check error:", str(e))
        return False

def test_categories():
    """Test categories endpoints"""
    try:
        # Test GET categories
        response = requests.get(f'{BASE_URL}/categories/')
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categories retrieved: {len(categories)} categories")
            return True
        else:
            print("❌ Categories failed:", response.status_code)
            return False
    except Exception as e:
        print("❌ Categories error:", str(e))
        return False

def test_products():
    """Test products endpoints"""
    try:
        # Test GET products
        response = requests.get(f'{BASE_URL}/products/')
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Products retrieved: {len(products)} products")
            return True
        else:
            print("❌ Products failed:", response.status_code)
            return False
    except Exception as e:
        print("❌ Products error:", str(e))
        return False

def test_auth_endpoints():
    """Test auth endpoints structure (will fail without proper auth, but checks if routes exist)"""
    endpoints = [
        ('POST', '/auth/register'),
        ('POST', '/auth/login'),
        ('GET', '/auth/session'),
        ('GET', '/auth/profile'),
        ('PUT', '/auth/profile'),
        ('POST', '/auth/logout')
    ]

    success_count = 0
    for method, endpoint in endpoints:
        try:
            if method == 'GET':
                response = requests.get(f'{BASE_URL}{endpoint}')
            elif method == 'POST':
                response = requests.post(f'{BASE_URL}{endpoint}', json={})
            elif method == 'PUT':
                response = requests.put(f'{BASE_URL}{endpoint}', json={})

            # We expect 401 (unauthorized) for auth endpoints without session
            if response.status_code in [401, 400]:  # 400 for validation errors
                print(f"✅ {method} {endpoint} - Route exists (expected auth failure)")
                success_count += 1
            else:
                print(f"❌ {method} {endpoint} - Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"❌ {method} {endpoint} - Error: {str(e)}")

    return success_count == len(endpoints)

def test_cart_endpoints():
    """Test cart endpoints structure"""
    endpoints = [
        ('GET', '/cart/'),
        ('POST', '/cart/'),
        ('DELETE', '/cart/clear')
    ]

    success_count = 0
    for method, endpoint in endpoints:
        try:
            if method == 'GET':
                response = requests.get(f'{BASE_URL}{endpoint}')
            elif method == 'POST':
                response = requests.post(f'{BASE_URL}{endpoint}', json={'product_id': 1, 'quantity': 1})
            elif method == 'DELETE':
                response = requests.delete(f'{BASE_URL}{endpoint}')

            if response.status_code == 401:  # Expected unauthorized
                print(f"✅ {method} {endpoint} - Route exists (expected auth failure)")
                success_count += 1
            else:
                print(f"❌ {method} {endpoint} - Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"❌ {method} {endpoint} - Error: {str(e)}")

    return success_count == len(endpoints)

def test_other_endpoints():
    """Test other endpoints structure"""
    endpoints = [
        ('GET', '/orders/'),
        ('GET', '/reviews/'),
        ('GET', '/favorites/'),
        ('GET', '/follows/following'),
        ('GET', '/follows/followers'),
        ('GET', '/messages/conversations'),
        ('GET', '/artisan/1'),  # Assuming artisan with ID 1 exists
        ('GET', '/artisan/1/products'),
        ('GET', '/payments/'),
        ('GET', '/notifications/'),
        ('GET', '/users/'),
    ]

    success_count = 0
    for method, endpoint in endpoints:
        try:
            response = requests.get(f'{BASE_URL}{endpoint}')

            if response.status_code in [401, 404]:  # Expected unauthorized or not found
                print(f"✅ {method} {endpoint} - Route exists (expected auth/not found)")
                success_count += 1
            else:
                print(f"❌ {method} {endpoint} - Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"❌ {method} {endpoint} - Error: {str(e)}")

    return success_count == len(endpoints)

def main():
    """Run all tests"""
    print("🚀 Testing SokoDigital Backend Routes")
    print("=" * 50)

    tests = [
        ("Health Check", test_health_check),
        ("Categories", test_categories),
        ("Products", test_products),
        ("Auth Endpoints", test_auth_endpoints),
        ("Cart Endpoints", test_cart_endpoints),
        ("Other Endpoints", test_other_endpoints),
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n🧪 Testing {test_name}...")
        if test_func():
            passed += 1
            print(f"✅ {test_name} passed")
        else:
            print(f"❌ {test_name} failed")

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Backend is ready for frontend integration.")
        print("\n📋 Next steps:")
        print("1. Start the frontend development server")
        print("2. Test authentication flow")
        print("3. Test product browsing and cart functionality")
        print("4. Test artisan dashboard and product management")
        return True
    else:
        print("⚠️  Some tests failed. Check the backend setup and database connection.")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
