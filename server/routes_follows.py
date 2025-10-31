from flask import Blueprint, request, jsonify
from models import db, Follow, User
from auth_utils import login_required, get_current_user_id
from validators import validate_required_fields

follows_bp = Blueprint('follows', __name__)

@follows_bp.route('/', methods=['POST'])
@login_required
def follow_artisan():
    """Follow an artisan"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        # Validate required fields
        required = ['artisan_id']
        error = validate_required_fields(data, required)
        if error:
            return jsonify({'error': error}), 400

        artisan_id = data['artisan_id']

        # Check if artisan exists and is actually an artisan
        artisan = User.query.filter_by(id=artisan_id, role='artisan').first()
        if not artisan:
            return jsonify({'error': 'Artisan not found'}), 404

        # Don't allow following yourself
        if artisan_id == user_id:
            return jsonify({'error': 'Cannot follow yourself'}), 400

        # Check if already following
        existing_follow = Follow.query.filter_by(follower_id=user_id, artisan_id=artisan_id).first()
        if existing_follow:
            return jsonify({'error': 'Already following this artisan'}), 400

        follow = Follow(
            follower_id=user_id,
            artisan_id=artisan_id
        )

        db.session.add(follow)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Successfully followed artisan',
            'follow': follow.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/<int:artisan_id>', methods=['DELETE'])
@login_required
def unfollow_artisan(artisan_id):
    """Unfollow an artisan"""
    try:
        user_id = get_current_user_id()

        follow = Follow.query.filter_by(follower_id=user_id, artisan_id=artisan_id).first()
        if not follow:
            return jsonify({'error': 'Not following this artisan'}), 404

        db.session.delete(follow)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Successfully unfollowed artisan'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/following', methods=['GET'])
@login_required
def get_following():
    """Get users that current user is following"""
    try:
        user_id = get_current_user_id()
        follows = Follow.query.filter_by(follower_id=user_id).all()
        return jsonify([follow.to_dict() for follow in follows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/followers', methods=['GET'])
@login_required
def get_followers():
    """Get users following current user (if artisan)"""
    try:
        user_id = get_current_user_id()
        follows = Follow.query.filter_by(artisan_id=user_id).all()
        return jsonify([follow.to_dict() for follow in follows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
