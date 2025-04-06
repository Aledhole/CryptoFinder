import React, { useState, useEffect } from "react";
import "./styling/FearGreedIndex.css";

const FearGreedIndex = () => {
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const response = await fetch("http://localhost:5000/fear-greed-index");
        const data = await response.json();
        setIndex(data);
      } catch (error) {
        console.error("Error fetching Fear & Greed Index:", error);
      }
      setLoading(false);
    };

    fetchIndex();
  }, []);
  
  const getRotation = (value) => ((value / 100) * 180) - 90;

  
  const getTextColor = (value) => {
    if (value < 20) return "#d9534f"; // Red
    if (value < 40) return "#f0ad4e"; // Orange 
    if (value < 60) return "#ffd700"; // yellow
    if (value < 80) return "#5cb85c"; // Green 
    return "#4caf50"; // Dark Green 
  };

  return (
    <div className="gauge-container">
      <h2>Crypto Fear & Greed Index</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : index ? (
        <div className="gauge-wrapper">
          <svg className="gauge-svg" viewBox="0 0 200 120">
                        
            <defs>
              <linearGradient id="fearGreedGradient">
                <stop offset="0%" stopColor="#d9534f" />  
                <stop offset="25%" stopColor="#f0ad4e" /> 
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="75%" stopColor="#5cb85c" /> 
                <stop offset="100%" stopColor="#4caf50" /> 
              </linearGradient>
            </defs>
           
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              stroke="#444"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
            />
            
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              stroke="url(#fearGreedGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              transform={`rotate(${getRotation(index.value)} 100 100)`}
            />            
            
            <circle cx="100" cy="100" r="5" fill="white" />
          </svg>
          
          <div className="gauge-label" style={{ color: getTextColor(index.value) }}>
            {index.value} - {index.classification}
          </div>
        </div>
      ) : (
        <p>Error loading data.</p>
      )}
    </div>
  );
};

export default FearGreedIndex;
