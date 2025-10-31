#!/usr/bin/env python3
"""
Development server for SokoDigital API
"""
from flask import Flask
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from models import db, bcrypt, User, Product, Category, Cart, Order, Review, Message, Favorite, Payment
from sqlalchemy import Numeric
import os

# Development configuration
class DevConfig:
    SECRET_KEY = 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///soko_dev.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'dev-jwt-secret-key'

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevConfig)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    CORS(app, supports_credentials=True)
    api = Api(app)
    
    # API Status
    class APIStatus(Resource):
        def get(self):
            return {
                'message': 'SokoDigital API is running!', 
                'status': 'success',
                'version': '1.0.0'
            }
    
    # Auth Routes
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
    
    class AuthSession(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user:
                return {'authenticated': True, 'user': user.to_dict()}
            return {'authenticated': False}
    
    # Product Routes
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
    
    class ProductDetail(Resource):
        def get(self, product_id):
            product = Product.query.get_or_404(product_id)
            return product.to_dict()
    
    # Cart Routes
    class CartList(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            cart_items = Cart.query.filter_by(user_id=user_id).all()
            return [item.to_dict() for item in cart_items]
        
        @jwt_required()
        def post(self):
            from flask import request
            user_id = get_jwt_identity()
            data = request.get_json()
            
            existing_item = Cart.query.filter_by(
                user_id=user_id, 
                product_id=data['product_id']
            ).first()
            
            if existing_item:
                existing_item.quantity += data.get('quantity', 1)
            else:
                cart_item = Cart(
                    user_id=user_id,
                    product_id=data['product_id'],
                    quantity=data.get('quantity', 1)
                )
                db.session.add(cart_item)
            
            db.session.commit()
            return {'success': True}
    
    # Register routes
    api.add_resource(APIStatus, '/')
    api.add_resource(AuthRegister, '/auth/register')
    api.add_resource(AuthLogin, '/auth/login')
    api.add_resource(AuthSession, '/auth/session')
    api.add_resource(ProductList, '/products/')
    api.add_resource(ProductDetail, '/products/<int:product_id>')
    api.add_resource(CartList, '/cart/')
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create sample data if none exists
        if User.query.count() == 0:
            # Create test artisan
            artisan = User(
                full_name='Sarah Johnson',
                email='artisan@soko.com',
                role='artisan',
                location='Nairobi, Kenya',
                description='Master ceramic artist specializing in traditional Kenyan pottery'
            )
            artisan.set_password('password123')
            db.session.add(artisan)
            
            # Create test buyer
            buyer = User(
                full_name='John Doe',
                email='buyer@soko.com',
                role='buyer',
                location='Mombasa, Kenya'
            )
            buyer.set_password('password123')
            db.session.add(buyer)
            
            db.session.commit()
            
            # Create sample products
            products = [
                Product(
                    title='Handcrafted Ceramic Vase',
                    description='Beautiful blue-green ceramic vase made with traditional techniques',
                    price=2500.00,
                    category='ceramics',
                    subcategory='decorative',
                    stock=5,
                    image='https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
                    artisan_id=artisan.id
                ),
                Product(
                    title='Woven Basket Set',
                    description='Set of 3 traditional woven baskets perfect for storage',
                    price=1800.00,
                    category='textiles',
                    subcategory='functional',
                    stock=8,
                    image='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
                    artisan_id=artisan.id
                ),
                Product(
                    title='Wooden Sculpture',
                    description='Hand-carved wooden sculpture depicting African wildlife',
                    price=3200.00,
                    category='woodwork',
                    subcategory='decorative',
                    stock=3,
                    image='https://images.unsplash.com/photo-1544967882-6abec37be2b4?w=400&h=400&fit=crop',
                    artisan_id=artisan.id
                )
            ]
            
            for product in products:
                db.session.add(product)
            
            db.session.commit()
            print("✅ Sample data created!")
    
    print("\n🚀 SokoDigital Development Server Starting...")
    print("📍 Server running at: http://localhost:5000")
    print("\n📋 Available Endpoints:")
    print("  GET  /                    - API Status")
    print("  POST /auth/register       - Register User")
    print("  POST /auth/login          - Login User")
    print("  GET  /auth/session        - Check Session (requires JWT)")
    print("  GET  /products/           - List Products")
    print("  POST /products/           - Create Product (requires JWT)")
    print("  GET  /products/<id>       - Get Product Details")
    print("  GET  /cart/               - Get Cart Items (requires JWT)")
    print("  POST /cart/               - Add to Cart (requires JWT)")
    print("\n🧪 Test Credentials:")
    print("  Artisan: artisan@soko.com / password123")
    print("  Buyer:   buyer@soko.com / password123")
    print("\n💡 Use Authorization header: Bearer <your_jwt_token>")
    
    app.run(debug=True, host='0.0.0.0', port=5000)