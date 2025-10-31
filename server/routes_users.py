from flask import Blueprint, request, jsonify
from models import db, User
from auth_utils import login_required, require_role, get_current_user_id

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@login_required
@require_role('admin')
def get_users():
    """Get all users (admin only)"""
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """Get user by ID"""
    try:
        current_user_id = get_current_user_id()
        user = User.query.get_or_404(user_id)

        # Users can only view their own profile or admins can view any
        current_user = User.query.get(current_user_id)
        if user_id != current_user_id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'User not found'}), 404

@users_bp.route('/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    """Update user (admin or self)"""
    try:
        current_user_id = get_current_user_id()
        user = User.query.get_or_404(user_id)

        # Check permissions
        current_user = User.query.get(current_user_id)
        if user_id != current_user_id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()

        # Update allowed fields
        allowed_fields = ['full_name', 'description', 'location', 'phone', 'profile_picture_url']
        if current_user.role == 'admin':
            allowed_fields.extend(['role', 'email'])  # Admins can update more fields

        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@login_required
@require_role('admin')
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        user = User.query.get_or_404(user_id)

        # Prevent deleting self
        current_user_id = get_current_user_id()
        if user_id == current_user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400

        db.session.delete(user)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
