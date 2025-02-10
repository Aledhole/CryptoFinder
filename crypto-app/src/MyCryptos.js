import React, { useState } from "react";
import "./App.css";

const MyCryptos = () => {
  const [cryptos, setCryptos] = useState([]); // ✅ Start with an empty list
  const [newSymbol, setNewSymbol] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const binanceSockets = {}; // ✅ Store WebSockets per symbol

  // ✅ Validate Crypto Exists Before Fetching
  const validateCrypto = async (symbol) => {
    try {
      const response = await fetch(`http://localhost:5000/api/crypto-info?symbol=${symbol}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.logo; // ✅ Return logo if valid
    } catch (error) {
      console.error("Error validating crypto:", error.message);
      setError(`"${symbol}" is not a valid cryptocurrency.`);
      return null;
    }
  };

  const fetchCryptoPriceREST = async (symbol) => {
    try {
        const response = await fetch(`http://localhost:5000/api/check-crypto?symbol=${symbol}`);
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

  const connectWebSocket = async (symbol) => {
    const binanceSymbol = symbol.toLowerCase() + "usdt"; // Convert to Binance format (e.g., BTC → btcusdt)

    // ✅ Check if Binance supports this crypto
    try {
        const testResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol.toUpperCase()}`);
        const testData = await testResponse.json();
        if (testData.code) {
            console.warn(`${symbol} is not available on Binance. Switching to REST API.`);
            return false;
        }
    } catch (error) {
        console.error(`Error checking Binance support for ${symbol}:`, error);
        return false;
    }

    // ✅ WebSocket Connection
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`);

    ws.onopen = () => console.log(`WebSocket connected for ${symbol}`);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.p) {
            const price = parseFloat(data.p).toFixed(2); // Extract live price
            setCryptos((prev) =>
                prev.map((crypto) =>
                    crypto.symbol === symbol ? { ...crypto, price } : crypto
                )
            );
        }
    };

    ws.onerror = (error) => {
        console.error(`WebSocket Error for ${symbol}:`, error);
        ws.close(); // Close WebSocket if there's an error
    };

    ws.onclose = () => {
        console.warn(`WebSocket closed for ${symbol}, using REST API`);
    };

    return true; // ✅ Confirm Binance supports this crypto
};

  const handleAddCrypto = async () => {
    if (!newSymbol) return;
    const symbol = newSymbol.toUpperCase();

    // ✅ Prevent adding duplicates
    if (cryptos.some((crypto) => crypto.symbol === symbol)) {
        setError(`"${symbol}" is already being tracked.`);
        return;
    }

    setLoading(true);
    setError(null);

    const logo = await validateCrypto(symbol);
    if (!logo) {
        setLoading(false);
        return; // 🚨 Prevent adding invalid cryptos
    }

    // ✅ Add the crypto immediately to UI with "Loading..." price
    setCryptos([...cryptos, { symbol, price: "Loading...", logo }]);

    // ✅ Try WebSocket First, If Binance Doesn't Support It, Use REST API
    const isBinance = await connectWebSocket(symbol);
    if (!isBinance) {
        await fetchCryptoPriceREST(symbol);
    }

    setLoading(false);
    setNewSymbol("");
  };

  return (
    <div className="crypto-container">
      <h2>Live Crypto Prices</h2>

      <div className="input-container">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Enter Symbol (e.g., BTC)"
        />
        <button onClick={handleAddCrypto} disabled={loading}>
          {loading ? "Adding..." : "Add Crypto"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

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
