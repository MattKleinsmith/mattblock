let id;
let controller;
let player;

setInterval(gameLoop, frameTime)

function gameLoop() {
    time += frameTime;
    update();
    handleInputs();
    draw();
    send();
}

// Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7

socket.onmessage = message => {

    const payload = JSON.parse(message.data);

    if (id === undefined) {
        console.log("id", payload.id);
        id = payload.id;
        player = gameObjects[id];
        controller = {
            "w": { pressed: false, func: player.move.bind(player, { x: 0, y: -1 }) },
            "a": { pressed: false, func: player.move.bind(player, { x: -1, y: 0 }) },
            "s": { pressed: false, func: player.move.bind(player, { x: 0, y: 1 }) },
            "d": { pressed: false, func: player.move.bind(player, { x: 1, y: 0 }) },
            " ": { pressed: false, func: player.move.bind(player, { x: 0, y: -1 }) },  // should affect velocity
        }

        const colorPayload = { id: id, color: player.color };
        socket.send(JSON.stringify(colorPayload));
    } else {
        if ("position" in payload) gameObjects[payload.id].position = payload.position;
        if ("color" in payload) {
            gameObjects[payload.id].setColor(payload.color);
        }
    }
}

function send() {
    if (!player) return;
    if (player.position.x !== player.oldPosition.x ||
        player.position.y !== player.oldPosition.y) {
        const payload = { id: id, position: player.position };
        socket.send(JSON.stringify(payload));
    }
}

function update() {
    gameObjects.forEach(gameObject => gameObject.update())
}

function handleInputs() {
    for (const key in controller) {
        controller[key].pressed && controller[key].func()
    }
}

function draw() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth * .98;
    canvas.height = window.innerHeight * .95;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    gameObjects.forEach(gameObject => gameObject.draw(ctx))
}

document.addEventListener("keydown", event => {
    if (controller[event.key]) controller[event.key].pressed = true;
})

document.addEventListener("keyup", event => {
    if (controller[event.key]) controller[event.key].pressed = false;
})
