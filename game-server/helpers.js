function broadcast(server, payload, senderId = -1) {
    server.clients
        .forEach(socket => {
            if (socket.id !== senderId) sendPayload(socket, payload)
        });
}

function sendPayload(socket, payload) {
    socket.send(JSON.stringify(payload))
}

function randomHexColor() {
    return (~~(Math.random() * 255)).toString(16).padStart(2, '0');
}

function sendWorld(socket, ...propertyArrays) {
    propertyArrays.forEach(propertyArray => propertyArray.forEach(property => socket.send(JSON.stringify(property))));
}

module.exports = { broadcast, randomHexColor, sendWorld }
