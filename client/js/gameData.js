const player = new GameObject(
    0,
    {
        x: window.innerWidth * .5,
        y: window.innerHeight * .5
    },
    'rgb(200, 30, 30)',
    {
        width: 50,
        height: 50
    })

const otherPlayer = new GameObject(
    1,
    {
        x: window.innerWidth * .5,
        y: window.innerHeight * .5
    },
    'rgb(30, 70, 200)',
    {
        width: 50,
        height: 50
    })

const referencePoint = new GameObject(
    {
        x: window.innerWidth * .1,
        y: window.innerWidth * .1
    },
    'rgb(200, 200, 200)',
    {
        width: 10,
        height: 10
    })

const gameObjects = { player: player, otherPlayer: otherPlayer, referencePoint: referencePoint };
