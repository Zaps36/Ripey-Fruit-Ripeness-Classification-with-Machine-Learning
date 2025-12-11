from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import numpy as np
import joblib
import cv2
from skimage import feature
from skimage.color import rgb2gray
import xgboost as xgb
from PIL import Image
import io
import base64
import os
import psycopg2
from datetime import datetime, timedelta
import uuid
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'fruit_app'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'password')
        )
        return conn
    except psycopg2.OperationalError as e:
        print(f"[v0] Database connection failed: {e}")
        return None
    except Exception as e:
        print(f"[v0] Unexpected database error: {e}")
        return None

# Initialize database tables
def init_db():
    conn = get_db_connection()
    if conn is None:
        print("[v0] Skipping database initialization - connection failed")
        return False
    
    try:
        cur = conn.cursor()
        
        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Create history_entries table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS history_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                fruit VARCHAR(100) NOT NULL,
                label VARCHAR(50) NOT NULL,
                score DECIMAL(3,2) NOT NULL,
                preview_data_url TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("[v0] Database tables initialized successfully")
        return True
    except Exception as e:
        print(f"[v0] Database table initialization failed: {e}")
        return False

# Load model and artifacts
MODEL_DIR = "best_model_traditionalML"
MODEL_PATH = os.path.join(MODEL_DIR, "best_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

model = None
scaler = None
label_encoder = None

def extract_lbp(image_gray, P=8, R=1):
    """
    Extracts Local Binary Pattern (LBP) histogram.
    Using 'nri_uniform' (Non-Rotation-Invariant Uniform) yields 59 patterns.
    """
    # Suppress warning about floating point image for LBP as it matches training logic
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        lbp = feature.local_binary_pattern(image_gray, P, R, method='nri_uniform')

    # Calculate histogram (59 bins)
    n_bins = 59
    hist, _ = np.histogram(lbp.ravel(), bins=n_bins, range=(0, n_bins))

    # Normalize histogram
    hist = hist.astype("float")
    hist /= (hist.sum() + 1e-6)
    return hist

def extract_glcm(image_gray):
    """
    Extracts GLCM Texture Features.
    Distances: [1], Angles: 0, 45, 90, 135 degrees
    Properties: Contrast, Homogeneity, Energy, Correlation
    """
    # Convert image to uint8 (0-255) required for GLCM
    img_arr = (image_gray * 255).astype(np.uint8)

    # Angles in radians
    angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]

    # Calculate GLCM
    glcm = feature.graycomatrix(img_arr, distances=[1], angles=angles,
                                levels=256, symmetric=True, normed=True)

    # Extract properties
    props = ['contrast', 'homogeneity', 'energy', 'correlation']
    features = []

    for prop in props:
        val = feature.graycoprops(glcm, prop).flatten()
        features.extend(val)

    return np.array(features)

def extract_color_hist(image_rgb):
    """
    Extracts Color Histogram features (HSV space).
    """
    # Convert RGB to HSV
    hsv_image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2HSV)

    # Compute histogram for each channel (21 bins per channel)
    hist_features = []
    for i in range(3): # H, S, V channels
        hist = cv2.calcHist([hsv_image], [i], None, [21], [0, 256])
        cv2.normalize(hist, hist) # Normalize
        hist_features.extend(hist.flatten())

    return np.array(hist_features)

def extract_features(img_rgb):
    """
    Master function: Resize -> Gray -> Extract LBP/GLCM/Color -> Concatenate
    Expected input: RGB numpy array (uint8)
    """
    # 1. Resize to 128x128
    img_rgb = cv2.resize(img_rgb, (128, 128))

    # 2. Convert to Grayscale for Texture
    img_gray = rgb2gray(img_rgb)

    # 3. Extract Features
    lbp_feat = extract_lbp(img_gray, P=8, R=1)      # ~59 features
    glcm_feat = extract_glcm(img_gray)              # ~16 features
    color_feat = extract_color_hist(img_rgb)        # ~63 features

    # 4. Concatenate
    final_vector = np.concatenate([lbp_feat, glcm_feat, color_feat])

    return final_vector

