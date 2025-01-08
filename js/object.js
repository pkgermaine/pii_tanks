

// class for all game objects
class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    // draw the object on the canvas
    draw(ctx) {
        ctx.fillStyle = this.color;
        
    }
}

// class for all players
class Player extends GameObject {
    constructor(x, y, width, height, color, health) {
        super(x, y, width, height, color);
        this.health = health;
    }

    // draw the player on the canvas
    draw(ctx) {
        const opacity = this.health / 100;
        ctx.fillStyle = `rgba(${parseInt(this.color.slice(1, 3), 16)}, ${parseInt(this.color.slice(3, 5), 16)}, ${parseInt(this.color.slice(5, 7), 16)}, ${opacity})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: this.color,
            health: this.health
        };
    }
}