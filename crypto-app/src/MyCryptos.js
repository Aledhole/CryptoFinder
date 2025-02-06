import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = process.env.CMC_KEY;


const myImages = [
  {
    src: "./images/btc.png",
    link: "https://example.com/btc",
    alt: "bitcoin",
  },
  {
    src: "./images/ethereum.png",
    link: "https://example.com/eth",
    alt: "eth",
  },
  {
    src: "/images/ondo.png",
    link: "https://example.com/ondo",
    alt: "ondo",
  },  
];

const MyCryptos = () => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      console.log("API Response:", data);
      const symbols = myImages.map((img) => img.symbol).join(",");
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": API_KEY,
            "Accept": "application/json",
          },
        }
      );
      const data = await response.json();
      const updatedPrices = {};
      myImages.forEach((img) => {
        updatedPrices[img.symbol] = data.data[img.symbol].quote.USD.price.toFixed(2);
      });
      setPrices(updatedPrices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prices:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="crypto-gallery">
      {myImages.map((image, index) => (
        <div key={index} className="crypto-item">
          <a href={image.link} target="_blank" rel="noopener noreferrer">
            <img src={image.src} alt={image.alt} className="crypto-image" />
          </a>
          <p className="crypto-price">
            {loading ? "Loading..." : `$${prices[image.symbol] || "N/A"}`}
          </p>
        </div>
      ))}
    </div>
  );
};


export default MyCryptos;