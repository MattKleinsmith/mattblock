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
    static ground = 3000;

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
                    shared.player.positionSS.x = shared.player.activeHorizontalScrollLineSS;
                } else {
                    shared.player.positionSS.x = (shared.player.positionWS.x - shared.player.cameraLeftWS) * shared.gameScaleWS2SS;
                }

                if (this.isScrollingVertically) {
                    shared.player.positionSS.y = shared.player.activeVerticalScrollLineSS;

                } else {
                    shared.player.positionSS.y = (shared.player.positionWS.y - shared.player.cameraTopWS) * shared.gameScaleWS2SS;
                }
            }
            ////////////////////
            // NOT THE PLAYER //
            ////////////////////
            else {
                const positionCS = {  // Camera space (not screen space)
                    x: platform.positionWS.x - shared.player.cameraLeftWS,
                    y: platform.positionWS.y - shared.player.cameraTopWS
                };

                function scale(position, scalar, pivot) {
                    position.x = (position.x - pivot.x) * scalar + pivot.x;
                    position.y = (position.y - pivot.y) * scalar + pivot.y;
                    return position;
                }

                platform.positionSS = scale(positionCS, shared.gameScaleWS2SS, { x: 0, y: 0 });

                // For the minimap
                platform.positionPS = {
                    x: platform.positionWS.x - shared.player.positionWS.x,
                    y: platform.positionWS.y - shared.player.positionWS.y
                };
            }
        })
    }

    scrollHorizontally() {
        this.distanceBetweenHorizontalScrollLinesSS = this.rightScrollLineSS - this.leftScrollLineSS;

        if (this.positionWS.x <= this.leftScrollWS) {
            this.scrollLeft();
        } else {
            this.isScrollingLeft = false;

            if (this.positionWS.x >= this.rightScrollWS) {
                this.scrollRight();
            } else {
                this.isScrollingRight = false;
            }
        }

        this.isScrollingHorizontally = this.isScrollingLeft || this.isScrollingRight;
    }

    scrollVertically() {
        this.distanceBetweenVerticalScrollLinesSS = shared.player.bottomScrollLineSS - shared.player.topScrollLineSS;

        if (this.positionWS.y <= this.topScrollWS) {
            this.scrollUp();
        } else {
            this.isScrollingUp = false;
        }

        if (this.positionWS.y >= this.bottomScrollWS) {
            this.scrollDown();
        } else {
            this.isScrollingDown = false;
        }

        this.isScrollingVertically = this.isScrollingUp || this.isScrollingDown;
    }

    scrollLeft() {
        if (!this.isScrollingLeft) {
            this.activeHorizontalScrollLineSS = this.leftScrollLineSS;
            this.isScrollingLeft = true;
        }
        // | CAMERA         | LEFT SCROLL LINE AND PLAYER        | RIGHT SCROLL LINE
        this.leftScrollWS = this.positionWS.x;
        this.rightScrollWS = this.leftScrollWS + this.distanceBetweenHorizontalScrollLinesSS / shared.gameScaleWS2SS;
        this.cameraLeftWS = this.leftScrollWS - this.leftScrollLineSS / shared.gameScaleWS2SS;
    }

    scrollRight() {
        if (!this.isScrollingRight) {
            this.activeHorizontalScrollLineSS = this.rightScrollLineSS;
            this.isScrollingRight = true;
        }
        // | CAMERA         | LEFT SCROLL LINE                  | RIGHT SCROLL LINE AND PLAYER
        this.rightScrollWS = this.positionWS.x;
        this.leftScrollWS = this.rightScrollWS - this.distanceBetweenHorizontalScrollLinesSS / shared.gameScaleWS2SS;
        this.cameraLeftWS = this.leftScrollWS - this.leftScrollLineSS / shared.gameScaleWS2SS;
    }

    scrollUp() {
        if (!this.isScrollingUp) {
            this.activeVerticalScrollLineSS = this.topScrollLineSS;
            this.isScrollingUp = true;
        }

        this.topScrollWS = this.positionWS.y;
        this.bottomScrollWS = this.topScrollWS + this.distanceBetweenVerticalScrollLinesSS / shared.gameScaleWS2SS;
        this.cameraTopWS = this.topScrollWS - this.topScrollLineSS / shared.gameScaleWS2SS;
    }

    scrollDown() {
        if (!this.isScrollingDown) {
            this.activeVerticalScrollLineSS = this.bottomScrollLineSS;
            this.isScrollingDown = true;
        }
        this.bottomScrollWS = this.positionWS.y;
        this.topScrollWS = this.bottomScrollWS - this.distanceBetweenVerticalScrollLinesSS / shared.gameScaleWS2SS;
        this.cameraTopWS = this.topScrollWS - this.topScrollLineSS / shared.gameScaleWS2SS;
    }

    moveVertically(yDirection) {
        if (shared.tSpeed) {
            this.positionWS.y += yDirection * frameTime * shared.tSpeed;
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

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;

        // Draw the rectangle
        ctx.fillRect(this.positionSS.x, this.positionSS.y, this.size.width * shared.gameScaleWS2SS, this.size.height * shared.gameScaleWS2SS);

        if (this.positionWS.y > -1000 && this.status === "💤") return;

        // Draw the text
        ctx.font = `${48 * shared.gameScaleWS2SS}px sans-serif`;
        ctx.fillText(this.name, this.positionSS.x + (this.nameOffset.x) * shared.gameScaleWS2SS, this.positionSS.y + (this.nameOffset.y) * shared.gameScaleWS2SS);

        // if (["", "connected"].includes(this.status)) return;
        // Draw the shared.player status
        // ctx.font = `${40 * shared.gameScaleWS2SS}px sans-serif`;
        // ctx.fillText(this.status, this.positionSS.x + (this.nameOffset.x + 50) * shared.gameScaleWS2SS, this.positionSS.y + (this.nameOffset.y + 30) * shared.gameScaleWS2SS);
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
