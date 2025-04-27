import { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Checkhealth = () => {
  const [enginerpm, setEnginerpm] = useState("");
  const [luboilpress, setLuboilpress] = useState("");
  const [fuelpress, setFuelpress] = useState("");
  const [coolpress, setCoolpress] = useState("");
  const [luboiltemp, setLuboiltemp] = useState("");
  const [cooltemp, setCooltemp] = useState("");
  const [result, setResult] = useState(null);

  const submitHandler = (e) => {
    e.preventDefault();
    const features = [
      parseFloat(enginerpm),
      parseFloat(luboilpress),
      parseFloat(fuelpress),
      parseFloat(coolpress),
      parseFloat(luboiltemp),
      parseFloat(cooltemp),
    ];

    socket.emit("start_stream_check", { features });
  };

  useEffect(() => {
    const handleCheckData = (data) => {
      console.log("Received check result:", data);
      setResult(data);
    };

    socket.on("check_data", handleCheckData);

    return () => {
      socket.off("check_data", handleCheckData);
    };
  }, []);

  const getInputStyle = (fieldName) => {
    if (!result || !result["Anomaly Details"]) return {};
    return {
      borderColor: result["Anomaly Details"][fieldName] ? "red" : "green",
      borderWdith: "3px"
    };
  };

  const getFeedbackMessage = (fieldName) => {
    if (!result || !result["Anomaly Details"]) return null;

    const isAnomaly = result["Anomaly Details"][fieldName];
    return (
      <Form.Text style={{ color: isAnomaly ? "red" : "green" }}>
        {isAnomaly ? "⚠️ Status: Anomaly Detected" : "🟢 Status: Normal"}
      </Form.Text>
    );
  };

  return (
    <div>
      <Container style={{ marginTop: "60px" }} className="small-container">
        <h1 style={{ color: "white" }} className="my-3 mt-4">Check Your Engine Health</h1>
        <Form onSubmit={submitHandler} style={{border:"2px solid white",marginTop:"30px"}} >
          <div style={{marginLeft:"40px",marginTop:"20px"}}>
          <Form.Group className="mb-3" controlId="enginerpm">
            <Form.Label style={{ color: "white", fontSize:"20px"}}>Engine RPM</Form.Label>
            <Form.Control
              required
              value={enginerpm}
              onChange={(e) => setEnginerpm(e.target.value)}
              style={{
                ...getInputStyle("Engine rpm")}}
              className="form-input"
            />
            {getFeedbackMessage("Engine rpm")}
          </Form.Group>

          <Form.Group className="mb-3" controlId="luboilpress">
            <Form.Label style={{ color: "white",fontSize:"20px" }}>Lub Oil Pressure</Form.Label>
            <Form.Control
              required
              value={luboilpress}
              onChange={(e) => setLuboilpress(e.target.value)}
              style={{...getInputStyle("Lub oil pressure")}}
              className="form-input"
            />
            {getFeedbackMessage("Lub oil pressure")}
          </Form.Group>

          <Form.Group className="mb-3" controlId="fuelpress">
            <Form.Label style={{ color: "white",fontSize:"20px" }}>Fuel Pressure</Form.Label>
            <Form.Control
              required
              value={fuelpress}
              onChange={(e) => setFuelpress(e.target.value)}
              style={{...getInputStyle("Fuel pressure")}}
              className="form-input"
            />
            {getFeedbackMessage("Fuel pressure")}
          </Form.Group>

          <Form.Group className="mb-3" controlId="coolpress">
            <Form.Label style={{ color: "white",fontSize:"20px" }}>Coolant Pressure</Form.Label>
            <Form.Control
              required
              value={coolpress}
              onChange={(e) => setCoolpress(e.target.value)}
              style={{...getInputStyle("Coolant pressure")}}
              className="form-input"
            />
            {getFeedbackMessage("Coolant pressure")}
          </Form.Group>

          <Form.Group className="mb-3" controlId="luboiltemp">
            <Form.Label style={{ color: "white" ,fontSize:"20px"}}>Lub Oil Temperature</Form.Label>
            <Form.Control
              required
              value={luboiltemp}
              onChange={(e) => setLuboiltemp(e.target.value)}
              style={{...getInputStyle("Lub oil temp")}}
               className="form-input"
            />
            {getFeedbackMessage("Lub oil temp")}
          </Form.Group>

          <Form.Group className="mb-3" controlId="cooltemp">
            <Form.Label style={{ color: "white",fontSize:"20px" }}>Coolant Temperature</Form.Label>
            <Form.Control
              required
              value={cooltemp}
              onChange={(e) => setCooltemp(e.target.value)}
              style={{...getInputStyle("Coolant temp")}}
              className="form-input"
            />
            {getFeedbackMessage("Coolant temp")}
          </Form.Group>
          </div>
          <div className="pb-3" style={{marginLeft:"40px"}}>
            <Button style={{backgroundColor: "black",color: "white",border: "2px solid white", width:"150px",fontSize:"20px" }} type="submit">Check</Button>
          </div>
        </Form>
        <br></br>
        <br></br>
      </Container>
    </div>
  );
};

export default Checkhealth;
