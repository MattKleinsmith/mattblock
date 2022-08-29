function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

class GameObject {
    constructor(position = { x: 0, y: 0 }, color = { r: 255, g: 255, b: 255 }, size = { width: 50, height: 50 }) {
        this.position = position;
        this.oldPosition = { ...position };
        this.displacement = { x: 0, y: 0 };
        this.size = size;
        this.color = color;
        this.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        this.isControllable = false;
    }

    static velocityFromGravity = 0.3;
    static height = 50;
    static ground = 850;

    setColor(color = { r: 255, g: 255, b: 255 }) {
        this.color = color;
        this.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    }

    // Idea: What if instead of moving ourself, we moved the world?
    move(direction = { x: 0, y: 0 }) {
        this.position.x += direction.x * frameTime;
        if (this.position.x > window.innerWidth) this.position.x = 0;
        else if (this.position.x < 0) this.position.x = window.innerWidth;

        let yDisplacement = direction.y;
        if (this.position.y >= GameObject.ground) {
            this.position.y = GameObject.ground;
        }
        else {
            yDisplacement += GameObject.velocityFromGravity;
        }
        this.position.y += yDisplacement * frameTime;
        if (this.position.y < 0) this.position.y = window.innerHeight - this.size.height * 2;
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
}
