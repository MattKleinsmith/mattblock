import { shared, frameTime } from "./configuration.js";
import { platforms } from "./gameData.js";

export class Platform {
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
        shared.player.oldPositionWS = { ...shared.player.positionWS };
        this.moveVertically(direction.y);
        this.moveHorizontally(direction.x);
        this.decollide();
        this.scroll();
        this.updateScreenSpace();
    }

    decollide() {
        this.resetAllowedDirections();
        for (const platform of platforms) {
            if (platform === shared.player || !platform.isEnabled) continue;
            if (this.handleVerticalCollision(platform)) break;
            if (this.handleHorizontalCollision(platform)) break;
        }
    }

    scroll() {
        this.scrollHorizontally();
        this.scrollVertically();
    }

    updateScreenSpace() {
        // Calibrate the world presentation to the shared.player's position
        // That is, calculate the screen space coordinates for each object

        platforms.forEach(platform => {
            ////////////////
            // THE PLAYER //
            ////////////////
            if (platform === shared.player) {
                if (this.isScrollingHorizontally) {
                    shared.player.positionSS.x = (shared.player.xLimitSS);
                } else {
                    shared.player.positionSS.x = (shared.player.positionWS.x - shared.player.cameraLeftWS);
                }

                if (this.isScrollingVertically) {
                    shared.player.positionSS.y = (shared.player.yLimitSS);

                } else {
                    shared.player.positionSS.y = (shared.player.positionWS.y - shared.player.cameraTopWS);
                }
            }
            ////////////////////
            // NOT THE PLAYER //
            ////////////////////
            else {
                platform.positionSS = {
                    x: (platform.positionWS.x - shared.player.cameraLeftWS),
                    y: (platform.positionWS.y - shared.player.cameraTopWS)
                };

                platform.positionSS.x -= shared.zoomOrigin.x;
                platform.positionSS.x *= shared.gameScale;
                platform.positionSS.x += shared.zoomOrigin.x;

                platform.positionSS.y -= shared.zoomOrigin.y;
                platform.positionSS.y *= shared.gameScale;
                platform.positionSS.y += shared.zoomOrigin.y;

                platform.positionPS = {
                    x: platform.positionWS.x - shared.player.positionWS.x,
                    y: platform.positionWS.y - shared.player.positionWS.y
                };
            }
        })
    }

    moveVertically(yDirection) {
        if (shared.tSpeed) {
            this.positionWS.y += yDirection * frameTime * shared.tSpeed;
            console.log(this.positionWS);
        }
        else {
            if (this.allowedDirections.down) {
                this.velocity.y += Platform.gravity * frameTime;
            } else if (yDirection !== 0) {
                this.velocity.y = Platform.jumpForce * yDirection;
            }

            this.positionWS.y += this.velocity.y * frameTime;
        }
    }

    moveHorizontally(xDirection) {
        if (shared.tSpeed) {
            this.positionWS.x += xDirection * frameTime * shared.tSpeed;
        } else {
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
    }

    handleVerticalCollision(platform) {
        if (withinRange(shared.player.positionWS.x, platform.positionWS.x, platform.positionWS.x + platform.size.width, true) ||
            withinRange(shared.player.positionWS.x + shared.player.size.width, platform.positionWS.x, platform.positionWS.x + platform.size.width, true)) {

            if (withinRange(platform.positionWS.y, shared.player.oldPositionWS.y + shared.player.size.height, shared.player.positionWS.y + shared.player.size.height, true)) {
                shared.player.positionWS.y = platform.positionWS.y - shared.player.size.height;
                this.allowedDirections.down = false;
                this.velocity.y = 0;
                if (!this.allowedDirections.right || !this.allowedDirections.left) return true;
            } else if (withinRange(platform.positionWS.y + platform.size.height, shared.player.positionWS.y, shared.player.oldPositionWS.y, true)) {
                shared.player.positionWS.y = platform.positionWS.y + platform.size.height;
                this.allowedDirections.up = false;
                this.velocity.y = 0;
                if (!this.allowedDirections.right || !this.allowedDirections.left) return true;
            }
        }
        return false;
    }

    handleHorizontalCollision(platform) {
        if (withinRange(shared.player.positionWS.y, platform.positionWS.y, platform.positionWS.y + platform.size.height, true) ||
            withinRange(shared.player.positionWS.y + shared.player.size.height, platform.positionWS.y, platform.positionWS.y + platform.size.height, true)) {

            if (withinRange(platform.positionWS.x, shared.player.oldPositionWS.x + shared.player.size.width, shared.player.positionWS.x + shared.player.size.width, true)) {
                shared.player.positionWS.x = platform.positionWS.x - shared.player.size.width;
                this.allowedDirections.right = false;
                this.velocity.x = 0;
                if (!this.allowedDirections.down || !this.allowedDirections.up) return true;
            } else if (withinRange(platform.positionWS.x + platform.size.width, shared.player.positionWS.x, shared.player.oldPositionWS.x, true)) {
                shared.player.positionWS.x = platform.positionWS.x + platform.size.width;
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
        this.scrolllessZoneWidth = this.rightScrollSS - this.leftScrollSS;

        if (this.positionWS.x <= this.leftScrollWS) {
            if (!this.isScrollingLeft) {
                // Draw player at left-limit
                this.xLimitSS = this.leftScrollSS;

                this.isScrollingLeft = true;
            }

            // Push left-limit in WS
            this.leftScrollWS = this.positionWS.x;

            // Pull right-limit in WS
            this.rightScrollWS = this.leftScrollWS + this.scrolllessZoneWidth;

            // Push camera in WS
            this.cameraLeftWS = this.positionWS.x - this.positionSS.x;  // / shared.gameScale
        } else {
            this.isScrollingLeft = false;
        }

        if (this.positionWS.x >= this.rightScrollWS) {
            if (!this.isScrollingRight) {
                this.xLimitSS = this.rightScrollSS;
                this.isScrollingRight = true;
            }
            this.rightScrollWS = this.positionWS.x;
            this.leftScrollWS = this.rightScrollWS - this.scrolllessZoneWidth;

            this.cameraLeftWS = this.positionWS.x - window.innerWidth * this.rightScrollPercentage;
        } else {
            this.isScrollingRight = false;
        }

        this.isScrollingHorizontally = this.isScrollingLeft || this.isScrollingRight;
    }

    scrollVertically() {
        shared.player.topScrollSS = window.innerHeight * shared.player.topScrollPercentage;
        shared.player.bottomScrollSS = window.innerHeight * shared.player.bottomScrollPercentage;
        shared.player.noScrollZoneHeight = shared.player.bottomScrollSS - shared.player.topScrollSS;

        if (this.positionWS.y <= this.topScrollWS) {
            if (!this.isScrollingUp) {
                this.yLimitSS = this.topScrollSS;
                this.isScrollingUp = true;
            }

            this.topScrollWS = this.positionWS.y;
            this.bottomScrollWS = this.topScrollWS + shared.player.noScrollZoneHeight;

            this.cameraTopWS = shared.player.positionWS.y - window.innerHeight * shared.player.topScrollPercentage;
        } else {
            this.isScrollingUp = false;
        }

        if (this.positionWS.y >= this.bottomScrollWS) {
            if (!this.isScrollingDown) {
                this.yLimitSS = this.bottomScrollSS;
                this.isScrollingDown = true;
            }
            this.bottomScrollWS = this.positionWS.y;
            this.topScrollWS = this.bottomScrollWS - shared.player.noScrollZoneHeight;

            this.cameraTopWS = shared.player.positionWS.y - window.innerHeight * shared.player.bottomScrollPercentage;
        } else {
            this.isScrollingDown = false;
        }

        this.isScrollingVertically = this.isScrollingUp || this.isScrollingDown;
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;

        // Draw the rectangle
        ctx.fillRect(this.positionSS.x, this.positionSS.y, this.size.width * shared.gameScale, this.size.height * shared.gameScale);

        // Draw the text
        ctx.font = `${48 * shared.gameScale}px sans-serif`;
        ctx.fillText(this.name, this.positionSS.x + (this.nameOffset.x) * shared.gameScale, this.positionSS.y + (this.nameOffset.y) * shared.gameScale);

        // if (["", "connected"].includes(this.status)) return;
        // Draw the shared.player status
        ctx.font = `${40 * shared.gameScale}px sans-serif`;
        ctx.fillText(this.status, this.positionSS.x + (this.nameOffset.x + 50) * shared.gameScale, this.positionSS.y + (this.nameOffset.y + 30) * shared.gameScale);
    }

    draw_Minimap(ctx) {
        ctx.fillStyle = this.fillStyle;
        const pos = {
            x: this.positionPS.x + shared.player.MM.x,
            y: this.positionPS.y + shared.player.MM.y
        }
        ctx.fillRect(pos.x, pos.y, this.size.width, this.size.height);
    }
}

function withinRange(number, min, max, includeBoundary) {
    return includeBoundary ?
        number >= min && number <= max :
        number > min && number < max;
}
