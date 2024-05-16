const fs = require('fs');
const neo4j = require('../config/connection');
const { getPokemon, getTypes } = require('./get');

// Clear database
async function clearDatabase() {
    try {
        await neo4j.executeQuery('match (n) DETACH DELETE n');
        console.log('Database cleared');
    } catch (error) {
        console.error('Error clearing database: ', error);
    }
}
async function addNodes(pList, tList) {
    try {
        // Create pokemon nodes
        for (const pokemon of pList) {
            const query = `CREATE (p:Pokemon {name: $name, id: $id, type1:$type1, type2:$type2, url: $url})`;
            const params = {
                name: pokemon.name,
                id: pokemon.id,
                type1: pokemon.types[0].type.name,
                type2: pokemon.types[1] ? pokemon.types[1].type.name : null,
                url: pokemon.varieties[0].pokemon.url,
            };
            await neo4j.executeQuery(query, params);
        }
        // Create type nodes
        for (const type of tList) {
            const query = `CREATE (t:Type {name: $name})`;
            const params = {
                name: type.name,
            };
            await neo4j.executeQuery(query, params);
        }
        console.log('Nodes added');
    } catch (error) {
        console.error('Error adding nodes: ', error);
    }
}

// Add relationships
async function addRels(pList, tList) {
    try {
        // Create relationships
        for (const pokemon of pList) {
            if (pokemon.evolves_from_species) {
                // Create relationships between pokemon and their evolutions
                const query = `MATCH (a:Pokemon {name: $name1}), (b:Pokemon {name: $name2})
                CREATE (a)-[:EVOLVES_FROM]->(b)
                CREATE (b)-[:EVOLVES_INTO]->(a)`;
                const params = {
                    name1: pokemon.name,
                    name2: pokemon.evolves_from_species.name,
                };
                await neo4j.executeQuery(query, params);
            }
            // Create relationships between pokemon and types
            const query = `MATCH (a:Pokemon {name: $name}), (b:Type {name: $type1})
            CREATE (a)-[:IS_TYPE]->(b)`;
            const params = {
                name: pokemon.name,
                type1: pokemon.types[0].type.name,
            };
            await neo4j.executeQuery(query, params);
            if (pokemon.types[1]) {
                const query = `MATCH (a:Pokemon {name: $name}), (b:Type {name: $type2})
                CREATE (a)-[:IS_TYPE]->(b)`;
                const params = {
                    name: pokemon.name,
                    type2: pokemon.types[1].type.name,
                };
                await neo4j.executeQuery(query, params);
            }
        }
        console.log('Relationships added');
    } catch (error) {
        console.error('Error adding relationships: ', error);
    }
}
// Seed database
async function seedDatabase() {
    try {
        await clearDatabase();
        // Get pokemon and types
        // if file exists, use it
        // otherwise, fetch from API
        const pList = (await fs.existsSync('./db/pokemon.json'))
            ? JSON.parse(fs.readFileSync('./db/pokemon.json'))
            : await getPokemon();
        const tList = (await fs.existsSync('./db/types.json'))
            ? JSON.parse(fs.readFileSync('./db/types.json'))
            : await getTypes();
        // Add nodes
        await addNodes(pList, tList);
        // Add relationships
        await addRels(pList, tList);
        console.log('Database seeded');
    } catch (error) {
        console.error('Error seeding database: ', error);
    }
}

module.exports = seedDatabase;
