import { shared, nameFieldSpaceCount } from "./configuration.js";
import { sendProfile } from "./network.js";
import { zoom } from "./draw.js";

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
