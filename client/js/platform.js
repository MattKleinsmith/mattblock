class Platform {
    constructor(positionWS = { x: 0, y: 0 }, fillStyle = "#ffffff", size = { width: 50, height: 50 }, name = "", isEnabled = true) {
        // Profile
        {
            this.fillStyle = fillStyle;
            this.size = size;
            this.name = name;
            this.nameOffset = { x: 0, y: -5 };
            this.isEnabled = isEnabled;
        }

        // Motion
        {
            this.positionWS = { ...positionWS };
            this.oldPositionWS = { ...positionWS };
            this.positionSS = { ...positionWS };
            this.velocity = { x: 0, y: 0 };
            this.updateCorners();
        }
    }

    static gravity = 0.0045;
    static jumpForce = 1.35 * 2;
    static runningForce = .0625;
    static maxRunSpeed = 1;
    static ground = 400;

    move(direction = { x: 0, y: 0 }) {

        // Decollision
        {
            this.updateCorners();

            this.allowedDirections = { up: true, down: true, left: true, right: true };
            for (const platform of platforms) {
                if (platform !== player && platform.isEnabled) platform.decollide();
            }
        }

        // Vertical movement
        {
            if (this.allowedDirections.down) {
                this.velocity.y += Platform.gravity * frameTime;
            }

            if (!this.allowedDirections.down) {
                this.velocity.y = 0;
                this.velocity.y += Platform.jumpForce * direction.y;
            }

            if (!this.allowedDirections.down && this.velocity.y > 0) {
                this.velocity.y = 0;
            }

            if (!this.allowedDirections.up && this.velocity.y < 0) {
                this.velocity.y = 0;
            }

            this.positionWS.y += this.velocity.y * frameTime;
        }

        // Horizontal movement
        {
            if (this.allowedDirections.left && direction.x < 0) {
                this.velocity.x += Platform.runningForce * direction.x;
            }

            if (this.allowedDirections.right && direction.x > 0) {
                this.velocity.x += Platform.runningForce * direction.x;
            }

            if (!this.allowedDirections.left && this.velocity.x < 0) {
                this.velocity.x = 0;
            }

            if (!this.allowedDirections.right && this.velocity.x > 0) {
                this.velocity.x = 0;
            }

            // Max speed
            if (Math.abs(this.velocity.x) > Platform.maxRunSpeed) {
                this.velocity.x = Math.sign(this.velocity.x) * Platform.maxRunSpeed;
            }
            // Friction
            if (!this.allowedDirections.down && !direction.x && this.velocity.x) {
                this.velocity.x = 0;
            }
            // Move
            this.positionWS.x += this.velocity.x * frameTime;
        }

        //////////////////////////
        // HORIZONTAL SCROLLING //
        //////////////////////////
        {
            player.leftScrollSS = window.innerWidth * player.leftScrollPercentage;
            player.rightScrollSS = window.innerWidth * player.rightScrollPercentage;
            player.noScrollZoneWidth = player.rightScrollSS - player.leftScrollSS;

            if (this.positionWS.x <= this.leftScrollWS) {
                // console.log("LEFT", "DIFF", this.positionWS.x - this.leftScrollWS, "WS", this.positionWS.x, "CUTOFF", this.leftScrollWS);
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
                // console.log("RIGHT", "DIFF", this.positionWS.x - this.rightScrollWS, "WS", this.positionWS.x, "CUTOFF", this.rightScrollWS);
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

        ////////////////////////
        // VERTICAL SCROLLING //
        ////////////////////////
        {
            player.topScrollSS = window.innerHeight * player.topScrollPercentage;
            player.bottomScrollSS = window.innerHeight * player.bottomScrollPercentage;
            player.noScrollZoneHeight = player.bottomScrollSS - player.topScrollSS;

            if (this.positionWS.y <= this.topScrollWS) {
                // console.log("TOP", "DIFF", this.positionWS.y - this.topScrollWS, "WS", this.positionWS.y, "CUTOFF", this.topScrollWS);
                if (!this.isScrollingUp) {
                    this.yLimitSS = this.topScrollSS;
                    this.isScrollingUp = true;
                }

                this.topScrollWS = this.positionWS.y;
                this.bottomScrollWS = this.topScrollWS + player.noScrollZoneHeight;

                this.topScreenWS = player.positionWS.y - window.innerHeight * player.topScrollPercentage;
            } else {
                // console.log("y", this.positionWS.y, "BOTTOM SCROLL LINE", this.bottomScrollWS, "DIFF", this.positionWS.y - this.bottomScrollWS);
                this.isScrollingUp = false;
            }

            if (this.positionWS.y >= this.bottomScrollWS) {
                // console.log("CROSSED y", this.positionWS.y, "BOTTOM SCROLL LINE", this.bottomScrollWS, "DIFF", this.positionWS.y - this.bottomScrollWS);
                if (!this.isScrollingDown) {

                    // EITHER bottomScrollSS is wrong, or, we have some weird transition
                    this.yLimitSS = this.bottomScrollSS;
                    this.isScrollingDown = true;
                }
                this.bottomScrollWS = this.positionWS.y;
                this.topScrollWS = this.bottomScrollWS - player.noScrollZoneHeight;

                this.topScreenWS = player.positionWS.y - window.innerHeight * player.bottomScrollPercentage;
            } else {
                // console.log("y", this.positionWS.y, "BOTTOM SCROLL LINE", this.bottomScrollWS, "DIFF", this.positionWS.y - this.bottomScrollWS);
                this.isScrollingDown = false;
            }

            this.isScrollingVertically = this.isScrollingUp || this.isScrollingDown;
        }

        // Calibrate the world presentation to the player's position
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
            }
        })
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

    updateCorners() {
        this.x0 = this.positionWS.x;
        this.x1 = this.x0 + this.size.width;
        this.y0 = this.positionWS.y;
        this.y1 = this.y0 + this.size.height;
    }

    decollide() {
        this.updateCorners();
        const withinXRange = (point, includeBoundary) => withinRange(point, this.x0, this.x1, includeBoundary);
        const withinYRange = (point, includeBoundary) => withinRange(point, this.y0, this.y1, includeBoundary);

        const error = { x: 0, y: 0 };

        const tentativeAllowedDirections = { up: true, down: true, left: true, right: true };

        // Vertical
        {
            // RELAX CONSTRAINTS TO ALLOW MOVEMENT
            const isLeftInRange = withinXRange(player.x0, false);
            const isRightInRange = withinXRange(player.x1, false);
            if (isLeftInRange || isRightInRange) {
                if (withinYRange(player.y0, true)) {
                    error.y = player.y0 - this.y1;
                    tentativeAllowedDirections.up = false;
                } else if (withinYRange(player.y1, true)) {
                    error.y = player.y1 - this.y0;
                    // console.log("No to down. Error: ", error.y);
                    tentativeAllowedDirections.down = false;
                }
            }
        }

        // Horizontal
        {
            const sameHeight = this.size.height === player.size.height;
            if (sameHeight) {
                if (player.y0 === this.y0 && player.y1 === this.y1) {
                    if (withinXRange(player.x1, true)) {
                        error.x = player.x1 - this.x0;
                        tentativeAllowedDirections.right = false;
                    } else if (withinXRange(player.x0, true)) {
                        error.x = player.x0 - this.x1;
                        tentativeAllowedDirections.left = false;
                    }
                }
            } else {
                const isTopInRange = withinYRange(player.y0, false);
                const isBottomInRange = withinYRange(player.y1, false);
                if (isTopInRange || isBottomInRange) {
                    if (withinXRange(player.x1, true)) {
                        error.x = player.x1 - this.x0;
                        tentativeAllowedDirections.right = false;
                    } else if (withinXRange(player.x0, true)) {
                        error.x = player.x0 - this.x1;
                        tentativeAllowedDirections.left = false;
                    }
                }
            }
        }

        // Decollide and update constraints
        {
            if (error.x && (!error.y || Math.abs(error.x) < Math.abs(error.y))) {
                // console.log("Chose violence", error.x);
                player.positionWS.x -= error.x;
            }

            if (error.y && (!error.x || Math.abs(error.y) < Math.abs(error.x))) {
                // console.log("Chose peace", error.y);
                player.positionWS.y -= error.y;
            }

            player.allowedDirections.up &= tentativeAllowedDirections.up;
            player.allowedDirections.down &= tentativeAllowedDirections.down;
            player.allowedDirections.left &= tentativeAllowedDirections.left;
            player.allowedDirections.right &= tentativeAllowedDirections.right;
        }
    }

    draw(ctx) {
        // Draw the rectangle
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.positionSS.x, this.positionSS.y, this.size.width, this.size.height);

        // Draw the text
        ctx.font = '48px sans-serif';
        ctx.fillText(this.name, this.positionSS.x + this.nameOffset.x, this.positionSS.y + this.nameOffset.y);
    }
}

function withinRange(number, min, max, includeBoundary) {
    return includeBoundary ?
        number >= min && number <= max :
        number > min && number < max;
}
