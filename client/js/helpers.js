function getMousePositionSS(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

export function getMousePositionWS(canvas, event, player) {
    if (!player) return;
    const mousePosition = getMousePositionSS(canvas, event);
    mousePosition.x += player.leftScreenWS;
    mousePosition.y += player.topScreenWS;
    return mousePosition;
}
