class GameObject {
    constructor(positionWS = { x: 0, y: 0 }, fillStyle = "#ffffff", size = { width: 50, height: 50 }, name = "") {
        this.size = size;
        this.fillStyle = fillStyle;

        this.positionWS = { ...positionWS };
        this.positionSS = { x: window.innerWidth * .5, y: window.innerHeight * .5 };

        this.name = name;
        this.nameOffset = { x: 0, y: -5 };

        // TODO: Can we use positionWS instead?
        // Player only
        // TODO: Please use positionWS instead. Please test.
        this.playerPositionWS = { ...positionWS };
        this.oldplayerPositionWS = { ...positionWS };

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

            this.playerPositionWS.y += this.velocity.y * frameTime;
        }

        let worldSpaceHorizontalDisplacement;
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
            worldSpaceHorizontalDisplacement = this.velocity.x * frameTime;
            this.playerPositionWS.x += worldSpaceHorizontalDisplacement;
        }

        //////////////////////////
        // HORIZONTAL SCROLLING //
        //////////////////////////
        {
            player.leftScrollSS = window.innerWidth * player.leftScrollPercentage;
            player.rightScrollSS = window.innerWidth * player.rightScrollPercentage;
            player.noScrollZoneWidth = player.rightScrollSS - player.leftScrollSS;

            if (this.playerPositionWS.x <= this.leftScrollWS) {
                // console.log("LEFT", "DIFF", this.playerPositionWS.x - this.leftScrollWS, "WS", this.playerPositionWS.x, "CUTOFF", this.leftScrollWS);
                if (!this.isScrollingLeft) {
                    this.xLimitSS = this.leftScrollSS;
                    this.isScrollingLeft = true;
                }

                this.leftScrollWS = this.playerPositionWS.x;
                this.rightScrollWS = this.leftScrollWS + player.noScrollZoneWidth;

                this.leftScreenWS = player.playerPositionWS.x - window.innerWidth * player.leftScrollPercentage;
            } else {
                this.isScrollingLeft = false;
            }

            if (this.playerPositionWS.x >= this.rightScrollWS) {
                // console.log("RIGHT", "DIFF", this.playerPositionWS.x - this.rightScrollWS, "WS", this.playerPositionWS.x, "CUTOFF", this.rightScrollWS);
                if (!this.isScrollingRight) {
                    this.xLimitSS = this.rightScrollSS;
                    this.isScrollingRight = true;
                }
                this.rightScrollWS = this.playerPositionWS.x;
                this.leftScrollWS = this.rightScrollWS - player.noScrollZoneWidth;

                this.leftScreenWS = player.playerPositionWS.x - window.innerWidth * player.rightScrollPercentage;
            } else {
                this.isScrollingRight = false;
            }

            this.isScrollingHorizontally = this.isScrollingLeft || this.isScrollingRight;
        }

        ////////////////////////
        // VERTICAL SCROLLING //
        ////////////////////////
        {
            player.topScrollSS = window.innerHeight * player.topScrollPercentage;
            player.bottomScrollSS = window.innerHeight * player.bottomScrollPercentage;
            player.noScrollZoneHeight = player.bottomScrollSS - player.topScrollSS;

            if (this.playerPositionWS.y <= this.topScrollWS) {
                // console.log("TOP", "DIFF", this.playerPositionWS.y - this.topScrollWS, "WS", this.playerPositionWS.y, "CUTOFF", this.topScrollWS);
                if (!this.isScrollingUp) {
                    this.yLimitSS = this.topScrollSS;
                    this.isScrollingUp = true;
                }

                this.topScrollWS = this.playerPositionWS.y;
                this.bottomScrollWS = this.topScrollWS + player.noScrollZoneHeight;

                this.topScreenWS = player.playerPositionWS.y - window.innerHeight * player.topScrollPercentage;
            } else {
                // console.log("y", this.playerPositionWS.y, "BOTTOM SCROLL LINE", this.bottomScrollWS, "DIFF", this.playerPositionWS.y - this.bottomScrollWS);
                this.isScrollingUp = false;
            }

            if (this.playerPositionWS.y >= this.bottomScrollWS) {
                // console.log("CROSSED y", this.playerPositionWS.y, "BOTTOM SCROLL LINE", this.bottomScrollWS, "DIFF", this.playerPositionWS.y - this.bottomScrollWS);
                if (!this.isScrollingDown) {

                    // EITHER bottomScrollSS is wrong, or, we have some weird transition
                    this.yLimitSS = this.bottomScrollSS;
                    this.isScrollingDown = true;
                }
                this.bottomScrollWS = this.playerPositionWS.y;
                this.topScrollWS = this.bottomScrollWS - player.noScrollZoneHeight;

                this.topScreenWS = player.playerPositionWS.y - window.innerHeight * player.bottomScrollPercentage;
            } else {
                // console.log("y", this.playerPositionWS.y, "BOTTOM SCROLL LINE", this.bottomScrollWS, "DIFF", this.playerPositionWS.y - this.bottomScrollWS);
                this.isScrollingDown = false;
            }

            this.isScrollingVertically = this.isScrollingUp || this.isScrollingDown;
        }


        gameObjects.forEach(PROBABLY_NOT_THE_PLAYER => {
            ////////////////
            // THE PLAYER //
            ////////////////
            if (PROBABLY_NOT_THE_PLAYER === player) {
                if (this.isScrollingHorizontally) {
                    player.positionSS.x = player.xLimitSS;
                } else {
                    player.positionSS.x = player.playerPositionWS.x - player.leftScreenWS;
                }

                if (this.isScrollingVertically) {
                    player.positionSS.y = player.yLimitSS;
                    // console.log("yLimitSS", player.yLimitSS);

                } else {
                    player.positionSS.y = player.playerPositionWS.y - player.topScreenWS;
                    // console.log("player.positionSS.y", player.positionSS.y);
                }
            }
            ////////////////////
            // NOT THE PLAYER //
            ////////////////////
            else {
                PROBABLY_NOT_THE_PLAYER.positionSS = {
                    x: PROBABLY_NOT_THE_PLAYER.positionWS.x - player.leftScreenWS,
                    y: PROBABLY_NOT_THE_PLAYER.positionWS.y - player.topScreenWS
                };
            }
        })
        ///////////////
        // PLATFORMS //
        ///////////////
        platforms.forEach(platform => {
            platform.positionSS = {
                x: platform.positionWS.x - player.leftScreenWS,
                y: platform.positionWS.y - player.topScreenWS
            };
        })
    }

    worldToScreenSpace(gameObject) {
        // World --> Player
        const positionPS = {
            x: gameObject.positionWS.x - player.playerPositionWS.x,
            y: gameObject.positionWS.y - player.playerPositionWS.y,
        }

        // Player --> Screen
        const offsetFromPlayerToScreenSpace = {
            x: player.playerPositionWS.x,
            y: player.playerPositionWS.y
        }

        // World --> Player --> Screen
        gameObject.positionSS = {
            x: positionPS.x + offsetFromPlayerToScreenSpace.x,
            y: positionPS.y + offsetFromPlayerToScreenSpace.y
        }
    }


    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.positionSS.x, this.positionSS.y, this.size.width, this.size.height);
        ctx.font = '48px sans-serif';
        ctx.fillText(this.name, this.positionSS.x + this.nameOffset.x, this.positionSS.y + this.nameOffset.y);
    }
}

