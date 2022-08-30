let id;
let controller;
let player;

colorPicker.style.position = "absolute"
colorPicker.style.left = 500 + 'px';
colorPicker.style.top = 500 + 'px';

setInterval(gameLoop, frameTime)

///////////////////////////////////////////////////////////////////////////////////////

function gameLoop() {
    time += frameTime;

    movePlayer();
    drawWorld();
    sendPosition();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

colorPicker.oninput = function (event) {
    player.setColor(hexToRgb(colorPicker.value))
    sendColor();
}

function sendColor() {
    const colorPayload = { id: id, color: player.color };
    socket.send(JSON.stringify(colorPayload));
}

function initializePlayer(payload) {
    console.log("id", payload.id);
    id = payload.id;
    player = gameObjects[id];
    controller = {
        "w": { pressed: false, move: () => { player.move({ x: 0, y: -1 }) } },
        "a": { pressed: false, move: () => { player.move({ x: -1, y: 0 }) } },
        "s": { pressed: false, move: () => { player.move({ x: 0, y: 1 }) } },
        "d": { pressed: false, move: () => { player.move({ x: 1, y: 0 }) } },
        " ": { pressed: false, move: () => { player.move({ x: 0, y: -1 }) } },  // should affect velocity
    }
    colorPicker.value = rgbToHex(player.color.r, player.color.g, player.color.b);
    sendColor();
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
            gameObjects[payload.id].setColor(payload.color);
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
    canvas.width = window.innerWidth * .99;
    canvas.height = window.innerHeight * .99;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    gameObjects.forEach(gameObject => gameObject.draw(ctx))
}

// Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
document.addEventListener("keydown", event => {
    if (controller[event.key]) controller[event.key].pressed = true;
})

document.addEventListener("keyup", event => {
    if (controller[event.key]) controller[event.key].pressed = false;
})

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();

    colorPicker.style.left = event.clientX + 'px';
    colorPicker.style.top = event.clientY + 'px';

    setTimeout(colorPicker.showPicker.bind(colorPicker), frameTime * 2)
}, false);
