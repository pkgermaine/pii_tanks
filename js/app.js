import { loadConfig } from './config.js';
import { createPeerConnection, createDataChannel, createOffer, createAnswer, setLocalDescription, setRemoteDescription, sendData } from './webrtc.js';
import { initialize, addPlayer, movePlayer, renderPlayers, players, playerId } from './game.js';
import { encodeData, decodeData } from './utils.js';////

const createOfferButton = document.getElementById('createOffer');
const joinMatchButton = document.getElementById('joinMatch');
const connectButton = document.getElementById('connect');
const matchCodeField = document.getElementById('matchCode');
const joinCodeField = document.getElementById('joinCode');
const matchmakingSection = document.getElementById('matchmakingSection');
const gameSection = document.getElementById('gameSection');
const gameCanvas = document.getElementById('gameCanvas');

let config;

async function initializeApp() {
    config = await loadConfig();

    initialize(gameCanvas);
    renderPlayers();

    createOfferButton.onclick = async () => {
        const peerConnection = createPeerConnection(config, setupDataChannel);

        const dataChannel = createDataChannel('game', setupDataChannel);
        const offer = await createOffer();
        await setLocalDescription(offer);

        await new Promise(resolve => (peerConnection.onicecandidate = event => event.candidate || resolve()));
        matchCodeField.value = encodeData(peerConnection.localDescription);
    };

    joinMatchButton.onclick = async () => {
        const offerDescription = decodeData(joinCodeField.value);
        const peerConnection = createPeerConnection(config, setupDataChannel);

        await setRemoteDescription(offerDescription);
        const answer = await createAnswer();
        await setLocalDescription(answer);

        await new Promise(resolve => (peerConnection.onicecandidate = event => event.candidate || resolve()));
        joinCodeField.value = encodeData(peerConnection.localDescription);
    };

    connectButton.onclick = async () => {
        const answerDescription = decodeData(joinCodeField.value);
        await setRemoteDescription(answerDescription);
    };

    document.addEventListener('keydown', event => {
        movePlayer(playerId, event.key);
        sendData({ type: 'update', players });
    });
}

// Handles UI transition to the game page and starts the game loop
function showGamePage() {
    matchmakingSection.style.display = 'none'; // Hide matchmaking section
    gameSection.style.display = 'block'; // Show game section

    console.log('Switched to the game page.'); // Debugging output

    setTimeout(() => {
        renderPlayers(); // Start the game rendering loop
    }, 100); // Delay to ensure player initialization//
}

function setupDataChannel(channel) {
    channel.onopen = () => {
        console.log('Data channel is open!');
        showGamePage(); // Transition to the game page
    };

    channel.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
            for (const id in data.players) {
                if (!players[id]) {
                    addPlayer(id, data.players[id].x, data.players[id].y, data.players[id].color);
                }
            }
        }
    };
}


initializeApp();
