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
    controller = {
        // "w": { pressed: false, move: () => { player.move({ x: 0, y: -1 }) } },
        "a": { pressed: false, move: () => { player.move({ x: -1, y: 0 }) } },
        // "s": { pressed: false, move: () => { player.move({ x: 0, y: 1 }) } },
        "d": { pressed: false, move: () => { player.move({ x: 1, y: 0 }) } },
        " ": { pressed: false, move: () => { player.move({ x: 0, y: -1 }) } },  // should affect velocity
    }
    colorPicker.value = player.fillStyle;
    player.name = nameInput.value;
    sendProfile();
}

socket.onmessage = message => {

    const payload = JSON.parse(message.data);

    if (id === undefined) {
        initializePlayer(payload);
    } else {
        if ("position" in payload) {
            gameObjects[payload.id].positionWorldSpace = payload.position;
        }
        if ("color" in payload) {
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

    let isMoved = false;
    for (const key in controller) {
        if (controller[key].pressed) controller[key].move();  // TODO: Can get hit by multiple gravities
    }
    if (!isMoved) player.move();
}

function drawWorld() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; // * .996;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    gameObjects.forEach(gameObject => gameObject.draw(ctx))
}

colorPicker.oninput = function (event) {
    player.fillStyle = colorPicker.value;
    sendProfile();
}

nameInput.oninput = function (event) {
    player.name = nameInput.value;
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

    const offset = 5;

    colorPicker.style.display = "hidden";
    colorPicker.style.left = event.clientX - offset + 'px';
    colorPicker.style.top = event.clientY - offset + 'px';

    nameInput.style.display = "block";
    nameInput.style.left = colorPicker.style.left;
    nameInput.style.top = colorPicker.style.top;

    setTimeout(colorPicker.showPicker.bind(colorPicker), frameTime * 2);
}, false);

canvas.addEventListener('click', (event) => {
    nameInput.style.display = "none";
    allowMovement = true;
});
