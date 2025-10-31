from flask import Blueprint, request, jsonify
from models import db, Category, Subcategory
from auth_utils import login_required, require_role
from validators import validate_required_fields

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/', methods=['GET'])
def get_categories():
    """Get all categories"""
    try:
        categories = Category.query.all()
        return jsonify([category.to_dict() for category in categories]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get category by ID"""
    try:
        category = Category.query.get_or_404(category_id)
        return jsonify(category.to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Category not found'}), 404

@categories_bp.route('/', methods=['POST'])
@login_required
@require_role('admin')
def create_category():
    """Create new category (admin only)"""
    try:
        data = request.get_json()

        # Validate required fields
        required = ['name']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        # Check if category already exists
        if Category.query.filter_by(name=data['name']).first():
            return jsonify({'error': 'Category already exists'}), 400

        category = Category(
            name=data['name'],
            description=data.get('description')
        )

        db.session.add(category)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@login_required
@require_role('admin')
def update_category(category_id):
    """Update category (admin only)"""
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()

        # Update fields
        allowed_fields = ['name', 'description']
        for field in allowed_fields:
            if field in data:
                setattr(category, field, data[field])

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Category updated successfully',
            'category': category.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@login_required
@require_role('admin')
def delete_category(category_id):
    """Delete category (admin only)"""
    try:
        category = Category.query.get_or_404(category_id)

        # Check if category has subcategories
        if category.subcategories:
            return jsonify({'error': 'Cannot delete category with subcategories'}), 400

        db.session.delete(category)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Category deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Subcategory routes
@categories_bp.route('/subcategories/', methods=['GET'])
def get_subcategories():
    """Get all subcategories"""
    try:
        subcategories = Subcategory.query.all()
        return jsonify([sub.to_dict() for sub in subcategories]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/subcategories/<int:subcategory_id>', methods=['GET'])
def get_subcategory(subcategory_id):
    """Get subcategory by ID"""
    try:
        subcategory = Subcategory.query.get_or_404(subcategory_id)
        return jsonify(subcategory.to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Subcategory not found'}), 404

@categories_bp.route('/subcategories/', methods=['POST'])
@login_required
@require_role('admin')
def create_subcategory():
    """Create new subcategory (admin only)"""
    try:
        data = request.get_json()

        # Validate required fields
        required = ['name', 'category_id']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        # Check if category exists
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'error': 'Category not found'}), 404

        subcategory = Subcategory(
            name=data['name'],
            description=data.get('description'),
            category_id=data['category_id']
        )

        db.session.add(subcategory)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Subcategory created successfully',
            'subcategory': subcategory.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/subcategories/<int:subcategory_id>', methods=['PUT'])
@login_required
@require_role('admin')
def update_subcategory(subcategory_id):
    """Update subcategory (admin only)"""
    try:
        subcategory = Subcategory.query.get_or_404(subcategory_id)
        data = request.get_json()

        # Update fields
        allowed_fields = ['name', 'description', 'category_id']
        for field in allowed_fields:
            if field in data:
                if field == 'category_id':
                    # Check if new category exists
                    category = Category.query.get(data['category_id'])
                    if not category:
                        return jsonify({'error': 'Category not found'}), 404
                setattr(subcategory, field, data[field])

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Subcategory updated successfully',
            'subcategory': subcategory.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/subcategories/<int:subcategory_id>', methods=['DELETE'])
@login_required
@require_role('admin')
def delete_subcategory(subcategory_id):
    """Delete subcategory (admin only)"""
    try:
        subcategory = Subcategory.query.get_or_404(subcategory_id)

        db.session.delete(subcategory)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Subcategory deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
