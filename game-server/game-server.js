// Props: WebSockets in 100 Seconds & Beyond with Socket.io
//// https://www.youtube.com/watch?v=1BfCnjr_Vjg

const https = require("https");
const fs = require('fs');

const WebSocket = require('ws');
const { broadcast, randomHexColor, sendWorld } = require('./helpers');

const { webSocketServerPort } = require('../config.js');

const certServer = https.createServer({
    cert: fs.readFileSync('../client/.well-known/fullchain.pem'),
    key: fs.readFileSync('../client/.well-known/privkey.pem')
}).listen(webSocketServerPort);

const webSocketServer = new WebSocket.Server({ server: certServer });
console.log(`Game server is running on port ${webSocketServerPort}`);

const worldPath = "./cache/world.json";

let maxAltitude = 0;

let world;
// TODO: Keep track of max
if (fs.existsSync(worldPath)) world = require(worldPath);
else {
    world = {
        highestId: -1,
        profiles: [],  // id index) --> id, color, name
        positions: [],  // id (index) --> id, position
        ids: {}   // ip --> id
    }
}

function getMaxAltitudeAndProfile() {
    let min = Infinity;
    let profile = "";
    for (let i = 0; i < world.positions.length; i++) {
        if (world.positions[i].position.y < min) {
            min = world.positions[i].position.y;
            profile = world.profiles[i];

        }
    }
    return [min, profile]
}

webSocketServer.on('connection', socket => {

    sendWorld(socket, world.profiles, world.positions);
    const [max, profile] = getMaxAltitudeAndProfile();
    socket.send(JSON.stringify({ highScore: max, profile: profile }));

    socket.on('message', unparsedData => {
        const payload = JSON.parse(unparsedData);
        if ("ip" in payload) {
            if (socket.id >= 0) return;
            // Associate ip with id, and send id to player.
            let id;
            if (!(payload.ip in world.ids)) {
                id = ++world.highestId;
                world.ids[payload.ip] = id;
                const names = ["WASD to move", "Right click", "R to respawn"];
                const name = names[~~(Math.random() * names.length)]
                const profilePayload = {
                    id: id,
                    color: `#${randomHexColor()}${randomHexColor()}${randomHexColor()}`,
                    name: name
                }
                world.profiles[id] = profilePayload;
                world.positions[id] = { id: id, position: { x: 0, y: 0 } };
                console.log(`New player: "${world.profiles[id].name}", id: ${id}`);
                broadcast(webSocketServer, profilePayload); // Send to all, including sender
            } else {
                id = world.ids[payload.ip];
                console.log(`Old player: "${world.profiles[id].name}", id: ${id}`);
            }
            console.log(world.profiles[id].name, payload);
            socket.id = id;
            const initializationPayload = { initialization: true, ...world.positions[id] };
            console.log("Sending", JSON.stringify(initializationPayload));
            socket.send(JSON.stringify(initializationPayload));
            return;
        }
        else if ("color" in payload) {
            world.profiles[payload.id] = payload;
            console.log(world.profiles[payload.id].name, payload);
        } else if ("position" in payload) {
            world.positions[payload.id] = payload;
            if (payload.position.y < 1e4) console.log(world.profiles[payload.id].name, payload);
        }
        broadcast(webSocketServer, payload, payload.id); // Relay to all except sender;
    });

    socket.on('close', () => {
        console.log("Closing", socket.id);
    })
});

setInterval(() => {
    fs.writeFileSync(worldPath, JSON.stringify(world, null, 2), 'utf-8');
    // broadcast max height and name
    // TODO: Make this more continous. Make it run on load, and when a new position arrives that beats the high score.
    const [max, profile] = getMaxAltitudeAndProfile();
    const payload = { highScore: max, profile: profile };
    if (max > maxAltitude) {
        maxAltitude = max;
        broadcast(webSocketServer, payload);
    }
}, 1000)

process.on('SIGINT', function () {
    console.log("\nCaught interrupt signal");
    broadcast(webSocketServer, { serverDown: true });  // Let everyone know to refresh
    process.exit();
});
