const axios = require('axios');
const fs = require('fs');
const apiURL = 'https://pokeapi.co/api/v2/';

// Get pokemon
async function getPokemon() {
    try {
        console.log('Getting pokemon from api');
        const limit = 1025;
        const pList = [];
        for (let i = 1; i < limit; i++) {
            // Get species
            let p = await axios.get(`${apiURL}pokemon-species/${i}`);
            // Get types
            let pTypes = await axios.get(`${apiURL}pokemon/${i}`);
            p.data.types = [
                pTypes.data.types[0],
                pTypes.data.types[1] ? pTypes.data.types[1] : null,
            ];
            pList.push(p.data);
            // Wait 10 seconds every 50 requests
            if (i % 50 === 0) {
                console.log('Waiting 10 seconds before calling api again...');
                console.log('Total Pokemon fetched: ', i);
                await new Promise((r) => setTimeout(r, 10000));
            }
        }
        // Write pokemon to file
        (async (pList) => {
            // Check if path to db exists
            if (!fs.existsSync('./db/pokemon.json')) {
                console.log('Creating db directory and pokemon.json file');
                await fs.mkdirSync('./db', { recursive: true });
                await fs.writeFileSync('./db/pokemon.json', '[]');
            }
            fs.writeFileSync(
                './db/pokemon.json',
                JSON.stringify(pList, null, 0)
            );
        })(pList);
        return pList;
    } catch (error) {
        console.error('Error getting pokemon: ', error);
    }
}

// Get types
async function getTypes() {
    try {
        console.log('Getting types from api');
        const tList = [];
        const types = await axios.get(`${apiURL}type?limit=25`);
        for (const type of types.data.results) {
            let t = await axios.get(type.url);
            tList.push(t.data);
        }
        // Write types to file
        (async (tList) => {
            // Check if path to db exists
            if (!fs.existsSync('./db/types.json')) {
                console.log('Creating db directory and types.json file');
                await fs.mkdirSync('./db', { recursive: true });
                await fs.writeFileSync('./db/types.json', '[]');
            }
            fs.writeFileSync('./db/types.json', JSON.stringify(tList, null, 0));
        })(tList);
        return tList;
    } catch (error) {
        console.error('Error getting types: ', error);
    }
}

module.exports = { getPokemon, getTypes };
