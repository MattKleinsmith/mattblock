// Props: WebSockets in 100 Seconds & Beyond with Socket.io
//// https://www.youtube.com/watch?v=1BfCnjr_Vjg

const WebSocket = require('ws');
const { broadcast, randomHexColor, sendWorld } = require('./helpers');
const fs = require('fs');

const server = new WebSocket.Server({ port: 8080 });
const worldPath = "./cache/world.json";

let world;
if (fs.existsSync(worldPath)) world = require(worldPath);
else {
    world = {
        highestId: -1,
        profiles: [],  // id index) --> id, color, name
        positions: [],  // id (index) --> id, position
        ids: {}   // ip --> id
    }
}

server.on('connection', socket => {

    sendWorld(socket, world.profiles, world.positions);

    socket.on('message', unparsedData => {
        const payload = JSON.parse(unparsedData);
        if ("ip" in payload) {
            // Associate ip with id, and send id to player.
            let id;
            if (!(payload.ip in world.ids)) {
                id = ++world.highestId;
                world.ids[payload.ip] = id;
                const profilePayload = {
                    id: id,
                    color: `#${randomHexColor()}${randomHexColor()}${randomHexColor()}`,
                    name: Math.random() > 0.5 ? "new phone" : "who dis"
                }
                world.profiles[id] = profilePayload;
                world.positions[id] = { id: id, position: { x: 0, y: 0 } };
                console.log(`New player: "${world.profiles[id].name}", id: ${id}`);
                broadcast(server, profilePayload); // Send to all, including sender
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
            console.log(world.profiles[payload.id].name, payload);
        }
        broadcast(server, payload, payload.id); // Relay to all except sender;
    });

    socket.on('close', () => {
        console.log("Closing", socket.id);
    })
});

setInterval(() => {
    fs.writeFileSync(worldPath, JSON.stringify(world, null, 2), 'utf-8');
}, 1000)
