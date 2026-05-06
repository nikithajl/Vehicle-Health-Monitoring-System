from flask import Flask, jsonify, request
import numpy as np
import joblib
import shap
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load trained model and scaler
model = joblib.load("engine_rf_model.pkl")
scaler = joblib.load("scaler.pkl")
explainer = shap.TreeExplainer(model)

feature_columns = [
    "Engine rpm",
    "Lub oil pressure",
    "Fuel pressure",
    "Coolant pressure",
    "Lub oil temp",
    "Coolant temp",
]
target_column = "Engine Condition"
anomaly_class_label = 0
anomaly_class_index = int(np.where(model.classes_ == anomaly_class_label)[0][0])

df_train = pd.read_csv("engine training data.csv")
df_scaled_train = df_train.copy()
df_scaled_train[feature_columns] = scaler.transform(df_train[feature_columns])

normal_data = df_scaled_train[df_scaled_train[target_column] == 1]
thresholds = {
    col: (normal_data[col].mean() - 2 * normal_data[col].std(),
          normal_data[col].mean() + 2 * normal_data[col].std())
    for col in feature_columns
}


def detect_threshold_violations(row):
    return {
        feature: bool(not (min_val <= row[feature] <= max_val))
        for feature, (min_val, max_val) in thresholds.items()
    }


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


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    input_data = np.array([data["features"]])
    scaled_input = scaler.transform(input_data)

    prediction = int(model.predict(scaled_input)[0])
    anomaly = prediction == 0
    input_series = pd.Series(scaled_input[0], index=feature_columns)
    threshold_violations = detect_threshold_violations(input_series)
    anomaly_details, shap_contributions = build_shap_anomaly_details(
        anomaly, scaled_input
    )

    param_status = {
        param: {
            "value": val,
            "status": "Model Contributor" if anomaly_details[param] else "OK",
        }
        for param, val in zip(feature_columns, data["features"])
    }

    response = {
        "prediction": "Service Required" if anomaly else "No Service Needed",
        "anomaly": anomaly,
        "anomaly_details": anomaly_details,
        "threshold_violations": threshold_violations,
        "shap_contributions": shap_contributions,
        "parameters": param_status,
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
