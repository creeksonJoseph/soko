#!/usr/bin/env python3
"""
Test the API without PostgreSQL - using SQLite for testing
"""
from flask import Flask
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, create_refresh_token
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from models import db, bcrypt, User, Product, Category, Subcategory, Cart, Order, OrderItem, Review, Message, Favorite, Follow, Payment, Notification
import os

# Test configuration
class TestConfig:
    SECRET_KEY = 'test-secret-key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test_soko.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'test-jwt-secret'

def create_test_app():
    app = Flask(__name__)
    app.config.from_object(TestConfig)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    CORS(app, supports_credentials=True)
    api = Api(app)
    
    # Test route
    class TestAPI(Resource):
        def get(self):
            return {'message': 'SokoDigital API is running!', 'status': 'success'}
    
    # Auth routes
    class AuthLogin(Resource):
        def post(self):
            from flask import request
            data = request.get_json()
            user = User.query.filter_by(email=data['email']).first()
            
            if user and user.check_password(data['password']):
                access_token = create_access_token(identity=user.id)
                return {
                    'user': user.to_dict(), 
                    'authenticated': True,
                    'access_token': access_token
                }
            return {'error': 'Invalid credentials'}, 401
    
    class AuthRegister(Resource):
        def post(self):
            from flask import request
            data = request.get_json()
            
            if User.query.filter_by(email=data['email']).first():
                return {'error': 'Email already exists'}, 400
            
            user = User(
                full_name=data['full_name'],
                email=data['email'],
                role=data.get('role', 'buyer')
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            access_token = create_access_token(identity=user.id)
            return {
                'user': user.to_dict(), 
                'authenticated': True,
                'access_token': access_token
            }
    
    class ProductList(Resource):
        def get(self):
            products = Product.query.all()
            return [product.to_dict() for product in products]
        
        @jwt_required()
        def post(self):
            from flask import request
            user_id = get_jwt_identity()
            data = request.get_json()
            product = Product(
                title=data['title'],
                description=data['description'],
                price=data['price'],
                category=data.get('category'),
                subcategory=data.get('subcategory'),
                stock=data.get('stock', 10),
                image=data.get('image'),
                artisan_id=user_id
            )
            
            db.session.add(product)
            db.session.commit()
            return product.to_dict()
    
    # Register routes
    api.add_resource(TestAPI, '/')
    api.add_resource(AuthLogin, '/auth/login')
    api.add_resource(AuthRegister, '/auth/register')
    api.add_resource(ProductList, '/products/')
    
    return app

if __name__ == '__main__':
    app = create_test_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create test data
        if not User.query.filter_by(email='test@example.com').first():
            test_user = User(
                full_name='Test Artisan',
                email='test@example.com',
                role='artisan'
            )
            test_user.set_password('password123')
            db.session.add(test_user)
            
            test_product = Product(
                title='Test Ceramic Vase',
                description='Beautiful handmade ceramic vase',
                price=2500.00,
                category='ceramics',
                subcategory='decorative',
                stock=5,
                artisan_id=1
            )
            db.session.add(test_product)
            db.session.commit()
            print("Test data created!")
    
    print("Starting SokoDigital API server...")
    print("Test endpoints:")
    print("- GET  /                 - API status")
    print("- POST /auth/register    - Register user")
    print("- POST /auth/login       - Login user")
    print("- GET  /products/        - List products")
    print("- POST /products/        - Create product (requires auth)")
    
    app.run(debug=True, host='0.0.0.0', port=5000)