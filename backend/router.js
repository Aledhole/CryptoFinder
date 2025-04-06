const express = require("express");
const axios = require("axios");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const {fetchTopCryptos, fetchFearGreedIndex, fetchCryptoInfo, fetchCryptoPrice,fetchFullCryptoData, validateCryptoSymbol,fetchCryptoCharts } = require("./controller");

const router = express.Router();

const upload = multer({ dest: "uploads/" });
router.post("/upload-csv", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const transactions = [];
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on("data", (row) => {
      if (row.symbol && row.buyDate && row.buyPrice && row.sellDate && row.sellPrice && row.amount) {
        transactions.push({
          symbol: row.symbol.toUpperCase(),
          buyDate: row.buyDate,
          buyPrice: parseFloat(row.buyPrice),
          sellDate: row.sellDate,
          sellPrice: parseFloat(row.sellPrice),
          amount: parseFloat(row.amount),
        });
      }
    })
    .on("end", () => {
      fs.unlinkSync(req.file.path); 
      res.json({ transactions });
    })
    .on("error", (error) => {
      console.error("Error processing CSV:", error.message);
      res.status(500).json({ error: "Failed to process CSV file" });
    });
});

router.post("/calculate-tax", async (req, res) => {
  //console.log(" Request Body Received:", JSON.stringify(req.body, null, 2));

  if (!req.body || !req.body.transactions || !Array.isArray(req.body.transactions) || req.body.transactions.length === 0) {
    console.warn("No transactions received.");
    return res.status(400).json({ error: "No transactions found. Please upload a CSV file or add transactions manually." });
  }

  const { transactions } = req.body;

  let totalGains = 0;
  let totalLosses = 0;

  transactions.forEach(({ buyPrice, sellPrice, amount }) => {
    // Convert to numbers 
    buyPrice = parseFloat(buyPrice);
    sellPrice = parseFloat(sellPrice);
    amount = parseFloat(amount);

    if (isNaN(buyPrice) || isNaN(sellPrice) || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid transaction data. Prices and amounts must be numbers." });
    }

    const profit = (sellPrice - buyPrice) * amount;
    if (profit > 0) totalGains += profit;
    else totalLosses += Math.abs(profit);
  });

  res.json({
    totalGains: totalGains.toFixed(2),
    totalLosses: totalLosses.toFixed(2),
    netTaxable: (totalGains - totalLosses).toFixed(2),
  });
});



router.get("/top-cryptos", async (req, res) => {
  try {
    const topCryptos = await fetchTopCryptos(); 

    if (!topCryptos || topCryptos.length === 0) {
      return res.status(500).json({ error: "Failed to fetch top cryptocurrencies." });
    }
    res.json({ cryptos: topCryptos }); 
  } catch (error) {
    console.error("Error fetching top cryptos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/convert", async (req, res) => {
  const { from, to, amount } = req.query;
  
  //console.log("Query Parameters:", req.query);

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {    
    const fromPriceData = await fetchCryptoPrice(from);
    const toPriceData = await fetchCryptoPrice(to);
  
    const fromSymbol = from.toUpperCase();
    const toSymbol = to.toUpperCase();

    if (!fromPriceData?.data?.[fromSymbol] || !toPriceData?.data?.[toSymbol]) {
      console.error(`Failed to fetch price data for ${fromSymbol} or ${toSymbol}`);
      return res.status(500).json({ error: `Price data not found for ${fromSymbol} or ${toSymbol}` });
    }

    // Extract prices
    const fromPrice = fromPriceData.data[fromSymbol]?.quote?.USD?.price;
    const toPrice = toPriceData.data[toSymbol]?.quote?.USD?.price;

    if (fromPrice === undefined || toPrice === undefined) {
      console.error(`Price data missing for ${fromSymbol} or ${toSymbol}`);
      return res.status(500).json({ error: `Price data not found for ${fromSymbol} or ${toSymbol}` });
    }    
    const convertedAmount = (amount * fromPrice) / toPrice;

    res.json({ converted: convertedAmount });
  } catch (error) {
    console.error("Error converting crypto:", error);
    res.status(500).json({ error: "Conversion failed" });
  }
});


  

// Route to Get Fear & Greed Index
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


///////////////////////////
router.get("/charts", async (req, res) => {
  const symbol = (req.query.symbol || "BTC").toUpperCase();
  const interval = req.query.interval || "1d";  
  // Supported intervals 
  const allowedIntervals = ["15m", "1h", "4h", "1d", "7d"];

  if (!allowedIntervals.includes(interval)) {
    return res.status(400).json({ error: "Invalid interval" });
  }
  await fetchCryptoCharts(res, symbol, interval);  
});



module.exports = router;