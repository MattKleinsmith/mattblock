const player = new GameObject(
    {
        x: window.innerWidth * .5,
        y: window.innerHeight * .5
    },
    'rgb(200, 0, 0)',
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

const gameObjects = [player, referencePoint];

// Props: https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
const controller = {
    "w": { pressed: false, func: player.move.bind(player, { x: 0, y: -1 }) },
    "a": { pressed: false, func: player.move.bind(player, { x: -1, y: 0 }) },
    "s": { pressed: false, func: player.move.bind(player, { x: 0, y: 1 }) },
    "d": { pressed: false, func: player.move.bind(player, { x: 1, y: 0 }) },
    " ": { pressed: false, func: player.move.bind(player, { x: 0, y: -1 }) },  // should affect velocity
}
