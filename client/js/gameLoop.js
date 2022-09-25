setInterval(gameLoop, frameTime);

function gameLoop() {
    ++numFrames;
    // console.log((performance.now() - beginning) / numFrames);

    movePlayer();  // Simulation
    drawWorld(); // Presentation
    sendPosition(); // Communication
}

function movePlayer() {
    if (!player) return;

    const totalDirection = { x: 0, y: 0 };
    for (const key in controller) {
        if (controller[key].pressed) {
            totalDirection.x += controller[key].direction.x;
            totalDirection.y += controller[key].direction.y;
            if (key === "r") {
                player.oldPositionWS = { x: 0, y: 0 };
                player.positionWS = { x: 0, y: 0 };
                player.velocity = { x: 0, y: 0 };
            }
            if (key === "v") {
                player.positionWS = { x: player.positionWS.x, y: player.positionWS.y };
                player.velocity = { x: 0, y: player.velocity.y + 1 };
            }
        }
    }
    player.move(totalDirection);
}

function drawWorld() {
    const ctx = calibrateCanvas();
    drawPlatforms(ctx);

    const [minimapCtx, minimap] = calibrateMinimap();
    drawPlatforms_Minimap(minimapCtx, minimap);

    const textCtx = calibrateTextCanvas();
    drawHighscore(textCtx);
    drawAltitude(textCtx);
    drawServerStatus(textCtx);
}

function sendPosition() {
    if (!player) return;
    if (player.positionWS.x !== player.oldPositionWS.x ||
        player.positionWS.y !== player.oldPositionWS.y) {
        const payload = { id: id, position: player.positionWS };
        socket.send(JSON.stringify(payload));
    }
}

function sendProfile() {
    const profilePayload = { id: id, color: player.fillStyle, name: player.name };
    socket.send(JSON.stringify(profilePayload));
}

function initializePlayer(payload) {
    console.log("id", payload.id);
    id = payload.id;
    player = platforms[id];
    player.positionWS = payload.position;
    player.oldPositionWS = { ...player.positionWS };
    colorPicker.value = player.fillStyle;
    nameInput.value = player.name;
    controller = {
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
        player.leftScrollPercentage = 0.42;  // 0.50 for instascroll
        player.rightScrollPercentage = 1 - player.leftScrollPercentage;

        player.leftScrollSS = window.innerWidth * player.leftScrollPercentage;
        player.rightScrollSS = window.innerWidth * player.rightScrollPercentage;

        player.noScrollZoneHalfWidth = (player.rightScrollSS - player.leftScrollSS) * 0.5;

        player.leftScrollWS = player.positionWS.x - player.noScrollZoneHalfWidth;
        player.rightScrollWS = player.positionWS.x + player.noScrollZoneHalfWidth;

        player.leftScreenWS = player.positionWS.x - window.innerWidth * 0.5;
        player.leftMMWS = player.positionWS.x - window.innerWidth * .10 * 0.5;
    }

    {
        player.topScrollPercentage = 0.35;
        player.bottomScrollPercentage = 1 - player.topScrollPercentage;

        player.topScrollSS = window.innerHeight * player.topScrollPercentage;
        player.bottomScrollSS = window.innerHeight * player.bottomScrollPercentage;

        player.noScrollZoneHalfHeight = (player.bottomScrollSS - player.topScrollSS) * 0.5;

        player.topScrollWS = player.positionWS.y - player.noScrollZoneHalfHeight;
        player.bottomScrollWS = player.positionWS.y + player.noScrollZoneHalfHeight;

        player.topScreenWS = player.positionWS.y - window.innerHeight * 0.5;
    }
}

socket.addEventListener('open', (event) => {
    getIPs().then(result => socket.send(JSON.stringify({ id: id, ip: result[0] })));
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
            highScorePayload = payload;
        }
        else if ("serverDown" in payload) {
            isServerDown = true;
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
    if (!player) return;

    ctx.fillStyle = "#181A1B";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = player.fillStyle;

    ctx.scale(minimapScale, minimapScale);
    const minimapCenterX = ctx.canvas.width * .5 / minimapScale;
    const minimapCenterY = ctx.canvas.height * .5 / minimapScale;
    ctx.fillRect(
        minimapCenterX,
        minimapCenterY,
        player.size.width,
        player.size.height);
    player.MM = { x: minimapCenterX, y: minimapCenterY };

    for (let i = platforms.length - 1; i >= 0; i--) {
        if (i === id) continue;
        const platform = platforms[i];
        if (platform.isEnabled) platform.draw_Minimap(ctx);
    }
}

//for zoom detection
px_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;

addEventListener('resize', (event) => isZooming());

function isZooming() {
    const newPx_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
    recalibrateScreen();
    if (newPx_ratio != px_ratio) {
        px_ratio = newPx_ratio;
        console.log("zooming", newPx_ratio);
        return true;
    } else {
        console.log("just resizing");
        return false;
    }
}

function calibrateCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    if (gameScale === 0.25) {
        ctx.setTransform(gameScale, 0, 0, gameScale, ctx.canvas.width * gameScale * 1.5, ctx.canvas.height * gameScale * 1.5)
    } else if (gameScale === 0.50) {
        ctx.setTransform(gameScale, 0, 0, gameScale, ctx.canvas.width * gameScale * 0.5, ctx.canvas.height * gameScale * 0.5)
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
    if (!isServerDown) return;
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
    if (!highScorePayload) return;
    const text = `Highest player: ${highScorePayload.profile.name}: ${-highScorePayload.highscore}`;
    drawTopText(ctx, text, highScorePayload.profile.color, 1);
}

function drawAltitude(ctx) {
    if (!player) return;
    const text = `Your altitude: ${-player.positionWS.y}`;
    drawTopText(ctx, text, player.fillStyle, 2);
}

colorPicker.oninput = function (event) {
    player.fillStyle = colorPicker.value;
    sendProfile();
}

nameInput.oninput = function (event) {
    player.name = nameInput.value;
    nameInput.style.width = nameInput.value.length + nameFieldSpaceCount + "ch";
    colorPicker.style.width = 2 * nameInput.value.length + 2 + nameFieldSpaceCount + "ch";
    sendProfile();
}

function zoom(shouldZoomIn) {
    shouldZoomIn ? zoomIn() : zoomOut();
    gameScale = gameScales[gameScaleIndex];
}

function zoomIn() {
    if (++gameScaleIndex === gameScales.length) gameScaleIndex--;
}

function zoomOut() {
    if (--gameScaleIndex === -1) gameScaleIndex++;
}

document.addEventListener("keydown", event => {
    // Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
    if (allowMovement && controller[event.key]) controller[event.key].pressed = true;

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
    if (controller[event.key]) controller[event.key].pressed = false;
})

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();

    allowMovement = false;

    for (const key in controller) {
        controller[key].pressed = false;
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
    allowMovement = true;
});
