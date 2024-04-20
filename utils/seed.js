const apiURL = 'https://pokeapi.co/api/v2/pokemon/';
const axios = require('axios');
const neo4j = require('../config/connection');

// Seed the database with Pokemon data
async function seedDatabase() {
    try {
        // Clear database
        await neo4j.executeQuery('match (n) DETACH DELETE n');
        console.log('Database cleared');
        // Seed database
        const pokemonList = await getPokemonList();
        for (const pokemon of pokemonList) {
            await seedEvolutions(pokemon);
        }
        console.log('Database seeded');
    } catch (error) {
        console.error('Error seeding database: ', error);
    }
}
// Get list of Pokemon from the PokeAPI
async function getPokemonList() {
    const response = await axios.get(apiURL);
    return response.data.results;
}
// Seed the database with Pokemon evolution data
async function seedEvolutions(pokemon) {
    const response = await axios.get(pokemon.url);
    const pokemonData = response.data;
    const speciesResponse = await axios.get(pokemonData.species.url);
    const speciesData = speciesResponse.data;
    const evolutionChainResponse = await axios.get(
        speciesData.evolution_chain.url
    );
    const evolutionChainData = evolutionChainResponse.data.chain;
    await seedEvolutionChain(evolutionChainData);
}
// Seed the database with Pokemon evolution chain data
async function seedEvolutionChain(chain) {
    const query = `
        MERGE (e:Evolution {id: $id})
        ON CREATE SET e.speciesURL = $speciesURL
    `;
    const params = {
        id: chain.species.name,
        speciesURL: chain.species.url,
    };
    await neo4j.executeQuery(query, params);
    if (chain.evolves_to.length > 0) {
        for (const evolution of chain.evolves_to) {
            await seedEvolutionChain(evolution);
            await seedEvolutionRelationship(
                chain.species.name,
                evolution.species.name
            );
        }
    }
}
// Seed the database with Pokemon evolution relationship data
async function seedEvolutionRelationship(species1, species2) {
    const query = `
        MATCH (e1:Evolution {id: $species1})
        MATCH (e2:Evolution {id: $species2})
        MERGE (e1)-[:EVOLVES_TO]->(e2)
    `;
    const params = {
        species1,
        species2,
    };
    await neo4j.executeQuery(query, params);
}

module.exports = seedDatabase;
