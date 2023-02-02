import { frameTime, beginning } from "./configuration.js"
import { movePlayer } from "./userInterface.js"
import { drawWorld } from "./draw.js"
import { sendPosition } from "./network.js"

let numFrames = 0;

setInterval(gameLoop, frameTime);

function gameLoop() {
    ++numFrames;
    // console.log((performance.now() - beginning) / numFrames);

    movePlayer();  // Simulation
    drawWorld();  // Presentation
    sendPosition();  // Communication
}
