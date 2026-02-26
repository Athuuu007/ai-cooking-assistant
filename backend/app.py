from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import random
import sqlite3
import google.generativeai as genai
from ultralytics import YOLO

# --- GEMINI AI SETUP ---
genai.configure(api_key="AIzaSyDrYI2F5ZlDG_Z2yALTEjsazuYJc-XK7Mc")

try:
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"⚠️ Warning: Could not load Gemini 2.5 Flash: {e}")
    gemini_model = None

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    name TEXT NOT NULL, 
                    email TEXT UNIQUE NOT NULL, 
                    password TEXT NOT NULL)''')
    conn.commit()
    conn.close()
init_db()

# --- LOAD YOLO MODEL ---
try:
    model = YOLO("yolov8n.pt")
    FOOD_CLASSES = [46, 47, 48, 49, 50, 51, 52, 53, 54, 55] 
    print("✅ YOLOv8 Model Loaded")
except Exception as e:
    model = None

COMMON_INGREDIENTS = ["Tomato", "Onion", "Garlic", "Ginger", "Chicken", "Fish", "Rice", "Paneer", "Potato", "Dal", "Egg", "Brinjal"]

def load_data():
    try:
        df = pd.read_csv('recipes.csv')
        df = df.fillna('')
        df.columns = df.columns.str.strip().str.lower()
        
        recipes = []
        for index, row in df.iterrows():
            title = str(row.get('name', ''))
            instructions = str(row.get('instructions', ''))
            
            dataset_img_url = str(row.get('image_url', row.get('image', ''))).strip()
            if not dataset_img_url.startswith('http'):
                dataset_img_url = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800"
            
            extracted_ings = [ing for ing in COMMON_INGREDIENTS if ing.lower() in (instructions + title).lower()]
            if not extracted_ings: extracted_ings = ["Spices", "Oil", "Salt"]

            recipes.append({
                "id": index,
                "title": title,
                "cuisine": row.get('cuisine', 'Global'),
                "diet": row.get('diet', 'Standard'),
                "time": str(row.get('prep_time', '30')) + " min",
                "image": dataset_img_url, 
                "ingredients": extracted_ings, 
                "instructions": instructions
            })
        print(f"✅ Loaded {len(recipes)} recipes directly using dataset URLs")
        return recipes
    except Exception as e:
        print(f"❌ CSV Error: {e}")
        return []

DATASET = load_data()

# --- ROUTES ---

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "online", "message": "Backend active with Dataset Images"}), 200

@app.route('/api/chat', methods=['POST'])
def chat_with_sous_chef():
    data = request.json
    user_message = data.get('message')
    recipe_context = data.get('recipeContext', {})
    
    if not gemini_model:
        return jsonify({"reply": "My AI connection is offline! Please check your API key and library."}), 500

    prompt = f"You are CulinAI, an expert Sous-Chef. User is cooking: {recipe_context.get('title')}. Question: {user_message}. Reply briefly."
    
    try:
        response = gemini_model.generate_content(prompt)
        reply = response.text if response.parts else "Chef, I didn't quite catch that."
        return jsonify({"reply": reply})
    except Exception as e:
        print(f"❌ CHAT ERROR: {str(e)}")
        error_msg = str(e).lower()
        if "quota" in error_msg or "429" in error_msg:
            return jsonify({"reply": "I'm exhausted, Chef! I've reached my free rate limit. Please wait a minute."}), 500
        return jsonify({"reply": "My connection to the pantry is broken! Check your VS Code terminal for the exact error."}), 500

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    query = request.args.get('search', '').lower()
    
    if query == 'quick_suggestions': 
        return jsonify(random.sample(DATASET, min(len(DATASET), 3)))
        
    if not query: 
        return jsonify(random.sample(DATASET, min(len(DATASET), 6)))
    
    # --- SMART SEARCH FIX ---
    # Split the query by commas into individual ingredients
    terms = [t.strip() for t in query.split(',') if t.strip()]
    
    # 1. First, try to find recipes that contain ALL the ingredients typed
    filtered = [r for r in DATASET if all(t in (str(r['title']) + " " + " ".join(r['ingredients'])).lower() for t in terms)]
    
    # 2. If no recipes match perfectly, fall back to matching ANY of the ingredients
    if not filtered:
        filtered = [r for r in DATASET if any(t in (str(r['title']) + " " + " ".join(r['ingredients'])).lower() for t in terms)]
        
    # 3. If there is still absolutely no match, return some random recipes so the grid doesn't break
    if not filtered:
        return jsonify(random.sample(DATASET, min(len(DATASET), 6)))
        
    return jsonify(filtered[:15])

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)