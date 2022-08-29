class GameObject {
    constructor(position = { x: 0, y: 0 }, color = { r: 255, g: 255, b: 255 }, size = { width: 50, height: 50 }) {
        this.position = position;
        this.oldPosition = { ...position };
        this.size = size;
        this.color = color;
        this.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    }

    update() {
        this.oldPosition = { ...this.position };
    }

    setColor(color = { r: 255, g: 255, b: 255 }) {
        this.color = color;
        this.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    }

    // Idea: What if instead of moving ourself, we moved the world?
    move(direction) {
        this.position.x += direction.x * frameTime;
        this.position.y += direction.y * frameTime;
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
}
