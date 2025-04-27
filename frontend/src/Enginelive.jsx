import annotationPlugin from "chartjs-plugin-annotation";
import { Chart } from "chart.js";
import { Container, ProgressBar} from "react-bootstrap"; 
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState,useRef } from "react";
import { io } from "socket.io-client";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

Chart.register(annotationPlugin);

const socket = io("http://localhost:5000");

const Enginelive = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [health, setHealth ] = useState(100);
  const [thresholds, setThresholds] = useState({});
  const alertTriggered = useRef(false);


  useEffect(() => {
    const handleThreshold = (Data) => {
      console.log("Received Thresholds:", Data);
      setThresholds( Data ); 
    };
    
    socket.on("threshold_values", handleThreshold);
    return () => {
      socket.off("threshold_values",handleThreshold);
    };
  }, []);

  useEffect(() => {
    const handleNewData = (newData) => {
        console.log("Received Data:", newData); 
        setDataPoints((prev) => {
            const updatedData = [...prev, newData];
            return updatedData.length > 25 ? updatedData.slice(-25) : updatedData; // Keep only last 25 points
        });

    };

    socket.on("receive_data", handleNewData);
    socket.emit("start_stream_data");

    return () => {
      socket.off("receive_data", handleNewData); 
    };
  }, []);

  useEffect(() => {
    if (dataPoints.length === 0) return; 
  
    const latestData = dataPoints[dataPoints.length - 1]; // Get the latest data point
    const anomalyDetected = Object.values(latestData["Anomaly Details"]).some(value => value === true);
  
    if (anomalyDetected) {
      const randomDecrease = Math.floor(Math.random() * 5) + 1; 
      setHealth(prevHealth => Math.max(prevHealth - randomDecrease, 40)); 
    }
  }, [dataPoints]); 
  
  
  useEffect(() => {
    if (health <= 40 && !alertTriggered.current) {
      alert("Warning! Engine health is critically low.");
      alertTriggered.current = true; 
    }
  }, [health]); 

  const graph1Data = {
    labels: dataPoints.map((point) => point["Engine RPM"]),
    datasets: [
      {
        label: "Lub Oil Pressure",
        data: dataPoints.map((point) => point["Lub Oil Pressure"] || 0),
        borderColor:"yellow",
        pointBorderColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Lub oil pressure"]===true ? "red" : "yellow"
        ),
        pointBackgroundColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Lub oil pressure"]===true ? "red" : "yellow"
        ),
        pointRadius: 5,
        fill: false
      },
      
      {
        label: "Coolant Pressure",
        data: dataPoints.map((point) => point["Coolant Pressure"] || 0),
        borderColor:"green",
        pointBorderColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Coolant pressure"]===true ? "red" : "green"
        ),
        pointBackgroundColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Coolant pressure"]===true ? "red" : "green"
        ),
        pointRadius: 5,
        fill: false,
      },
      {
        label: "Fuel Pressure",
        data: dataPoints.map((point) => point["Fuel Pressure"] || 0),
        borderColor:"RoyalBlue",
        pointBorderColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Fuel pressure"]===true ? "red" : "RoyalBlue"
        ),
        pointBackgroundColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Fuel pressure"]===true? "red" : "RoyalBlue"
        ),
        pointRadius: 5,
        fill: false,
      },
      {
        label: "Anomaly Indicator",
        data: dataPoints.filter((point) => point["Anomaly Details"]["Engine rpm"] === true).map((point) => ({x: point["Engine RPM"],y: 0,})),
        borderColor: "red",
        backgroundColor: "red", 
        pointBorderColor: "red",
        pointBackgroundColor: "red",
        pointRadius: 5,
        pointStyle: 'circle',
        showLine: false,
      },
      
    ],

  };

  const graph2Data = {
    labels: dataPoints.map((point) => point["Engine RPM"]),
    datasets: [
      {
        label: "Coolant Temp",
        data: dataPoints.map((point) => point["Coolant Temp"] || 0),
        borderColor:"white",
        pointBorderColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Coolant temp"]===true ? "red" : "white"
        ),
        pointBackgroundColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Coolant temp"]===true ? "red" : "white"
        ),
        pointRadius: 5,
        fill: false,
      },
      {
        label: "Lub Oil Temp",
        data: dataPoints.map((point) => point["Lub Oil Temp"] || 0),
        borderColor:"Purple",
        pointBorderColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Lub oil temp"]===true ? "red" : "Purple"
        ),
        pointBackgroundColor: dataPoints.map((point) => 
          point["Anomaly Details"]["Lub oil temp"]===true ? "red" : "Purple"
        ),
        pointRadius: 5,
        fill: false,
      },
      {
        label: "Anomaly Indicator",
        data: dataPoints.filter((point) => point["Anomaly Details"]["Engine rpm"] === true).map((point) => ({x: point["Engine RPM"],y: 0,})),
        borderColor: "red",
        backgroundColor: "red", 
        pointBorderColor: "red",
        pointBackgroundColor: "red",
        pointRadius: 5,
        pointStyle: 'circle',
        showLine: false,
      }
    ],
  };

  const chartOptions1 = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Engine RPM",
          color: "white"
        },
        ticks: { color: "white" },
        grid: {
          color: "rgba(255,255,255,0.1)" 
        }
      },
      y: {
        title:{
          display: true,
          text: "Pressure",
          color:"white"
        },
        beginAtZero: false,
        ticks: { color: "white" },
        grid: {
          color: "rgba(255,255,255,0.1)"
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "white" 
        }
      },
      annotation: {
        annotations: {
          minThresholdlop: {
            type: "line",
            yMin: thresholds["Lub oil pressure"]?.[0],
            yMax:thresholds["Lub oil pressure"]?.[0],
            borderColor: "yellow",
            borderDash: [6, 6], 
            borderWidth: 2,
            label: {
              display: true,
              content: "Min Lub Oil",
              color: "yellow",
              backgroundColor: "black",
              position: "end",
            },
          },
          minThresholdcp: {
            type: "line",
            yMin: thresholds["Coolant pressure"]?.[0],
            yMax:thresholds["Coolant pressure"]?.[0],
            borderColor: "green",
            borderDash: [6, 6], 
            borderWidth: 2,
            label: {
              display: true,
              content: "Min Coolant",
              color: "green",
              backgroundColor: "black",
              position: "end",
            },
          },
          minThresholdfp: {
            type: "line",
            yMin: thresholds["Fuel pressure"]?.[0],
            yMax:thresholds["Fuel pressure"]?.[0],
            borderColor: "RoyalBlue",
            borderDash: [6, 6], 
            borderWidth: 2,
            label: {
              display: true,
              content: "Min Fuel",
              color: "RoyalBlue",
              backgroundColor: "black",
              position: "end",
            },
          },
          maxThresholdlop: {
            type: "line",
            yMin: thresholds["Lub oil pressure"]?.[1], 
            yMax:thresholds["Lub oil pressure"]?.[1],
            borderColor: "yellow",
            borderDash: [6, 6],  
            borderWidth: 2,
            label: {
              display: true,
              content: "Max Lub Oil",
              color: "yellow",
              backgroundColor: "black",
              position: "end",
            },
          },
          maxThresholdcp: {
            type: "line",
            yMin: thresholds["Coolant pressure"]?.[1], 
            yMax:thresholds["Coolant pressure"]?.[1],
            borderColor: "green",
            borderDash: [6, 6],  
            borderWidth: 2,
            label: {
              display: true,
              content: "Max Coolant",
              color: "green",
              backgroundColor: "black",
              position: "end",
            },
          },
          maxThresholdfp: {
            type: "line",
            yMin: thresholds["Fuel pressure"]?.[1], 
            yMax:thresholds["Fuel pressure"]?.[1],
            borderColor: "RoyalBlue",
            borderDash: [6, 6],  
            borderWidth: 2,
            label: {
              display: true,
              content: "Max Fuel",
              color: "RoyalBlue",
              backgroundColor: "black",
              position: "end",
            },
          }
        }
        
      },
    },
  };
  
  const chartOptions2 = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Engine RPM",
          color: "white"
        },
        ticks: { color: "white" },
        grid: {
          color: "rgba(255,255,255,0.1)" 
        }
      },
      y: {
        title:{
          display: true,
          text: "Temperature",
          color:"white"
        },
        beginAtZero: false,
        ticks: { color: "white" },
        grid: {
          color: "rgba(255,255,255,0.1)"
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "white" 
        }
      },
      annotation: {
        annotations: {
          minThresholdct: {
            type: "line",
            yMin: thresholds["Coolant temp"]?.[0],
            yMax: thresholds["Coolant temp"]?.[0],
            borderColor: "white",
            borderDash: [6, 6],
            borderWidth: 2,
            label: {
              display: true,
              content: "Min Coolant Temp",
              color: "white",
              backgroundColor: "black",
              position: "end",
            },
          },
          minThresholdlot: {
            type: "line",
            yMin: thresholds["Lub oil temp"]?.[0],
            yMax: thresholds["Lub oil temp"]?.[0],
            borderColor: "purple",
            borderDash: [6, 6],
            borderWidth: 2,
            label: {
              display: true,
              content: "Min Lub Oil Temp",
              color: "purple",
              backgroundColor: "black",
              position: "end",
            },
          },
          maxThresholdct: {
            type: "line",
            yMin: thresholds["Coolant temp"]?.[1],
            yMax: thresholds["Coolant temp"]?.[1],
            borderColor: "white",
            borderDash: [6, 6], 
            borderWidth: 2,
            label: {
              display: true,
              content: "Max Coolant Temp",
              color: "white",
              backgroundColor: "black",
              position: "end",
            },
          },
          maxThresholdlot: {
            type: "line",
            yMin: thresholds["Lub oil temp"]?.[1],
            yMax: thresholds["Lub oil temp"]?.[1],
            borderColor: "purple",
            borderDash: [6, 6], 
            borderWidth: 2,
            label: {
              display: true,
              content: "Max Lub Temp",
              color: "purple",
              backgroundColor: "black",
              position: "end",
            },
          }
        }
        
      },
    },
  };
  
  

  return (
    <Container className="p-4">
      <div>
        <h2 style={{ textAlign: "center", marginTop: "60px", marginBottom: "20px" }}>
        Engine Health: {health}%
        </h2>
        <ProgressBar 
          now={health} 
          label={`${health}%`} 
          variant={health > 60 ? "success" : health > 40 ? "warning" : "danger"} 
          style={{ height: "20px", marginBottom: "30px" }} 
        />
        <h3 style={{marginBottom:"55px"}}>Engine RPM vs Pressure Values</h3>
        {dataPoints.length > 0 ? (
           <Line data={graph1Data} options={chartOptions1} />
        ) : (
          <p>Waiting for data...</p>
        )}
        <br></br>
        <br></br>
        <h3 style={{marginBottom:"55px"}}>Engine RPM vs Temperature Values</h3>
        {dataPoints.length > 0 ? (
          <Line data={graph2Data} options={chartOptions2} />
        ) : (
          <p>Waiting for data...</p>
        )}
      </div>
    </Container>
  );
};

export default Enginelive;