const apiURL = 'https://pokeapi.co/api/v2/pokemon/';
const axios = require('axios');
const neo4j = require('../config/connection');

async function seedDatabase() {
    try {
        // Clear database
        await neo4j.executeQuery('match (n) DETACH DELETE n');
        console.log('Database cleared');
        // Seed database
        const pokemonList = await getPokemonList();
        for (const pokemon of pokemonList) {
            await seedPokemon(pokemon);
        }
        console.log('Database seeded');
    } catch (error) {
        console.error('Error seeding database: ', error);
    }
}

async function getPokemonList() {
    const response = await axios.get(apiURL);
    return response.data.results;
}

async function seedPokemon(pokemon) {
    const response = await axios.get(pokemon.url);
    const pokemonData = response.data;
    const query = `
        MERGE (p:Pokemon {id: $id})
        ON CREATE SET p.name = $name, p.type1 = $type1, p.type2 = $type2, p.height = $height, p.weight = $weight 
    `;
    const params = {
        id: pokemonData.id,
        name: pokemonData.name,
        type1: pokemonData.types[0].type.name,
        type2: pokemonData.types[1] ? pokemonData.types[1].type.name : null,
        height: pokemonData.height,
        weight: pokemonData.weight,
    };
    await neo4j.executeQuery(query, params);
}

module.exports = seedDatabase;
