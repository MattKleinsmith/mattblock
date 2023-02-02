import { port } from "./config.js"

document.head.innerHTML += `<link id="favicon" rel="icon" type="image/svg+xml"
href="https://www.thecolorapi.com/id?format=svg&named=false&hex=${localStorage.getItem("color")}">`

colorPicker.style.position = "absolute";
nameInput.style.position = "absolute";
export const nameFieldSpaceCount = 2;

export const playerHeight = 50;

export const minimapScale = 0.075;

const frameRate = 120;
export const frameTime = 1000 / frameRate;  // 1000 / 60 is 16.6666...
export const beginning = performance.now();
export const socket = new WebSocket(`wss://mattblock.io:${port}`);
export const gameScales = [0.5, 1];

export const shared = {
    id: undefined,
    controller: undefined,
    player: undefined,
    highScorePayload: undefined,

    allowMovement: true,
    isServerDown: false,
    tSpeed: 0,
    gameScaleWS2SSIndex: 1,
    gameScaleWS2SS: 1,
    gameWidth: window.innerWidth,
    gameHeight: window.innerHeight,

    origin: { x: -1450, y: 0 }
}

export const builder = {
    enabled: false,
    startingPoint: { x: 0, y: 0 },
    bottomRightWS: { x: 0, y: 0 }
}
