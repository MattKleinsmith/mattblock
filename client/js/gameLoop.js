let id;
let controller;
let who;
let otherWho;

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

        console.log(payload);

        id = Number(payload.id);

        [who, otherWho] = id === 0 ? [player, otherPlayer] : [otherPlayer, player];

        controller = {
            "w": { pressed: false, func: who.move.bind(who, { x: 0, y: -1 }) },
            "a": { pressed: false, func: who.move.bind(who, { x: -1, y: 0 }) },
            "s": { pressed: false, func: who.move.bind(who, { x: 0, y: 1 }) },
            "d": { pressed: false, func: who.move.bind(who, { x: 1, y: 0 }) },
            " ": { pressed: false, func: who.move.bind(who, { x: 0, y: -1 }) },  // should affect velocity
        }
    } else {
        otherWho.position = payload.position;
    }
}

function update() {
    for (const gameObject of Object.values(gameObjects)) {
        gameObject.update();
    }
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
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');

        for (const gameObject of Object.values(gameObjects)) {
            gameObject.draw(ctx);
        }
    }
}

function send() {
    if (!who) return;
    if (who.position.x !== who.oldPosition.x ||
        who.position.y !== who.oldPosition.y) {
        const payload = { id: id, position: who.position };
        socket.send(JSON.stringify(payload));
    }
}

document.addEventListener("keydown", event => {
    if (controller[event.key]) controller[event.key].pressed = true;
})

document.addEventListener("keyup", event => {
    if (controller[event.key]) controller[event.key].pressed = false;
})
