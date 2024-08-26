// src/LandingPage.js
import './LandingSection.css';

// const LandingPage = () => {
//   return (
//     <div className="landing-page">
//       <div className="content">
//         <h1>Welcome to Our Website</h1>
//         <p>Your journey to excellence starts here.</p>
//         <button className="cta-button">Get Started</button>
//       </div>
//     </div>
//   );
// };

function LandingSection() {
  return (
    <div className="landing-section bg-primary text-white text-center d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <h1>Welcome to MyApp</h1>
            <p className="lead">
              Your ultimate solution for combating cybercrime and scams. Protect yourself and stay informed with MyApp.
            </p>
            <Button variant="light" size="lg" href="#get-started">
              Get Started
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LandingSection;
