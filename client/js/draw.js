import { shared, minimapScale, gameScales } from "./configuration.js";
import { platforms } from "./gameData.js";
import { Platform } from "./platform.js";

export function drawWorld() {
    const ctx = calibrateCanvas();
    drawPlatforms(ctx);

    const [minimapCtx, minimap] = calibrateMinimap();
    drawPlatforms_Minimap(minimapCtx, minimap);

    const textCtx = calibrateTextCanvas();
    drawHighscore(textCtx);
    drawAltitude(textCtx);
    drawServerStatus(textCtx);
}

export function recalibrateScreen() {
    {
        shared.player.leftScrollPercentage = 0.42;  // 0.50 for instascroll
        shared.player.rightScrollPercentage = 1 - shared.player.leftScrollPercentage;

        shared.player.leftScrollSS = window.innerWidth * shared.player.leftScrollPercentage;
        shared.player.rightScrollSS = window.innerWidth * shared.player.rightScrollPercentage;

        shared.player.noScrollZoneHalfWidth = (shared.player.rightScrollSS - shared.player.leftScrollSS) * 0.5;

        shared.player.leftScrollWS = shared.player.positionWS.x - shared.player.noScrollZoneHalfWidth;
        shared.player.rightScrollWS = shared.player.positionWS.x + shared.player.noScrollZoneHalfWidth;

        shared.player.leftScreenWS = shared.player.positionWS.x - window.innerWidth * 0.5;
        shared.player.leftMMWS = shared.player.positionWS.x - window.innerWidth * .10 * 0.5;
    }

    {
        shared.player.topScrollPercentage = 0.35;
        shared.player.bottomScrollPercentage = 1 - shared.player.topScrollPercentage;

        shared.player.topScrollSS = window.innerHeight * shared.player.topScrollPercentage;
        shared.player.bottomScrollSS = window.innerHeight * shared.player.bottomScrollPercentage;

        shared.player.noScrollZoneHalfHeight = (shared.player.bottomScrollSS - shared.player.topScrollSS) * 0.5;

        shared.player.topScrollWS = shared.player.positionWS.y - shared.player.noScrollZoneHalfHeight;
        shared.player.bottomScrollWS = shared.player.positionWS.y + shared.player.noScrollZoneHalfHeight;

        shared.player.topScreenWS = shared.player.positionWS.y - window.innerHeight * 0.5;
    }
}

function calibrateMinimap() {
    const canvas = document.getElementById('minimap');
    canvas.width = window.innerWidth * 0.099;
    canvas.height = window.innerHeight * 0.999;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    return [ctx, canvas];
}

function drawPlatforms_Minimap(ctx) {
    if (!shared.player) return;

    ctx.fillStyle = "#181A1B";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = shared.player.fillStyle;

    ctx.scale(minimapScale, minimapScale);
    const minimapCenterX = ctx.canvas.width * .5 / minimapScale;
    const minimapCenterY = ctx.canvas.height * .5 / minimapScale;
    ctx.fillRect(
        minimapCenterX,
        minimapCenterY,
        shared.player.size.width,
        shared.player.size.height);
    shared.player.MM = { x: minimapCenterX, y: minimapCenterY };

    for (let i = platforms.length - 1; i >= 0; i--) {
        if (i === shared.id) continue;
        const platform = platforms[i];
        if (platform.isEnabled) platform.draw_Minimap(ctx);
    }
}

addEventListener('resize', recalibrateScreen);

export function calibrateCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    if (shared.gameScale === 0.25) {
        ctx.setTransform(shared.gameScale, 0, 0, shared.gameScale, ctx.canvas.width * shared.gameScale * 1.5, ctx.canvas.height * shared.gameScale * 1.5)
    } else if (shared.gameScale === 0.50) {
        ctx.setTransform(shared.gameScale, 0, 0, shared.gameScale, ctx.canvas.width * shared.gameScale * 0.5, ctx.canvas.height * shared.gameScale * 0.5)
    }

    return ctx;
}

function calibrateTextCanvas() {
    const canvas = document.getElementById('textCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    return ctx;
}

function drawPlatforms(ctx) {
    // Backwards to draw player names over NPC platforms
    for (let i = platforms.length - 1; i >= 0; i--) {
        const platform = platforms[i];
        if (platform.isEnabled) platform.draw(ctx);
    }
}

function drawServerStatus(ctx) {
    if (!shared.isServerDown) return;
    ctx.fillStyle = 'red';
    const fontSize = 48 / px_ratio;
    ctx.font = fontSize + 'px sans-serif';
    ctx.fillText(`The server reset. Refresh to reconnect`, 100, 100 + fontSize * 0.5);
    ctx.fillText(`(will automate this eventually)`, 100, 100 + fontSize * 1.5);
}

function drawTopText(ctx, text, fillStyle, order = 1) {
    const fontSize = 19;
    ctx.fillStyle = fillStyle;
    ctx.font = fontSize + 'px sans-serif';
    ctx.fillText(
        text,
        window.innerWidth * .45,  // x
        fontSize * order);        // y
}

function drawHighscore(ctx) {
    if (!shared.highScorePayload) return;
    const text = `Highest player: ${shared.highScorePayload.profile.name}: ${-shared.highScorePayload.highscore}`;
    drawTopText(ctx, text, shared.highScorePayload.profile.color, 1);
}

function drawAltitude(ctx) {
    if (!shared.player) return;
    const text = `Your altitude: ${-shared.player.positionWS.y}`;
    drawTopText(ctx, text, shared.player.fillStyle, 2);
}

export function zoom(shouldZoomIn) {
    shouldZoomIn ? zoomIn() : zoomOut();
    shared.gameScale = gameScales[shared.gameScaleIndex];
}

function zoomIn() {
    if (++shared.gameScaleIndex === gameScales.length) shared.gameScaleIndex--;
}

function zoomOut() {
    if (--shared.gameScaleIndex === -1) shared.gameScaleIndex++;
}
