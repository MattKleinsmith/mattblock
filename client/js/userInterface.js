import { shared, nameFieldSpaceCount, builder, socket } from "./configuration.js";
import { sendProfile, sendPlatform } from "./network.js";
import { zoom, calibrateCanvas } from "./draw.js";
import { getMousePositionWS } from "./helpers.js";
import { platforms, builtPlatformIds, builtPlatforms } from "./gameData.js";
import { Platform, withinRange } from "./platform.js";

export function movePlayer() {
    if (!shared.player) return;

    const totalDirection = { x: 0, y: 0 };
    for (const key in shared.controller) {
        if (shared.controller[key].pressed) {
            if (totalDirection.x === 0) totalDirection.x = shared.controller[key].direction.x;
            if (totalDirection.y === 0) totalDirection.y = shared.controller[key].direction.y;
            if (key === "r") {
                shared.player.oldPositionWS = { x: 0, y: 0 };
                shared.player.positionWS = { x: 0, y: 0 };
                shared.player.velocity = { x: 0, y: 0 };
            }
            if (key === "v") {
                shared.player.positionWS = { x: shared.player.positionWS.x, y: shared.player.positionWS.y };
                shared.player.velocity = { x: 0, y: shared.player.velocity.y + 1 };
            }
        }
    }
    shared.player.move(totalDirection);

    if (shared.rewardCount % 2 === 1) {
        rewards.style.left = shared.player.positionSS.x + 'px';
        rewards.style.top = shared.player.positionSS.y - 50 + 'px';
    } else {
        rewards.style.left = shared.player.positionSS.x + 'px';
        rewards.style.top = shared.player.positionSS.y + 50 + 'px';
    }
}

colorPicker.oninput = function (event) {
    shared.player.fillStyle = colorPicker.value;
    const color = colorPicker.value.slice(1);
    localStorage.setItem("color", color);
    favicon.href = `https://www.thecolorapi.com/id?format=svg&named=false&hex=${localStorage.getItem("color")}`
    sendProfile();
}

nameInput.oninput = function (event) {
    shared.player.name = nameInput.value;
    nameInput.style.width = nameInput.value.length + nameFieldSpaceCount + "ch";
    colorPicker.style.width = 2 * nameInput.value.length + 2 + nameFieldSpaceCount + "ch";
    sendProfile();
}

textCanvas.onclick = function (event) {
    closeMenu();
};

function closeMenu() {
    nameInput.style.display = "none";
    colorPicker.style.display = "none";
    stats.style.display = "none";
    shared.allowMovement = true;
}

function cleanUpRewards() {
    rewards.style.display = "none";
    shared.rewardCount--;
    if (shared.rewardCount === 0) {
        document.querySelector("#jumpButton").remove();
        document.querySelector("#runButton").remove();
    }
    if (+(run.innerText) > +(jump.innerText)) {
        jumpLabel.textContent = "You choose her more than me :(";
        runLabel.textContent = "Double down 😎";
    } else if (+(run.innerText) < +(jump.innerText)) {
        jumpLabel.textContent = "Me!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
        runLabel.textContent = "bruh";
    } else {
        jumpLabel.textContent = "Choose me!";
        runLabel.textContent = "No, pick me!";
    }
    shared.collectedRewardFrameNumber = shared.numFrames;
}

function giveReward() {
    rewards.style.display = "block";
    shared.rewardCount++;
    if (shared.rewardCount === 1) {
        // Create and destroy each time to deter cheating.
        const jumpButton = document.createElement("button");
        jumpButton.id = "jumpButton";
        jumpButton.textContent = "🦘";
        jumpReward.append(jumpButton);

        const runButton = document.createElement("button");
        runButton.id = "runButton";
        runButton.textContent = "🐎";
        runReward.append(runButton);

        jumpButton.onmouseover = e => {
            if (rewards.style.display === "block") jumpLabel.textContent = "Yes!"
        };

        jumpButton.onmouseleave = e => {
            if (rewards.style.display === "block" && shared.numFrames > shared.collectedRewardFrameNumber + 2) {
                jumpLabel.textContent = "nooo";
            }
        };

        jumpButton.onclick = e => {
            Platform.jumpForce += 0.2;
            jump.innerText = +(jump.innerText) + 1;
            cleanUpRewards();
        }

        runButton.onmouseover = e => {
            if (rewards.style.display === "block") runLabel.textContent = "😎"
        };

        runButton.onmouseleave = e => {
            if (rewards.style.display === "block" && shared.numFrames > shared.collectedRewardFrameNumber + 2) {
                runLabel.textContent = "😮"
            }
        };

        runButton.onclick = e => {
            Platform.maxRunSpeed += 0.2;
            run.innerText = +(run.innerText) + 1;
            cleanUpRewards();
        }
    }
}

let isMoveLeftQuestComplete = false;
let isMoveRightQuestComplete = false;
let isJumpQuestComplete = false;

