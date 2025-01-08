import { peerConnection, dataChannel, createPeerConnection, setupDataChannel, sendUpdate, gameLoop, players, updatePlayerPosition } from './game.js';

// Section 1: DOM Element References
const createOfferButton = document.getElementById('createOffer');
const joinMatchButton = document.getElementById('joinMatch');
const connectButton = document.getElementById('connect');
const matchCodeField = document.getElementById('matchCode');
const joinCodeField = document.getElementById('joinCode');
const matchmakingSection = document.getElementById('matchmakingSection');
const gameSection = document.getElementById('gameSection');

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const playerId = Math.random().toString(36).substring(2, 15);

// Export canvas context and gameCanvas for rendering
export { ctx, gameCanvas };

// Section 4: View Management
export function showGamePage() {
    matchmakingSection.style.display = 'none';
    gameSection.style.display = 'block';
    setTimeout(gameLoop, 100); // Delay to ensure initialization
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


// Listen for key presses and update player position
document.addEventListener('keydown', (event) => {
    if (!players[playerId]) {
        console.warn('Player not initialized yet.');
        return; // Exit if the player hasn't been initialized
    }

    updatePlayerPosition(playerId, event.key, gameCanvas.width, gameCanvas.height);

    // If necessary, send updates to the peer
    sendUpdate(); // Uncomment if you need to sync movement with peers
});