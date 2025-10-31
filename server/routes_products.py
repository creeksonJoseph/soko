from flask import Blueprint, request, jsonify
from models import db, Product
from auth_utils import login_required, get_current_user_id, require_role
from validators import validate_required_fields, validate_price, validate_quantity

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    try:
        # Get query parameters
        category = request.args.get('category')
        subcategory = request.args.get('subcategory')
        search = request.args.get('search')
        
        query = Product.query.filter_by(status='active')
        
        if category:
            query = query.filter_by(category=category)
        if subcategory:
            query = query.filter_by(subcategory=subcategory)
        if search:
            query = query.filter(
                (Product.title.ilike(f'%{search}%')) | 
                (Product.description.ilike(f'%{search}%'))
            )
        
        products = query.all()
        return jsonify([product.to_dict() for product in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify(product.to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Product not found'}), 404

@products_bp.route('/', methods=['POST'])
@login_required
@require_role('artisan')
def create_product():
    """Create a new product (artisan only)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()
        
        # Validate required fields
        required = ['title', 'description', 'price']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400
        
        # Validate price
        if not validate_price(data['price']):
            return jsonify({'error': 'Invalid price'}), 400
        
        # Validate stock
        stock = data.get('stock', 0)
        if not validate_quantity(stock):
            return jsonify({'error': 'Invalid stock quantity'}), 400
        
        product = Product(
            title=data['title'],
            description=data['description'],
            price=data['price'],
            currency=data.get('currency', 'KSH'),
            stock=stock,
            category=data.get('category'),
            subcategory=data.get('subcategory'),
            image=data.get('image'),
            artisan_id=user_id,
            status=data.get('status', 'active')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    """Update a product"""
    try:
        user_id = get_current_user_id()
        product = Product.query.get_or_404(product_id)
        
        # Check ownership
        if product.artisan_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update fields
        allowed_fields = ['title', 'description', 'price', 'currency', 'stock', 
                          'category', 'subcategory', 'image', 'status']
        for field in allowed_fields:
            if field in data:
                setattr(product, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    """Delete a product"""
    try:
        user_id = get_current_user_id()
        product = Product.query.get_or_404(product_id)
        
        # Check ownership
        if product.artisan_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
