// Props: WebSockets in 100 Seconds & Beyond with Socket.io
//// https://www.youtube.com/watch?v=1BfCnjr_Vjg

const WebSocket = require('ws');
const { broadcast } = require('./helpers');

const server = new WebSocket.Server({ port: 8080 });
let id = -1;

const colors = [];
const positions = [];

server.on('connection', socket => {
    id++;
    const payload = { id: id };
    socket.send(JSON.stringify(payload));
    socket.id = id;

    colors.forEach((color, i) => socket.send(JSON.stringify({ id: i, color: color })));
    positions.forEach((position, i) => socket.send(JSON.stringify({ id: i, position: position })));

    socket.on('message', unparsedData => {
        const payload = JSON.parse(unparsedData);
        console.log(payload);
        if ("color" in payload) {
            colors[payload.id] = payload.color;
        } else if ("position" in payload) {
            positions[payload.id] = payload.position;
        }
        broadcast(server, payload, payload.id); // Relay to all except sender;
    });

    socket.on('close', () => {
        console.log("Closing", socket.id);
        // TODO: Make their ID available for use.
        /*
            When there's a new person, pop an ID from availableIds.
            When a person disconnects, push their ID back into availableIds, to recycle it.
        */
    })

});
