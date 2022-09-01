const maxPlayers = 100;
const playerHeight = 50;
const gameObjects = new Array(maxPlayers);
const platforms = [];

for (let i = 0; i < 100; i++) {
    gameObjects[i] = new GameObject(
        { x: 0, y: 0 },
        `#FFFFFF`,
        { width: playerHeight, height: playerHeight },
    );
}


const spawner = new GameObject(
    { x: -4, y: -4 },
    "#000000",
    { width: 60, height: 60 },
);
gameObjects.push(spawner);

const minPlatformWidth = 100;
const maxPlatformWidth = 1000;
const platformWidthRange = maxPlatformWidth - minPlatformWidth;

const groundHeight = 2000;
const groundWidth = 7000;

const minPlatformX = -groundWidth * 0.5;
const maxPlatformX = groundWidth * 0.5;
const platformXRange = maxPlatformX - minPlatformX;

const minPlatformY = -7000;
const maxPlatformY = 400;
const platformYRange = maxPlatformY - minPlatformY;

for (let i = 0; i < 200; i++) {
    platforms.push(new Platform(
        {
            x: Math.random() * platformXRange + minPlatformX,
            y: Math.random() * platformYRange + minPlatformY
        },
        "#000000",
        { width: Math.random() * platformWidthRange + minPlatformWidth, height: 100 },
    ));
}

platforms.push(new Platform(
    {
        x: -groundWidth * 0.5,
        y: GameObject.ground + playerHeight
    },
    "#222222",
    { width: groundWidth, height: groundHeight },
));

platforms.push(new Platform(
    {
        x: -400,
        y: 350
    },
    "#000000",
    { width: 250, height: 100 },
));

platforms.push(new Platform(
    {
        x: 250,
        y: -350
    },
    "#000000",
    { width: 250, height: 500 },
));

platforms.push(new Platform(
    {
        x: 450,
        y: 250
    },
    "#000000",
    { width: 250, height: 100 },
));
