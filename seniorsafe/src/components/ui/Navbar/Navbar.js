// Navbar.js
import { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
// import './Navbar.css';

function MyNavbar() {
    return (
      <Navbar bg="light" variant="light" expand="md">
        <Container>
          <Navbar.Brand href="#home">Senior Safe</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#data">Interesting Data</Nav.Link>
              <Nav.Link href="#features">Features</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
}
export default MyNavbar;
