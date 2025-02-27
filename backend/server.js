require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cryptoRoutes = require("./router");
const app = express();
const PORT = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

require("dotenv").config();


app.use("/", cryptoRoutes);




app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);    
});