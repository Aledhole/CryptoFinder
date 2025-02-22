import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Navbar"; 
import MyCryptos from "./MyCryptos";
import CryptoConverter from "./CryptoConverter";
import TaxCalculator from "./TaxCalculator";


function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>        <Route path="/" element={<MyCryptos />} />   
        <Route path="/CryptoConverter" element={<CryptoConverter/>}/>
        <Route path="/TaxCalculator" element={<TaxCalculator/>}/>
      </Routes>
    </Router>
  );
}

export default App;