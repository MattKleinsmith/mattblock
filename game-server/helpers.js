function broadcast(server, payload, senderId = -1) {
    server.clients
        .forEach(socket => {
            if (socket.id !== senderId) sendPayload(socket, payload)
        });
}

function sendPayload(socket, payload) {
    socket.send(JSON.stringify(payload))
}

module.exports = { broadcast }
