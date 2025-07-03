
# Live Vision Captioning System

A real-time visual understanding application that combines computer vision, AI-powered image captioning, and text-to-speech synthesis for accessibility and automation.

## Features

- **Real-time Camera Feed**: Live video capture and display
- **AI Image Captioning**: Uses BLIP (Bootstrapping Language-Image Pre-training) for generating natural language descriptions
- **Text-to-Speech**: High-quality speech synthesis with multiple voice options
- **Modern Web Interface**: React-based UI with responsive design
- **Real-time Processing**: Continuous frame analysis and caption generation

## Technology Stack

### Frontend (This React App)
- **React + TypeScript**: Modern web interface
- **Tailwind CSS**: Responsive styling and animations
- **Shadcn/ui**: Professional UI components
- **WebRTC**: Camera access and video streaming

### Backend Integration (Your Python Code)
- **BLIP Model**: Salesforce/blip-image-captioning-base
- **OpenCV**: Video processing and frame capture
- **PyTorch**: Deep learning inference
- **Transformers**: Hugging Face model integration

### Speech Synthesis
- **Browser Speech API**: Fallback text-to-speech
- **ElevenLabs Integration**: Premium AI voice synthesis (recommended)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Webcam/camera device

### Frontend Setup (React App)
1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:8080 in your browser

### Backend Setup (Python Services)

Create a new directory for your Python backend and set up the following files:

#### 1. Requirements File (`requirements.txt`)
```
torch>=1.9.0
torchvision>=0.10.0
transformers>=4.21.0
opencv-python>=4.5.0
Pillow>=8.3.0
flask>=2.0.0
flask-cors>=3.0.0
requests>=2.25.0
numpy>=1.21.0
```

#### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configuration File (`config.py`)
```python
import torch

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Capture settings
CAPTURE_INTERVAL = 3  # seconds between caption generations
```

#### 4. API Server (`app.py`)
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import cv2
import numpy as np
from PIL import Image
from caption_generator import CaptionGenerator

app = Flask(__name__)
CORS(app)

# Initialize caption generator
caption_gen = CaptionGenerator()

@app.route('/generate-caption', methods=['POST'])
def generate_caption():
    try:
        # Get image data from request
        data = request.json
        image_data = data['image'].split(',')[1]  # Remove data:image/jpeg;base64,
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
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
```

#### 5. Start the Python Backend
```bash
python app.py
```

### Integration Steps

1. **Update the Frontend**: In `src/components/CameraFeed.tsx`, replace the mock `generateCaption` function with actual API calls:

```typescript
const generateCaption = async (imageData: string) => {
  onProcessingStateChange(true);
  
  try {
    const response = await fetch('http://localhost:5000/generate-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData })
    });
    
    const result = await response.json();
    
    if (result.success) {
      onCaptionUpdate(result.caption);
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error("Error generating caption:", error);
    onError("Failed to generate caption");
  } finally {
    onProcessingStateChange(false);
  }
};
```

2. **ElevenLabs Speech Integration** (Optional but Recommended):
   - Sign up for ElevenLabs API
   - Add your API key to environment variables
   - Replace browser speech synthesis with ElevenLabs API calls

## Usage

1. **Start both servers**: Python backend (port 5000) and React frontend (port 8080)
2. **Grant camera permissions** when prompted by your browser
3. **Click "Start Live Captioning"** to begin real-time analysis
4. **View live captions** generated from your camera feed
5. **Enable auto-speech** or manually play captions using the speech controls

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │  Python API     │    │  BLIP Model     │
│  (Frontend)     │◄──►│   (Flask)       │◄──►│   (PyTorch)     │
│                 │    │                 │    │                 │
│ • Camera Feed   │    │ • Image Processing   │ • Caption Generation
│ • Controls      │    │ • API Endpoints      │ • Computer Vision
│ • Speech UI     │    │ • CORS handling      │ • Language Model
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Speech API     │
│ (ElevenLabs)    │
│                 │
│ • Voice Synthesis
│ • Audio Generation
│ • Voice Options
└─────────────────┘
```

## Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Check if camera is being used by another application
- Try different browsers (Chrome/Firefox recommended)

### Caption Generation
- Verify Python backend is running on port 5000
- Check CORS configuration for cross-origin requests
- Monitor console logs for API errors

### Performance
- Use GPU acceleration if available (CUDA)
- Adjust `CAPTURE_INTERVAL` for processing speed vs. accuracy
- Consider image resolution optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please check individual model licenses for BLIP and other AI components.
