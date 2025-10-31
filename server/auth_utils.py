from flask import session, jsonify
from functools import wraps
from models import User

def login_required(f):
    """Decorator to ensure user is logged in"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required', 'authenticated': False}), 401
        
        # Verify user still exists
        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({'error': 'User not found', 'authenticated': False}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    """Get the currently logged-in user"""
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

def get_current_user_id():
    """Get the current user's ID from session"""
    return session.get('user_id')

def require_role(role):
    """Decorator to ensure user has specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({'error': 'Authentication required'}), 401
            if user.role.lower() != role.lower():
                return jsonify({'error': f'Access denied. {role.capitalize()} role required.'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def set_user_session(user):
    """Set user session data"""
    session['user_id'] = user.id
    session['user_email'] = user.email
    session['user_role'] = user.role
    session.permanent = True

def clear_user_session():
    """Clear user session data"""
    session.clear()
