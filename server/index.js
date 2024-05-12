const express = require("express");
const dotenv = require("dotenv");
const app = express();
const connectToDatabase = require("./config/db");
const authController = require('./controllers/authController')
const postController = require('./controllers/postController')

dotenv.config();

connectToDatabase();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/auth', authController);
app.use('/post', postController);

app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT)
});

module.exports = app;