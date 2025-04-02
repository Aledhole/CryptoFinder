import React, { useState} from "react";
import "./App.css";

const MyCryptos = () => {
  const [cryptos, setCryptos] = useState([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  

  //  Validate Cryptocurrency
  const validateCrypto = async (symbol) => {
    try {
      const response = await fetch(`http://localhost:5000/crypto-info?symbol=${symbol}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.logo;
    } catch (error) {
      console.error("Error validating crypto:", error.message);
      setError(`"${symbol}" is not a valid cryptocurrency.`);
      return null;
    }
  };

  // Fetch Crypto Price via REST API
  const fetchCryptoPriceREST = async (symbol) => {
    try {
      const response = await fetch(`http://localhost:5000/check-crypto?symbol=${symbol}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCryptos((prev) =>
        prev.map((crypto) =>
          crypto.symbol === symbol ? { ...crypto, price: data.price } : crypto
        )
      );
    } catch (error) {
      console.error("Error fetching price:", error.message);
      setError(`Could not fetch price for "${symbol}".`);
    }
  };

  // Add Crypto Symbol
  const handleAddCrypto = async () => {
    if (!newSymbol) return;
    const symbol = newSymbol.toUpperCase();

    if (cryptos.some((crypto) => crypto.symbol === symbol)) {
      setError(`"${symbol}" is already being tracked.`);
      return;
    }

    setLoading(true);
    setError(null);

    const logo = await validateCrypto(symbol);
    if (!logo) {
      setLoading(false);
      return;
    }

    setCryptos([...cryptos, { symbol, price: "Loading...", logo }]);

    await fetchCryptoPriceREST(symbol);

    setLoading(false);
    setNewSymbol("");
  };

  return (
    <div className="crypto-container">
      <h2>Live Crypto Prices</h2>  
        
      
      <div className="add-crypto-container">
        <h2>Add a New Crypto</h2>
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Enter Symbol (e.g., BTC)"
        />
        <button className="button" onClick={handleAddCrypto} disabled={loading}>
          {loading ? "Adding..." : "Add Crypto"}
        </button>
      </div>
  
      {error && <p className="error">{error}</p>}
  
      {/* Crypto Display */}
      <div className="crypto-gallery">
        {cryptos.map((crypto, index) => (
          <div key={index} className="crypto-item">
            <img src={crypto.logo} alt={crypto.symbol} className="crypto-image" />
            <h3>{crypto.symbol}</h3>
            <p className="crypto-price">${crypto.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCryptos;