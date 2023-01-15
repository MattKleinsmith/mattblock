const {
    createGameServer,
    loadWorld,
    sendWorld,
    sendCharacter,
    broadcastProfile,
    broadcastPosition,
    broadcastOfflineStatus,
    broadcastServerDownAlert,
    broadcastPlatform,
    broadcastPlatformDeletion,
    processQuestCompletion,
    processRewardRedemptionRequest } = require('./helpers');

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
        else if ("idOfPlatformToDelete" in payload) broadcastPlatformDeletion(gameServer, world, payload);
        else if ("questCompletionRequest" in payload) processQuestCompletion(gameServer, world, payload, socket);
        else if ("rewardRedemptionRequest" in payload) processRewardRedemptionRequest(gameServer, world, payload, socket);
    });

    socket.on('close', broadcastOfflineStatus.bind(null, gameServer, world, socket))
});

process.on('SIGINT', broadcastServerDownAlert.bind(null, gameServer));
