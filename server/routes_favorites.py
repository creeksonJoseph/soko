from flask import Blueprint, request, jsonify
from models import db, Favorite, Product
from auth_utils import login_required, get_current_user_id
from validators import validate_required_fields

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route('/', methods=['GET'])
@login_required
def get_favorites():
    """Get user's favorite products"""
    try:
        user_id = get_current_user_id()
        favorites = Favorite.query.filter_by(user_id=user_id).all()
        return jsonify([fav.to_dict() for fav in favorites]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@favorites_bp.route('/', methods=['POST'])
@login_required
def add_favorite():
    """Add product to favorites"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Validate required fields
        required = ['product_id']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        product_id = data['product_id']

        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        # Check if already in favorites
        existing_favorite = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
        if existing_favorite:
            return jsonify({'error': 'Product already in favorites'}), 400

        favorite = Favorite(
            user_id=user_id,
            product_id=product_id
        )

        db.session.add(favorite)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Product added to favorites',
            'favorite': favorite.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@favorites_bp.route('/<int:product_id>', methods=['DELETE'])
@login_required
def remove_favorite(product_id):
    """Remove product from favorites"""
    try:
        user_id = get_current_user_id()

        favorite = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
        if not favorite:
            return jsonify({'error': 'Product not in favorites'}), 404

        db.session.delete(favorite)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Product removed from favorites'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
