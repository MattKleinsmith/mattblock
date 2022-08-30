function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

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
    constructor(positionWorldSpace = { x: 0, y: 0 }, color = { r: 255, g: 255, b: 255 }, size = { width: 50, height: 50 }) {
        this.size = size;
        this.color = color;
        this.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;

        this.positionWorldSpace = { ...positionWorldSpace };
        this.positionScreenSpace = { x: window.innerWidth * .5, y: window.innerHeight * .5 };

        // Player only
        this.playerPositionWorldSpace = { ...positionWorldSpace };
        this.oldPlayerPositionWorldSpace = { ...this.playerPositionWorldSpace };
    }

    static velocityFromGravity = 0;
    static height = 50;
    static ground = 850;

    setColor(color = { r: 255, g: 255, b: 255 }) {
        this.color = color;
        this.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    }

    // Idea: What if instead of moving ourself, we moved the world?
    move(direction = { x: 0, y: 0 }) {
        this.playerPositionWorldSpace.x += direction.x * frameTime;

        let yDisplacement = direction.y;
        // if (this.playerPositionWorldSpace.y < GameObject.ground) yDisplacement += GameObject.velocityFromGravity;
        this.playerPositionWorldSpace.y += yDisplacement * frameTime;

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
    }
}
