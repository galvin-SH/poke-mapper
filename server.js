const express = require('express');
const routes = require('./routes');
const driver = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

driver
    .getServerInfo()
    .then(() => {
        console.log('Connected to Neo4j');
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to Neo4j', error);
    });
