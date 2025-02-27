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
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Fetch top cryptos on page load
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
  }, []);

  // Fetch Conversion Rate
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
      <p></p>

      {/* From Crypto Dropdown with Search */}
      <div className="search-dropdown">
        <input
          type="text"
          placeholder="Convert from .."
          value={searchFrom}
          onChange={(e) => {
            setSearchFrom(e.target.value);
            setShowFromDropdown(true);
          }}
          onFocus={() => setShowFromDropdown(true)}
          onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
        />
        {showFromDropdown && (
          <div className="dropdown">
            {cryptos
              .filter((crypto) =>
                crypto.name.toLowerCase().includes(searchFrom.toLowerCase())
              )              
              .map((crypto) => (
                <p
                  key={crypto.symbol}
                  onClick={() => {
                    setFrom(crypto.symbol);
                    setSearchFrom("");
                    setShowFromDropdown(false);
                  }}
                >
                  {crypto.symbol} - {crypto.name}
                </p>
              ))}
          </div>
        )}
      </div>

      <p></p>

      {/* To Crypto Dropdown with Search */}
      <div className="search-dropdown">
        <input
          type="text"
          placeholder="Convert to .. "
          value={searchTo}
          onChange={(e) => {
            setSearchTo(e.target.value);
            setShowToDropdown(true);
          }}
          onFocus={() => setShowToDropdown(true)}
          onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
        />
        {showToDropdown && (
          <div className="dropdown">
            {cryptos
              .filter((crypto) =>
                crypto.name.toLowerCase().includes(searchTo.toLowerCase())
              )              
              .map((crypto) => (
                <p
                  key={crypto.symbol}
                  onClick={() => {
                    setTo(crypto.symbol);
                    setSearchTo("");
                    setShowToDropdown(false);
                  }}
                >
                  {crypto.symbol} - {crypto.name}
                </p>
              ))}
          </div>
        )}
      </div>

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
