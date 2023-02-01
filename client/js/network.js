import { shared, socket, builder } from "./configuration.js";
import { getIPs } from "./ip.js";
import { platforms } from "./gameData.js";
import { zoom } from "./draw.js";
import { Platform } from "./platform.js";

export function sendPosition() {
    if (!shared.player) return;
    if (shared.player.positionWS.x !== shared.player.oldPositionWS.x ||
        shared.player.positionWS.y !== shared.player.oldPositionWS.y) {
        const payload = { id: shared.id, position: shared.player.positionWS };
        socket.send(JSON.stringify(payload));
    }
}

export function sendProfile() {
    const profilePayload = { id: shared.id, color: shared.player.fillStyle, name: shared.player.name };
    socket.send(JSON.stringify(profilePayload));
}

export function sendPlatform() {
    socket.send(JSON.stringify({ id: shared.id, positionWS: builder.platform.positionWS, size: builder.platform.size }));
}

export function deleteAccount() {
    socket.send(JSON.stringify({ id: shared.id, deleteAccount: true }));
}

function initializePlayer(payload) {
    console.log("id", payload.id);
    shared.id = payload.id;
    shared.player = platforms[shared.id];
    shared.player.isEnabled = true;
    shared.player.positionWS = payload.position;
    shared.player.oldPositionWS = { ...shared.player.positionWS };
    colorPicker.value = shared.player.fillStyle;
    nameInput.value = shared.player.name;
    shared.controller = {
        "r": { pressed: false, direction: { x: 0, y: 0 } },
        "v": { pressed: false, direction: { x: 0, y: 0 } },

        "ArrowLeft": { pressed: false, direction: { x: -1, y: 0 } },
        "a": { pressed: false, direction: { x: -1, y: 0 } },

        "ArrowRight": { pressed: false, direction: { x: 1, y: 0 } },
        "d": { pressed: false, direction: { x: 1, y: 0 } },

        "ArrowUp": { pressed: false, direction: { x: 0, y: -1 } },
        "w": { pressed: false, direction: { x: 0, y: -1 } },
        " ": { pressed: false, direction: { x: 0, y: -1 } },

        "s": { pressed: false, direction: { x: 0, y: 1 } }
    }
    body.style.visibility = "visible";
    zoom(false);
}

socket.addEventListener('open', async (event) => {
    const ips = await getIPs();
    socket.send(JSON.stringify({ id: shared.id, ip: ips[0] }));
});

socket.onmessage = message => {

    const payload = JSON.parse(message.data);
    if (!payload) return;

    if ("initialization" in payload) {
        initializePlayer(payload);
    } else {
        if ("position" in payload) {
            platforms[payload.id].positionWS = payload.position;
            platforms[payload.id].isEnabled = true;
        }
        else if ("color" in payload) {
            platforms[payload.id].fillStyle = payload.color;
            platforms[payload.id].name = payload.name;
            platforms[payload.id].status = payload.status;
        }
        else if ("highscore" in payload) {
            shared.highScorePayload = payload;
        }
        else if ("serverDown" in payload) {
            shared.shared.isServerDown = true;
        }
        else if ("size" in payload) {
            platforms.push(new Platform(
                payload.positionWS,
                "#222222",
                payload.size,
            ));
        }
    }
}
