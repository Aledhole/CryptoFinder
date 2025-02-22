import React from "react";
import { Link } from "react-router-dom";
import "./styling/Navbar.css"; // Create this CSS file for styling

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1 className="logo">CryptoFinder</h1>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>        
        <li><Link to="/CryptoConverter">Converter</Link></li>
        <li><Link to="/TaxCalculator">TaxCalculator</Link></li>            
      </ul>
    </nav>
  );
};

export default Navbar;