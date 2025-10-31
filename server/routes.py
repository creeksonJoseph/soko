from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, create_refresh_token
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from models import db, bcrypt, User, Product, Category, Subcategory, Cart, Order, OrderItem, Review, Message, Favorite, Follow, Payment, Notification
from config import config
import os

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    CORS(app, supports_credentials=True)
    api = Api(app)
    
    # Authentication Routes
    class AuthLogin(Resource):
        def post(self):
            data = request.get_json()
            user = User.query.filter_by(email=data['email']).first()
            
            if user and user.check_password(data['password']):
                access_token = create_access_token(identity=user.id)
                refresh_token = create_refresh_token(identity=user.id)
                return {
                    'user': user.to_dict(), 
                    'authenticated': True,
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            return {'error': 'Invalid credentials'}, 401
    
    class AuthRegister(Resource):
        def post(self):
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
            refresh_token = create_refresh_token(identity=user.id)
            return {
                'user': user.to_dict(), 
                'authenticated': True,
                'access_token': access_token,
                'refresh_token': refresh_token
            }
    
    class AuthLogout(Resource):
        @jwt_required()
        def post(self):
            return {'success': True}
    
    class AuthSession(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user:
                return {'authenticated': True, 'user': user.to_dict()}
            return {'authenticated': False}
    
    class AuthProfile(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            return {'user': user.to_dict()}
        
        @jwt_required()
        def put(self):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            data = request.get_json()
            
            for key, value in data.items():
                if hasattr(user, key) and key != 'id':
                    setattr(user, key, value)
            
            db.session.commit()
            return {'user': user.to_dict()}
    
    # Product Routes
    class ProductList(Resource):
        def get(self):
            products = Product.query.all()
            return [product.to_dict() for product in products]
        
        @jwt_required()
        def post(self):
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
        
        @jwt_required()
        def put(self, product_id):
            user_id = get_jwt_identity()
            product = Product.query.get_or_404(product_id)
            if product.artisan_id != user_id:
                return {'error': 'Unauthorized'}, 403
            
            data = request.get_json()
            for key, value in data.items():
                if hasattr(product, key) and key not in ['id', 'artisan_id']:
                    setattr(product, key, value)
            
            db.session.commit()
            return product.to_dict()
        
        @jwt_required()
        def delete(self, product_id):
            user_id = get_jwt_identity()
            product = Product.query.get_or_404(product_id)
            if product.artisan_id != user_id:
                return {'error': 'Unauthorized'}, 403
            
            db.session.delete(product)
            db.session.commit()
            return {'success': True}
    
    # Cart Routes
    class CartList(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            cart_items = Cart.query.filter_by(user_id=user_id).all()
            return [item.to_dict() for item in cart_items]
        
        @jwt_required()
        def post(self):
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
    
    class CartItem(Resource):
        @jwt_required()
        def put(self, item_id):
            user_id = get_jwt_identity()
            cart_item = Cart.query.filter_by(id=item_id, user_id=user_id).first_or_404()
            data = request.get_json()
            cart_item.quantity = data['quantity']
            
            db.session.commit()
            return cart_item.to_dict()
        
        @jwt_required()
        def delete(self, item_id):
            user_id = get_jwt_identity()
            cart_item = Cart.query.filter_by(id=item_id, user_id=user_id).first_or_404()
            db.session.delete(cart_item)
            db.session.commit()
            return {'success': True}
    
    class CartClear(Resource):
        @jwt_required()
        def delete(self):
            user_id = get_jwt_identity()
            Cart.query.filter_by(user_id=user_id).delete()
            db.session.commit()
            return {'success': True}
    
    # Order Routes
    class OrderList(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            orders = Order.query.filter_by(user_id=user_id).all()
            return [order.to_dict() for order in orders]
        
        @jwt_required()
        def post(self):
            user_id = get_jwt_identity()
            data = request.get_json()
            order = Order(
                user_id=user_id,
                total_amount=data['total_amount'],
                status=data.get('status', 'pending')
            )
            
            db.session.add(order)
            db.session.commit()
            return {'order': order.to_dict()}
    
    class OrderDetail(Resource):
        @jwt_required()
        def get(self, order_id):
            user_id = get_jwt_identity()
            order = Order.query.filter_by(id=order_id, user_id=user_id).first_or_404()
            return order.to_dict()
    
    class OrderStatus(Resource):
        @jwt_required()
        def put(self, order_id):
            user_id = get_jwt_identity()
            order = Order.query.get_or_404(order_id)
            data = request.get_json()
            order.status = data['status']
            
            db.session.commit()
            return order.to_dict()
    
    # Category Routes
    class CategoryList(Resource):
        def get(self):
            categories = Category.query.all()
            return [category.to_dict() for category in categories]
        
        @jwt_required()
        def post(self):
            data = request.get_json()
            category = Category(
                name=data['name'],
                description=data.get('description')
            )
            
            db.session.add(category)
            db.session.commit()
            return category.to_dict()
    
    class SubcategoryList(Resource):
        def get(self):
            subcategories = Subcategory.query.all()
            return [sub.to_dict() for sub in subcategories]
    
    # Review Routes
    class ReviewList(Resource):
        @jwt_required()
        def post(self):
            user_id = get_jwt_identity()
            data = request.get_json()
            review = Review(
                product_id=data['product_id'],
                user_id=user_id,
                rating=data['rating'],
                comment=data.get('comment')
            )
            
            db.session.add(review)
            db.session.commit()
            return review.to_dict()
    
    class ProductReviews(Resource):
        def get(self, product_id):
            reviews = Review.query.filter_by(product_id=product_id).all()
            return [review.to_dict() for review in reviews]
    
    # Message Routes
    class MessageConversations(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            conversations = db.session.query(Message).filter(
                (Message.sender_id == user_id) | (Message.receiver_id == user_id)
            ).all()
            
            conv_dict = {}
            for msg in conversations:
                partner_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
                if partner_id not in conv_dict:
                    partner = User.query.get(partner_id)
                    conv_dict[partner_id] = {
                        'id': partner_id,
                        'artisan': {
                            'id': partner.id,
                            'name': partner.full_name,
                            'avatar': partner.profile_picture_url or '/images/placeholder.svg',
                            'online': True
                        },
                        'lastMessage': msg.message,
                        'lastMessageTime': msg.created_at.strftime('%H:%M'),
                        'unread': 0
                    }
            
            return list(conv_dict.values())
    
    class MessageList(Resource):
        @jwt_required()
        def get(self, user_id):
            current_user_id = get_jwt_identity()
            messages = Message.query.filter(
                ((Message.sender_id == current_user_id) & (Message.receiver_id == user_id)) |
                ((Message.sender_id == user_id) & (Message.receiver_id == current_user_id))
            ).order_by(Message.created_at).all()
            
            return [msg.to_dict() for msg in messages]
        
        @jwt_required()
        def post(self):
            user_id = get_jwt_identity()
            data = request.get_json()
            message = Message(
                sender_id=user_id,
                receiver_id=data['receiver_id'],
                message=data['message'],
                message_type=data.get('message_type', 'text'),
                attachment_url=data.get('attachment_url'),
                attachment_name=data.get('attachment_name')
            )
            
            db.session.add(message)
            db.session.commit()
            return {'message_data': message.to_dict()}
    
    # Favorites Routes
    class FavoriteList(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            favorites = Favorite.query.filter_by(user_id=user_id).all()
            return [fav.to_dict() for fav in favorites]
        
        @jwt_required()
        def post(self):
            user_id = get_jwt_identity()
            data = request.get_json()
            favorite = Favorite(
                user_id=user_id,
                product_id=data['product_id']
            )
            
            db.session.add(favorite)
            db.session.commit()
            return favorite.to_dict()
    
    class FavoriteItem(Resource):
        @jwt_required()
        def delete(self, product_id):
            user_id = get_jwt_identity()
            favorite = Favorite.query.filter_by(
                user_id=user_id, 
                product_id=product_id
            ).first_or_404()
            
            db.session.delete(favorite)
            db.session.commit()
            return {'success': True}
    
    # Artisan Routes
    class ArtisanProfile(Resource):
        def get(self, artisan_id):
            artisan = User.query.filter_by(id=artisan_id, role='artisan').first_or_404()
            return artisan.to_dict()
    
    class ArtisanProducts(Resource):
        def get(self, artisan_id):
            products = Product.query.filter_by(artisan_id=artisan_id).all()
            return [product.to_dict() for product in products]
    
    class ArtisanDashboard(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user.role != 'artisan':
                return {'error': 'Artisan access required'}, 403
            
            products = Product.query.filter_by(artisan_id=user_id).all()
            orders = Order.query.join(OrderItem).filter(OrderItem.artisan_id == user_id).all()
            
            total_revenue = sum(order.total_amount for order in orders if order.status == 'completed')
            
            return {
                'stats': {
                    'total_products': len(products),
                    'total_orders': len(orders),
                    'total_revenue': float(total_revenue)
                },
                'products': [p.to_dict() for p in products],
                'orders': [o.to_dict() for o in orders]
            }
    
    # Payment Routes
    class PaymentList(Resource):
        @jwt_required()
        def get(self):
            user_id = get_jwt_identity()
            payments = Payment.query.filter_by(user_id=user_id).all()
            return [payment.to_dict() for payment in payments]
        
        @jwt_required()
        def post(self):
            user_id = get_jwt_identity()
            data = request.get_json()
            payment = Payment(
                order_id=data['order_id'],
                user_id=user_id,
                amount=data.get('amount', 0),
                method=data.get('method', 'mpesa'),
                phone_number=data.get('phone_number')
            )
            
            db.session.add(payment)
            db.session.commit()
            return {'success': True, 'message': 'Payment initiated'}
    
    class PaymentInitiate(Resource):
        @jwt_required()
        def post(self):
            user_id = get_jwt_identity()
            return {'success': True, 'message': 'Payment request sent to your phone'}
    
    # Register all routes
    api.add_resource(AuthLogin, '/auth/login')
    api.add_resource(AuthRegister, '/auth/register')
    api.add_resource(AuthLogout, '/auth/logout')
    api.add_resource(AuthSession, '/auth/session')
    api.add_resource(AuthProfile, '/auth/profile')
    
    api.add_resource(ProductList, '/products/')
    api.add_resource(ProductDetail, '/products/<int:product_id>')
    
    api.add_resource(CartList, '/cart/')
    api.add_resource(CartItem, '/cart/<int:item_id>')
    api.add_resource(CartClear, '/cart/clear')
    
    api.add_resource(OrderList, '/orders/')
    api.add_resource(OrderDetail, '/orders/<int:order_id>')
    api.add_resource(OrderStatus, '/orders/<int:order_id>/status')
    
    api.add_resource(CategoryList, '/categories/')
    api.add_resource(SubcategoryList, '/categories/subcategories/')
    
    api.add_resource(ReviewList, '/reviews/')
    api.add_resource(ProductReviews, '/reviews/product/<int:product_id>')
    
    api.add_resource(MessageConversations, '/messages/conversations')
    api.add_resource(MessageList, '/messages/', '/messages/<int:user_id>')
    
    api.add_resource(FavoriteList, '/favorites/')
    api.add_resource(FavoriteItem, '/favorites/<int:product_id>')
    
    api.add_resource(ArtisanProfile, '/artisan/<int:artisan_id>')
    api.add_resource(ArtisanProducts, '/artisan/<int:artisan_id>/products')
    api.add_resource(ArtisanDashboard, '/artisan/dashboard')
    
    api.add_resource(PaymentList, '/payments/')
    api.add_resource(PaymentInitiate, '/payments/initiate')
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)