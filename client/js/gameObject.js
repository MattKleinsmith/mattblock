class GameObject {
    constructor(id, position = { x: 0, y: 0 }, fillStyle = 'rgb(200, 0, 0)', size = { width: 50, height: 50 }) {
        this.id = id;  // TODO: Didn't end up using this.
        this.position = position;
        this.oldPosition = { ...position };
        this.fillStyle = fillStyle;
        this.size = size;
    }

    update() {
        this.oldPosition = { ...this.position };
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
