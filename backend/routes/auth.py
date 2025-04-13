from flask import Blueprint, request, jsonify, current_app
from google.oauth2 import id_token
from google.auth.transport import requests
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    get_jwt_identity,
    jwt_required
)
from utils.user_directory import UserDirectoryManager
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    try:
        # Log the incoming request
        current_app.logger.info('Received login request')
        current_app.logger.info(f'Request data: {request.json}')
        
        # Get token from request
        token = request.json.get('credential')
        if not token:
            current_app.logger.error('No credential token provided')
            return {'error': 'No credential token provided'}, 400
        
        current_app.logger.info('Verifying Google token...')
        # Verify token
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            os.getenv('GOOGLE_CLIENT_ID')
        )

        current_app.logger.info('Token verified successfully')
        # Get user info
        user_info = {
            'email': idinfo['email'],
            'name': idinfo['name'],
            'picture': idinfo.get('picture', '')
        }

        # Setup user directory
        try:
            user_dir = UserDirectoryManager.setup_user_directory(user_info['email'])
            current_app.logger.info(f'User directory setup at: {user_dir}')
        except Exception as e:
            current_app.logger.error(f'Error setting up user directory: {str(e)}')
            # Continue with login even if directory creation fails
            
        # Create tokens
        access_token = create_access_token(identity=user_info['email'])
        refresh_token = create_refresh_token(identity=user_info['email'])

        response = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user_info
        }
        current_app.logger.info('Login successful')
        return jsonify(response)

    except ValueError as e:
        current_app.logger.error(f'Error validating Google token: {str(e)}')
        return {'error': str(e)}, 401
    except Exception as e:
        current_app.logger.error(f'Unexpected error during login: {str(e)}')
        return {'error': 'Login failed'}, 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify({'access_token': access_token})