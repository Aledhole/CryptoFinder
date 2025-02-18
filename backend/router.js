const express = require("express");
const {fetchTopCryptos, fetchFearGreedIndex, fetchCryptoInfo, fetchCryptoPrice,fetchFullCryptoData, validateCryptoSymbol } = require("./controller");

const router = express.Router();

router.get("/top-cryptos", async (req, res) => {
  try {
    const topCryptos = await fetchTopCryptos(); // Ensure this function fetches top cryptos

    if (!topCryptos || topCryptos.length === 0) {
      return res.status(500).json({ error: "Failed to fetch top cryptocurrencies." });
    }

    res.json({ cryptos: topCryptos }); // Wrap response in an object
  } catch (error) {
    console.error("Error fetching top cryptos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const fromPriceData = await fetchCryptoPrice(from);
    const toPriceData = await fetchCryptoPrice(to);

    if (!fromPriceData || !toPriceData) {
      return res.status(500).json({ error: "Failed to fetch price data" });
    }

    const fromPrice = fromPriceData[from.toUpperCase()].quote.USD.price;
    const toPrice = toPriceData[to.toUpperCase()].quote.USD.price;

    const convertedAmount = (amount * fromPrice) / toPrice;

    res.json({ converted: convertedAmount });
  } catch (error) {
    console.error("❌ Error converting crypto:", error);
    res.status(500).json({ error: "Conversion failed" });
  }
});

  

// ✅ Route to Get Fear & Greed Index
router.get("/fear-greed-index", async (req, res) => {
  const indexData = await fetchFearGreedIndex();

  if (!indexData) {
    return res.status(500).json({ error: "Failed to fetch Fear & Greed Index." });
  }

  res.json(indexData);
});

// Get Cryptocurrency Information
router.get("/crypto-info", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "No symbol provided" });

  const isValid = await validateCryptoSymbol(symbol);
  if (!isValid) return res.status(404).json({ error: "Cryptocurrency not found" });

  const data = await fetchCryptoInfo(symbol);
  if (data?.data[symbol.toUpperCase()]) {
    return res.json({ symbol: symbol.toUpperCase(), logo: data.data[symbol.toUpperCase()].logo });
  }

  return res.status(404).json({ error: "Cryptocurrency not found" });
});

// Check Crypto Price
router.get("/check-crypto", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "No symbol provided" });

  const isValid = await validateCryptoSymbol(symbol);
  if (!isValid) return res.status(404).json({ error: "Cryptocurrency not found" });

  const data = await fetchFullCryptoData(symbol);
  if (data?.data[symbol.toUpperCase()]) {
    return res.json({ symbol: symbol.toUpperCase(), price: data.data[symbol.toUpperCase()].quote.USD.price.toFixed(2) });
  }

  return res.status(404).json({ error: "Cryptocurrency not found" });
});

module.exports = router;