// Props: WebSockets in 100 Seconds & Beyond with Socket.io
//// https://www.youtube.com/watch?v=1BfCnjr_Vjg

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
let lastId = -1;

server.on('connection', socket => {
    lastId++;
    const payload = { id: lastId };
    socket.send(JSON.stringify(payload));
    socket.id = lastId;

    socket.on('message', unparsedData => {

        const payload = JSON.parse(unparsedData);
        console.log(payload);

        // Send to all except the sender
        server.clients.forEach(function each(otherSocket) {
            if (otherSocket.id !== payload.id) {
                otherSocket.send(JSON.stringify(payload));
            }
        });
    });

    socket.on('close', () => {
        console.log("Closing", socket.id);
        // TODO: Make their ID available for use.
    })

});
