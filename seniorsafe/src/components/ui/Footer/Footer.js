// src/components/Footer.js
// import './Footer.css';
import { Container, Row, Col } from 'react-bootstrap';

function MyFooter() {
  return (
    <footer className="bg-light text-dark py-4">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Senior Safe</h5>
            <p>Keep the scams away.</p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="#home" className="text-dark">Home</a></li>
              <li><a href="#about" className="text-dark">Data</a></li>
              <li><a href="#features" className="text-dark">Features</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <p>
              Email: contact@seniorsafe.com<br />
              Phone: (123) 456-7890
            </p>
          </Col>
        </Row>
        <Row className="pt-3">
          <Col className="text-center">
            <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default MyFooter;
