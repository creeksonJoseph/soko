from flask import Flask, session
from flask_cors import CORS
from flask_migrate import Migrate
from flask_session import Session
from models import db, bcrypt
from config import config
import os

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate = Migrate(app, db)
    
    # Initialize server-side session
    Session(app)
    
    # CORS configuration for frontend
    CORS(app, 
         supports_credentials=True,
         origins=[
             'http://localhost:5173',
             'http://localhost:3000',
             'http://127.0.0.1:5173',
             'http://127.0.0.1:3000'
         ],
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
    
    # Register blueprints
    from routes_auth import auth_bp
    from routes_products import products_bp
    from routes_cart import cart_bp
    from routes_orders import orders_bp
    from routes_categories import categories_bp
    from routes_reviews import reviews_bp
    from routes_messages import messages_bp
    from routes_favorites import favorites_bp
    from routes_follows import follows_bp
    from routes_artisan import artisan_bp
    from routes_payments import payments_bp
    from routes_notifications import notifications_bp
    from routes_users import users_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(cart_bp, url_prefix='/cart')
    app.register_blueprint(orders_bp, url_prefix='/orders')
    app.register_blueprint(categories_bp, url_prefix='/categories')
    app.register_blueprint(reviews_bp, url_prefix='/reviews')
    app.register_blueprint(messages_bp, url_prefix='/messages')
    app.register_blueprint(favorites_bp, url_prefix='/favorites')
    app.register_blueprint(follows_bp, url_prefix='/follows')
    app.register_blueprint(artisan_bp, url_prefix='/artisan')
    app.register_blueprint(payments_bp, url_prefix='/payments')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')
    app.register_blueprint(users_bp, url_prefix='/users')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'SokoDigital API is running'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
