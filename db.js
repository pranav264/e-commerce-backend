const mongodb = require('mongodb');
require('dotenv').config();

const url = process.env.DB_URL;

const client = new mongodb.MongoClient(url);

const db = client.db('E_Commerce');

module.exports = { client, db };