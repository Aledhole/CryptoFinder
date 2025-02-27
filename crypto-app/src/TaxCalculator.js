import React, { useState } from "react";
import "./styling/TaxCalculator.css";

const TaxCalculator = () => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    symbol: "",
    buyDate: "",
    buyPrice: "",
    sellDate: "",
    sellPrice: "",
    amount: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [taxResults, setTaxResults] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const handleInputChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  // Add a Transaction Manually
  const addTransaction = () => {
    if (
      !newTransaction.symbol ||
      !newTransaction.buyDate ||
      !newTransaction.buyPrice ||
      !newTransaction.sellDate ||
      !newTransaction.sellPrice ||
      !newTransaction.amount
    ) {
      setError("All fields are required.");
      return;
    }

    setTransactions([...transactions, { ...newTransaction }]);
    setNewTransaction({
      symbol: "",
      buyDate: "",
      buyPrice: "",
      sellDate: "",
      sellPrice: "",
      amount: "",
    });
    setError(null);
  };

  // Remove a Transaction
  const removeTransaction = (index) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  // Handle CSV Upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload and Parse CSV
  const uploadCSV = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to process CSV.");
      }

      setTransactions((prev) => [...prev, ...data.transactions]);
      setFile(null);
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const calculateTax = async () => {
    const allTransactions = transactions.map((tx) => ({
      symbol: tx.symbol.toUpperCase(),
      buyDate: tx.buyDate,
      buyPrice: parseFloat(tx.buyPrice), // ✅ Ensure it's a number
      sellDate: tx.sellDate,
      sellPrice: parseFloat(tx.sellPrice), // ✅ Ensure it's a number
      amount: parseFloat(tx.amount), // ✅ Ensure it's a number
    }));
  
    if (allTransactions.length === 0) {
      setError("No transactions to calculate. Please upload a CSV file or add transactions manually.");
      return;
    }
  
    console.log("Sending Tax Calculation");
  
    setError(null);
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:5000/calculate-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ transactions: allTransactions }), // ✅ Send corrected transactions
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate tax.");
      }
  
      setTaxResults(data);
    } catch (error) {
      console.error("❌ Error calculating tax:", error.message);
      setError(error.message);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="tax-page">
      <div className="tax-calculator">
      <h2>Crypto Tax Calculator</h2>

      {/* Manual Transaction Input */}
      <div className="manual-entry">
        <h3>Enter Transaction Manually</h3>
        <input type="text" name="symbol" placeholder="Symbol (e.g., BTC)" value={newTransaction.symbol} onChange={handleInputChange} />
        <input type="date" name="buyDate" value={newTransaction.buyDate} onChange={handleInputChange} />
        <input type="number" name="buyPrice" placeholder="Buy Price" value={newTransaction.buyPrice} onChange={handleInputChange} />
        <input type="date" name="sellDate" value={newTransaction.sellDate} onChange={handleInputChange} />
        <input type="number" name="sellPrice" placeholder="Sell Price" value={newTransaction.sellPrice} onChange={handleInputChange} />
        <input type="number" name="amount" placeholder="Amount" value={newTransaction.amount} onChange={handleInputChange} />
        <div className="add-transaction-button">
          <button onClick={addTransaction}>Add Transaction</button>
        </div>
      </div>

      {/* Upload CSV */}
      <div className="csv-upload">
        <h3>Upload CSV</h3>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={uploadCSV} disabled={loading}>
          {loading ? "Uploading..." : "Upload CSV"}
        </button>
      </div>

      {/* Display Transactions */}
      {transactions.length > 0 && (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Buy Date</th>
              <th>Buy Price</th>
              <th>Sell Date</th>
              <th>Sell Price</th>
              <th>Amount</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>{tx.symbol}</td>
                <td>{tx.buyDate}</td>
                <td>${tx.buyPrice}</td>
                <td>{tx.sellDate}</td>
                <td>${tx.sellPrice}</td>
                <td>{tx.amount}</td>
                <td>
                  <button onClick={() => removeTransaction(index)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Calculate Tax Button */}
      <button onClick={calculateTax} disabled={transactions.length === 0}>
        {loading ? "Calculating..." : "Calculate Tax"}
      </button>

      {/* Show Tax Results */}
      {taxResults && (
        <div className="tax-results">
          <p>Total Gains: ${taxResults.totalGains}</p>
          <p>Total Losses: ${taxResults.totalLosses}</p>
          <p>Net Taxable: ${taxResults.netTaxable}</p>
        </div>
      )}
    </div>
    </div>
  );
};

export default TaxCalculator;