def load_model_and_labels():
    global model, scaler, label_encoder
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH) and os.path.exists(ENCODER_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            label_encoder = joblib.load(ENCODER_PATH)
            print(f"[v0] ML Model, Scaler, and Encoder loaded successfully.")
        else:
            print(f"[v0] One or more model files missing in {MODEL_DIR}. Using placeholder.")
            model = None
    except Exception as e:
        print(f"[v0] Error loading model: {e}")
        model = None

def parse_label(full_label):
    """Parse the full label into ripeness and fruit name"""
    if full_label.startswith("Ripe"):
        ripeness = "Ripe"
        fruit = full_label.replace("Ripe", "")
    elif full_label.startswith("Rotten"):
        ripeness = "Rotten"
        fruit = full_label.replace("Rotten", "")
    elif full_label.startswith("Unripe"):
        ripeness = "Unripe"
        fruit = full_label.replace("Unripe", "")
    else:
        ripeness = "Unknown"
        fruit = full_label
    
    return ripeness, fruit

# Authentication routes with consistent error format
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')

    if not email or not password:
        return jsonify({
            'success': False,
            'error': 'Email and password required',
            'code': 'MISSING_FIELDS'
        }), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({
            'success': False,
            'error': 'Database connection failed',
            'code': 'DATABASE_ERROR'
        }), 500

    try:
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({
                'success': False,
                'error': 'User with this email already exists',
                'code': 'USER_EXISTS'
            }), 400

        # Validate email format
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'error': 'Please enter a valid email address',
                'code': 'INVALID_EMAIL'
            }), 400

        # Validate password length
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 6 characters long',
                'code': 'PASSWORD_TOO_SHORT'
            }), 400

        # Create user
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        cur.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
            (email, password_hash, name)
        )
        
        user_id = cur.fetchone()[0]
        
        # Create JWT token
        access_token = create_access_token(identity=str(user_id))
        
        conn.commit()

        return jsonify({
            'success': True,
            'access_token': access_token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            'success': False,
            'error': 'Server error during registration',
            'code': 'SERVER_ERROR'
        }), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({
            'success': False,
            'error': 'Email and password required',
            'code': 'MISSING_FIELDS'
        }), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({
            'success': False,
            'error': 'Database connection failed',
            'code': 'DATABASE_ERROR'
        }), 500

    try:
        cur = conn.cursor()
        
        # Get user
        cur.execute("SELECT id, email, password_hash, name FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password',
                'code': 'INVALID_CREDENTIALS'
            }), 401

        if not bcrypt.check_password_hash(user[2], password):
            return jsonify({
                'success': False,
                'error': 'Invalid email or password',
                'code': 'INVALID_CREDENTIALS'
            }), 401

        # Create JWT token
        access_token = create_access_token(identity=str(user[0]))

        return jsonify({
            'success': True,
            'access_token': access_token,
            'user': {
                'id': user[0],
                'email': user[1],
                'name': user[3]
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Server error during login',
            'code': 'SERVER_ERROR'
        }), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cur = conn.cursor()
        
        cur.execute("SELECT id, email, name FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': {
                'id': user[0],
                'email': user[1],
                'name': user[2]
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

# History routes
@app.route("/api/history", methods=["GET"])
@jwt_required()
def get_user_history():
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, fruit, label, score, preview_data_url, created_at 
            FROM history_entries 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        
        entries = []
        for row in cur.fetchall():
            entries.append({
                'id': row[0],
                'fruit': row[1],
                'label': row[2],
                'score': float(row[3]),
                'previewDataUrl': row[4],
                'createdAt': int(row[5].timestamp() * 1000)  # Convert to milliseconds
            })
        
        return jsonify(entries), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route("/api/history", methods=["POST"])
@jwt_required()
def add_history_entry():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO history_entries (user_id, fruit, label, score, preview_data_url)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        """, (
            user_id,
            data['fruit'],
            data['label'],
            data['score'],
            data['previewDataUrl']
        ))
        
        entry_id = cur.fetchone()[0]
        conn.commit()

        return jsonify({'id': entry_id, 'message': 'Entry saved'}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route("/api/history/<entry_id>", methods=["DELETE"])
@jwt_required()
def delete_history_entry(entry_id):
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cur = conn.cursor()
        
        cur.execute("DELETE FROM history_entries WHERE id = %s AND user_id = %s", (entry_id, user_id))
        conn.commit()
        
        return jsonify({'message': 'Entry deleted'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

# Prediction route (original functionality)
@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects JSON with:
    {
      "image": "data:image/jpeg;base64,..." or base64 string
    }
    Returns:
    {
      "fruit": "Apple",
      "label": "RipeApple",
      "confidence": 0.95,
      "error": null
    }
    """
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"error": "Missing 'image' field"}), 400
        
        image_data = data["image"]
        
        # Handle data URL format
        if image_data.startswith("data:"):
            image_data = image_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # If model is not loaded, return placeholder prediction
        if model is None or scaler is None or label_encoder is None:
            return jsonify({
                "fruit": "Apple",
                "label": "RipeApple",
                "confidence": 0.8,
                "error": "ML Model not loaded correctly. Using placeholder."
            }), 200
        
        # --- NEW PREDICTION PIPELINE ---
        # 1. Convert PIL Image to Numpy Array (RGB)
        img_rgb = np.array(image) # This is RGB because we did .convert("RGB")
        
        # OPTIMIZATION: Center Crop
        # Crop the center square/rectangle to remove background noise (tables, walls)
        h, w, _ = img_rgb.shape
        min_dim = min(h, w)
        # Keep 75% of the smallest dimension as the crop size
        crop_size = int(min_dim * 0.75)
        
        start_y = (h - crop_size) // 2
        start_x = (w - crop_size) // 2
        
        img_cropped = img_rgb[start_y:start_y+crop_size, start_x:start_x+crop_size]
        
        # 2. Extract Features
        # extract_features expects RGB uint8
        features = extract_features(img_cropped)
        
        # Reshape for scalar (1, n_features)
        features = features.reshape(1, -1)
        
        # 3. Scale Features
        features_scaled = scaler.transform(features)
        
        # 4. Predict
        if hasattr(model, "predict_proba"):
            probas = model.predict_proba(features_scaled)
            predicted_class_idx = np.argmax(probas[0])
            confidence = float(probas[0][predicted_class_idx])
        else:
            # Fallback if probability not available (e.g. SVM without prob)
            predicted_class_idx = model.predict(features_scaled)[0]
            confidence = 1.0 # Cannot determine confidence easily
            
        # 5. Decode Label
        full_label = label_encoder.inverse_transform([predicted_class_idx])[0]
        
        # Parse the label to get fruit name
        ripeness, fruit_name = parse_label(full_label)
        
        return jsonify({
            "fruit": fruit_name,
            "label": full_label,  # Return the full label for reference
            "confidence": confidence,
            "error": None
        }), 200
    
    except Exception as e:
        print(f"[v0] Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "fruit": "Unknown",
            "label": "Unknown",
            "confidence": 0.0
        }), 500

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    conn = get_db_connection()
    db_status = "connected" if conn else "disconnected"
    if conn:
        conn.close()
    
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None and scaler is not None and label_encoder is not None,
        "database": db_status
    }), 200

# Initialize everything
print("[v0] Starting Fruit Ripeness Scanner...")
db_initialized = init_db()
load_model_and_labels()
print("[v0] Application started successfully")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)