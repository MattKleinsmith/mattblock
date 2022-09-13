const maxPlayers = 100;
const playerHeight = 50;
const platforms = new Array(maxPlayers);

// PLAYERS
for (let i = 0; i < 100; i++) {
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
const groundWidth = 4000;

const minPlatformX = -groundWidth * 0.5;
const maxPlatformX = groundWidth * 0.5;
const platformXRange = maxPlatformX - minPlatformX;

const minPlatformY = -7000;
const maxPlatformY = 400;
const platformYRange = maxPlatformY - minPlatformY;

// GROUND
platforms.push(new Platform(
    {
        x: -500,
        y: Platform.ground + playerHeight
    },
    "#222222",
    { width: groundWidth, height: groundHeight },
    // "ground"
));

// RANDOM PLATFORMS
// for (let i = 0; i < 200; i++) {
//     platforms.push(new Platform(
//         {
//             x: Math.random() * platformXRange + minPlatformX,
//             y: Math.random() * platformYRange + minPlatformY
//         },
//         "#000000",
//         { width: Math.random() * platformWidthRange + minPlatformWidth, height: 100 },
//     ));
// }

//
platforms.push(new Platform(
    {
        x: -991.6666666666918,
        y: -20153.4375
    },
    "#5213e7",
    { width: 50, height: 50 },
    "Please keep it sfw 🤦"
));

// R
platforms.push(new Platform(
    {
        x: 250,
        y: -350
    },
    "#AA5555",
    { width: 250, height: 500 },
    // "red"
));

// G
platforms.push(new Platform(
    {
        x: 450,
        y: 245
    },
    "#55AA55",
    { width: 250, height: 100 },
    // "green"
));

// UP
for (let i = 0; i < 10; i++) {
    platforms.push(new Platform(
        {
            x: -600 + (i * -200),
            y: 250 + (i * -100)
        },
        "#5555AA",
        { width: 250, height: 100 },
        // "up " + i
    ));
}

// DOWN
for (let i = 0; i < 100; i++) {
    platforms.push(new Platform(
        {
            x: -600 + (i * -200),
            y: 450 + (i * 100)
        },
        "#5555AA",
        { width: 250, height: 100 },
        // "down " + i
    ));
}
