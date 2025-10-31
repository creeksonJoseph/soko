from flask import Blueprint, request, jsonify
from models import db, Notification
from auth_utils import login_required, get_current_user_id

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@login_required
def get_notifications():
    """Get user's notifications"""
    try:
        user_id = get_current_user_id()
        notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
        return jsonify([notif.to_dict() for notif in notifications]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@login_required
def mark_as_read(notification_id):
    """Mark notification as read"""
    try:
        user_id = get_current_user_id()
        notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()

        if not notification:
            return jsonify({'error': 'Notification not found'}), 404

        notification.is_read = True
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/read-all', methods=['PUT'])
@login_required
def mark_all_as_read():
    """Mark all notifications as read"""
    try:
        user_id = get_current_user_id()

        Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'All notifications marked as read'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Helper function to create notifications (can be called from other routes)
def create_notification(user_id, message, notification_type):
    """Create a new notification"""
    try:
        notification = Notification(
            user_id=user_id,
            message=message,
            type=notification_type
        )
        db.session.add(notification)
        db.session.commit()
        return notification
    except Exception as e:
        db.session.rollback()
        return None
