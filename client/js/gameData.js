const maxPlayers = 100;
const gameObjects = new Array(maxPlayers);

function randomHexColor() {
    return (~~(Math.random() * 255)).toString(16);
}

for (let i = 0; i < 100; i++) {
    gameObjects[i] = new GameObject(
        { x: 0, y: 0 },
        `#${randomHexColor()}${randomHexColor()}${randomHexColor()}`,
        { width: 50, height: 50 }
    );
}

const referencePoint = new GameObject(
    { x: window.innerWidth * .1, y: window.innerHeight * .1 },
    "#7d7d7d",
    { width: 10, height: 10 }
);
gameObjects.push(referencePoint);

const spawner = new GameObject(
    { x: 0, y: 0 },
    "#000000",
    { width: 53, height: 53 }
);
gameObjects.push(spawner);
