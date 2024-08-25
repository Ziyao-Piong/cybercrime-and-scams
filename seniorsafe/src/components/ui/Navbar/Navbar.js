// Navbar.js
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/">Senior Safe</a>
            </div>
            <ul className="navbar-links">
                <li><a href="/">Home</a></li>
                <li><a href="/about">Stats</a></li>
                {/* <li><a href="/services">Services</a></li>
                <li><a href="/contact">Contact</a></li> */}
            </ul>
            <div className="navbar-toggle" onclick={toggleNavbar}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    );
};

export default Navbar;
