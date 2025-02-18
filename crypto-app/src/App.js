import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styling/App.css";
import Navbar from "./Navbar"; 
import MyCryptos from "./MyCryptos";
import CryptoConverter from "./CryptoConverter";


function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>        <Route path="/" element={<MyCryptos />} />   
        <Route path="/CryptoConverter" element={<CryptoConverter/>}/>
              
      </Routes>
    </Router>
  );
}

export default App;