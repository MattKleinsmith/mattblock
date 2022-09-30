import { shared, minimapScale, gameScales } from "./configuration.js";
import { platforms } from "./gameData.js";

export function drawWorld() {
    const ctx = calibrateCanvas();
    drawPlatforms(ctx);
    drawScrollLines(ctx);

    const [minimapCtx, minimap] = calibrateMinimap();
    drawPlatforms_Minimap(minimapCtx, minimap);

    const textCtx = calibrateTextCanvas();
    drawHighscore(textCtx);
    drawAltitude(textCtx);
    drawServerStatus(textCtx);
}

export function recalibrateScreen() {
    console.log("recalibrateScreen", shared.player.positionSS.x);
    {
        // const scrollPercentageDelta = 0.08;  // 0 for instascroll
        const scrollPercentageDelta = 0.0;  // 0 for instascroll
        shared.player.leftScrollPercentage = 0.5 - scrollPercentageDelta * shared.gameScaleWS2SS;
        shared.player.rightScrollPercentage = 1 - shared.player.leftScrollPercentage;

        shared.player.leftScrollLineSS = window.innerWidth * shared.player.leftScrollPercentage;
        shared.player.rightScrollLineSS = window.innerWidth * shared.player.rightScrollPercentage;
        shared.player.activeHorizontalScrollLineSS = shared.player.leftScrollLineSS;

        // CLUE: THE GAME IS INSENSITIVE TO THESE EXCEPT AT EXTREME VALUES
        // shared.player.leftScrollWS = shared.player.positionWS.x - shared.player.size.width * 2.5;
        // shared.player.rightScrollWS = shared.player.positionWS.x + shared.player.size.width * 2.5;
        shared.player.leftScrollWS = shared.player.positionWS.x;
        shared.player.rightScrollWS = shared.player.positionWS.x;

        shared.player.cameraLeftWS = shared.player.positionWS.x - (window.innerWidth * 0.5) / shared.gameScaleWS2SS;
        shared.player.leftMMWS = shared.player.positionWS.x - window.innerWidth * .10 * 0.5;
    }

    {
        const scrollPercentageDelta = 0.0;  // 0 for instascroll
        shared.player.topScrollPercentage = 0.5 - scrollPercentageDelta * shared.gameScaleWS2SS;
        shared.player.bottomScrollPercentage = 1 - shared.player.topScrollPercentage;

        shared.player.topScrollLineSS = window.innerHeight * shared.player.topScrollPercentage;
        shared.player.bottomScrollLineSS = window.innerHeight * shared.player.bottomScrollPercentage;
        shared.player.activeVerticalScrollLineSS = shared.player.topScrollLineSS;

        // const noScrollZoneHalfHeight = (shared.player.bottomScrollLineSS - shared.player.topScrollLineSS) * 0.5;
        // shared.player.topScrollWS = shared.player.positionWS.y - noScrollZoneHalfHeight;
        // shared.player.bottomScrollWS = shared.player.positionWS.y + noScrollZoneHalfHeight;
        shared.player.topScrollWS = shared.player.positionWS.y;
        shared.player.bottomScrollWS = shared.player.positionWS.y;

        shared.player.cameraTopWS = shared.player.positionWS.y - (window.innerHeight * 0.5) / shared.gameScaleWS2SS;
    }

    shared.scaleOriginSS = { x: shared.player.leftScrollLineSS, y: shared.player.topScrollLineSS };
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

    // if (shared.gameScaleWS2SS === 0.25) {
    //     ctx.setTransform(
    //         shared.gameScaleWS2SS, 0, 0,
    //         shared.gameScaleWS2SS, ctx.canvas.width * shared.gameScaleWS2SS * 1.5,
    //         ctx.canvas.height * shared.gameScaleWS2SS * 1.5);
    // }
    if (shared.gameScaleWS2SS === 0.50) {
        // ctx.setTransform(
        //     shared.gameScaleWS2SS, 0, 0,
        //     shared.gameScaleWS2SS, ctx.canvas.width * shared.gameScaleWS2SS * 0.5,
        //     ctx.canvas.height * shared.gameScaleWS2SS * 0.5);
        // ctx.translate(shared.player.positionSS.x, shared.player.positionSS.y);
        // ctx.scale(0.50, 0.50);
        // ctx.translate(-shared.player.positionSS.x, -shared.player.positionSS.y);
        // canvas.style.zoom = 0.5;  // Slows the game down noticeably
        // canvas.height *= 2;
        // canvas.width *= 2;
        // recalibrateScreen();
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

function drawScrollLines(ctx) {
    if (!shared.player) return;
    ctx.strokeStyle = "green"
    ctx.beginPath();
    ctx.moveTo(shared.player.leftScrollLineSS, 0);
    ctx.lineTo(shared.player.leftScrollLineSS, 1000);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(shared.player.rightScrollLineSS, 0);
    ctx.lineTo(shared.player.rightScrollLineSS, 1000);
    ctx.stroke();

    ctx.strokeStyle = "green"
    ctx.beginPath();
    ctx.moveTo(0, shared.player.topScrollLineSS);
    ctx.lineTo(2000, shared.player.topScrollLineSS);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, shared.player.bottomScrollLineSS);
    ctx.lineTo(2000, shared.player.bottomScrollLineSS);
    ctx.stroke();
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
    shared.gameScaleWS2SS = gameScales[shared.gameScaleWS2SSIndex];
    recalibrateScreen();
}

function zoomIn() {
    if (++shared.gameScaleWS2SSIndex === gameScales.length) shared.gameScaleWS2SSIndex--;
}

function zoomOut() {
    if (--shared.gameScaleWS2SSIndex === -1) shared.gameScaleWS2SSIndex++;
}