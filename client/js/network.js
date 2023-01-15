import { shared, socket, builder } from "./configuration.js";
import { getIPs } from "./ip.js";
import { platforms, builtPlatforms, builtPlatformIds } from "./gameData.js";
import { zoom } from "./draw.js";
import { Platform } from "./platform.js";
import { giveRewardChoice, questIdToUI, showRewardChoice } from "./userInterface.js";

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
    socket.send(JSON.stringify({ creatorId: shared.id, positionWS: builder.platform.positionWS, size: builder.platform.size }));
}

function initializePlayer(payload) {
    console.log("id", payload.id);
    shared.id = payload.id;
    shared.player = platforms[shared.id];
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

socket.addEventListener('open', (event) => {
    getIPs().then(result => socket.send(JSON.stringify({ id: shared.id, ip: result[0] })));
});

socket.onmessage = message => {

    const payload = JSON.parse(message.data);

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
            shared.isServerDown = true;
        }
        else if ("size" in payload) {
            builtPlatformIds.push(payload.platformId);
            builtPlatforms[payload.platformId] = new Platform(
                payload.positionWS,
                "#222222",
                payload.size,
            );
        }
        else if ("idOfPlatformToDelete" in payload) {
            builtPlatformIds.splice(payload.idOfPlatformToDelete, 1);
            delete builtPlatforms[payload.idOfPlatformToDelete];
        }
        else if ("questsCompleted" in payload) {
            shared.questsCompleted = payload.questsCompleted;
            payload.questsCompleted.forEach(questId => questIdToUI[questId]());
            questWrapper.style.display = "block";
        }
        else if ("questId" in payload) {
            // Quest completion
            shared.questsCompleted.push(payload.questId);
            questIdToUI[payload.questId]();
        }
        else if ("stats" in payload) {
            // Remember the reward count
            shared.rewardCount = payload.stats.rewardCount;

            Platform.jumpForce = 1.35 + 0.2 * payload.stats.jump;
            jump.innerText = payload.stats.jump;

            Platform.maxRunSpeed = 1 + 0.2 * payload.stats.run;
            run.innerText = payload.stats.run;

            // If the player has unredeemed rewards, show the reward buttons
            if (payload.stats.rewardCount > 0 && !document.querySelector("#rewards button")) showRewardChoice();
        }
    }
}
