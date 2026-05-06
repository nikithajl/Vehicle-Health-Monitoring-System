import { Button } from "react-bootstrap";
import { Container,Row,Col} from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear} from "@fortawesome/free-solid-svg-icons";
import "./App.css"

export default function App() {
  return (
    <div className="d-flex vh-100 bg-black text-white">
        <Container fluid className="p-0 m-0">
            <Container fluid className="p-0" style={{borderBottom: "4px", boxShadow: "0 2px 10px white"}}>
                <Row className="p-4 d-flex justify-content-between align-items-center" style={{ marginLeft: "0", marginRight: "0" }}>
                    <Col md="auto"><h2 className="text">VEHICLE HEALTH MONITORING SYSTEM</h2></Col>
                    <Col md="auto" className="d-flex gap-3">
                        <Link className="link" style={{ textDecoration: "none" }} to="/">
                            <Button variant="outline-light" className="d-flex align-items-center button" style={{borderColor: "white",color: "white",borderWidth: "2px"}}>
                            <FontAwesomeIcon icon={faGear} size="5px" color="white" spin className="me-3 icon"/>Engine Live Health Monitoring</Button>
                        </Link>
                        <Link className="link" style={{ textDecoration: "none" }} to="healthstatus">
                            <Button variant="outline-light" className="d-flex align-items-center button" style={{borderColor: "white", color: "white", borderWidth: "2px"}}>
                            <FontAwesomeIcon icon={faGear} size="5px" color="white" spin className="me-3 icon"/>Check Engine Health Status</Button>
                        </Link>
                    </Col>
                </Row>
            </Container>
            <Outlet/> 
        </Container>
    </div>
  );
}
