const maxPlayers = 100;
const playerHeight = 50;
const gameObjects = new Array(maxPlayers);

for (let i = 0; i < 100; i++) {
    gameObjects[i] = new GameObject(
        { x: 0, y: 0 },
        `#FFFFFF`,
        { width: playerHeight, height: playerHeight },
    );
}

const groundHeight = 2000;
const ground = new GameObject(
    { x: 0, y: GameObject.ground + (playerHeight + groundHeight) * 0.5 },
    "#222222",
    { width: 10000, height: groundHeight },
    "don't do it"
);
gameObjects.push(ground);

const spawner = new GameObject(
    { x: 0, y: 0 },
    // "#181A1B",
    "#000000",
    { width: 53, height: 53 },
);
gameObjects.push(spawner);
