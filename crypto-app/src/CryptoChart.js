import {React, useEffect} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const CryptoChart = ({ data }) => {
    useEffect(() => {
        const fetchDefaultChart = async () => {
          try {
            const response = await fetch("http://localhost:5000/charts?symbol=BTC&range=D");
            const data = await response.json();
            setChartData({ BTC: data });
          } catch (error) {
            console.error("Error fetching BTC chart:", error.message);
          }
        };
      
        fetchDefaultChart();
      }, []);

  return (
    <div className="crypto-chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="time" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CryptoChart;