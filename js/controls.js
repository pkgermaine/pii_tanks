import { dataChannel, gameCanvas } from './app.js';
import { players, playerId, bullets } from './game.js';
import { Bullet } from './object.js';

// Track pressed keys
const pressedKeys = new Set();

document.addEventListener('keydown', (event) => {
    pressedKeys.add(event.key.toLowerCase());
    handleMovement();
});

document.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.key.toLowerCase());
});

// code for bullets when space is pressed
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        const player = players[playerId];
        if (!player) return;


        const velocity = { x: 0, y: 0 };
        if (pressedKeys.has('w')) velocity.y = -5; // Up
        if (pressedKeys.has('s')) velocity.y = 5; // Down
        if (pressedKeys.has('a')) velocity.x = -5; // Left
        if (pressedKeys.has('d')) velocity.x = 5; // Right

        const bullet = new Bullet(player.x, player.y, 5, 5, 'red', velocity);


        bullets.push(bullet);
        sendBullet(bullet);
    }
});

// Handle movement logic
function handleMovement() {
    if (!players[playerId]) return;

    const player = players[playerId];
    const speed = 10; // Speed of movement
    let dx = 0; // Change in x-axis
    let dy = 0; // Change in y-axis

    // Check for key combinations
    if (pressedKeys.has('w')) dy -= speed; // Up
    if (pressedKeys.has('s')) dy += speed; // Down
    if (pressedKeys.has('a')) dx -= speed; // Left
    if (pressedKeys.has('d')) dx += speed; // Right

    // Normalize diagonal movement to ensure consistent speed
    if (dx !== 0 && dy !== 0) {
        const normalizationFactor = Math.sqrt(2) / 2;
        dx *= normalizationFactor;
        dy *= normalizationFactor;
    }

    // Update player position with boundaries
    player.x = Math.min(Math.max(0, player.x + dx), gameCanvas.width);
    player.y = Math.min(Math.max(0, player.y + dy), gameCanvas.height);

    sendUpdate(); // Notify peers about the movement
}

export function sendUpdate() {
    if (dataChannel?.readyState === 'open') {
        dataChannel.send(JSON.stringify({ type: 'update', players }));
    }
}

export function sendBullet(bullet) {
    if (dataChannel?.readyState === 'open') {
        dataChannel.send(JSON.stringify({ type: 'bullet', bullet }));
    }
}