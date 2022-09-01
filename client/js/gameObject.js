function playerSpaceToScreenSpace(gameObject) {
    return {
        x: 0.5 * (window.innerWidth),//- gameObject.size.width),  // TODO: Should this be the player's size?
        y: 0.5 * (window.innerHeight)// - gameObject.size.height)
    }
}

function worldSpaceToPlayerSpace(gameObject) {
    return {
        x: gameObject.positionWorldSpace.x - player.playerPositionWorldSpace.x,
        y: gameObject.positionWorldSpace.y - player.playerPositionWorldSpace.y,
    }
}

function worldToScreenSpace(gameObject) {
    // World --> Player
    const positionPlayerSpace = worldSpaceToPlayerSpace(gameObject);

    // Player --> Screen
    const offsetFromPlayerToScreenSpace = playerSpaceToScreenSpace(gameObject);

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
        this.oldPlayerPositionWorldSpace = { ...positionWorldSpace };

        this.velocity = { x: 0, y: 0 };
    }

    static gravity = 0.0045;
    static height = 50;
    static ground = 400;
    static jumpForce = 1.35;
    static runningForce = .0625;
    static maxRunSpeed = 1;
    static friction = .4;

    move(direction = { x: 0, y: 0 }) {

        // Decollision
        {
            this.allowedDirections = {
                up: true,
                down: true,
                left: true,
                right: true
            };

            for (const platform of platforms) {
                platform.decollide();
            }
        }

        // Vertical movement
        {
            if (this.allowedDirections.down) {
                this.velocity.y += GameObject.gravity * frameTime;
            }

            if (!this.allowedDirections.down) {
                this.velocity.y = 0;
                this.velocity.y += GameObject.jumpForce * direction.y;
            }

            if (!this.allowedDirections.down && this.velocity.y > 0) {
                this.velocity.y = 0;
            }

            if (!this.allowedDirections.up && this.velocity.y < 0) {
                this.velocity.y = 0;
            }

            this.playerPositionWorldSpace.y += this.velocity.y * frameTime;
        }

        // Horizontal movement
        {
            if (this.allowedDirections.left && direction.x < 0) {
                this.velocity.x += GameObject.runningForce * direction.x;
            }

            if (this.allowedDirections.right && direction.x > 0) {
                this.velocity.x += GameObject.runningForce * direction.x;
            }

            if (!this.allowedDirections.left && this.velocity.x < 0) {
                this.velocity.x = 0;
            }

            if (!this.allowedDirections.right && this.velocity.x > 0) {
                this.velocity.x = 0;
            }

            // Max speed
            if (Math.abs(this.velocity.x) > GameObject.maxRunSpeed) {
                this.velocity.x = Math.sign(this.velocity.x) * GameObject.maxRunSpeed;
            }
            // Friction
            if (!this.allowedDirections.down && !direction.x && this.velocity.x) {
                this.velocity.x = 0;
            }
            // Move
            this.playerPositionWorldSpace.x += this.velocity.x * frameTime;
        }

        // Move world
        {
            gameObjects.forEach(gameObject => {
                if (gameObject === player) {
                    gameObject.positionScreenSpace = playerSpaceToScreenSpace(player);
                } else {
                    gameObject.positionScreenSpace = worldToScreenSpace(gameObject);
                }
            })
            platforms.forEach(platform => {
                platform.positionScreenSpace = worldToScreenSpace(platform);
            })
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.positionScreenSpace.x, this.positionScreenSpace.y, this.size.width, this.size.height);
        ctx.font = '48px sans-serif';
        ctx.fillText(this.name, this.positionScreenSpace.x + this.nameOffset.x, this.positionScreenSpace.y + this.nameOffset.y);
    }
}

class Platform {
    constructor(positionWorldSpace = { x: 0, y: 0 }, fillStyle = "#ffffff", size = { width: 50, height: 50 }) {
        this.fillStyle = fillStyle;

        this.positionWorldSpace = { ...positionWorldSpace };
        this.positionScreenSpace = { ...positionWorldSpace };

        this.size = size;

        this.x0 = positionWorldSpace.x;
        this.x1 = this.x0 + size.width;
        this.y0 = positionWorldSpace.y;
        this.y1 = this.y0 + size.height;
    }

    decollide() {
        const error = { x: 0, y: 0 };

        const tentativeRestrictions = {
            up: true,
            down: true,
            left: true,
            right: true
        };

        let collisionCount = 0;

        const platformLeft = this.x0;
        const platformRight = this.x1;
        const platformTop = this.y0;
        const platformBottom = this.y1;

        const playerLeft = player.playerPositionWorldSpace.x;
        const playerRight = player.playerPositionWorldSpace.x + player.size.width;
        const playerTop = player.playerPositionWorldSpace.y;
        const playerBottom = player.playerPositionWorldSpace.y + player.size.height;
        const withinXRange = (point, relax = false) => {
            return relax ? point > this.x0 && point < this.x1 : point >= this.x0 && point <= this.x1;
        }
        const withinYRange = (point, relax = false) => {
            return relax ? point > this.y0 && point < this.y1 : point >= this.y0 && point <= this.y1;
        }

        // Vertical
        {
            if (withinXRange(playerLeft, true) || withinXRange(playerRight, true)) {
                if (withinYRange(playerTop)) {
                    error.y = playerTop - platformBottom;
                    tentativeRestrictions.up = false;
                    collisionCount++;
                } else if (withinYRange(playerBottom)) {
                    error.y = playerBottom - platformTop;
                    tentativeRestrictions.down = false;
                    collisionCount++;
                }
            }
        }

        // Horizontal
        {
            if (withinYRange(playerTop, true) || withinYRange(playerBottom, true)) {
                if (withinXRange(playerRight)) {
                    error.x = playerRight - platformLeft;
                    tentativeRestrictions.right = false;
                    collisionCount++;
                } else
                    if (withinXRange(playerLeft)) {
                        error.x = playerLeft - platformRight;
                        tentativeRestrictions.left = false;
                        collisionCount++;
                    }
            }
        }

        if (error.x && Math.abs(error.x) < Math.abs(error.y)) {
            player.playerPositionWorldSpace.x -= error.x;
        }

        if (error.y && Math.abs(error.y) < Math.abs(error.x)) {
            player.playerPositionWorldSpace.y -= error.y;
        }

        player.allowedDirections.up &= tentativeRestrictions.up;
        player.allowedDirections.down &= tentativeRestrictions.down;
        player.allowedDirections.left &= tentativeRestrictions.left;
        player.allowedDirections.right &= tentativeRestrictions.right;

        return collisionCount;
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.positionScreenSpace.x, this.positionScreenSpace.y, this.size.width, this.size.height);
    }
}
