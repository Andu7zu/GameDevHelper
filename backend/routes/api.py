from flask import Blueprint, current_app

api_bp = Blueprint('api', __name__)
sound_bp = Blueprint('sound', __name__)

# API routes
@api_bp.route('/hello', methods=['POST'])
def hello():
    current_app.logger.info('Received request to /api/hello')
    try:
        response = {"message": "Hello World"}
        current_app.logger.info(f'Sending response: {response}')
        return response
    except Exception as e:
        current_app.logger.error(f'Error in /api/hello: {str(e)}')
        return {"error": str(e)}, 500

# Sound routes
@sound_bp.route('/generate', methods=['POST'])
def generateSound():
    current_app.logger.info('Received request to /sound/xxxxx')
    try:
        response = {"message": "Sound endpoint response"}
        current_app.logger.info(f'Sending response: {response}')
        return response
    except Exception as e:
        current_app.logger.error(f'Error in /sound/xxxxx: {str(e)}')
        return {"error": str(e)}, 500
