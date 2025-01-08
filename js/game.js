import { gameCanvas, ctx } from './app.js';
import { sendUpdate } from './controls.js';

// export players object to be used in webrtc_match.js
export let players = {};
export const playerId = Math.random().toString(36).substring(2, 15); // Unique ID for this player

export function initializePlayer() {
    players[playerId] = {
        x: Math.random() * gameCanvas.width,
        y: Math.random() * gameCanvas.height,
        color: getRandomColor()
    };
    console.log(`Player initialized: ${playerId}`, players[playerId]);
    sendUpdate();
}

// Section 8: Rendering
export function gameLoop() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    Object.values(players).forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
    });
    requestAnimationFrame(gameLoop);
}

// Section 9: Utility Functions
function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}