import React, { useEffect, useState } from "react";
import "./styling/CryptoChart.css"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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
        setChartData(data);
      } catch (err) {
        console.error("Failed to load chart:", err);
      }
      setLoading(false);
    };

    fetchChartData();
  }, [symbol, interval]);

  return (
    <div className="crypto-chart-wrapper">
    <div className="crypto-chart-container">
  <h3>{symbol} Price Chart</h3>
  {loading ? (
    <p>Loading chart...</p>
  ) : (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="time" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="price" stroke="#ff9800" dot={false} />
      </LineChart>
    </ResponsiveContainer>
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