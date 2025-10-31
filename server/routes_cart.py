from flask import Blueprint, request, jsonify
from models import db, Cart, Product
from auth_utils import login_required, get_current_user_id
from validators import validate_required_fields, validate_quantity

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@login_required
def get_cart():
    """Get user's cart items"""
    try:
        user_id = get_current_user_id()
        cart_items = Cart.query.filter_by(user_id=user_id).all()
        return jsonify([item.to_dict() for item in cart_items]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/', methods=['POST'])
@login_required
def add_to_cart():
    """Add item to cart"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Validate required fields
        required = ['product_id']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        product_id = data['product_id']
        quantity = data.get('quantity', 1)

        # Validate quantity
        if not validate_quantity(quantity):
            return jsonify({'error': 'Invalid quantity'}), 400

        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        # Check stock
        if product.stock < quantity:
            return jsonify({'error': 'Insufficient stock'}), 400

        # Check if item already in cart
        existing_item = Cart.query.filter_by(user_id=user_id, product_id=product_id).first()

        if existing_item:
            existing_item.quantity += quantity
        else:
            cart_item = Cart(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)

        db.session.commit()
        return jsonify({'success': True, 'message': 'Item added to cart'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/<int:item_id>', methods=['PUT'])
@login_required
def update_cart_item(item_id):
    """Update cart item quantity"""
    try:
        user_id = get_current_user_id()
        cart_item = Cart.query.filter_by(id=item_id, user_id=user_id).first()

        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404

        data = request.get_json()
        quantity = data.get('quantity')

        if quantity is None:
            return jsonify({'error': 'Quantity is required'}), 400

        if not validate_quantity(quantity):
            return jsonify({'error': 'Invalid quantity'}), 400

        # Check stock
        if cart_item.product.stock < quantity:
            return jsonify({'error': 'Insufficient stock'}), 400

        cart_item.quantity = quantity
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Cart item updated',
            'item': cart_item.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/<int:item_id>', methods=['DELETE'])
@login_required
def remove_cart_item(item_id):
    """Remove item from cart"""
    try:
        user_id = get_current_user_id()
        cart_item = Cart.query.filter_by(id=item_id, user_id=user_id).first()

        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404

        db.session.delete(cart_item)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Item removed from cart'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/clear', methods=['DELETE'])
@login_required
def clear_cart():
    """Clear all items from cart"""
    try:
        user_id = get_current_user_id()
        Cart.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        return jsonify({'success': True, 'message': 'Cart cleared'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
