import re

def validate_email(email):
    """Validate email format"""
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if not password:
        return False
    return len(password) >= 6

def validate_phone(phone):
    """Validate phone number (Kenyan format)"""
    if not phone:
        return True  # Phone is optional
    # Simple validation for Kenyan phone numbers
    pattern = r'^(?:\+254|0)[17]\d{8}$'
    return re.match(pattern, phone) is not None

def validate_required_fields(data, required_fields):
    """Validate that all required fields are present"""
    for field in required_fields:
        if field not in data or not data[field]:
            return f'{field} is required'
    return None

def validate_price(price):
    """Validate price is positive number"""
    try:
        price_float = float(price)
        return price_float > 0
    except (ValueError, TypeError):
        return False

def validate_quantity(quantity):
    """Validate quantity is positive integer"""
    try:
        quantity_int = int(quantity)
        return quantity_int > 0
    except (ValueError, TypeError):
        return False
