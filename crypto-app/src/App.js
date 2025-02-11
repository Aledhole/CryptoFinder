import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import MyCryptos from "./MyCryptos";

const Layout = ({ children }) => (
  <div className="home-container">
    <h1>Welcome to CryptoFinder</h1>
    <p>Track cryptocurrency prices, market trends, and more.</p>

    {/* Navigation Links */}
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>        
        <li><Link to="/prices">Prices</Link></li>
      </ul>
    </nav>

    {children}
  </div>
);

const Home = () => (
  <Layout>
    <MyCryptos />
  </Layout>
);

const Prices = () => (
  <Layout>
    <h2>Live Cryptocurrency Prices</h2>
    <p>Stay updated with real-time crypto prices.</p>
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />       
        <Route path="/prices" element={<Prices />} />
      </Routes>
    </Router>
  );
}

export default App;