const players = {};
let playerId;
let canvas;
let ctx;

export function initialize(canvasElement) {
    playerId = Math.random().toString(36).substring(2, 15);
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
}

export function addPlayer(id, x, y, color) {
    players[id] = { x, y, color };
}

export function movePlayer(id, direction) {
    const player = players[id];
    if (!player) return;

    const speed = 10;
    switch (direction) {
        case 'ArrowUp':
            player.y = Math.max(0, player.y - speed);
            break;
        case 'ArrowDown':
            player.y = Math.min(canvas.height, player.y + speed);
            break;
        case 'ArrowLeft':
            player.x = Math.max(0, player.x - speed);
            break;
        case 'ArrowRight':
            player.x = Math.min(canvas.width, player.x + speed);
            break;
    }
}

export function renderPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(renderPlayers);
}

export function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
