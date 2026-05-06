from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import shap
from flask import Flask
from flask_socketio import SocketIO
import time
import threading

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

model = joblib.load("engine_rf_model.pkl")
scaler = joblib.load("scaler.pkl")
explainer = shap.TreeExplainer(model)


df = pd.read_excel("engine test data.xlsx")
df_train = pd.read_csv("engine training data.csv")

feature_columns = ["Engine rpm", "Lub oil pressure", "Fuel pressure", "Coolant pressure", "Lub oil temp", "Coolant temp"]
target_column = "Engine Condition"
anomaly_class_label = 0
anomaly_class_index = int(np.where(model.classes_ == anomaly_class_label)[0][0])


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


def detect_threshold_violations(row):
    violations = {}
    for feature, (min_val, max_val) in thresholds.items():
        violations[feature] = bool(not (min_val <= row[feature] <= max_val))
    return violations


def get_anomaly_class_contributions(scaled_input):
    explanation = explainer(scaled_input)
    shap_values = explanation.values

    if isinstance(shap_values, list):
        return np.asarray(shap_values[anomaly_class_index][0], dtype=float)

    shap_values = np.asarray(shap_values, dtype=float)
    if shap_values.ndim == 3:
        return shap_values[0, :, anomaly_class_index]
    if shap_values.ndim == 2:
        return shap_values[0]
    if shap_values.ndim == 1:
        return shap_values
    raise ValueError(f"Unsupported SHAP output shape: {shap_values.shape}")


def build_shap_anomaly_details(model_anomaly, scaled_input):
    zero_flags = {feature: False for feature in feature_columns}
    zero_contributions = {feature: 0.0 for feature in feature_columns}

    if not model_anomaly:
        return zero_flags, zero_contributions

    contributions = get_anomaly_class_contributions(scaled_input)
    anomaly_details = {
        feature: bool(contribution > 0)
        for feature, contribution in zip(feature_columns, contributions)
    }

    if not any(anomaly_details.values()):
        top_feature = feature_columns[int(np.argmax(contributions))]
        anomaly_details[top_feature] = True

    shap_contributions = {
        feature: float(contribution)
        for feature, contribution in zip(feature_columns, contributions)
    }
    return anomaly_details, shap_contributions

streaming_thread1 = None
streaming_active = False

def send_live_data():
    global streaming_active
    streaming_active = True

    for index, row in df_scaled.iterrows():
        if not streaming_active:
            break

        try:
            predicted_condition = int(df_scaled.loc[index, target_column])
            anomaly_flag = predicted_condition == 0
            scaled_input = np.array([row[feature_columns].to_numpy(dtype=float)])
            scaled_series = pd.Series(scaled_input[0], index=feature_columns)
            threshold_violations = detect_threshold_violations(scaled_series)
            anomaly_details, shap_contributions = build_shap_anomaly_details(
                anomaly_flag, scaled_input
            )
            data_point = {
                "Engine RPM": float(df.loc[index, "Engine rpm"]),
                "Lub Oil Pressure": float(df.loc[index, "Lub oil pressure"]),
                "Fuel Pressure": float(df.loc[index, "Fuel pressure"]),
                "Coolant Pressure": float(df.loc[index, "Coolant pressure"]),
                "Lub Oil Temp": float(df.loc[index, "Lub oil temp"]),
                "Coolant Temp": float(df.loc[index, "Coolant temp"]),
                "Predicted Engine Condition": predicted_condition,
                "Prediction": "Service Required" if anomaly_flag else "No Service Needed",
                "Anomaly": anomaly_flag,
                "Anomaly Details": anomaly_details,
                "Threshold Violations": threshold_violations,
                "SHAP Contributions": shap_contributions
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
        predicted_condition = int(model.predict(scaled_input)[0])
        anomaly_flag = predicted_condition == 0
        input_series = pd.Series(scaled_input[0], index=feature_columns)
        threshold_violations = detect_threshold_violations(input_series)
        anomaly_details, shap_contributions = build_shap_anomaly_details(
            anomaly_flag, scaled_input
        )
        check_data = {
                    "Predicted Engine Condition": predicted_condition,
                    "Prediction": "Service Required" if anomaly_flag else "No Service Needed",
                    "Anomaly": anomaly_flag,
                    "Anomaly Details": anomaly_details,
                    "Threshold Violations": threshold_violations,
                    "SHAP Contributions": shap_contributions
                }
        socketio.emit("check_data",check_data)
    except Exception as e:
        print("Error in handle_start_check_stream:", e)
        socketio.emit("check_data", {"error": str(e)})
    

if __name__ == "__main__":
    socketio.run(app, debug=True)
