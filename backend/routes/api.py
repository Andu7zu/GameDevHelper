from flask import Blueprint, current_app, request, send_from_directory
from SoundGenerator.fxSoundGenerator import generate_audio
from utils.user_directory import UserDirectoryManager
import uuid
from routes.auth_decorator import token_required
import os

sound_bp = Blueprint('sound', __name__)
# Sound routes
@sound_bp.route('/generate', methods=['POST'])
@token_required
def generateSound():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return {"error": "No prompt provided"}, 400
            
        prompt = data['prompt']
        filename = data.get('filename', '').strip()
        num_steps = data.get('num_of_steps', 200)
        duration = data.get('duration', 5)
        
        # Validate inputs
        if not filename:
            return {"error": "No filename provided"}, 400
        if num_steps not in [200, 250, 300, 350, 400, 500]:
            return {"error": "Invalid number of steps"}, 400
        if not 1 <= duration <= 30:
            return {"error": "Invalid duration"}, 400
            
        user_email = request.user_email
        
        # Get user's directory
        clean_email = user_email.replace('@', '_at_').replace('.', '_')
        user_dir = None
        for dir_name in os.listdir('Users'):
            if dir_name.startswith(clean_email):
                user_dir = os.path.join('Users', dir_name)
                break
                
        if not user_dir:
            return {"error": "User directory not found"}, 404

        # Generate sound
        sounds_dir = os.path.join(user_dir, 'sounds')
        safe_filename = f"{filename}_{uuid.uuid4().hex[:8]}.wav"  # Add unique identifier to prevent overwrites
        
        output_path = generate_audio(
            prompt=prompt,
            name=safe_filename.replace('.wav', ''),
            num_of_steps=num_steps,
            duration=duration,
            output_dir=sounds_dir
        )

        # Save metadata
        UserDirectoryManager.save_sound_metadata(
            user_dir=user_dir,
            filename=safe_filename,
            prompt=prompt
        )
        
        return {
            "message": "Sound generated successfully",
            "filename": safe_filename,
            "prompt": prompt
        }
            
    except Exception as e:
        current_app.logger.error(f'Error in /sound/generate: {str(e)}')
        return {"error": str(e)}, 500

@sound_bp.route('/audio/<path:filename>')
@token_required
def serve_audio(filename):
    user_email = request.user_email
    clean_email = user_email.replace('@', '_at_').replace('.', '_')
    user_dir = None
    
    for dir_name in os.listdir('Users'):
        if dir_name.startswith(clean_email):
            user_dir = dir_name
            break
    
    if not user_dir:
        return {"error": "User directory not found"}, 404
        
    sounds_path = os.path.join('Users', user_dir, 'sounds')
    return send_from_directory(sounds_path, filename)

@sound_bp.route('/my-sounds', methods=['GET'])
@token_required
def get_user_sounds():
    try:
        user_email = request.user_email
        clean_email = user_email.replace('@', '_at_').replace('.', '_')
        
        # Find user directory
        user_dir = None
        for dir_name in os.listdir('Users'):
            if dir_name.startswith(clean_email):
                user_dir = os.path.join('Users', dir_name)
                break
        
        if not user_dir:
            return {"sounds": []}, 200
            
        sounds_dir = os.path.join(user_dir, 'sounds')
        if not os.path.exists(sounds_dir):
            return {"sounds": []}, 200
            
        # Get metadata
        metadata = UserDirectoryManager.get_sounds_metadata(user_dir)
        
        # Get all wav files and their metadata
        sounds = []
        for filename in os.listdir(sounds_dir):
            if filename.endswith('.wav'):
                sound_data = metadata.get(filename, {
                    'filename': filename,
                    'prompt': 'Unknown prompt',
                    'created_at': None
                })
                sounds.append(sound_data)
                
        # Sort by creation date (newest first)
        sounds.sort(key=lambda x: x['created_at'] if x['created_at'] else '', reverse=True)
        
        return {"sounds": sounds}
        
    except Exception as e:
        current_app.logger.error(f'Error getting user sounds: {str(e)}')
        return {"error": str(e)}, 500
