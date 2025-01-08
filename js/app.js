
import { players, playerId, bullets, gameLoop, initializePlayer } from './game.js';
import { Player } from './object.js';

// Section 1: DOM Element References
const createOfferButton = document.getElementById('createOffer');
const joinMatchButton = document.getElementById('joinMatch');
const connectButton = document.getElementById('connect');
const matchCodeField = document.getElementById('matchCode');
const joinCodeField = document.getElementById('joinCode');
const matchmakingSection = document.getElementById('matchmakingSection');
const gameSection = document.getElementById('gameSection');

export const gameCanvas = document.getElementById('gameCanvas');
export const ctx = gameCanvas.getContext('2d');//

// Section 2: Global Variables
let peerConnection;
export let dataChannel;

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

// Section 4: View Management
function showGamePage() {
    matchmakingSection.style.display = 'none';
    gameSection.style.display = 'block';
    setTimeout(gameLoop, 100); // Delay to ensure initialization
}

// Section 5: Peer Connection Setup
function createPeerConnection() {
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

function setupDataChannel(channel) {
    dataChannel = channel;

    dataChannel.onopen = () => {
        console.log('Data channel is open!');
        initializePlayer();
        showGamePage();
    };

    dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
    
        if (data.type === 'update') {
            const receivedPlayers = {};
            for (const id in data.players) {
                const playerData = data.players[id];
                // Recreate Player instances
                receivedPlayers[id] = new Player(playerData.x, playerData.y, playerData.height, playerData.width, playerData.color, playerData.health);
            }
    
            console.log(receivedPlayers);
            // Merge player data
            Object.assign(players, receivedPlayers);


        }

        if (data.type === 'bullet') {
            const bulletData = data.bullet;
            const bullet = new Bullet(bulletData.x, bulletData.y, bulletData.height, bulletData.width, bulletData.color, bulletData.velocity);
            bullets.push(bullet);
        }
        
    };
    
}

// Section 6: Matchmaking Handlers
createOfferButton.onclick = async () => {
    try {
        createPeerConnection();
        dataChannel = peerConnection.createDataChannel('game');
        setupDataChannel(dataChannel);

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        await new Promise((resolve) => {
            peerConnection.onicecandidate = (event) => {
                if (!event.candidate) resolve();
            };
        });

        const matchCode = btoa(JSON.stringify(peerConnection.localDescription));
        matchCodeField.value = matchCode;
        console.log('Match Code (offer):', matchCode);
    } catch (error) {
        console.error('Error creating offer:', error);
    }
};

joinMatchButton.onclick = async () => {
    try {
        const matchCode = joinCodeField.value;
        if (!matchCode) throw new Error('Please enter a match code');

        const offerDescription = JSON.parse(atob(matchCode));
        createPeerConnection();
        await peerConnection.setRemoteDescription(offerDescription);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        await new Promise((resolve) => {
            peerConnection.onicecandidate = (event) => {
                if (!event.candidate) resolve();
            };
        });

        const answerCode = btoa(JSON.stringify(peerConnection.localDescription));
        joinCodeField.value = answerCode;
        console.log('Answer Code:', answerCode);
    } catch (error) {
        console.error('Error during join process:', error);
    }
};

connectButton.onclick = async () => {
    try {
        const answerCode = joinCodeField.value;
        if (!answerCode) throw new Error('Please enter the answer code');

        const answerDescription = JSON.parse(atob(answerCode));
        await peerConnection.setRemoteDescription(answerDescription);
        console.log('Connection established!');
    } catch (error) {
        console.error('Error completing connection:', error);
    }
};

// Section 7: Game Logic





