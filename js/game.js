import { gameCanvas, ctx } from './app.js';
import { sendUpdate } from './controls.js';
import { Player, Bullet } from './object.js';

// export players object to be used in webrtc_match.js
export let players = {};
export const playerId = Math.random().toString(36).substring(2, 15); // Unique ID for this player
export let bullets = [];

export function initializePlayer() {

    players[playerId] = new Player(Math.random() * gameCanvas.width, Math.random() * gameCanvas.height, 20, 20, getRandomColor(), 100);
    sendUpdate();
}

// Section 8: Rendering
export function gameLoop() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    Object.values(players).forEach(player => player.draw(ctx));

    // update bullets
    bullets.forEach(bullet => {
        bullet.update();
        bullet.draw(ctx);
    });

    
    requestAnimationFrame(gameLoop);
}

// Section 9: Utility Functions
function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}