const gameObjects = [];

const maxPlayers = 100;

for (let i = 0; i < 100; i++) {

    gameObjects[i] = new GameObject(
        {
            x: window.innerWidth * .5,
            y: window.innerHeight * .5
        },
        {
            r: ~~(Math.random() * 255),
            g: ~~(Math.random() * 255),
            b: ~~(Math.random() * 255)
        },
        {
            width: 50,
            height: 50
        });

}

const referencePoint = new GameObject(
    {
        x: window.innerWidth * .1,
        y: window.innerHeight * .1
    },
    {
        r: 127,
        g: 127,
        b: 127
    },
    {
        width: 10,
        height: 10
    });
gameObjects.push(referencePoint);


const spawner = new GameObject(
    {
        x: window.innerWidth * .5 - 1,
        y: window.innerHeight * .5 - 1
    },
    {
        r: 0,
        g: 0,
        b: 0
    },
    {
        width: 53,
        height: 53
    });
gameObjects.push(spawner);
