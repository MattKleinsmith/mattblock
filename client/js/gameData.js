import { Platform } from "./platform.js";
import { playerHeight, shared } from "./configuration.js";

const maxPlayers = 150;
export const platforms = new Array(maxPlayers);

// PLAYERS
for (let i = 0; i < maxPlayers; i++) {
    platforms[i] = new Platform(
        { x: 0, y: 0 },
        `#181a1b`,
        { width: playerHeight, height: playerHeight },
        "",
        false
    );
}

// // SPAWNER
// const spawner = new Platform(
//     { x: -4, y: -4 },
//     "#181a1b",
//     { width: 60, height: 60 },
// );
// platforms.push(spawner);

const minPlatformWidth = 100;
const maxPlatformWidth = 1000;
const platformWidthRange = maxPlatformWidth - minPlatformWidth;

const groundHeight = 20000;
const groundWidth = 3050;

const minPlatformX = -groundWidth * 0.5;
const maxPlatformX = groundWidth * 0.5;
const platformXRange = maxPlatformX - minPlatformX;

const minPlatformY = -7000;
const maxPlatformY = 400;
const platformYRange = maxPlatformY - minPlatformY;

// GROUND
platforms.push(new Platform(
    {
        x: -2450,
        y: Platform.ground + playerHeight
    },
    "#222222",
    { width: groundWidth, height: groundHeight },
    // "ground"
));

// WALL
platforms.push(new Platform(
    {
        x: 500,
        y: -20000 + 900
    },
    "#222222",
    { width: 100, height: 20000 },
    // "wall"
));

// WALL
platforms.push(new Platform(
    {
        x: shared.origin.x - 1000,
        y: -10000 + 900
    },
    "#222222",
    { width: 100, height: 20000 },
    // "wall"
));

platforms.push(new Platform(
    {
        x: -991.6666666666918,
        y: -20153.4375
    },
    "#5213e7",
    { width: 50, height: 50 },
    "Please keep it sfw 🤦"
));

platforms.push(new Platform(
    {
        "x": -228.12500000000912,
        "y": -22625.9375
    },
    "#8074e4",
    { width: 50, height: 50 },
    "ULTRA SUPER JUMP UNLOCKED",
));

platforms.push(new Platform(
    {
        "x": -228.64583333334932,
        "y": -29863.75
    },
    "#9f741a",
    { width: 50, height: 50 },
    "BILL IS THE 🐐",
));

platforms.push(new Platform(
    {
        "x": -237.5000000000146,
        "y": -37072.5
    },
    "#0b9f61",
    { width: 50, height: 50 },
    "#ChrisBreaks30k",
));

platforms.push(new Platform(
    {
        "x": -2568.749999999996,
        "y": -43581.875
    },
    "#372268",
    { width: 50, height: 50 },
    "👑GigaBrax👑",
));

platforms.push(new Platform(
    {
        "x": -2601.5624999999454,
        "y": -46822.1875
    },
    "#00ffee",
    { width: 50, height: 50 },
    "ₜᵣₑₛ Bᵢₑₙ",
));

platforms.push(new Platform(
    {
        "x": -4616.1458333333085,
        "y": -50747.5
    },
    "#ff8000",
    { width: 50, height: 50 },
    "M̘͓Á̪̪T͖̄T͙ͬB̟̘̖L̵ͪO͔͔̓Cͧ̚K̰̯",
));

platforms.push(new Platform(
    {
        x: -4011.9791666666756,
        y: -58023.4375
    },
    "#722cc7",
    { width: 50, height: 50 },
    "chaos is a ladder"
));

platforms.push(new Platform(
    {
        "x": -2705.875,
        "y": -63373
    },
    "#d7d10d",
    { width: 50, height: 50 },
    " RIP Nick the TA"
));

platforms.push(new Platform(
    {
        "x": -1006,
        "y": -69780
    },
    "#00BCF2",
    { width: 50, height: 50 },
    "😭😭😭😭😭😭😭😭 BRUH"
));

platforms.push(new Platform(
    {
        "x": -244.7916666666663,
        "y": -72613.75
    },
    "#dd3624",
    { width: 50, height: 50 },
    "I Am Jack's Complete Lack of Surprise",
));

platforms.push(new Platform(
    {
        "x": -211.45833333327494,
        "y": -79695
    },
    "#fa27cb",
    { width: 50, height: 50 },
    "MINIMAP FTW",
));

platforms.push(new Platform(
    {
        x: -215.62499999999744,
        y: -86720.3125
    },
    "#5213e7",
    { width: 50, height: 50 },
    "Your never ending Expression"
));

platforms.push(new Platform(
    {
        "x": 1944.2708333333205,
        "y": -93840
    },
    "#4dff00",
    { width: 50, height: 50 },
    "Flexbox Gang >"
));
