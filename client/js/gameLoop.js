const socket = new WebSocket(url);



setInterval(gameLoop, frameTime)

function gameLoop() {
    // console.log((performance.now() - beginning) / ++numFrames);

    movePlayer();  // Simulation
    drawWorld(); // Presentation
    sendPosition(); // Communication
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
        " ": { pressed: false, direction: { x: 0, y: -1 } },  // should affect velocity
        // "s": { pressed: false, direction: { x: 0, y: 1 } },
        "a": { pressed: false, direction: { x: -1, y: 0 } },
        "d": { pressed: false, direction: { x: 1, y: 0 } },
        "r": { pressed: false, direction: { x: 0, y: 0 } },
        "ArrowUp": { pressed: false, direction: { x: 0, y: -1 } },  // should affect velocity
        // "s": { pressed: false, direction: { x: 0, y: 1 } },
        "ArrowLeft": { pressed: false, direction: { x: -1, y: 0 } },
        "ArrowRight": { pressed: false, direction: { x: 1, y: 0 } },
    }
    body.style.visibility = "visible";

    {
        player.leftScrollPercentage = 0.42;  // 0.50 for instascroll
        player.rightScrollPercentage = 1 - player.leftScrollPercentage;

        player.leftScrollSS = window.innerWidth * player.leftScrollPercentage;
        player.rightScrollSS = window.innerWidth * player.rightScrollPercentage;

        player.noScrollZoneHalfWidth = (player.rightScrollSS - player.leftScrollSS) * 0.5;

        player.leftScrollWS = player.positionWS.x - player.noScrollZoneHalfWidth;
        player.rightScrollWS = player.positionWS.x + player.noScrollZoneHalfWidth;

        player.leftScreenWS = player.positionWS.x - window.innerWidth * 0.5;
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
        }
    }
}

function sendPosition() {
    if (!player) return;
    if (player.positionWS.x !== player.oldPositionWS.x ||
        player.positionWS.y !== player.oldPositionWS.y) {
        const payload = { id: id, position: player.positionWS };
        socket.send(JSON.stringify(payload));
    }
}

function movePlayer() {
    if (!player) return;

    player.oldPositionWS = { ...player.positionWS };

    const totalDirection = { x: 0, y: 0 };
    for (const key in controller) {
        if (controller[key].pressed) {
            totalDirection.x += controller[key].direction.x;
            totalDirection.y += controller[key].direction.y;
            if (key === "r") {
                player.positionWS = { x: 0, y: 0 };
                player.velocity = { x: 0, y: 0 };
            }
        }
    }
    player.move(totalDirection);
}

function drawWorld() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; // * .996;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');


    platforms.forEach(platform => {
        if (platform.isEnabled) platform.draw(ctx);
    })
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

// Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
document.addEventListener("keydown", event => {
    if (allowMovement && controller[event.key]) controller[event.key].pressed = true;
})

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

canvas.addEventListener('click', event => {
    nameInput.style.display = "none";
    colorPicker.style.display = "none";
    allowMovement = true;
});
