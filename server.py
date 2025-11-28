from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

GEMINI_KEY = os.getenv("GEMINI_API_KEY")


@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.json
    chat = data.get("chat")
    days = data.get("days")

    if chat:
        prompt = f"You are TravelBuddy Hubli AI. User: {chat}"
        model = "gemini-1.5-flash"
    else:
        prompt = f"Create a detailed {days}-day Hubli travel plan."
        model = "gemini-1.5-pro"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_KEY}"

    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    res = requests.post(url, json=payload)
    result = res.json()

    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
    except:
        text = "AI Error. Check API response."

    return jsonify({"success": True, "result": text})


@app.route("/")
def home():
    return "Gemini API working locally!"


if __name__ == "__main__":
    app.run(port=5000, debug=True)