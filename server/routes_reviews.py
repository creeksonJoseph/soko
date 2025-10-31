from flask import Blueprint, request, jsonify
from models import db, Review, Product
from auth_utils import login_required, get_current_user_id
from validators import validate_required_fields

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/product/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    """Get all reviews for a product"""
    try:
        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        reviews = Review.query.filter_by(product_id=product_id).all()
        return jsonify([review.to_dict() for review in reviews]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/', methods=['POST'])
@login_required
def create_review():
    """Create a new review"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Validate required fields
        required = ['product_id', 'rating']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        product_id = data['product_id']
        rating = data['rating']

        # Validate rating
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400

        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        # Check if user already reviewed this product
        existing_review = Review.query.filter_by(product_id=product_id, user_id=user_id).first()
        if existing_review:
            return jsonify({'error': 'You have already reviewed this product'}), 400

        review = Review(
            product_id=product_id,
            user_id=user_id,
            rating=rating,
            comment=data.get('comment')
        )

        db.session.add(review)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Review created successfully',
            'review': review.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@login_required
def update_review(review_id):
    """Update a review"""
    try:
        user_id = get_current_user_id()
        review = Review.query.get_or_404(review_id)

        # Check ownership
        if review.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()

        # Update rating if provided
        if 'rating' in data:
            rating = data['rating']
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            review.rating = rating

        # Update comment if provided
        if 'comment' in data:
            review.comment = data['comment']

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Review updated successfully',
            'review': review.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review(review_id):
    """Delete a review"""
    try:
        user_id = get_current_user_id()
        review = Review.query.get_or_404(review_id)

        # Check ownership
        if review.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        db.session.delete(review)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Review deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
