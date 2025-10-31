from flask import Blueprint, request, jsonify
from models import db, Order, OrderItem, Cart, Product
from auth_utils import login_required, get_current_user_id, require_role
from validators import validate_required_fields
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@login_required
def get_orders():
    """Get user's orders"""
    try:
        user_id = get_current_user_id()
        orders = Order.query.filter_by(user_id=user_id).all()
        return jsonify([order.to_dict() for order in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>', methods=['GET'])
@login_required
def get_order(order_id):
    """Get specific order details"""
    try:
        user_id = get_current_user_id()
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        return jsonify(order.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/', methods=['POST'])
@login_required
def create_order():
    """Create new order from cart"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Get cart items
        cart_items = Cart.query.filter_by(user_id=user_id).all()
        if not cart_items:
            return jsonify({'error': 'Cart is empty'}), 400

        # Calculate total amount
        total_amount = 0
        order_items = []

        for cart_item in cart_items:
            if cart_item.product.stock < cart_item.quantity:
                return jsonify({'error': f'Insufficient stock for {cart_item.product.title}'}), 400

            item_total = cart_item.product.price * cart_item.quantity
            total_amount += item_total

            order_items.append({
                'product_id': cart_item.product_id,
                'quantity': cart_item.quantity,
                'unit_price': cart_item.product.price,
                'total_price': item_total,
                'artisan_id': cart_item.product.artisan_id
            })

        # Create order
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            status='pending'
        )
        db.session.add(order)
        db.session.flush()  # Get order ID

        # Create order items
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                **item_data
            )
            db.session.add(order_item)

            # Update product stock
            product = Product.query.get(item_data['product_id'])
            product.stock -= item_data['quantity']

        # Clear cart
        Cart.query.filter_by(user_id=user_id).delete()

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@login_required
def update_order_status(order_id):
    """Update order status (for artisans and admins)"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data.get('status'):
            return jsonify({'error': 'Status is required'}), 400

        order = Order.query.get_or_404(order_id)

        # Check if user is authorized (artisan who owns products in order or admin)
        is_authorized = False

        # Check if user is admin
        from models import User
        user = User.query.get(user_id)
        if user.role == 'admin':
            is_authorized = True
        else:
            # Check if user is artisan for any product in the order
            for item in order.items:
                if item.artisan_id == user_id:
                    is_authorized = True
                    break

        if not is_authorized:
            return jsonify({'error': 'Unauthorized'}), 403

        order.status = data['status']
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Order status updated',
            'order': order.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
