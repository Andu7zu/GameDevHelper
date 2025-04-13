import os
import json
from datetime import datetime

class UserDirectoryManager:
    BASE_DIR = "Users"  # Base directory for all user content

    @staticmethod
    def setup_user_directory(email):
        """
        Check if user directory exists, if not create it with timestamp and ID
        Returns the path to the user's directory
        """
        # Clean email for directory name
        clean_email = email.replace('@', '_at_').replace('.', '_')
        
        # Check all directories in Users folder
        existing_user_dir = None
        for dir_name in os.listdir(UserDirectoryManager.BASE_DIR):
            if dir_name.startswith(clean_email):
                existing_user_dir = os.path.join(UserDirectoryManager.BASE_DIR, dir_name)
                break
        
        # If user directory doesn't exist, create it
        if not existing_user_dir:
            timestamp = datetime.now().strftime('%Y%m%d')
            user_id = UserDirectoryManager._get_next_user_id()
            new_dir_name = f"{clean_email}_{timestamp}_{user_id}"
            user_dir = os.path.join(UserDirectoryManager.BASE_DIR, new_dir_name)
            
            # Create directory structure
            os.makedirs(os.path.join(user_dir, 'sounds'), exist_ok=True)
            return user_dir
        
        return existing_user_dir

    @staticmethod
    def get_user_sounds_directory(email):
        user_dir = UserDirectoryManager.setup_user_directory(email)
        return os.path.join(user_dir, 'sounds')

    @staticmethod
    def _get_next_user_id():
        # Get all existing directories
        if not os.path.exists(UserDirectoryManager.BASE_DIR):
            os.makedirs(UserDirectoryManager.BASE_DIR)
            return 1
            
        existing_dirs = os.listdir(UserDirectoryManager.BASE_DIR)
        
        # Find the highest ID
        max_id = 0
        for dir_name in existing_dirs:
            try:
                id_str = dir_name.split('_')[-1]
                max_id = max(max_id, int(id_str))
            except (ValueError, IndexError):
                continue
                
        return max_id + 1

    @staticmethod
    def get_user_sounds(email):
        sounds_dir = UserDirectoryManager.get_user_sounds_directory(email)
        if not os.path.exists(sounds_dir):
            return []
            
        return [f for f in os.listdir(sounds_dir) if f.endswith('.wav')]

    @staticmethod
    def get_user_sounds_path(email):
        """Get or create user's sounds directory path"""
        # Clean email for directory name
        clean_email = email.replace('@', '_at_').replace('.', '_')
        
        # Find user's directory
        user_dir = None
        for dir_name in os.listdir(UserDirectoryManager.BASE_DIR):
            if dir_name.startswith(clean_email):
                user_dir = os.path.join(UserDirectoryManager.BASE_DIR, dir_name)
                break
                
        if not user_dir:
            raise Exception("User directory not found")
            
        # Create sounds directory if it doesn't exist
        sounds_dir = os.path.join(user_dir, 'sounds')
        os.makedirs(sounds_dir, exist_ok=True)
        
        return sounds_dir

    @staticmethod
    def save_sound_metadata(user_dir: str, filename: str, prompt: str):
        """Save metadata for a sound file"""
        metadata_file = os.path.join(user_dir, 'metadata.json')
        
        # Load existing metadata or create new
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {}

        # Add new sound metadata
        metadata[filename] = {
            'prompt': prompt,
            'created_at': datetime.now().isoformat(),
            'filename': filename
        }

        # Save updated metadata
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

    @staticmethod
    def get_sounds_metadata(user_dir: str):
        """Get metadata for all sounds"""
        metadata_file = os.path.join(user_dir, 'metadata.json')
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                return json.load(f)
        return {}