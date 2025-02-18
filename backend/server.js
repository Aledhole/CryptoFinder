require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cryptoRoutes = require("./router");
const app = express();
const PORT = 5000;
app.use(cors({credentials: true }))
app.use("/", cryptoRoutes);


require("dotenv").config();

app.use(express.json());


app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);    
});