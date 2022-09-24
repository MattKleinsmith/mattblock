const fs = require('fs');
const { webSocketServerPort, gameServerHttpsKeyPath, gameServerHttpsCertificatePath, worldPath } = require('../config.js');

function createGameServer(port) {
    const https = require("https");
    const WebSocket = require('ws');

    port = port || webSocketServerPort;

    const certServer = https.createServer({
        key: fs.readFileSync(gameServerHttpsKeyPath),
        cert: fs.readFileSync(gameServerHttpsCertificatePath)
    }).listen(port);

    const gameServer = new WebSocket.Server({ server: certServer });
    console.log(`Game server is running on port ${port}`);
    return gameServer;
}

function getYearMonthDay() {
    const now = new Date(Date.now());
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const yearMonthDay = [year, month, day].join("-");
    return yearMonthDay;
}

function saveToFile(data, path) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

function saveDailyBackup(world) {
    const yearMonthDay = getYearMonthDay();
    if (world.lastBackupDate !== yearMonthDay) {
        world.lastBackupDate = yearMonthDay;

        const pathParts = worldPath.split("/");
        pathParts[pathParts.length - 1] = `world_${yearMonthDay}.json`;
        const path = pathParts.join("/");

        saveToFile(world, path);
    }
}

function saveWorld(world) {
    saveDailyBackup(world)
    saveToFile(world, worldPath);
}

function loadWorld() {
    const { worldPath } = require('../config.js');

    let world;

    if (fs.existsSync(worldPath)) {
        world = require(worldPath);
        world.profiles.forEach(profile => {
            if (!("status" in profile)) profile.status = "💤"
        });
        if (!("highscore" in world)) world.highscore = getMaxAltitudeAndProfile(world);
        if (!("highscoreHistory" in world)) world.highscoreHistory = [world.highscore]
    }
    else {
        world = {
            highestId: -1,
            profiles: [],  // id index) --> id, color, name
            positions: [],  // id (index) --> id, position
            ids: {}   // ip --> id
        }
    }

    setInterval(saveWorld.bind(null, world), 1000)

    return world;
}

function getMaxAltitudeAndProfile(world) {
    let min = Infinity;
    let profile = "";
    for (let i = 0; i < world.positions.length; i++) {
        if (world.positions[i].position.y <= min) {
            min = world.positions[i].position.y;
            profile = world.profiles[i];
        }
    }
    return { highscore: min, profile: profile }
}


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

function sendWorld(socket, world) {
    [world.profiles, world.positions].forEach(resources => resources.forEach(resource => socket.send(JSON.stringify(resource))));
    socket.send(JSON.stringify(world.highscore));
}

function broadcastServerDownAlert(gameServer) {
    console.log("\nCaught interrupt signal");
    broadcast(gameServer, { serverDown: true });  // Let everyone know to refresh
    process.exit();
}

function sendCharacter(gameServer, world, payload, socket) {
    if (socket.id >= 0) return;
    // Associate ip with id, and send id to player.
    let id;
    if (!(payload.ip in world.ids)) initializePlayer(gameServer, world);
    else {
        id = world.ids[payload.ip];
        console.log(`Old player joined: "${world.profiles[id].name}", id: ${id}`);
    }
    console.log(world.profiles[id].name, payload);
    socket.id = id;
    const initializationPayload = { initialization: true, ...world.positions[id] };
    console.log("Sending", JSON.stringify(initializationPayload));
    socket.send(JSON.stringify(initializationPayload));

    world.profiles[id].status = "";
    broadcast(gameServer, world.profiles[id]);
}

function initializePlayer(gameServer, world, payload) {
    id = ++world.highestId;
    world.ids[payload.ip] = id;
    const names = ["WASD to move", "Right click to change color", "R to respawn"];
    const name = names[~~(Math.random() * names.length)]
    const profilePayload = {
        id: id,
        color: `#${randomHexColor()}${randomHexColor()}${randomHexColor()}`,
        name: name
    }
    world.profiles[id] = profilePayload;
    world.positions[id] = { id: id, position: { x: 0, y: 0 } };
    console.log(`New player joined: "${world.profiles[id].name}", id: ${id}`);
    broadcast(gameServer, profilePayload); // Send to all, including sender
}

function checkForHighscore(gameServer, world, payload) {
    if (payload.position.y <= world.highscore.highscore) {
        world.highscore.highscore = payload.position.y;
        world.highscore.profile = world.profiles[payload.id];
        broadcast(gameServer, world.highscore);

        const previousHighscore = world.highscoreHistory[world.highscoreHistory.length - 1];
        if (previousHighscore.profile.name === world.highscore.profile.name) {
            world.highscoreHistory[world.highscoreHistory.length - 1] = world.highscore;
        } else {
            world.highscoreHistory.push(world.highscore);
        }
    }
}

function broadcastProfile(gameServer, world, payload) {
    world.profiles[payload.id] = payload;
    console.log(world.profiles[payload.id].name, payload);
    broadcast(gameServer, payload, payload.id); // Relay to all except sender;
}

function broadcastPosition(gameServer, world, payload) {
    world.positions[payload.id] = payload;
    if (payload.position.y < 1e4) console.log(world.profiles[payload.id].name, payload);
    checkForHighscore(gameServer, world, payload);
    broadcast(gameServer, payload, payload.id); // Relay to all except sender;
}

function broadcastOfflineStatus(gameServer, world, socket) {
    console.log("Closing", socket.id);
    const profile = world.profiles[socket.id];
    profile.status = "💤";
    broadcast(gameServer, profile, socket.id); // Relay to all except sender;
}

module.exports = {
    createGameServer,
    loadWorld,
    sendWorld,
    sendCharacter,
    broadcastProfile,
    broadcastPosition,
    broadcastOfflineStatus,
    broadcastServerDownAlert
}
