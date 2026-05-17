import os
import numpy as np
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False
    print("Warning: TensorFlow not found. Running in mock mode.")

app = Flask(__name__)

# Configurations
UPLOAD_FOLDER = 'uploads'
MODEL_PATH = 'model/model.h5'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the AI model
model = None
if HAS_TENSORFLOW and os.path.exists(MODEL_PATH):
    try:
        model = load_model(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    if not HAS_TENSORFLOW:
        print("TensorFlow is not installed. AI predictions will be simulated.")
    else:
        print("Model file not found. AI predictions will be simulated.")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_freshness(img_path):
    if not HAS_TENSORFLOW or model is None:
        # Mock logic if model is not available
        import random
        result = random.choice(['Fresh', 'Spoiled'])
        confidence = round(random.uniform(0.7, 0.99), 2)
        return result, confidence
    
    # Load and preprocess image
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    
    # Predict
    prediction = model.predict(img_array)
    # Assuming model output: 0 for Fresh, 1 for Spoiled (depends on how model was trained)
    # If it's a softmax output, we'll get probabilities
    fresh_prob = prediction[0][0] # Adjust based on your model's output layer
    
    if fresh_prob > 0.5:
        return 'Fresh', float(fresh_prob)
    else:
        return 'Spoiled', float(1 - fresh_prob)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            result, confidence = predict_freshness(filepath)
            return jsonify({
                'result': result,
                'confidence': confidence,
                'status': 'success'
            })
        except Exception as e:
            return jsonify({'error': str(e)})
        finally:
            # Clean up: delete uploaded file after processing
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Invalid file type'})

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0,  port=5001, debug=False)
