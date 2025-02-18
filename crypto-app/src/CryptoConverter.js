import React, { useState, useEffect } from "react";
import "./styling/CryptoConverter.css";

const CryptoConverter = () => {
  const [cryptos, setCryptos] = useState([]);
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("ETH");
  const [amount, setAmount] = useState(1);
  const [converted, setConverted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Fetch top cryptos on page load
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        console.log("Fetching top cryptos...");
        const response = await fetch("http://localhost:5000/top-cryptos");
        const data = await response.json();

        if (data.cryptos) {
          setCryptos(data.cryptos);
        } else {
          console.error("Invalid response:", data);
          setError("Failed to load cryptocurrencies.");
        }
      } catch (error) {
        console.error("Error fetching cryptos:", error);
        setError("Failed to fetch data.");
      }
    };

    fetchCryptos();
  }, []); // Runs only once when the component loads

  // 🔹 Fetch Conversion Rate
  const convertCrypto = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/convert?from=${from}&to=${to}&amount=${amount}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setConverted(null);
      } else {
        setConverted(data.converted.toFixed(6));
      }
    } catch (error) {
      setError("Failed to fetch conversion.");
      setConverted(null);
    }

    setLoading(false);
  };

  return (
    <div className="converter-container">
      <h3>Crypto Converter</h3>

      <div className="input-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
        />
      </div>

      {/* 🔹 From Crypto Dropdown */}
      <select value={from} onChange={(e) => setFrom(e.target.value)}>
        {cryptos.length === 0 ? (
          <option>Loading...</option>
        ) : (
          cryptos.map((crypto) => (
            <option key={crypto.symbol} value={crypto.symbol}>
              {crypto.symbol} - {crypto.name}
            </option>
          ))
        )}
      </select>

      <p>To</p>

      {/* 🔹 To Crypto Dropdown */}
      <select value={to} onChange={(e) => setTo(e.target.value)}>
        {cryptos.length === 0 ? (
          <option>Loading...</option>
        ) : (
          cryptos.map((crypto) => (
            <option key={crypto.symbol} value={crypto.symbol}>
              {crypto.symbol} - {crypto.name}
            </option>
          ))
        )}
      </select>

      <button onClick={convertCrypto} disabled={loading}>
        {loading ? "Converting..." : "Convert"}
      </button>

      {error && <p className="error">{error}</p>}
      {converted && (
        <p className="result">
          {amount} {from} = <strong>{converted} {to}</strong>
        </p>
      )}
    </div>
  );
};

export default CryptoConverter;
