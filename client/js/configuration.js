let id;
let controller;
let player;

colorPicker.style.position = "absolute";
nameInput.style.position = "absolute";
nameInput.value = Math.random() > 0.5 ? "new phone" : "who dis";

let time = 0;
let frameRate = 120;
let frameTime = 1000 / frameRate;  // 1000 / 60 is 16.6666...

let allowMovement = true;
