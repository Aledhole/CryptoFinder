import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import MyCryptos from "./MyCryptos";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to CryptoFinder</h1>
      <p>Track cryptocurrency prices, market trends, and more.</p>
      
      {/* Navigation Links */}
      <nav>
        <ul>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/prices">Prices</Link></li>
        </ul>
      </nav>
      {/* Crypto prices*/}
      <MyCryptos />
    </div>
  );
};


const About = () => <h2>About CryptoFinder</h2>;
const Prices = () => <h2>Live Cryptocurrency Prices</h2>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/prices" element={<Prices />} />
      </Routes>
    </Router>
  );
}

export default App;
