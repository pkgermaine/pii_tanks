import { createPeerConnection, setupDataChannel, sendUpdate, gameLoop } from './game.js';

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


document.addEventListener('keydown', (event) => {
    if (!players[playerId]) return;

    const player = players[playerId];
    switch (event.key) {
        case 'ArrowUp':
            player.y = Math.max(0, player.y - 10);
            break;
        case 'ArrowDown':
            player.y = Math.min(gameCanvas.height, player.y + 10);
            break;
        case 'ArrowLeft':
            player.x = Math.max(0, player.x - 10);
            break;
        case 'ArrowRight':
            player.x = Math.min(gameCanvas.width, player.x + 10);
            break;
    }

    sendUpdate();
});