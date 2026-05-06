# Vehicle Health Monitoring System

A comprehensive real-time vehicle health monitoring application that uses machine learning to predict engine failures and anomalies. The system continuously monitors engine parameters and provides live health status updates through an intuitive web interface.

## 🎯 Features

- **Real-Time Engine Monitoring**: Live streaming of engine parameters with WebSocket support
- **Predictive Analytics**: Machine learning model (Random Forest) for engine failure prediction
- **Anomaly Detection**: Random Forest model predicts anomalous engine behavior
- **SHAP-Based Explainability**: Highlights which features contributed to an anomaly prediction
- **Interactive Dashboard**: Modern React-based UI with real-time charts and visualizations
- **Parameter Tracking**: Monitors 6 critical engine parameters:
  - Engine RPM
  - Lubrication Oil Pressure
  - Fuel Pressure
  - Coolant Pressure
  - Lubrication Oil Temperature
  - Coolant Temperature
- **Health Status Check**: On-demand engine health assessment
- **Visual Alerts**: Clear indicators for normal operation vs. service required

## 🏗️ Project Structure

```
Vehicle Health Monitoring System/
├── backend/
│   ├── Live.py                      # Real-time WebSocket server for streaming data
│   ├── Check.py                     # REST API for on-demand health checks
│   ├── engine_rf_model.pkl          # Trained Random Forest model
│   ├── scaler.pkl                   # Feature scaler for normalization
│   ├── thresholds.pkl               # Threshold configuration
│   ├── engine training data.csv     # Training dataset
│   ├── engine_failure_dataset.csv   # Failure dataset for analysis
│   └── engine test data.xlsx        # Test data for live streaming
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Main application component
    │   ├── Enginelive.jsx           # Real-time engine monitoring page
    │   ├── Checkhealth.jsx          # Health status check page
    │   ├── main.jsx                 # React entry point
    │   └── App.css                  # Application styling
    ├── package.json                 # Frontend dependencies
    ├── vite.config.js               # Vite configuration
    └── eslint.config.js             # ESLint configuration
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure the following files are present in the backend directory:
   - `engine_rf_model.pkl`
   - `scaler.pkl`
   - `engine test data.xlsx`
   - `engine training data.csv`

4. Run the Flask server:
```bash
python Live.py
```

The server will start on `http://localhost:5000` with WebSocket support.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install npm dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite).

## 🔧 Usage

### Live Engine Monitoring

1. Open the application in your browser
2. Click on **"Engine Live Health Monitoring"**
3. The system will stream live engine parameters with:
   - Real-time sensor readings
   - Anomaly detection status
   - Visual indicators for parameter health

### Check Engine Health Status

1. Click on **"Check Engine Health Status"**
2. Input the 6 engine parameters manually
3. The system will:
   - Predict engine condition using the ML model
   - Display parameter status (✅ OK or ⚠️ Out of Bounds)
   - Provide recommendation (🟢 No Service Needed or 🔴 Service Required)

## 🤖 Machine Learning Model

- **Algorithm**: Random Forest Classifier
- **Features**: 6 engine parameters (scaled)
- **Training Data**: Historical engine data with condition labels
- **Predictions**: Binary classification (Normal/Failure)
- **Anomaly Detection**: Statistical method using mean ± 2σ threshold

## 📡 API Endpoints

### WebSocket Events

**Server Events:**
- `receive_data`: Emits live engine data with anomaly detection
- `threshold_values`: Sends engine parameter thresholds
- `check_data`: Returns health check results

**Client Events:**
- `start_stream_data`: Initiates live data streaming
- `start_stream_check`: Submits parameters for health check

## 🛠️ Tech Stack

### Backend
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-SocketIO**: WebSocket support
- **Pandas**: Data manipulation
- **NumPy**: Numerical computations
- **Joblib**: Model serialization
- **Eventlet**: Async I/O for WebSockets

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool
- **React Router**: Client-side routing
- **Bootstrap 5**: UI components
- **React Bootstrap**: Bootstrap components for React
- **Recharts**: Data visualization
- **Socket.io Client**: WebSocket client
- **Axios**: HTTP client
- **FontAwesome**: Icons
- **React Toastify**: Notifications

## 📊 Data Flow

```
Engine Sensors
    ↓
Test Data (Excel/CSV)
    ↓
Feature Scaler (scaler.pkl)
    ↓
Random Forest Model (engine_rf_model.pkl)
    ↓
Anomaly Detection (Thresholds)
    ↓
WebSocket Server (Flask-SocketIO)
    ↓
React Frontend (Real-time Dashboard)
```

## 🔍 Anomaly Detection

The system uses a two-level approach:

1. **Model-Based**: Random Forest predicts if the engine condition is normal (1) or failure (0)
2. **Statistical**: Checks if each parameter falls within `mean ± 2σ` threshold based on training data

An anomaly is flagged if either condition is violated.

## 📈 Monitoring Dashboard

The live dashboard displays:
- **Parameter Charts**: Real-time graphs of all 6 engine parameters
- **Status Indicators**: Visual indicators for each parameter
- **Anomaly Alerts**: Highlighted when anomalies are detected
- **Threshold Lines**: Reference lines showing acceptable ranges

## ⚙️ Configuration

### Threshold Management
Thresholds are calculated from the training data and stored in `scaler.pkl`. To update thresholds:
1. Retrain the model with new data
2. Update `engine training data.csv`
3. Regenerate pickle files

### Server Configuration
- **Host**: localhost
- **Backend Port**: 5000
- **Frontend Port**: 5173 (Vite default)
- **CORS**: Enabled for all origins

## 🐛 Troubleshooting

### ModuleNotFoundError
Install missing packages:
```bash
pip install -r requirements.txt
```

### WebSocket Connection Issues
- Ensure backend is running on correct port
- Check CORS settings in Flask-SocketIO
- Verify frontend is connecting to correct server URL

### Model Not Found
- Ensure `engine_rf_model.pkl` and `scaler.pkl` are in the backend directory
- Retrain the model if files are corrupted

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For questions or issues, please open an issue on the GitHub repository.

---

**Built with ❤️ for vehicle health monitoring**
