from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from models import db, bcrypt, User, Product, Category, Cart, Order, Review, Message, Favorite, Payment
from config import config
from validators import validate_json, UserRegistrationSchema, UserLoginSchema, ProductSchema, CartItemSchema, ReviewSchema
from utils import paginate_query, handle_errors, add_security_headers, logger
import os

def create_app(config_name='production'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize Sentry for error monitoring
    if app.config.get('SENTRY_DSN'):
        sentry_sdk.init(
            dsn=app.config['SENTRY_DSN'],
            integrations=[FlaskIntegration()],
            traces_sample_rate=1.0
        )
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    
    # Rate limiting
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )
    limiter.init_app(app)
    
    # CORS with strict settings
    CORS(app, 
         origins=os.environ.get('ALLOWED_ORIGINS', '').split(','),
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'])
    
    api = Api(app)
    
    # Add security headers to all responses
    @app.after_request
    def after_request(response):
        return add_security_headers(response)
    
    # Health check endpoint
    class HealthCheck(Resource):
        def get(self):
            try:
                db.session.execute('SELECT 1')
                return {'status': 'healthy', 'database': 'connected'}
            except Exception as e:
                logger.error(f"Health check failed: {e}")
                return {'status': 'unhealthy', 'database': 'disconnected'}, 503
    
    # Authentication Routes with validation and rate limiting
    class AuthRegister(Resource):
        decorators = [limiter.limit("5 per minute")]
        
        @validate_json(UserRegistrationSchema)
        @handle_errors
        def post(self):
            data = request.validated_data
            
            if User.query.filter_by(email=data['email']).first():
                return {'error': 'Email already exists'}, 400
            
            user = User(
                full_name=data['full_name'],
                email=data['email'],
                role=data['role']
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            access_token = create_access_token(identity=user.id)
            logger.info(f"User registered: {user.email}")
            
            return {
                'user': user.to_dict(),
                'authenticated': True,
                'access_token': access_token
            }
    
    class AuthLogin(Resource):
        decorators = [limiter.limit("10 per minute")]
        
        @validate_json(UserLoginSchema)
        @handle_errors
        def post(self):
            data = request.validated_data
            user = User.query.filter_by(email=data['email']).first()
            
            if user and user.check_password(data['password']):
                access_token = create_access_token(identity=user.id)
                logger.info(f"User logged in: {user.email}")
                
                return {
                    'user': user.to_dict(),
                    'authenticated': True,
                    'access_token': access_token
                }
            
            logger.warning(f"Failed login attempt: {data['email']}")
            return {'error': 'Invalid credentials'}, 401
    
    class AuthSession(Resource):
        @jwt_required()
        @handle_errors
        def get(self):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user:
                return {'authenticated': True, 'user': user.to_dict()}
            return {'authenticated': False}, 401
    
    # Product Routes with pagination
    class ProductList(Resource):
        @handle_errors
        def get(self):
            query = Product.query.filter_by(status='active')
            
            # Search functionality
            search = request.args.get('search')
            if search:
                query = query.filter(Product.title.contains(search))
            
            # Category filter
            category = request.args.get('category')
            if category:
                query = query.filter_by(category=category)
            
            return paginate_query(query)
        
        @jwt_required()
        @validate_json(ProductSchema)
        @handle_errors
        def post(self):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if user.role != 'artisan':
                return {'error': 'Artisan access required'}, 403
            
            data = request.validated_data
            product = Product(
                title=data['title'],
                description=data['description'],
                price=data['price'],
                category=data.get('category'),
                subcategory=data.get('subcategory'),
                stock=data.get('stock', 0),
                image=data.get('image'),
                artisan_id=user_id
            )
            
            db.session.add(product)
            db.session.commit()
            
            logger.info(f"Product created: {product.title} by {user.email}")
            return product.to_dict(), 201
    
    class ProductDetail(Resource):
        @handle_errors
        def get(self, product_id):
            product = Product.query.get_or_404(product_id)
            return product.to_dict()
        
        @jwt_required()
        @validate_json(ProductSchema)
        @handle_errors
        def put(self, product_id):
            user_id = get_jwt_identity()
            product = Product.query.get_or_404(product_id)
            
            if product.artisan_id != user_id:
                return {'error': 'Unauthorized'}, 403
            
            data = request.validated_data
            for key, value in data.items():
                if hasattr(product, key) and key not in ['id', 'artisan_id']:
                    setattr(product, key, value)
            
            db.session.commit()
            logger.info(f"Product updated: {product.title}")
            return product.to_dict()
    
    # Cart Routes with validation
    class CartList(Resource):
        @jwt_required()
        @handle_errors
        def get(self):
            user_id = get_jwt_identity()
            cart_items = Cart.query.filter_by(user_id=user_id).all()
            return [item.to_dict() for item in cart_items]
        
        @jwt_required()
        @validate_json(CartItemSchema)
        @handle_errors
        def post(self):
            user_id = get_jwt_identity()
            data = request.validated_data
            
            # Check if product exists and is available
            product = Product.query.get_or_404(data['product_id'])
            if product.stock < data['quantity']:
                return {'error': 'Insufficient stock'}, 400
            
            existing_item = Cart.query.filter_by(
                user_id=user_id,
                product_id=data['product_id']
            ).first()
            
            if existing_item:
                existing_item.quantity += data['quantity']
            else:
                cart_item = Cart(
                    user_id=user_id,
                    product_id=data['product_id'],
                    quantity=data['quantity']
                )
                db.session.add(cart_item)
            
            db.session.commit()
            return {'success': True}, 201
    
    # Review Routes with validation
    class ReviewList(Resource):
        @jwt_required()
        @validate_json(ReviewSchema)
        @handle_errors
        def post(self):
            user_id = get_jwt_identity()
            data = request.validated_data
            
            # Check if user already reviewed this product
            existing_review = Review.query.filter_by(
                product_id=data['product_id'],
                user_id=user_id
            ).first()
            
            if existing_review:
                return {'error': 'You have already reviewed this product'}, 400
            
            review = Review(
                product_id=data['product_id'],
                user_id=user_id,
                rating=data['rating'],
                comment=data.get('comment')
            )
            
            db.session.add(review)
            db.session.commit()
            
            logger.info(f"Review created for product {data['product_id']}")
            return review.to_dict(), 201
    
    class ProductReviews(Resource):
        @handle_errors
        def get(self, product_id):
            query = Review.query.filter_by(product_id=product_id)
            return paginate_query(query)
    
    # Register routes
    api.add_resource(HealthCheck, '/health')
    api.add_resource(AuthRegister, '/auth/register')
    api.add_resource(AuthLogin, '/auth/login')
    api.add_resource(AuthSession, '/auth/session')
    api.add_resource(ProductList, '/products/')
    api.add_resource(ProductDetail, '/products/<int:product_id>')
    api.add_resource(CartList, '/cart/')
    api.add_resource(ReviewList, '/reviews/')
    api.add_resource(ProductReviews, '/reviews/product/<int:product_id>')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))