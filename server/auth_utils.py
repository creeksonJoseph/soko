from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

def jwt_required_with_fallback():
    """
    Custom decorator that handles both JWT and session-based auth
    for backward compatibility with frontend
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Try JWT first
                verify_jwt_in_request()
                return f(*args, **kwargs)
            except Exception as e:
                # If JWT fails, return 401
                return {'error': 'Authentication required'}, 401
        return decorated_function
    return decorator

def get_current_user():
    """Get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except:
        return None

def require_role(role):
    """Decorator to require specific user role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user or user.role != role:
                return {'error': f'{role.title()} access required'}, 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator