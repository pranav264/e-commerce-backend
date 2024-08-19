const { db } = require("./db");

const Users = db.collection("Users");
const Products = db.collection("Products");

module.exports = { Users, Products }