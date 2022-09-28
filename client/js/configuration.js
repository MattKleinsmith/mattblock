colorPicker.style.position = "absolute";
nameInput.style.position = "absolute";
export const nameFieldSpaceCount = 2;

export const playerHeight = 50;

export const minimapScale = 0.075;

const frameRate = 120;
export const frameTime = 1000 / frameRate;  // 1000 / 60 is 16.6666...
export const beginning = performance.now();
export const socket = new WebSocket('wss://mattblock.io:8082');
export const gameScales = [0.25, 0.5, 1];

export const shared = {
    id: undefined,
    controller: undefined,
    player: undefined,
    highScorePayload: undefined,

    allowMovement: true,
    isServerDown: false,
    tSpeed: 0,
    gameScaleIndex: 1,
    gameScale: .5,
    gameWidth: window.innerWidth,
    gameHeight: window.innerHeight
}
