const express = require('express');
const routes = require('./routes');
const neo4j = require('./config/connection');
const seed = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

async function main() {
    try {
        // Verify connection to Neo4j database
        await neo4j.verifyAuthentication();
        console.log('Connected to Neo4j database');
        // Seed database
        await seed();
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server: ', error);
    }
}
// Call main function to start server
main();
