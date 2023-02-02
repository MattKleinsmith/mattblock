import { frameTime, beginning } from "./configuration.js"
import { movePlayer } from "./userInterface.js"
import { drawWorld } from "./draw.js"
import { sendPosition } from "./network.js"

let numFrames = 0;

setInterval(gameLoop, frameTime);

// setInterval(() => {
//     console.log((performance.now() - beginning) / numFrames);
// }, 1000)

function gameLoop() {
    ++numFrames;

    movePlayer();  // Simulation
    drawWorld();  // Presentation
    sendPosition();  // Communication
}
