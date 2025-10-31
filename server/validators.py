from marshmallow import Schema, fields, validate, ValidationError
from flask import request, jsonify
from functools import wraps

class UserRegistrationSchema(Schema):
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8, max=128))
    role = fields.Str(validate=validate.OneOf(['buyer', 'artisan']), missing='buyer')

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class ProductSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(required=True, validate=validate.Length(min=10, max=2000))
    price = fields.Decimal(required=True, validate=validate.Range(min=0))
    category = fields.Str(validate=validate.Length(max=50))
    subcategory = fields.Str(validate=validate.Length(max=50))
    stock = fields.Int(validate=validate.Range(min=0), missing=0)
    image = fields.Url()

class CartItemSchema(Schema):
    product_id = fields.Int(required=True, validate=validate.Range(min=1))
    quantity = fields.Int(validate=validate.Range(min=1, max=100), missing=1)

class ReviewSchema(Schema):
    product_id = fields.Int(required=True, validate=validate.Range(min=1))
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str(validate=validate.Length(max=1000))

class MessageSchema(Schema):
    receiver_id = fields.Int(required=True, validate=validate.Range(min=1))
    message = fields.Str(required=True, validate=validate.Length(min=1, max=1000))
    message_type = fields.Str(validate=validate.OneOf(['text', 'image', 'file']), missing='text')

def validate_json(schema_class):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                data = request.get_json()
                if not data:
                    return {'error': 'No JSON data provided'}, 400
                
                schema = schema_class()
                validated_data = schema.load(data)
                request.validated_data = validated_data
                return f(*args, **kwargs)
            except ValidationError as err:
                return {'error': 'Validation failed', 'details': err.messages}, 400
            except Exception as e:
                return {'error': 'Invalid JSON format'}, 400
        return decorated_function
    return decorator