function playerSpaceToScreenSpace() {
    const screenCenter = {
        x: 0.5 * window.innerWidth,
        y: 0.5 * window.innerHeight
    }
    return {
        x: screenCenter.x,
        y: screenCenter.y
    }
}

function worldSpaceToPlayerSpace(gameObject) {
    return {
        x: gameObject.positionWS.x - player.playerPositionWS.x,
        y: gameObject.positionWS.y - player.playerPositionWS.y,
    }
}

// gameObjects.forEach(gameObject => {
//     if (gameObject === player) {
//         if (scroll) {
//             const screenOffset = {
//                 x: 0.5 * window.innerWidth,
//                 y: 0.5 * window.innerHeight
//             }
//             // gameObject.positionSS = screenOffset;
//             console.log("scrolling", gameObject.positionSS);
//         } else {
//             console.log("not scrolling", gameObject.positionSS);
//             gameObject.positionSS = this.playerPositionWS;
//         }
//     } else {
//         gameObject.positionSS = worldToScreenSpace(gameObject, scroll);
//     }
// })

class Platform {
    constructor(positionWS = { x: 0, y: 0 }, fillStyle = "#ffffff", size = { width: 50, height: 50 }) {
        this.fillStyle = fillStyle;

        this.positionWS = { ...positionWS };
        this.positionSS = { ...positionWS };

        this.size = size;

        this.x0 = positionWS.x;
        this.x1 = this.x0 + size.width;
        this.y0 = positionWS.y;
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

        const playerLeft = player.playerPositionWS.x;
        const playerRight = player.playerPositionWS.x + player.size.width;
        const playerTop = player.playerPositionWS.y;
        const playerBottom = player.playerPositionWS.y + player.size.height;
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
            player.playerPositionWS.x -= error.x;
        }

        if (error.y && Math.abs(error.y) < Math.abs(error.x)) {
            player.playerPositionWS.y -= error.y;
        }

        player.allowedDirections.up &= tentativeRestrictions.up;
        player.allowedDirections.down &= tentativeRestrictions.down;
        player.allowedDirections.left &= tentativeRestrictions.left;
        player.allowedDirections.right &= tentativeRestrictions.right;

        return collisionCount;
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.positionSS.x, this.positionSS.y, this.size.width, this.size.height);
    }
}
