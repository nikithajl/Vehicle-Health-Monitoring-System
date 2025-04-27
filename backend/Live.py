from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
from flask import Flask
from flask_socketio import SocketIO
import time
import threading

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

model = joblib.load("engine_rf_model.pkl")
scaler = joblib.load("scaler.pkl")


df = pd.read_excel("engine test data.xlsx")
df_train = pd.read_csv("engine training data.csv")

feature_columns = ["Engine rpm", "Lub oil pressure", "Fuel pressure", "Coolant pressure", "Lub oil temp", "Coolant temp"]
target_column = "Engine Condition"


df_scaled = df.copy()
df_scaled_train = df_train.copy()
df_scaled_train[feature_columns] = scaler.transform(df_train[feature_columns])
df_scaled[feature_columns] = scaler.transform(df[feature_columns])
df_scaled[target_column] = model.predict(df_scaled[feature_columns])


normal_data = df_scaled_train[df_scaled_train[target_column] == 1]
thresholds = {
    col: (normal_data[col].mean() - 2 * normal_data[col].std(), 
          normal_data[col].mean() + 2 * normal_data[col].std())
    for col in feature_columns
}

def detect_anomalies(row):
    anomalies = {}
    for feature, (min_val, max_val) in thresholds.items():
        anomalies[feature] = not (min_val <= row[feature] <= max_val)
    return any(anomalies.values()), anomalies

streaming_thread1 = None
streaming_active = False

def send_live_data():
    global streaming_active
    streaming_active = True

    for index, row in df_scaled.iterrows():
        if not streaming_active:
            break

        try:
            anomaly_flag, anomaly_details = detect_anomalies(row)
            data_point = {
                "Engine RPM": float(df.loc[index, "Engine rpm"]),
                "Lub Oil Pressure": float(df.loc[index, "Lub oil pressure"]),
                "Fuel Pressure": float(df.loc[index, "Fuel pressure"]),
                "Coolant Pressure": float(df.loc[index, "Coolant pressure"]),
                "Lub Oil Temp": float(df.loc[index, "Lub oil temp"]),
                "Coolant Temp": float(df.loc[index, "Coolant temp"]),
                "Anomaly": anomaly_flag,
                "Anomaly Details": anomaly_details
            }
            print("Sending Data:", data_point)
            socketio.emit("receive_data", data_point)
        except Exception as e:
            print(f"Error processing row {index}: {e}")

        time.sleep(2)

threshold_min = []
threshold_max = []

for feature in feature_columns:
    min_val, max_val = thresholds[feature]
    threshold_min.append(min_val)
    threshold_max.append(max_val)

# Create two rows: one for min values, one for max values
threshold_array = np.array([threshold_min, threshold_max])  # shape: [2, num_features]

# Inverse transform to get original values
inverse_scaled_thresholds = scaler.inverse_transform(threshold_array)

# Build dictionary of original thresholds
original_thresholds = {}

for i, feature in enumerate(feature_columns):
    original_thresholds[feature] = (
        inverse_scaled_thresholds[0][i], 
        inverse_scaled_thresholds[1][i]   
    )


@socketio.on("start_stream_data")
def handle_start_data_stream():
    global streaming_thread1, streaming_active
    if streaming_thread1 is None or not streaming_thread1.is_alive():
        print("Starting Data Stream...")
        streaming_thread1 = threading.Thread(target=send_live_data, daemon=True)
        streaming_thread1.start()
    socketio.emit("threshold_values", original_thresholds)

@socketio.on("start_stream_check")
def handle_start_check_stream(data):
    try:
        input_data = np.array([data['features']])
        scaled_input = scaler.transform(input_data)
        input_series = pd.Series(scaled_input[0], index=feature_columns)
        anomaly_flag, anomaly_details = detect_anomalies(input_series)
        check_data = {
                    "Anomaly": anomaly_flag,
                    "Anomaly Details": anomaly_details
                }
        socketio.emit("check_data",check_data)
    except Exception as e:
        print("Error in handle_start_check_stream:", e)
        socketio.emit("check_data", {"error": str(e)})
    

if __name__ == "__main__":
    socketio.run(app, debug=True)

