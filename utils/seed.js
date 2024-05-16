const apiURL = 'https://pokeapi.co/api/v2/';
const axios = require('axios');
const neo4j = require('../config/connection');

// Clear database
async function clearDatabase() {
    try {
        await neo4j.executeQuery('match (n) DETACH DELETE n');
        console.log('Database cleared');
    } catch (error) {
        console.error('Error clearing database: ', error);
    }
}
// Get pokemon
async function getPokemon() {
    try {
        const limit = 25;
        const pokemonList = [];
        for (let i = 1; i <= limit; i++) {
            let p = await axios.get(`${apiURL}pokemon-species/${i}`);
            pokemonList.push(p.data);
        }
        return pokemonList;
    } catch (error) {
        console.error('Error getting pokemon: ', error);
    }
}
// Add relationships
async function addRelationships(pokemonList) {
    try {
        // Create relationships
        for (const pokemon of pokemonList) {
            if (pokemon.evolves_from_species) {
                // Create relationship
                const query = `MATCH (a:Pokemon {name: $name1}), (b:Pokemon {name: $name2}) CREATE (a)-[:EVOLVES_FROM]->(b) CREATE (b)-[:EVOLVES_INTO]->(a)`;
                const params = {
                    name1: pokemon.name,
                    name2: pokemon.evolves_from_species.name,
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
        const pokemonList = await getPokemon();
        // Create nodes
        for (const pokemon of pokemonList) {
            const query = `CREATE (p:Pokemon {name: $name, id: $id})`;
            const params = {
                name: pokemon.name,
                id: pokemon.id,
            };
            await neo4j.executeQuery(query, params);
        }
        // Add relationships
        await addRelationships(pokemonList);
        console.log('Database seeded');
    } catch (error) {
        console.error('Error seeding database: ', error);
    }
}

module.exports = seedDatabase;
