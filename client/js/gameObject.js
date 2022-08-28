class GameObject {
    constructor(position = { x: 0, y: 0 }, fillStyle = 'rgb(200, 0, 0)', size = { width: 50, height: 50 }) {
        this.position = position;
        this.fillStyle = fillStyle;
        this.size = size;
    }

    // Idea: What if instead of moving ourself, we moved the world?
    move(direction) {
        this.position.x += direction.x * frameTime * frameRateMultiplier;
        this.position.y += direction.y * frameTime * frameRateMultiplier;
    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
}
