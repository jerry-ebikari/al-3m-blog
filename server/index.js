const express = require("express");
const dotenv = require("dotenv");
const app = express();
const connectDB = require("./config/db");

dotenv.config();

connectDB();

app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT)
})