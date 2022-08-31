function playerToScreenSpace(gameObject) {
    return {
        x: 0.5 * (window.innerWidth - gameObject.size.width),
        y: 0.5 * (window.innerHeight - gameObject.size.height)
    }
}

function worldToPlayerSpace(gameObject) {
    return {
        x: gameObject.positionWorldSpace.x - player.playerPositionWorldSpace.x,
        y: gameObject.positionWorldSpace.y - player.playerPositionWorldSpace.y,
    }
}

function worldToScreenSpace(gameObject) {
    // World --> Player
    const positionPlayerSpace = worldToPlayerSpace(gameObject);

    // Player --> Screen
    const offsetFromPlayerToScreenSpace = playerToScreenSpace(gameObject);

    // World --> Player --> Screen
    return {
        x: positionPlayerSpace.x + offsetFromPlayerToScreenSpace.x,
        y: positionPlayerSpace.y + offsetFromPlayerToScreenSpace.y
    }
}

class GameObject {
    constructor(positionWorldSpace = { x: 0, y: 0 }, fillStyle = "#ffffff", size = { width: 50, height: 50 }, name = "") {
        this.size = size;
        this.fillStyle = fillStyle;

        this.positionWorldSpace = { ...positionWorldSpace };
        this.positionScreenSpace = { x: window.innerWidth * .5, y: window.innerHeight * .5 };

        this.name = name;
        this.nameOffset = { x: 0, y: -5 };

        // Player only
        this.playerPositionWorldSpace = { ...positionWorldSpace };
        this.oldPlayerPositionWorldSpace = { ...this.playerPositionWorldSpace };

        this.velocity = { x: 0, y: 0 };
    }

    static gravity = 0.001;
    static height = 50;
    static ground = 400;
    static jumpForce = 0.75;

    // Idea: What if instead of moving ourself, we moved the world?
    move(direction = { x: 0, y: 0 }) {

        // Velocity
        if (this.playerPositionWorldSpace.y <= GameObject.ground) {
            this.velocity.y += GameObject.gravity * frameTime;
        } else {
            this.velocity.y = GameObject.jumpForce * direction.y;
        }
        this.velocity.x += GameObject.gravity.x * frameTime;

        // Position
        this.playerPositionWorldSpace.x += direction.x * frameTime;
        this.playerPositionWorldSpace.y += this.velocity.y * frameTime;

        // Move everything else.
        gameObjects.forEach(gameObject => {
            if (gameObject !== player) {
                gameObject.positionScreenSpace = worldToScreenSpace(gameObject);
            } else {
                gameObject.positionScreenSpace = playerToScreenSpace(player);
            }
        })
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.positionScreenSpace.x, this.positionScreenSpace.y, this.size.width, this.size.height);
        ctx.font = '48px sans-serif';
        ctx.fillText(this.name, this.positionScreenSpace.x + this.nameOffset.x, this.positionScreenSpace.y + this.nameOffset.y);
    }
}

function invertColor(hex, bw = true) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    if (hex.length !== 6) {
        throw new Error(`Invalid HEX color. Hex: ${hex}`);
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}
