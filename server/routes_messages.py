from flask import Blueprint, request, jsonify
from models import db, Message, User
from auth_utils import login_required, get_current_user_id
from validators import validate_required_fields
from sqlalchemy import or_, and_

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/conversations', methods=['GET'])
@login_required
def get_conversations():
    """Get user's message conversations"""
    try:
        user_id = get_current_user_id()

        # Get all messages involving the user
        messages = Message.query.filter(
            or_(Message.sender_id == user_id, Message.receiver_id == user_id)
        ).order_by(Message.created_at.desc()).all()

        # Group by conversation partner
        conversations = {}
        for msg in messages:
            partner_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
            if partner_id not in conversations:
                partner = User.query.get(partner_id)
                conversations[partner_id] = {
                    'id': partner_id,
                    'artisan': {
                        'id': partner.id,
                        'name': partner.full_name,
                        'avatar': partner.profile_picture_url or '/images/placeholder.svg',
                        'online': True  # Could be enhanced with actual online status
                    },
                    'lastMessage': msg.message,
                    'lastMessageTime': msg.created_at.strftime('%H:%M'),
                    'unread': 0  # Could be enhanced with actual unread count
                }

        return jsonify(list(conversations.values())), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/', methods=['GET'])
@login_required
def get_messages():
    """Get messages with a specific user"""
    try:
        user_id = get_current_user_id()
        other_user_id = request.args.get('user_id')

        if not other_user_id:
            return jsonify({'error': 'user_id parameter required'}), 400

        # Verify other user exists
        other_user = User.query.get(other_user_id)
        if not other_user:
            return jsonify({'error': 'User not found'}), 404

        # Get messages between users
        messages = Message.query.filter(
            or_(
                and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == user_id)
            )
        ).order_by(Message.created_at).all()

        return jsonify([msg.to_dict() for msg in messages]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/', methods=['POST'])
@login_required
def send_message():
    """Send a message"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Validate required fields
        required = ['receiver_id', 'message']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        receiver_id = data['receiver_id']
        message_text = data['message']

        # Verify receiver exists
        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({'error': 'Receiver not found'}), 404

        # Don't allow sending messages to self
        if receiver_id == user_id:
            return jsonify({'error': 'Cannot send message to yourself'}), 400

        message = Message(
            sender_id=user_id,
            receiver_id=receiver_id,
            message=message_text,
            message_type=data.get('message_type', 'text'),
            attachment_url=data.get('attachment_url'),
            attachment_name=data.get('attachment_name')
        )

        db.session.add(message)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Message sent successfully',
            'message_data': message.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<int:message_id>/status', methods=['PUT'])
@login_required
def update_message_status(message_id):
    """Update message status (e.g., mark as read/delivered)"""
    try:
        user_id = get_current_user_id()
        message = Message.query.get_or_404(message_id)

        # Only receiver can update status
        if message.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        status = data.get('status')

        if status not in ['sent', 'delivered', 'read']:
            return jsonify({'error': 'Invalid status'}), 400

        message.status = status
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Message status updated'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
