// Props: WebSockets in 100 Seconds & Beyond with Socket.io
//// https://www.youtube.com/watch?v=1BfCnjr_Vjg

const WebSocket = require('ws');
const { broadcast, randomHexColor, sendWorld } = require('./helpers');

const server = new WebSocket.Server({ port: 8080 });
let highestId = -1;

const profiles = [];  // Keys: id, color, name
const positions = [];  // Keys: id, position
const ids = {};

server.on('connection', socket => {

    sendWorld(socket, profiles, positions);

    socket.on('message', unparsedData => {
        const payload = JSON.parse(unparsedData);
        if ("ip" in payload) {
            // Associate ip with id, and send id to player.
            let id;
            if (!(payload.ip in ids)) {
                id = ++highestId;
                ids[payload.ip] = id;
                const profilePayload = {
                    id: id,
                    color: `#${randomHexColor()}${randomHexColor()}${randomHexColor()}`,
                    name: Math.random() > 0.5 ? "new phone" : "who dis"
                }
                profiles[id] = profilePayload;
                positions[id] = { id: id, position: { x: 0, y: 0 } };
                console.log(`New player: "${profiles[id].name}", id: ${id}`);
                broadcast(server, profilePayload); // Send to all, including sender
            } else {
                id = ids[payload.ip];
                console.log(`Old player: "${profiles[id].name}", id: ${id}`);
            }
            socket.id = id;
            const initializationPayload = { initialization: true, ...positions[id] };
            console.log("Sending", JSON.stringify(initializationPayload));
            socket.send(JSON.stringify(initializationPayload));
            return;
        }
        else if ("color" in payload) {
            profiles[payload.id] = payload;
        } else if ("position" in payload) {
            positions[payload.id] = payload;
        }
        broadcast(server, payload, payload.id); // Relay to all except sender;
    });

    socket.on('close', () => {
        console.log("Closing", socket.id);
    })

});
