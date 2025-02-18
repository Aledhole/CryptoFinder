import React, { useState, useEffect } from "react";
import "./styling/FearGreedIndex.css"; // Import styles

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

  // 🔹 Define colors based on the classification
  const getColor = (classification) => {
    switch (classification) {
      case "Extreme Fear":
        return "#d9534f"; // Red
      case "Fear":
        return "#f0ad4e"; // Orange
      case "Neutral":
        return "#5bc0de"; // Blue
      case "Greed":
        return "#5cb85c"; // Green
      case "Extreme Greed":
        return "#4caf50"; // Dark Green
      default:
        return "#ccc"; // Default Grey
    }
  };

  return (
    <div className="fear-greed-container">
      <h2>Crypto Fear & Greed Index</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : index ? (
        <div className="fear-greed-card">
          <div className="meter">
            <div
              className="meter-fill"
              style={{
                width: `${index.value}%`,
                backgroundColor: getColor(index.classification),
              }}
            ></div>
          </div>
          <p className="index-value" style={{ color: getColor(index.classification) }}>
            {index.value} - {index.classification}
          </p>
        </div>
      ) : (
        <p>Error loading data.</p>
      )}
    </div>
  );
};

export default FearGreedIndex;
