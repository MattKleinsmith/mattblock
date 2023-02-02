import { shared, nameFieldSpaceCount, builder } from "./configuration.js";
import { sendProfile, sendPlatform, deleteAccount } from "./network.js";
import { zoom, calibrateCanvas } from "./draw.js";
import { getMousePositionWS } from "./helpers.js";
import { platforms } from "./gameData.js";
import { Platform } from "./platform.js";

export function movePlayer() {
    if (!shared.player) return;

    const totalDirection = { x: 0, y: 0 };
    for (const key in shared.controller) {
        if (shared.controller[key].pressed) {
            totalDirection.x += shared.controller[key].direction.x;
            totalDirection.y += shared.controller[key].direction.y;
            if (key === "r") {
                respawn();
            }
            if (key === "v") {
                shared.player.positionWS = { x: shared.player.positionWS.x, y: shared.player.positionWS.y };
                shared.player.velocity = { x: 0, y: shared.player.velocity.y + 1 };
            }
        }
    }
    shared.player.move(totalDirection);

    if (shared.player.positionWS.y > 5000) {
        respawn();
    }
}

function respawn() {
    shared.player.oldPositionWS = { ...shared.origin };
    shared.player.positionWS = { ...shared.origin };
    shared.player.velocity = { x: 0, y: 0 };
}

colorPicker.oninput = function (event) {
    if (colorPicker.value === "#181a1b") {
        colorPicker.value = "#3DB856"
    }
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
    nameInput.style.display = "none";
    colorPicker.style.display = "none";
    shared.allowMovement = true;
};

document.addEventListener("keydown", event => {
    // Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
    if (shared.allowMovement && shared.controller[event.key]) shared.controller[event.key].pressed = true;

    if (((event.ctrlKey || event.metaKey) && ['-', '='].includes(event.key))) {
        event.preventDefault();
        zoom(event.key === '=');
    }

    if (event.key === "b") {
        builder.enabled = !builder.enabled;
    }

    if (event.key === "F1") {
        event.preventDefault();
        console.log("Deleting account");
        deleteAccount();
    }


    if (event.key === "F2") {
        event.preventDefault();
        console.log(platforms);
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
    nameInput.style.fontFamily = "monospace";
    nameInput.focus();

    colorPicker.style.display = "block";
    colorPicker.style.left = event.clientX + 'px';
    colorPicker.style.top = event.clientY + 50 + 'px';
    colorPicker.style.width = 2 * nameInput.value.length + 2 + nameFieldSpaceCount + "ch";
    colorPicker.style.height = 40 + "px";
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
    if (event.button === 0 && builder.enabled) { // LEFT MOUSE BUTTON
        sendPlatform();
        builder.platform = null;
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
    platforms.push(platform);
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
