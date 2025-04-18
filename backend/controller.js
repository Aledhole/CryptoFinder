const axios = require("axios");
require("dotenv").config();

const CMC_API_KEY = process.env.CMC_SECRET_KEY;

const CACHE_TIME = 60 * 60 * 1000; // 1 hour cache
const cache = {};


const fetchFromAPI = async (cacheKey, url, headers, params, cacheDuration = CACHE_TIME) => {
  if (cache[cacheKey]) {
      const timeElapsed = Date.now() - cache[cacheKey].timestamp;      

      if (timeElapsed < cacheDuration) {          
          return cache[cacheKey].data;
      } else {
          console.log(`Cache EXPIRED for ${cacheKey}, fetching new data...`);
      }
  } else {
      console.log(`No cache found for ${cacheKey}, fetching new data...`);
  }

  try {
      console.log(` Fetching ${cacheKey} from API...`);
      const response = await axios.get(url, { headers, params });      

      if (!response.data || !response.data.data) {
          throw new Error(` Invalid response for ${cacheKey}`);
      }

      cache[cacheKey] = { data: response.data, timestamp: Date.now() }; // Store in cache
      return response.data;
  } catch (error) {
      console.error(` Error fetching ${cacheKey}:`, error.response?.data || error.message);
      return null;
  }
};

const fetchFullCryptoData = async (symbol) => {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`;
  const headers = { "X-CMC_PRO_API_KEY": CMC_API_KEY };
  const params = { symbol: symbol.toUpperCase() };

  return fetchFromAPI(`price-${symbol}`, url, headers, params);
};

const fetchCryptoPrice = async (symbol) => {
  const fullData = await fetchFullCryptoData(symbol);

  if (!fullData || !fullData.data || !fullData.data[symbol.toUpperCase()]) {
    console.error(`API response invalid for ${symbol}`, JSON.stringify(fullData, null, 2));
    return null;
  }

  return fullData;  
};


// Fetch cryptocurrency details
const fetchCryptoInfo = async (symbol) => {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol.toUpperCase()}`;
  const headers = { "X-CMC_PRO_API_KEY": CMC_API_KEY };
  return fetchFromAPI(`info-${symbol}`, url, headers);
};


const validateCryptoSymbol = async (symbol) => {
  if (cache["cryptoSymbols"] && Date.now() - cache["cryptoSymbols"].timestamp < 6 * 60 * 60 * 1000) {
    return cache["cryptoSymbols"].data.includes(symbol.toUpperCase());
  }
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
  const headers = { "X-CMC_PRO_API_KEY": CMC_API_KEY };
  const response = await fetchFromAPI("cryptoSymbols", url, headers, {});

  if (response) {
    cache["cryptoSymbols"] = { data: response.data.map((crypto) => crypto.symbol), timestamp: Date.now() };
    return cache["cryptoSymbols"].data.includes(symbol.toUpperCase());
  }  
  return false;
};

const fetchFearGreedIndex = async () => {
  try {
    const response = await axios.get("https://api.alternative.me/fng/");
    
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response from API");
    }

    return {
      value: response.data.data[0].value,
      classification: response.data.data[0].value_classification,
      timestamp: response.data.data[0].timestamp,
    };
  } catch (error) {
    console.error("Error fetching Fear & Greed Index:", error.message);
    return null;
  }
};

const fetchTopCryptos = async () => {
  if (cache["topCryptos"] && Date.now() - cache["topCryptos"].timestamp < 24 * 60 * 60 * 1000) {
    return cache["topCryptos"].data;
  }

  try {
    console.log("Fetching top 50 cryptocurrencies...");
    const response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
      params: { limit: 50 },
      headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
    });

    const cryptos = response.data.data.map((crypto) => ({
      symbol: crypto.symbol.toUpperCase(),
      name: crypto.name,
    }));

    cache["topCryptos"] = { data: cryptos, timestamp: Date.now() };
    return cryptos;
  } catch (error) {
    console.error("Error fetching top cryptos:", error.response?.data || error.message);
    return [];
  }
};



const fetchCryptoCharts = async (res, symbol, interval) => {
  const symbolMap = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",    
  };

  const id = symbolMap[symbol.toUpperCase()] || "bitcoin";
  const vs_currency = "usd";

  // Interval duration 
  const intervalMap = {
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 1000,
  };

  
  const intervalToDays = {
    "15m": "1",    
    "1h": "1",     
    "4h": "7",    
    "1d": "90",    
    "7d": "365",   
  };

  const intervalMs = intervalMap[interval] || intervalMap["1d"];
  const days = intervalToDays[interval] || "30";

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      {
        params: {
          vs_currency,
          days,
        },
      }
    );

    const prices = response.data.prices; // [timestamp, price]
    const generateCandles = (prices, intervalMs) => {
      const candles = [];
      let bucketStart = null;
      let bucketPrices = [];
    
      const round = (n) => Math.round(n * 100) / 100;
    
      for (const [timestamp, price] of prices) {
        const currentBucket = Math.floor(timestamp / intervalMs) * intervalMs;
    
        if (bucketStart === null) bucketStart = currentBucket;
    
        if (currentBucket !== bucketStart) {
          if (bucketPrices.length > 0) {
            const open = bucketPrices[0][1];
            const close = bucketPrices.at(-1)[1];
            const high = Math.max(...bucketPrices.map(p => p[1]));
            const low = Math.min(...bucketPrices.map(p => p[1]));
    
            candles.push({ date: new Date(bucketStart), open: round(open), high: round(high), low: round(low), close: round(close) });
          }
          bucketStart = currentBucket;
          bucketPrices = [];
        }
    
        bucketPrices.push([timestamp, price]);
      }
    
      if (bucketPrices.length > 0) {
        const open = bucketPrices[0][1];
        const close = bucketPrices.at(-1)[1];
        const high = Math.max(...bucketPrices.map(p => p[1]));
        const low = Math.min(...bucketPrices.map(p => p[1]));
        candles.push({ date: new Date(bucketStart), open: round(open), high: round(high), low: round(low), close: round(close) });
      }
    
      return candles;
    };

    //console.log(`Generated ${candles.length} candles for ${interval}`);
    res.json(generateCandles(prices,intervalMs));
  } catch (err) {
    console.error("Candle generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch or process chart data" });
  }
};




module.exports = {fetchTopCryptos,fetchFearGreedIndex, fetchCryptoInfo, fetchCryptoPrice,fetchFullCryptoData, validateCryptoSymbol, fetchCryptoCharts};