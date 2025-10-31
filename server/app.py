import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_session import Session
from models import db, bcrypt  # assuming you defined db = SQLAlchemy() and bcrypt = Bcrypt() in models.py
from config import config      # if you use a config.py for different environments

def create_app(config_name=None):
    """Factory function to create and configure the Flask app."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)

    # Load configuration (optional, only if you have config classes)
    if config_name in config:
        app.config.from_object(config[config_name])

    # Database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)
    Session(app)

    # Enable CORS (allow frontend connection)
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "https://your-frontend.netlify.app"  # 🔸 Replace with your Netlify domain
        ],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Import and register blueprints
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

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(products_bp, url_prefix="/products")
    app.register_blueprint(cart_bp, url_prefix="/cart")
    app.register_blueprint(orders_bp, url_prefix="/orders")
    app.register_blueprint(categories_bp, url_prefix="/categories")
    app.register_blueprint(reviews_bp, url_prefix="/reviews")
    app.register_blueprint(messages_bp, url_prefix="/messages")
    app.register_blueprint(favorites_bp, url_prefix="/favorites")
    app.register_blueprint(follows_bp, url_prefix="/follows")
    app.register_blueprint(artisan_bp, url_prefix="/artisan")
    app.register_blueprint(payments_bp, url_prefix="/payments")
    app.register_blueprint(notifications_bp, url_prefix="/notifications")
    app.register_blueprint(users_bp, url_prefix="/users")

    # Simple health check endpoint
    @app.route("/health")
    def health_check():
        return {"status": "healthy", "message": "SokoDigital API is running"}, 200

    return app


# Run locally or when Render calls "gunicorn app:create_app()"
if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

