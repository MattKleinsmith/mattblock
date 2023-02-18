const { createGameServer, loadWorld } = require('../helpers');

const gameServer = createGameServer();
const world = loadWorld();
for (let i = 0; i < world.positions.length; i++) {
    world.positions[i].position = { x: 0, y: 0 };
}
