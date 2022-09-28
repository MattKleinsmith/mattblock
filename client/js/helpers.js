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

    mousePosition.x -= shared.player.positionSS.x;
    mousePosition.x /= shared.gameScale;
    mousePosition.x += shared.player.positionSS.x;
    mousePosition.x += player.cameraLeftWS;

    mousePosition.y -= shared.player.positionSS.y;
    mousePosition.y /= shared.gameScale;
    mousePosition.y += shared.player.positionSS.y;
    mousePosition.y += player.cameraTopWS;
    return mousePosition;
}


// event.clientX - rect.left + player.cameraLeftWS
