const neo4j = require('neo4j-driver');
require('dotenv').config();
const driver = neo4j.driver(process.env.DB_URI);

module.exports = driver;
