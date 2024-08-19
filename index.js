const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT;

const users = require("./routes/users");
const products = require("./routes/products");

app.use(express.json());
app.use(cors());

app.use("/users", users);
app.use("/products", products);

app.listen(port, () => {
console.log('Server started');
})