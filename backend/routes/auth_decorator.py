from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Verify JWT token
            verify_jwt_in_request()
            # Get user email from token
            current_user = get_jwt_identity()
            # Add user email to request
            request.user_email = current_user
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or missing token'}), 401
    return decorated