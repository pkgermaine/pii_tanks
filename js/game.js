import { gameCanvas, ctx } from './app.js';
import { sendUpdate, updatePlayerMovement } from './controls.js';
import { Player, Bullet } from './object.js';

// export players object to be used in webrtc_match.js
export let players = {};
export const playerId = Math.random().toString(36).substring(2, 15); // Unique ID for this player
export let bullets = [];

export function initializePlayer() {

    players[playerId] = new Player(Math.random() * gameCanvas.width, Math.random() * gameCanvas.height, 20, 20, getRandomColor(), 100);
    sendUpdate();
}

let lastTimestamp = 0;
export function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Clear the canvas
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Update player movement
    updatePlayerMovement(deltaTime);

    // Render players
    Object.values(players).forEach(player => player.draw(ctx));

    // Update and render bullets
    bullets.forEach(bullet => {
        bullet.update();
        bullet.draw(ctx);
    });

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Section 9: Utility Functions
function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}