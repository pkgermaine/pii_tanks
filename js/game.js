import { showGamePage, ctx, gameCanvas } from './app.js';

// Section 2: Global Variables
export let peerConnection;
export let dataChannel;
export const players = {}; // Object to track player positions
const playerId = Math.random().toString(36).substring(2, 15); // Unique ID for this player
let config;

// Section 3: Configuration Management
async function loadConfig() {
    try {
        const response = await fetch('credentials.json');
        if (!response.ok) throw new Error('Failed to fetch config');
        config = await response.json();
        console.log('Config loaded:', config);
    } catch (error) {
        console.error('Error loading config:', error);
    }
}
loadConfig(); // Load config on startup



// Section 5: Peer Connection Setup
export function createPeerConnection() {
    peerConnection = new RTCPeerConnection(config);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('New ICE candidate:', event.candidate);
        } else {
            console.log('All ICE candidates sent');
        }
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('Peer connection state:', peerConnection.connectionState);
    };

    peerConnection.ondatachannel = (event) => {
        console.log('Data channel event received:', event);
        setupDataChannel(event.channel);
    };

    console.log('Peer connection created');
}

export function setupDataChannel(channel) {
    dataChannel = channel;

    dataChannel.onopen = () => {
        console.log('Data channel is open!');
        initializePlayer();
        showGamePage();
    };

    dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
            Object.assign(players, data.players); // Merge player data
            console.log('Players updated:', players);
        }
    };
}



// Section 7: Game Logic
function initializePlayer() {
    players[playerId] = {
        x: Math.random() * gameCanvas.width,
        y: Math.random() * gameCanvas.height,
        color: getRandomColor()
    };
    console.log(`Player initialized: ${playerId}`, players[playerId]);
    sendUpdate();
}

//

export function sendUpdate() {
    if (dataChannel?.readyState === 'open') {
        dataChannel.send(JSON.stringify({ type: 'update', players }));
    }
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

// Function to update a player's position
export function updatePlayerPosition(playerId, direction, canvasWidth, canvasHeight) {
    const player = players[playerId];
    if (!player) return;

    switch (direction) {
        case 'ArrowUp':
            player.y = Math.max(0, player.y - 10);
            break;
        case 'ArrowDown':
            player.y = Math.min(canvasHeight, player.y + 10);
            break;
        case 'ArrowLeft':
            player.x = Math.max(0, player.x - 10);
            break;
        case 'ArrowRight':
            player.x = Math.min(canvasWidth, player.x + 10);
            break;
    }
    console.log(`Player moved: ${JSON.stringify(player)}`);
}

// Section 9: Utility Functions
function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
