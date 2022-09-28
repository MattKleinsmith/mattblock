import { shared, socket, minimapScale, nameFieldSpaceCount } from "./configuration.js";
import { platforms } from "./gameData.js";
import { getIPs } from "./ip.js";

export function movePlayer() {
    if (!shared.player) return;

    const totalDirection = { x: 0, y: 0 };
    for (const key in shared.controller) {
        if (shared.controller[key].pressed) {
            totalDirection.x += shared.controller[key].direction.x;
            totalDirection.y += shared.controller[key].direction.y;
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
}

export function drawWorld() {
    const ctx = calibrateCanvas();
    drawPlatforms(ctx);

    const [minimapCtx, minimap] = calibrateMinimap();
    drawPlatforms_Minimap(minimapCtx, minimap);

    const textCtx = calibrateTextCanvas();
    drawHighscore(textCtx);
    drawAltitude(textCtx);
    drawServerStatus(textCtx);
}

export function sendPosition() {
    if (!shared.player) return;
    if (shared.player.positionWS.x !== shared.player.oldPositionWS.x ||
        shared.player.positionWS.y !== shared.player.oldPositionWS.y) {
        const payload = { id: shared.id, position: shared.player.positionWS };
        socket.send(JSON.stringify(payload));
    }
}

function sendProfile() {
    const profilePayload = { id: shared.id, color: shared.player.fillStyle, name: shared.player.name };
    socket.send(JSON.stringify(profilePayload));
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
    recalibrateScreen();
}

function recalibrateScreen() {
    {
        shared.player.leftScrollPercentage = 0.42;  // 0.50 for instascroll
        shared.player.rightScrollPercentage = 1 - shared.player.leftScrollPercentage;

        shared.player.leftScrollSS = window.innerWidth * shared.player.leftScrollPercentage;
        shared.player.rightScrollSS = window.innerWidth * shared.player.rightScrollPercentage;

        shared.player.noScrollZoneHalfWidth = (shared.player.rightScrollSS - shared.player.leftScrollSS) * 0.5;

        shared.player.leftScrollWS = shared.player.positionWS.x - shared.player.noScrollZoneHalfWidth;
        shared.player.rightScrollWS = shared.player.positionWS.x + shared.player.noScrollZoneHalfWidth;

        shared.player.leftScreenWS = shared.player.positionWS.x - window.innerWidth * 0.5;
        shared.player.leftMMWS = shared.player.positionWS.x - window.innerWidth * .10 * 0.5;
    }

    {
        shared.player.topScrollPercentage = 0.35;
        shared.player.bottomScrollPercentage = 1 - shared.player.topScrollPercentage;

        shared.player.topScrollSS = window.innerHeight * shared.player.topScrollPercentage;
        shared.player.bottomScrollSS = window.innerHeight * shared.player.bottomScrollPercentage;

        shared.player.noScrollZoneHalfHeight = (shared.player.bottomScrollSS - shared.player.topScrollSS) * 0.5;

        shared.player.topScrollWS = shared.player.positionWS.y - shared.player.noScrollZoneHalfHeight;
        shared.player.bottomScrollWS = shared.player.positionWS.y + shared.player.noScrollZoneHalfHeight;

        shared.player.topScreenWS = shared.player.positionWS.y - window.innerHeight * 0.5;
    }
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
            shared.shared.isServerDown = true;
        }
    }
}

function calibrateMinimap() {
    const canvas = document.getElementById('minimap');
    canvas.width = window.innerWidth * 0.099;
    canvas.height = window.innerHeight * 0.999;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    return [ctx, canvas];
}

function drawPlatforms_Minimap(ctx) {
    if (!shared.player) return;

    ctx.fillStyle = "#181A1B";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = shared.player.fillStyle;

    ctx.scale(minimapScale, minimapScale);
    const minimapCenterX = ctx.canvas.width * .5 / minimapScale;
    const minimapCenterY = ctx.canvas.height * .5 / minimapScale;
    ctx.fillRect(
        minimapCenterX,
        minimapCenterY,
        shared.player.size.width,
        shared.player.size.height);
    shared.player.MM = { x: minimapCenterX, y: minimapCenterY };

    for (let i = platforms.length - 1; i >= 0; i--) {
        if (i === shared.id) continue;
        const platform = platforms[i];
        if (platform.isEnabled) platform.draw_Minimap(ctx);
    }
}

addEventListener('resize', (event) => recalibrateScreen);

function calibrateCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    if (shared.gameScale === 0.25) {
        ctx.setTransform(shared.gameScale, 0, 0, shared.gameScale, ctx.canvas.width * shared.gameScale * 1.5, ctx.canvas.height * shared.gameScale * 1.5)
    } else if (shared.gameScale === 0.50) {
        ctx.setTransform(shared.gameScale, 0, 0, shared.gameScale, ctx.canvas.width * shared.gameScale * 0.5, ctx.canvas.height * shared.gameScale * 0.5)
    }

    return ctx;
}

function calibrateTextCanvas() {
    const canvas = document.getElementById('textCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    return ctx;
}

function drawPlatforms(ctx) {
    // Backwards to draw player names over NPC platforms
    for (let i = platforms.length - 1; i >= 0; i--) {
        const platform = platforms[i];
        if (platform.isEnabled) platform.draw(ctx);
    }
}

function drawServerStatus(ctx) {
    if (!shared.isServerDown) return;
    ctx.fillStyle = 'red';
    const fontSize = 48 / px_ratio;
    ctx.font = fontSize + 'px sans-serif';
    ctx.fillText(`The server reset. Refresh to reconnect`, 100, 100 + fontSize * 0.5);
    ctx.fillText(`(will automate this eventually)`, 100, 100 + fontSize * 1.5);
}

function drawTopText(ctx, text, fillStyle, order = 1) {
    const fontSize = 19;
    ctx.fillStyle = fillStyle;
    ctx.font = fontSize + 'px sans-serif';
    ctx.fillText(
        text,
        window.innerWidth * .45,  // x
        fontSize * order);        // y
}

function drawHighscore(ctx) {
    if (!shared.highScorePayload) return;
    const text = `Highest player: ${shared.highScorePayload.profile.name}: ${-shared.highScorePayload.highscore}`;
    drawTopText(ctx, text, shared.highScorePayload.profile.color, 1);
}

function drawAltitude(ctx) {
    if (!shared.player) return;
    const text = `Your altitude: ${-shared.player.positionWS.y}`;
    drawTopText(ctx, text, shared.player.fillStyle, 2);
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

function zoom(shouldZoomIn) {
    shouldZoomIn ? zoomIn() : zoomOut();
    shared.gameScale = gameScales[gameScaleIndex];
}

function zoomIn() {
    if (++gameScaleIndex === gameScales.length) gameScaleIndex--;
}

function zoomOut() {
    if (--gameScaleIndex === -1) gameScaleIndex++;
}

document.addEventListener("keydown", event => {
    // Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
    if (shared.allowMovement && shared.controller[event.key]) shared.controller[event.key].pressed = true;

    if (((event.ctrlKey || event.metaKey) && ['-', '='].includes(event.key))) {
        event.preventDefault();
        zoom(event.key === '=');
    }
})

document.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoom(event.deltaY < 0);
    }
}, { passive: false })

document.addEventListener("keyup", event => {
    if (shared.controller[event.key]) shared.controller[event.key].pressed = false;
})

document.addEventListener('contextmenu', function (event) {
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

textCanvas.addEventListener('click', event => {
    nameInput.style.display = "none";
    colorPicker.style.display = "none";
    shared.allowMovement = true;
});
