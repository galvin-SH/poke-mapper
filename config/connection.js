const neo4j = require('neo4j-driver');
require('dotenv').config();
const driver = neo4j.driver(
    process.env.DB_URI,
    neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASS)
);

module.exports = driver;
