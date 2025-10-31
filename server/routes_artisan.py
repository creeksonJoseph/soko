from flask import Blueprint, request, jsonify
from models import db, User, Product, Order, OrderItem
from auth_utils import login_required, get_current_user_id, require_role
from sqlalchemy import func

artisan_bp = Blueprint('artisan', __name__)

@artisan_bp.route('/<int:artisan_id>', methods=['GET'])
def get_artisan_profile(artisan_id):
    """Get artisan profile"""
    try:
        artisan = User.query.filter_by(id=artisan_id, role='artisan').first()
        if not artisan:
            return jsonify({'error': 'Artisan not found'}), 404

        return jsonify(artisan.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@artisan_bp.route('/<int:artisan_id>/products', methods=['GET'])
def get_artisan_products(artisan_id):
    """Get products by artisan"""
    try:
        artisan = User.query.filter_by(id=artisan_id, role='artisan').first()
        if not artisan:
            return jsonify({'error': 'Artisan not found'}), 404

        products = Product.query.filter_by(artisan_id=artisan_id, status='active').all()
        return jsonify([product.to_dict() for product in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@artisan_bp.route('/dashboard', methods=['GET'])
@login_required
@require_role('artisan')
def get_artisan_dashboard():
    """Get artisan dashboard data"""
    try:
        user_id = get_current_user_id()

        # Get products count
        products_count = Product.query.filter_by(artisan_id=user_id).count()

        # Get orders count and revenue
        orders_query = db.session.query(Order).join(OrderItem).filter(OrderItem.artisan_id == user_id)
        orders_count = orders_query.count()
        total_revenue = db.session.query(func.sum(Order.total_amount)).join(OrderItem).filter(OrderItem.artisan_id == user_id).scalar() or 0

        # Get recent products
        products = Product.query.filter_by(artisan_id=user_id).order_by(Product.created_at.desc()).limit(10).all()

        # Get recent orders
        orders = orders_query.order_by(Order.created_at.desc()).limit(10).all()

        return jsonify({
            'stats': {
                'total_products': products_count,
                'total_orders': orders_count,
                'total_revenue': float(total_revenue)
            },
            'products': [p.to_dict() for p in products],
            'orders': [o.to_dict() for o in orders]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@artisan_bp.route('/orders', methods=['GET'])
@login_required
@require_role('artisan')
def get_artisan_orders():
    """Get orders for artisan's products"""
    try:
        user_id = get_current_user_id()

        orders = Order.query.join(OrderItem).filter(OrderItem.artisan_id == user_id).distinct().all()
        return jsonify([order.to_dict() for order in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@artisan_bp.route('/messages', methods=['GET'])
@login_required
@require_role('artisan')
def get_artisan_messages():
    """Get messages for artisan"""
    try:
        user_id = get_current_user_id()

        # This would need to be implemented based on message system
        # For now, return empty array
        return jsonify([]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
