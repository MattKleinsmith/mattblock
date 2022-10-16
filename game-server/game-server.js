const {
    createGameServer,
    loadWorld,
    sendWorld,
    sendCharacter,
    broadcastProfile,
    broadcastPosition,
    broadcastOfflineStatus,
    broadcastServerDownAlert,
    broadcastPlatform } = require('./helpers');

const gameServer = createGameServer();
const world = loadWorld();

gameServer.on('connection', socket => {

    sendWorld(socket, world);

    socket.on('message', unparsedData => {
        const payload = JSON.parse(unparsedData);
        if ("ip" in payload) sendCharacter(gameServer, world, payload, socket);
        else if ("color" in payload) broadcastProfile(gameServer, world, payload);
        else if ("position" in payload) broadcastPosition(gameServer, world, payload);
        else if ("size" in payload) broadcastPlatform(gameServer, world, payload);
    });

    socket.on('close', broadcastOfflineStatus.bind(null, gameServer, world, socket))
});

process.on('SIGINT', broadcastServerDownAlert.bind(null, gameServer));
