import { shared } from "./configuration.js";

function getMousePositionSS(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left),
        y: (event.clientY - rect.top)
    };
}

export function getMousePositionWS(canvas, event, player) {
    if (!player) return;

    const mousePosition = getMousePositionSS(canvas, event);

    mousePosition.x /= shared.gameScaleWS2SS;
    mousePosition.x += player.cameraLeftWS;

    mousePosition.y /= shared.gameScaleWS2SS;
    mousePosition.y += player.cameraTopWS;

    return mousePosition;
}
