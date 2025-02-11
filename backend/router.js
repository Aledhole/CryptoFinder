const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const API_KEY = process.env.CMC_SECRET_KEY;

// ✅ Validate if a crypto exists before fetching data
const validateCryptoSymbol = async (symbol) => {
    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map`;
        const response = await axios.get(url, {
            headers: { "X-CMC_PRO_API_KEY": API_KEY },
        });
        const validSymbols = response.data.data.map((crypto) => crypto.symbol);
        return validSymbols.includes(symbol.toUpperCase());
    } catch (error) {
        console.error("Error validating symbol:", error.response?.data || error.message);
        return false;
    }
};

router.get("/api/crypto-info", async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: "No symbol provided" });

    const isValid = await validateCryptoSymbol(symbol);
    if (!isValid) return res.status(404).json({ error: "Cryptocurrency not found" });

    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol.toUpperCase()}`;
        const response = await axios.get(url, {
            headers: { "X-CMC_PRO_API_KEY": API_KEY },
        });

        const data = response.data;
        if (data.status.error_code === 0 && data.data[symbol.toUpperCase()]) {
            return res.json({ symbol: symbol.toUpperCase(), logo: data.data[symbol.toUpperCase()].logo });
        } else {
            return res.status(404).json({ error: "Cryptocurrency not found" });
        }
    } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to fetch data from API" });
    }
});

router.get("/api/check-crypto", async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: "No symbol provided" });

    const isValid = await validateCryptoSymbol(symbol);
    if (!isValid) return res.status(404).json({ error: "Cryptocurrency not found" });

    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`;
        const response = await axios.get(url, {
            headers: { "X-CMC_PRO_API_KEY": API_KEY },
        });

        const data = response.data;
        if (data.status.error_code === 0 && data.data[symbol.toUpperCase()]) {
            return res.json({ symbol: symbol.toUpperCase(), price: data.data[symbol.toUpperCase()].quote.USD.price.toFixed(2) });
        } else {
            return res.status(404).json({ error: "Cryptocurrency not found" });
        }
    } catch (error) {
        console.error("Error fetching price:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to fetch data from API" });
    }
});

module.exports = router;
