const maxPlayers = 100;
const playerHeight = 50;
const gameObjects = new Array(maxPlayers);

function randomHexColor() {
    return (~~(Math.random() * 255)).toString(16);
}

for (let i = 0; i < 100; i++) {
    gameObjects[i] = new GameObject(
        { x: 0, y: 0 },
        `#${randomHexColor()}${randomHexColor()}${randomHexColor()}`,
        { width: playerHeight, height: playerHeight }
    );
}

const ground = new GameObject(
    { x: 0, y: GameObject.ground + playerHeight * 0.5 + 5 },
    "#000000",
    { width: 10000, height: 10 }
);
gameObjects.push(ground);

const spawner = new GameObject(
    { x: 0, y: 0 },
    "#181A1B",
    { width: 53, height: 53 }
);
gameObjects.push(spawner);
