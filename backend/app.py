from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
from routes.api import api_bp, sound_bp
from routes.auth import auth_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000  # 30 days
jwt = JWTManager(app)

# Configure CORS
CORS(app, 
     resources={
         r"/*": {
             "origins": ["http://localhost:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
         }
     })

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')
app.register_blueprint(sound_bp, url_prefix='/sound')
app.register_blueprint(auth_bp, url_prefix='/auth')

# Print registered routes
print("\nRegistered Routes:")
for rule in app.url_map.iter_rules():
    print(f"{rule.methods} - {rule.rule}")

if __name__ == '__main__':
    if os.getenv('FLASK_ENV') == 'development':
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        app.run(host='0.0.0.0', port=5000)