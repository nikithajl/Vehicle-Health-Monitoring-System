# Vehicle Health Monitoring System

## Description
A web-based system that analyzes real-time vehicle sensor data using machine learning to detect anomalies and display engine health visually.

## Features
- Real-time anomaly detection using ML
- Interactive data visualization with graphs
- Alerts for abnormal engine conditions
- React frontend + Flask backend architecture

## Tech Stack
- Frontend: React, Chart.js
- Backend: Flask, Python
- ML / AI: Random Forest
- Database: None (can be extended)

## Installation
```bash
git clone https://github.com/nikithajl/Vehicle-Health-Monitoring-System.git
cd Vehicle-Health-Monitoring-System
pip install -r requirements.txt

Usage
Start the backend server:
cd backend
python Live.py

Start the frontend server:
cd frontend
npm install
npm run dev

Open the application in your browser:
http://localhost:5173


Enter engine parameters and view:
Real-time graphs
Anomaly detection results
Engine health status

Vehicle-Health-Monitoring-System/
│
├── backend/
│   ├── Live.py
│   ├── engine_rf_model.pkl
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md