document.addEventListener("keydown", event => {
    // Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
    if (shared.allowMovement && shared.controller[event.key]) {
        shared.controller[event.key].pressed = true;
        if (!isMoveLeftQuestComplete && (event.key === "a" || event.key === "ArrowLeft")) {
            questMoveLeft.innerHTML =
                `<img class="bulletComplete" src="images/checkmark.png">` + questMoveLeft.innerHTML;
            document.querySelector("#questMoveLeft>.bulletIncomplete").remove();
            document.querySelector("#questMoveLeft>.questIncomplete").classList.replace("questIncomplete", "questComplete");

            giveReward();

            isMoveLeftQuestComplete = true;
        }
        if (!isMoveRightQuestComplete && (event.key === "d" || event.key === "ArrowRight")) {
            questMoveRight.innerHTML =
                `<img class="bulletComplete" src="images/checkmark.png">` + questMoveRight.innerHTML;
            document.querySelector("#questMoveRight>.bulletIncomplete").remove();
            document.querySelector("#questMoveRight>.questIncomplete").classList.replace("questIncomplete", "questComplete");

            giveReward();

            isMoveRightQuestComplete = true;
        }
        if (!isJumpQuestComplete && (event.key === "w" || event.key === "ArrowUp" || event.key === " ")) {
            questJump.innerHTML =
                `<img class="bulletComplete" src="images/checkmark.png">` + questJump.innerHTML;
            document.querySelector("#questJump>.bulletIncomplete").remove();
            document.querySelector("#questJump>.questIncomplete").classList.replace("questIncomplete", "questComplete");

            giveReward();

            isJumpQuestComplete = true;
        }
    }

    if (((event.ctrlKey || event.metaKey) && ['-', '='].includes(event.key))) {
        event.preventDefault();
        zoom(event.key === '=');
    }

    if (event.key === "F1") {
        event.preventDefault();
        builder.enabled = !builder.enabled;
        if (builder.enabled) builder.deletion = false;
    }

    if (event.key === "F2") {
        event.preventDefault();
        builder.deletion = !builder.deletion;
        if (builder.deletion) builder.enabled = false;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        closeMenu();
    }
});

document.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoom(event.deltaY < 0);
    }
}, { passive: false });

document.addEventListener("keyup", event => {
    if (shared.controller[event.key]) shared.controller[event.key].pressed = false;
});

document.addEventListener('contextmenu', event => {
    event.preventDefault();

    shared.allowMovement = false;

    for (const key in shared.controller) {
        shared.controller[key].pressed = false;
    }

    nameInput.style.display = "block";
    nameInput.style.left = event.clientX + 'px';
    nameInput.style.top = event.clientY + 'px';
    nameInput.style.width = nameInput.value.length + nameFieldSpaceCount + "ch";
    nameInput.focus();

    colorPicker.style.display = "block";
    colorPicker.style.left = event.clientX + 'px';
    colorPicker.style.top = event.clientY + 50 + 'px';
    colorPicker.style.width = 2 * nameInput.value.length + 2 + nameFieldSpaceCount + "ch";
    colorPicker.style.height = 40 + "px";

    stats.style.display = "block";
    stats.style.left = event.clientX + 'px';
    stats.style.top = event.clientY + 100 + 'px';
    stats.style.height = 40 + "px";
}, false);

document.addEventListener('mousedown', event => {
    if (event.button === 0 && builder.enabled) { // LEFT CLICK
        builder.canvas = calibrateCanvas().canvas;
        builder.startingPoint = getMousePositionWS(builder.canvas, event, shared.player);
        builder.platform = createPlatform(builder.startingPoint);
    }
});

document.addEventListener('mousemove', event => {
    if (event.button === 0 && builder.platform && builder.enabled) { // LEFT CLICK
        builder.endingPoint = getMousePositionWS(builder.canvas, event, shared.player);
        updatePlatform();
    }
});

document.addEventListener('mouseup', event => {
    if (event.button === 0) { // LEFT MOUSE BUTTON
        if (builder.enabled && builder.platform.size.width > 0 && builder.platform.size.height > 0) {
            sendPlatform();
            builtPlatformIds.splice(builtPlatformIds.indexOf("temp"), 1);
            delete builtPlatforms["temp"];
            builder.platform = null;
        }
        else if (builder.deletion) {
            const deletionPoint = getMousePositionWS(calibrateCanvas().canvas, event, shared.player);
            for (const platformId of builtPlatformIds) {
                const platform = builtPlatforms[platformId];
                if (!platform) continue;
                if (withinRange(deletionPoint.x, platform.positionWS.x, platform.positionWS.x + platform.size.width) &&
                    withinRange(deletionPoint.y, platform.positionWS.y, platform.positionWS.y + platform.size.height)) {
                    socket.send(JSON.stringify({ senderId: shared.id, idOfPlatformToDelete: platformId }));
                    break;
                }
            }
        }
    }
});

function findRectangle(startingPoint, endingPoint) {
    const width = Math.abs(startingPoint.x - endingPoint.x);
    const height = Math.abs(startingPoint.y - endingPoint.y);
    const topLeft = {
        x: Math.min(startingPoint.x, endingPoint.x),
        y: Math.min(startingPoint.y, endingPoint.y)
    }
    return [topLeft, width, height];
}

function createPlatform(startingPoint, endingPoint = startingPoint) {

    const [topLeftWS, width, height] = findRectangle(startingPoint, endingPoint);

    const platform = new Platform(
        topLeftWS,
        "#AA5555",
        {
            width: width,
            height: height
        },
        "",
        true
    );
    builtPlatforms["temp"] = platform;
    builtPlatformIds.push("temp");
    return platform;
}

function updatePlatform() {
    const [topLeftWS, width, height] = findRectangle(builder.startingPoint, builder.endingPoint);
    builder.platform.positionWS = topLeftWS;
    builder.platform.size = {
        width: width,
        height: height
    }
}
