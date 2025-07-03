from flask import Flask, request, jsonify 
from flask_cors import CORS
from PIL import Image
import numpy as np
from caption_generator import CaptionGenerator

app = Flask(__name__)
CORS(app)

# Initialize caption generator
caption_gen = CaptionGenerator()

@app.route('/generate-caption', methods=['POST'])
def generate_caption():
    try:
        # Get image file from the request
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided'}), 400

        file = request.files['image']
        image = Image.open(file.stream)

        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Generate caption
        caption = caption_gen.generate_caption(np.array(image))
        
        return jsonify({
            'success': True,
            'caption': caption
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
