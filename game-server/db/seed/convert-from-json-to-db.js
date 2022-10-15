require('dotenv').config();
const { Client } = require('pg');
const dbClient = new Client();

const world = require('../../cache/world.json');
const ips = Object.keys(world.ids);
const highscoreHistory = world.highscoreHistory;

// require('events').EventEmitter.defaultMaxListeners = 10;
require('events').EventEmitter.defaultMaxListeners = 100;

async function bulkInsert() {
    await dbClient.connect();

    for (let id = 0; id < world.profiles.length; id++) {
        const profile = world.profiles[id];
        const position = world.positions[id].position;

        const sql = `INSERT INTO players(id, color, name, status, x_position, y_position, ip) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
        const params = [id, profile.color, profile.name, profile.status, position.x, position.y, ips[id]];

        const res = await dbClient.query(sql, params);
    }

    await dbClient.end();
}

async function bulkInsertHighscoreHistory() {
    await dbClient.connect();

    for (let i = 0; i < highscoreHistory.length; i++) {
        const highscore = highscoreHistory[i].highscore;
        const profile = highscoreHistory[i].profile;

        const sql = `INSERT INTO highscore_history(highscore, color, name, player_id) VALUES ($1, $2, $3, $4);`;
        const params = [highscore, profile.color, profile.name, profile.id];

        const res = await dbClient.query(sql, params);
    }

    await dbClient.end();
}

bulkInsertHighscoreHistory();
// bulkInsert();
