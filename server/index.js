// Props: WebSockets in 100 Seconds & Beyond with Socket.io
//// https://www.youtube.com/watch?v=1BfCnjr_Vjg

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
let lastId = -1;

const sockets = {};

server.on('connection', socket => {

    lastId++;
    const payload = { id: lastId };
    socket.send(JSON.stringify(payload));
    sockets[lastId] = socket;

    socket.on('message', unparsedData => {

        const payload = JSON.parse(unparsedData);
        console.log(payload);

        // Send to all except the sender
        for (const id in sockets) {
            if (Number(id) !== payload.id) {
                sockets[id].send(JSON.stringify(payload));
            }
        }
    });

});
