const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = 5000; // Proxy server runs on port 5000

app.use(cors()); // Enable CORS for all requests
app.use(express.json());

// Proxy route for CoinMarketCap API
app.get("/api/crypto", async (req, res) => {
    const symbols = req.query.symbols; // Get symbols from frontend request
    const API_KEY = process.env.REACT_APP_CMC_API_KEY;

    if (!symbols) {
        return res.status(400).json({ error: "No symbols provided" });
    }

    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}`;

    try {
        const response = await fetch(url, {
            headers: {
                "X-CMC_PRO_API_KEY": API_KEY,
                "Accept": "application/json",
            },
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});