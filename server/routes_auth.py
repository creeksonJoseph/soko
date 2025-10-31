from flask import Blueprint, request, jsonify, session
from models import db, User
from auth_utils import login_required, get_current_user, set_user_session, clear_user_session
from validators import validate_email, validate_password, validate_required_fields

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['full_name', 'email', 'password']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400
        
        # Validate email
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email address'}), 400
        
        # Validate password
        if not validate_password(data['password']):
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            full_name=data['full_name'],
            email=data['email'],
            role=data.get('role', 'buyer').lower(),
            description=data.get('description'),
            location=data.get('location'),
            phone=data.get('phone')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Set session
        set_user_session(user)
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': user.to_dict(),
            'authenticated': True
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Set session
        set_user_session(user)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'authenticated': True
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    clear_user_session()
    return jsonify({
        'success': True,
        'message': 'Logout successful',
        'authenticated': False
    }), 200

@auth_bp.route('/session', methods=['GET'])
def get_session():
    """Get current session"""
    user = get_current_user()
    if user:
        return jsonify({
            'authenticated': True,
            'user': user.to_dict()
        }), 200
    return jsonify({
        'authenticated': False,
        'user': None
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """Get user profile"""
    user = get_current_user()
    return jsonify({
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """Update user profile"""
    try:
        user = get_current_user()
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['full_name', 'description', 'location', 'phone', 'profile_picture_url']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
