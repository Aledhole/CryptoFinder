import React, { useEffect, useState } from "react";
import "./styling/CryptoChart.css";

import {
  ChartCanvas,
  Chart,
  CandlestickSeries,
  XAxis,
  YAxis,
} from "react-financial-charts";
import { scaleTime } from "d3-scale";

// Define the intervals
const intervals = [
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "D", value: "1d" },
  { label: "W", value: "7d" },
];

const CryptoChart = ({ symbol = "BTC" }) => {
  const [chartData, setChartData] = useState([]);
  const [interval, setInterval] = useState("1d");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/charts?symbol=${symbol}&interval=${interval}`
        );
        const data = await response.json();

        // Ensure 'date' is a Date object
        const formatted = data.map((d) => ({
          ...d,
          date: new Date(d.date),
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("Failed to load chart:", err);
      }
      setLoading(false);
    };

    fetchChartData();
  }, [symbol, interval]);

  
  const intervalToCandles = {
    "15m": 96,   // ~1 day
    "1h": 168,   // ~1 week
    "4h": 180,   // ~30 days
    "1d": 90,    // ~3 months
    "7d": 52,    // ~1 year
  };
  const candleCount = intervalToCandles[interval] || 100;  
  console.log("Total candles:", chartData.length);
  console.log("Candle count used:", candleCount);

  

  const xExtents =
    chartData.length >= candleCount
      ? [
          chartData[chartData.length - candleCount].date,
          chartData[chartData.length - 1].date,
        ]
      : [
          chartData[0]?.date || new Date(),
          chartData[chartData.length - 1]?.date || new Date(),
        ];

  return (
    <div className="crypto-chart-wrapper">
      <div className="crypto-chart-container">
        <h3>{symbol} Price Chart</h3>

        {loading ? (
          <p>Loading chart...</p>
        ) : chartData.length > 1 ? (
          <div style={{ overflowX: "auto", width: "100%" }}>
            <div
              style={{
                minWidth: "900px",
                display: "inline-block",
                textAlign: "left",
              }}
            >
              <ChartCanvas
                height={400}
                width={900}
                ratio={1}
                margin={{ left: 70, right: 70, top: 20, bottom: 50 }}
                seriesName={symbol}
                data={chartData}
                xScale={scaleTime()}
                xAccessor={(d) => d.date}
                xExtents={xExtents}
              >
                <Chart id={1} yExtents={(d) => [d.high * 1.01, d.low * 0.99]}>
                  <XAxis axisAt="bottom" orient="bottom" />
                  <YAxis axisAt="right" orient="right" />
                  <CandlestickSeries />
                </Chart>
              </ChartCanvas>
            </div>
          </div>
        ) : (
          <p>No data available.</p>
        )}

        <div className="interval-buttons">
          {intervals.map((option) => (
            <button
              key={option.value}
              onClick={() => setInterval(option.value)}
              className={interval === option.value ? "active" : ""}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;
