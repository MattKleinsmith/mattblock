setInterval(gameLoop, frameTime)

function gameLoop() {
    time += frameTime;
    handleInputs();
    draw();
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

        for (const gameObject of gameObjects) {
            gameObject.draw(ctx);
        }
    }
}

document.addEventListener("keydown", event => {
    if (controller[event.key]) controller[event.key].pressed = true;
})

document.addEventListener("keyup", event => {
    if (controller[event.key]) controller[event.key].pressed = false;
})
