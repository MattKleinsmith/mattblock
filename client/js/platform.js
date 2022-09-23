class Platform {
    constructor(positionWS = { x: 0, y: 0 }, fillStyle = "#ffffff", size = { width: 50, height: 50 }, name = "", isEnabled = true) {
        // Profile
        {
            this.fillStyle = fillStyle;
            this.size = size;
            this.name = name;
            this.nameOffset = { x: 0, y: -5 };
            this.isEnabled = isEnabled;
            this.status = "";
        }

        // Motion
        {
            this.positionWS = { ...positionWS };
            this.oldPositionWS = { ...positionWS };
            this.positionSS = { ...positionWS };
            this.velocity = { x: 0, y: 0 };
            this.allowedDirections = { up: true, down: true, left: true, right: true };
        }
    }

    static gravity = 0.0045;
    static jumpForce = 1.35 * 2;
    static runningForce = .0625;
    static maxRunSpeed = 1;
    static ground = 800;

    move(direction = { x: 0, y: 0 }) {
        player.oldPositionWS = { ...player.positionWS };
        this.moveVertically(direction.y);
        this.moveHorizontally(direction.x);
        this.decollide();
        this.scroll();
        this.updateScreenSpace();
    }

    decollide() {
        this.resetAllowedDirections();
        for (const platform of platforms) {
            if (platform === player || !platform.isEnabled) continue;
            if (this.handleVerticalCollision(platform)) break;
            if (this.handleHorizontalCollision(platform)) break;
        }
    }

    scroll() {
        this.scrollHorizontally();
        this.scrollVertically();
    }

    updateScreenSpace() {
        // Calibrate the world presentation to the player's position
        // That is, calculate the screen space coordinates for each object

        platforms.forEach(PROBABLY_NOT_THE_PLAYER => {
            ////////////////
            // THE PLAYER //
            ////////////////
            if (PROBABLY_NOT_THE_PLAYER === player) {
                if (this.isScrollingHorizontally) {
                    player.positionSS.x = player.xLimitSS;
                } else {
                    player.positionSS.x = player.positionWS.x - player.leftScreenWS;
                }

                if (this.isScrollingVertically) {
                    player.positionSS.y = player.yLimitSS;

                } else {
                    player.positionSS.y = player.positionWS.y - player.topScreenWS;
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

                PROBABLY_NOT_THE_PLAYER.positionPS = {
                    x: PROBABLY_NOT_THE_PLAYER.positionWS.x - player.positionWS.x,
                    y: PROBABLY_NOT_THE_PLAYER.positionWS.y - player.positionWS.y
                };
            }
        })
    }

    moveVertically(yDirection) {
        if (this.allowedDirections.down) {
            this.velocity.y += Platform.gravity * frameTime;
        } else if (yDirection !== 0) {
            this.velocity.y = Platform.jumpForce * yDirection;
        }

        this.positionWS.y += this.velocity.y * frameTime;
    }

    moveHorizontally(xDirection) {
        if (this.allowedDirections.left && xDirection < 0) {
            this.velocity.x += Platform.runningForce * xDirection;
        }

        if (this.allowedDirections.right && xDirection > 0) {
            this.velocity.x += Platform.runningForce * xDirection;
        }

        // Max speed
        if (Math.abs(this.velocity.x) > Platform.maxRunSpeed) {
            this.velocity.x = Math.sign(this.velocity.x) * Platform.maxRunSpeed;
        }
        // Friction
        if (!this.allowedDirections.down && !xDirection && this.velocity.x) {
            this.velocity.x = 0;
        }

        this.positionWS.x += this.velocity.x * frameTime;
    }

    handleVerticalCollision(platform) {
        if (withinRange(player.positionWS.x, platform.positionWS.x, platform.positionWS.x + platform.size.width, true) ||
            withinRange(player.positionWS.x + player.size.width, platform.positionWS.x, platform.positionWS.x + platform.size.width, true)) {

            if (withinRange(platform.positionWS.y, player.oldPositionWS.y + playerHeight, player.positionWS.y + playerHeight, true)) {
                player.positionWS.y = platform.positionWS.y - player.size.height;
                this.allowedDirections.down = false;
                this.velocity.y = 0;
                if (!this.allowedDirections.right || !this.allowedDirections.left) return true;
            } else if (withinRange(platform.positionWS.y + platform.size.height, player.positionWS.y, player.oldPositionWS.y, true)) {
                player.positionWS.y = platform.positionWS.y + platform.size.height;
                this.allowedDirections.up = false;
                this.velocity.y = 0;
                if (!this.allowedDirections.right || !this.allowedDirections.left) return true;
            }
        }
        return false;
    }

    handleHorizontalCollision(platform) {
        if (withinRange(player.positionWS.y, platform.positionWS.y, platform.positionWS.y + platform.size.height, true) ||
            withinRange(player.positionWS.y + player.size.height, platform.positionWS.y, platform.positionWS.y + platform.size.height, true)) {

            if (withinRange(platform.positionWS.x, player.oldPositionWS.x + player.size.width, player.positionWS.x + player.size.width, true)) {
                player.positionWS.x = platform.positionWS.x - player.size.width;
                this.allowedDirections.right = false;
                this.velocity.x = 0;
                if (!this.allowedDirections.down || !this.allowedDirections.up) return true;
            } else if (withinRange(platform.positionWS.x + platform.size.width, player.positionWS.x, player.oldPositionWS.x, true)) {
                player.positionWS.x = platform.positionWS.x + platform.size.width;
                this.allowedDirections.left = false;
                this.velocity.x = 0;
                if (!this.allowedDirections.down || !this.allowedDirections.up) return true;
            }
        }
        return false;
    }

    resetAllowedDirections() {
        this.allowedDirections.down = true;
        this.allowedDirections.up = true;
        this.allowedDirections.right = true;
        this.allowedDirections.left = true;
    }

    scrollHorizontally() {
        player.leftScrollSS = window.innerWidth * player.leftScrollPercentage;
        player.rightScrollSS = window.innerWidth * player.rightScrollPercentage;
        player.noScrollZoneWidth = player.rightScrollSS - player.leftScrollSS;

        if (this.positionWS.x <= this.leftScrollWS) {
            if (!this.isScrollingLeft) {
                this.xLimitSS = this.leftScrollSS;
                this.isScrollingLeft = true;
            }

            this.leftScrollWS = this.positionWS.x;
            this.rightScrollWS = this.leftScrollWS + player.noScrollZoneWidth;

            this.leftScreenWS = player.positionWS.x - window.innerWidth * player.leftScrollPercentage;
        } else {
            this.isScrollingLeft = false;
        }

        if (this.positionWS.x >= this.rightScrollWS) {
            if (!this.isScrollingRight) {
                this.xLimitSS = this.rightScrollSS;
                this.isScrollingRight = true;
            }
            this.rightScrollWS = this.positionWS.x;
            this.leftScrollWS = this.rightScrollWS - player.noScrollZoneWidth;

            this.leftScreenWS = player.positionWS.x - window.innerWidth * player.rightScrollPercentage;
        } else {
            this.isScrollingRight = false;
        }

        this.isScrollingHorizontally = this.isScrollingLeft || this.isScrollingRight;
    }

    scrollVertically() {
        player.topScrollSS = window.innerHeight * player.topScrollPercentage;
        player.bottomScrollSS = window.innerHeight * player.bottomScrollPercentage;
        player.noScrollZoneHeight = player.bottomScrollSS - player.topScrollSS;

        if (this.positionWS.y <= this.topScrollWS) {
            if (!this.isScrollingUp) {
                this.yLimitSS = this.topScrollSS;
                this.isScrollingUp = true;
            }

            this.topScrollWS = this.positionWS.y;
            this.bottomScrollWS = this.topScrollWS + player.noScrollZoneHeight;

            this.topScreenWS = player.positionWS.y - window.innerHeight * player.topScrollPercentage;
        } else {
            this.isScrollingUp = false;
        }

        if (this.positionWS.y >= this.bottomScrollWS) {
            if (!this.isScrollingDown) {
                this.yLimitSS = this.bottomScrollSS;
                this.isScrollingDown = true;
            }
            this.bottomScrollWS = this.positionWS.y;
            this.topScrollWS = this.bottomScrollWS - player.noScrollZoneHeight;

            this.topScreenWS = player.positionWS.y - window.innerHeight * player.bottomScrollPercentage;
        } else {
            this.isScrollingDown = false;
        }

        this.isScrollingVertically = this.isScrollingUp || this.isScrollingDown;
    }

    worldToScreenSpace(platform) {
        // World --> Player
        const positionPS = {
            x: platform.positionWS.x - player.positionWS.x,
            y: platform.positionWS.y - player.positionWS.y,
        }

        // Player --> Screen
        const offsetFromPlayerToScreenSpace = {
            x: player.positionWS.x,
            y: player.positionWS.y
        }

        // World --> Player --> Screen
        platform.positionSS = {
            x: positionPS.x + offsetFromPlayerToScreenSpace.x,
            y: positionPS.y + offsetFromPlayerToScreenSpace.y
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;

        // Draw the rectangle
        ctx.fillRect(this.positionSS.x, this.positionSS.y, this.size.width, this.size.height);

        // Draw the text
        ctx.font = '48px sans-serif';
        ctx.fillText(this.name, this.positionSS.x + this.nameOffset.x, this.positionSS.y + this.nameOffset.y);

        // if (["", "connected"].includes(this.status)) return;
        // Draw the player status
        ctx.font = '40px sans-serif';
        ctx.fillText(this.status, this.positionSS.x + this.nameOffset.x + 50, this.positionSS.y + this.nameOffset.y + 30);
    }

    draw_Minimap(ctx, scale) {
        ctx.fillStyle = this.fillStyle;
        const pos = {
            x: this.positionPS.x + player.MM.x,
            y: this.positionPS.y + player.MM.y
        }
        ctx.fillRect(pos.x, pos.y, this.size.width * scale, this.size.height * scale);
    }
}

function withinRange(number, min, max, includeBoundary) {
    return includeBoundary ?
        number >= min && number <= max :
        number > min && number < max;
}
