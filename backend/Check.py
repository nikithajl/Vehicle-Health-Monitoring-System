from flask import Flask
import numpy as np
import joblib
from flask_cors import CORS
import pandas as pd
from flask_socketio import SocketIO
import threading

app = Flask(__name__)

# Load trained model and scalers
model = joblib.load("engine_rf_model.pkl")
scaler = joblib.load("scaler.pkl")

thresholds = {
    "Engine rpm": (900, 3000),
    "Lub oil pressure": (2, 5),
    "Fuel pressure": (1.5, 4.5),
    "Coolant pressure": (1, 3.5),
    "lub oil temp": (50, 90),
    "Coolant temp": (60, 100)
}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_data = np.array([data['features']])
    scaled_input = scaler.transform(input_data)
    
    prediction = model.predict(scaled_input)[0]
    anomaly = prediction == 0

    param_status = {
        param: {"value": val, "status": "⚠️ Out of Bounds" if not (thresholds[param][0] <= val <= thresholds[param][1]) else "✅ OK"}
        for param, val in zip(thresholds.keys(), data['features'])
    }

    response = {
        "prediction": "🔴 Service Required" if anomaly else "🟢 No Service Needed",
        "parameters": param_status
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)