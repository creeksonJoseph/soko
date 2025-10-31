import logging
import os
from flask import request
from functools import wraps

# Logging setup
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s %(message)s',
        handlers=[
            logging.FileHandler('app.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# Pagination helper
def paginate_query(query, page=1, per_page=20):
    try:
        page = int(request.args.get('page', page))
        per_page = min(int(request.args.get('per_page', per_page)), 100)
    except (ValueError, TypeError):
        page, per_page = 1, 20
    
    paginated = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return {
        'items': [item.to_dict() for item in paginated.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
    }

# Error handler decorator
def handle_errors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return {'error': 'Internal server error'}, 500
    return decorated_function

# Security headers
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response