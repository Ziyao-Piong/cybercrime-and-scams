// src/pages/Home/LandingSection.js
import './LandingSection.css';
import { Container, Row, Col, Button } from 'react-bootstrap';

function LandingSection() {
  return (
    <div className="landing-section text-white text-center d-flex align-items-center">
      <Container>
        <Row className="justify-content-center introduction">
          <Col md={8}>
            <h1>Welcome to Senior Safe</h1>
            <p className="lead">
              Scam is an illegal act of obtaining others' property or sensitive information through deceptive means.
              Common types of scams include investment, false billing, phishing, and lottery scams.
              With the widespread use of the internet and social media, scam tactics have become increasingly sophisticated and far-reaching.
              Therefore, staying vigilant and understanding common scam methods are crucial to protecting oneself from losses.
            </p>
            <Button variant="light" size="lg" href="#get-started">
              View Insights
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LandingSection;
