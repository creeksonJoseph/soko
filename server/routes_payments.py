from flask import Blueprint, request, jsonify, current_app
from models import db, Payment, Order
from auth_utils import login_required, get_current_user_id
from validators import validate_required_fields
from mpesa_utils import mpesa_api
import requests
import os

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/', methods=['GET'])
@login_required
def get_payments():
    """Get user's payments"""
    try:
        user_id = get_current_user_id()
        payments = Payment.query.filter_by(user_id=user_id).all()
        return jsonify([payment.to_dict() for payment in payments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<int:payment_id>', methods=['GET'])
@login_required
def get_payment(payment_id):
    """Get payment by ID"""
    try:
        user_id = get_current_user_id()
        payment = Payment.query.filter_by(id=payment_id, user_id=user_id).first()

        if not payment:
            return jsonify({'error': 'Payment not found'}), 404

        return jsonify(payment.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/', methods=['POST'])
@login_required
def create_payment():
    """Create a new payment"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Validate required fields
        required = ['order_id', 'amount']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        order_id = data['order_id']
        amount = data['amount']

        # Check if order exists and belongs to user
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Check if payment already exists for this order
        existing_payment = Payment.query.filter_by(order_id=order_id).first()
        if existing_payment:
            return jsonify({'error': 'Payment already exists for this order'}), 400

        payment = Payment(
            order_id=order_id,
            user_id=user_id,
            amount=amount,
            method=data.get('method', 'mpesa'),
            phone_number=data.get('phone_number')
        )

        db.session.add(payment)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Payment created successfully',
            'payment': payment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/initiate', methods=['POST'])
@login_required
def initiate_payment():
    """Initiate payment (M-Pesa STK Push)"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Validate required fields
        required = ['amount', 'phone_number']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        amount = data['amount']
        phone_number = data['phone_number']
        order_id = data.get('order_id')

        # If order_id is provided, validate it exists and belongs to user
        if order_id:
            order = Order.query.filter_by(id=order_id, user_id=user_id).first()
            if not order:
                return jsonify({'error': 'Order not found or does not belong to user'}), 404

        # Create payment record
        payment = Payment(
            order_id=order_id,
            user_id=user_id,
            amount=amount,
            method='mpesa',
            phone_number=phone_number,
            status='pending'
        )

        db.session.add(payment)
        db.session.commit()

        # Generate account reference (use payment ID or order ID)
        account_reference = f"Payment-{payment.id}"
        if order_id:
            account_reference = f"Order-{order_id}"

        # Initiate M-Pesa STK Push
        stk_result = mpesa_api.initiate_stk_push(
            phone_number=phone_number,
            amount=int(amount),  # M-Pesa expects integer
            account_reference=account_reference,
            transaction_desc=f"Payment for {account_reference}"
        )

        if stk_result['success']:
            # Update payment with checkout request ID
            payment.transaction_id = stk_result.get('checkout_request_id')
            db.session.commit()

            current_app.logger.info(f"M-Pesa STK Push initiated for payment {payment.id}: {stk_result}")

            return jsonify({
                'success': True,
                'message': stk_result.get('customer_message', 'Payment request sent to your phone'),
                'payment_id': payment.id,
                'checkout_request_id': stk_result.get('checkout_request_id')
            }), 200
        else:
            # Update payment status to failed
            payment.status = 'failed'
            db.session.commit()

            current_app.logger.error(f"M-Pesa STK Push failed for payment {payment.id}: {stk_result}")

            return jsonify({
                'success': False,
                'error': stk_result.get('error', 'Failed to initiate payment')
            }), 500

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in initiate_payment: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@payments_bp.route('/status/<int:payment_id>', methods=['GET'])
@login_required
def get_payment_status(payment_id):
    """Get payment status"""
    try:
        user_id = get_current_user_id()
        payment = Payment.query.filter_by(id=payment_id, user_id=user_id).first()

        if not payment:
            return jsonify({'error': 'Payment not found'}), 404

        return jsonify({
            'payment_id': payment.id,
            'status': payment.status,
            'transaction_id': payment.transaction_id
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# M-Pesa specific routes
@payments_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """M-Pesa payment callback"""
    try:
        data = request.get_json()

        current_app.logger.info(f"M-Pesa callback received: {data}")

        # Extract callback metadata
        callback_data = data.get('Body', {}).get('stkCallback', {})

        if not callback_data:
            current_app.logger.error("Invalid callback data structure")
            return jsonify({'ResultCode': 1, 'ResultDesc': 'Invalid callback data'}), 400

        # Extract relevant information
        merchant_request_id = callback_data.get('MerchantRequestID')
        checkout_request_id = callback_data.get('CheckoutRequestID')
        result_code = callback_data.get('ResultCode')
        result_desc = callback_data.get('ResultDesc')

        # Find payment by checkout request ID
        payment = Payment.query.filter_by(transaction_id=checkout_request_id).first()

        if not payment:
            current_app.logger.error(f"Payment not found for checkout_request_id: {checkout_request_id}")
            return jsonify({'ResultCode': 1, 'ResultDesc': 'Payment not found'}), 404

        if result_code == 0:
            # Payment successful
            callback_metadata = callback_data.get('CallbackMetadata', {}).get('Item', [])

            # Extract transaction details
            transaction_id = None
            amount = None
            mpesa_receipt_number = None

            for item in callback_metadata:
                if item.get('Name') == 'Amount':
                    amount = item.get('Value')
                elif item.get('Name') == 'MpesaReceiptNumber':
                    mpesa_receipt_number = item.get('Value')
                elif item.get('Name') == 'TransactionDate':
                    transaction_id = item.get('Value')

            # Update payment status
            payment.status = 'completed'
            if mpesa_receipt_number:
                payment.transaction_id = mpesa_receipt_number  # Use receipt number as final transaction ID

            db.session.commit()

            current_app.logger.info(f"Payment {payment.id} completed successfully. Receipt: {mpesa_receipt_number}")

            # TODO: Update order status if payment is for an order
            if payment.order_id:
                order = Order.query.get(payment.order_id)
                if order:
                    order.status = 'processing'  # Or 'paid' if you have that status
                    db.session.commit()

        else:
            # Payment failed
            payment.status = 'failed'
            db.session.commit()

            current_app.logger.error(f"Payment {payment.id} failed: {result_desc}")

        return jsonify({'ResultCode': 0, 'ResultDesc': 'Callback processed successfully'}), 200

    except Exception as e:
        current_app.logger.error(f"Error processing M-Pesa callback: {str(e)}")
        return jsonify({'ResultCode': 1, 'ResultDesc': 'Internal server error'}), 500
