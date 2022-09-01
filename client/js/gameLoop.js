const socket = new WebSocket(url);

setInterval(gameLoop, frameTime)

function gameLoop() {
    time += frameTime;

    movePlayer();
    drawWorld();
    sendPosition();
}

function sendProfile() {
    const profilePayload = { id: id, color: player.fillStyle, name: player.name };
    socket.send(JSON.stringify(profilePayload));
}

function initializePlayer(payload) {
    console.log("id", payload.id);
    id = payload.id;
    player = gameObjects[id];
    player.playerPositionWorldSpace = payload.position;
    player.oldPlayerPositionWorldSpace = { ...player.playerPositionWorldSpace };
    colorPicker.value = player.fillStyle;
    nameInput.value = player.name;
    controller = {
        " ": { pressed: false, direction: { x: 0, y: -1 } },  // should affect velocity
        // "s": { pressed: false, direction: { x: 0, y: 1 } },
        "a": { pressed: false, direction: { x: -1, y: 0 } },
        "d": { pressed: false, direction: { x: 1, y: 0 } },
        "r": { pressed: false, direction: { x: 0, y: 0 } },
    }
    body.style.visibility = "visible";
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
            gameObjects[payload.id].positionWorldSpace = payload.position;
        }
        else if ("color" in payload) {
            gameObjects[payload.id].fillStyle = payload.color;
            gameObjects[payload.id].name = payload.name;
        }
    }
}

function sendPosition() {
    if (!player) return;
    if (player.playerPositionWorldSpace.x !== player.oldPlayerPositionWorldSpace.x ||
        player.playerPositionWorldSpace.y !== player.oldPlayerPositionWorldSpace.y) {
        const payload = { id: id, position: player.playerPositionWorldSpace };
        socket.send(JSON.stringify(payload));
    }
}

function movePlayer() {
    if (!player) return;

    player.oldPlayerPositionWorldSpace = { ...player.playerPositionWorldSpace };

    const totalDirection = { x: 0, y: 0 };
    for (const key in controller) {
        if (controller[key].pressed) {
            totalDirection.x += controller[key].direction.x;
            totalDirection.y += controller[key].direction.y;
            if (key === "r") {
                player.playerPositionWorldSpace = { x: 0, y: 0 };
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

    gameObjects.forEach(gameObject => gameObject.draw(ctx));
    platforms.forEach(platform => platform.draw(ctx));
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
