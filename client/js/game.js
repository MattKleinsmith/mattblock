import { frameTime, beginning } from "./configuration.js"
import { movePlayer } from "./userInterface.js"
import { drawWorld } from "./draw.js"
import { sendPosition } from "./network.js"

let numFrames = 0;

if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    document.body.style.visibility = "visible";
    document.body.innerHTML = "<h1>mattblock only works on Google Chrome, for now</h1>";
    document.body.style.fontFamily = "sans-serif";
}
else setInterval(gameLoop, frameTime);

function gameLoop() {
    ++numFrames;
    // console.log((performance.now() - beginning) / numFrames);

    movePlayer();  // Simulation
    drawWorld();  // Presentation
    sendPosition();  // Communication
}
