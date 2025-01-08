import { dataChannel, gameCanvas } from './app.js';
import { players, playerId, bullets } from './game.js';
import { Bullet } from './object.js';

// Track pressed keys
const pressedKeys = new Set();

document.addEventListener('keydown', (event) => {
    pressedKeys.add(event.key.toLowerCase());
});

document.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.key.toLowerCase());
});

// Handle bullet firing when space is pressed
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

// Update player movement
export function updatePlayerMovement(deltaTime) {
    if (!players[playerId]) return;

    const player = players[playerId];
    const speed = 200; // Speed in pixels per second
    let dx = 0; // Change in x-axis
    let dy = 0; // Change in y-axis

    // Check pressed keys for movement
    if (pressedKeys.has('w')) dy -= speed * (deltaTime / 1000); // Up
    if (pressedKeys.has('s')) dy += speed * (deltaTime / 1000); // Down
    if (pressedKeys.has('a')) dx -= speed * (deltaTime / 1000); // Left
    if (pressedKeys.has('d')) dx += speed * (deltaTime / 1000); // Right

    // Normalize diagonal movement
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

// Send updates to peers
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
