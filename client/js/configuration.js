let id;
let controller;
let player;

colorPicker.style.position = "absolute";

nameInput.style.position = "absolute";
const nameFieldSpaceCount = 2;

let time = 0;
let frameRate = 120;
let frameTime = 1000 / frameRate;  // 1000 / 60 is 16.6666...
const beginning = performance.now();
let numFrames = 0;

let allowMovement = true;

let highScorePayload;

let isServerDown = false;
