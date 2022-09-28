import { movePlayer, drawWorld, sendPosition } from "./gameLoop.js"
import { frameTime, beginning } from "./configuration.js"

let numFrames = 0;

setInterval(gameLoop, frameTime);

function gameLoop() {
    ++numFrames;
    // console.log((performance.now() - beginning) / numFrames);

    movePlayer();  // Simulation
    drawWorld();  // Presentation
    sendPosition();  // Communication
}
