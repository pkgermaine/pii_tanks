// Element references
const createOfferButton = document.getElementById('createOffer');
const joinMatchButton = document.getElementById('joinMatch');
const connectButton = document.getElementById('connect');
const matchCodeField = document.getElementById('matchCode');
const joinCodeField = document.getElementById('joinCode');
const matchmakingSection = document.getElementById('matchmakingSection');
const gameSection = document.getElementById('gameSection');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

let peerConnection;
let dataChannel;
let players = {}; // Object to track player positions
const playerId = Math.random().toString(36).substring(2, 15); // Unique ID for this player

// STUN Server Configuration for WebRTC
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Utility function to switch views
function showGamePage() {
  matchmakingSection.style.display = 'none';
  gameSection.style.display = 'block';
  gameLoop();
}

// Create a new WebRTC peer connection
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(config);

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('New ICE candidate:', event.candidate);
    } else {
      console.log('All ICE candidates sent');
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === 'failed') {
      console.error('ICE connection failed. Check network or signaling setup.');
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log('Peer connection state:', peerConnection.connectionState);
  };

  // Handle incoming data channel
  peerConnection.ondatachannel = (event) => {
    console.log('Data channel event received:', event);
    const channel = event.channel;
    setupDataChannel(channel);
  };

  console.log('Peer connection created');
}

function setupDataChannel(channel) {
  dataChannel = channel;

  dataChannel.onopen = () => {
    console.log('Data channel is open!');
    showGamePage();
    initializePlayer();
  };

  dataChannel.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'update') {
      players = data.players; // Sync player positions
    }
  };
}

// Initialize this player's position
function initializePlayer() {
  players[playerId] = { x: Math.random() * 800, y: Math.random() * 600, color: getRandomColor() };
  sendUpdate();
}

// Handle player movement
document.addEventListener('keydown', (event) => {
  if (!players[playerId]) return;

  const player = players[playerId];
  if (event.key === 'ArrowUp') player.y -= 10;
  if (event.key === 'ArrowDown') player.y += 10;
  if (event.key === 'ArrowLeft') player.x -= 10;
  if (event.key === 'ArrowRight') player.x += 10;

  sendUpdate();
});

// Send player positions to the peer
function sendUpdate() {
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(JSON.stringify({ type: 'update', players }));
  }
}

// Game loop to draw players
function gameLoop() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  for (const id in players) {
    const player = players[id];
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(gameLoop);
}

// Utility to get random color
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// Create and share an offer
createOfferButton.onclick = async () => {
  try {
    createPeerConnection();
    dataChannel = peerConnection.createDataChannel('game');
    setupDataChannel(dataChannel);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Wait for ICE candidates to be gathered
    await new Promise((resolve) => {
      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log('All ICE candidates gathered');
          resolve();
        }
      };
    });

    // Encode offer as a match code
    const matchCode = btoa(JSON.stringify(peerConnection.localDescription));
    matchCodeField.value = matchCode;
    console.log('Match Code (offer):', matchCode);
  } catch (error) {
    console.error('Error creating offer:', error);
  }
};

// Join using a match code
joinMatchButton.onclick = async () => {
  const matchCode = joinCodeField.value;
  if (!matchCode) {
    alert('Please enter a match code');
    return;
  }

  try {
    // Decode the host's match code
    const offerDescription = JSON.parse(atob(matchCode));
    console.log('Decoded offer description:', offerDescription);

    createPeerConnection();
    await peerConnection.setRemoteDescription(offerDescription); // Set the host's offer
    console.log('Remote description set:', peerConnection.remoteDescription);

    // Generate an answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log('Generated answer SDP:', peerConnection.localDescription);

    // Wait for ICE candidates to be gathered
    await new Promise((resolve) => {
      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log('All ICE candidates gathered');
          resolve();
        }
      };
    });

    // Encode the answer as a match code
    const answerCode = btoa(JSON.stringify(peerConnection.localDescription));
    console.log('Send this answer back to the host:', answerCode);
    joinCodeField.value = answerCode; // Display the answer code
  } catch (error) {
    console.error('Error during join process:', error);
  }
};

// Complete the connection
connectButton.onclick = async () => {
  const answerCode = joinCodeField.value;
  if (!answerCode) {
    alert('Please enter the answer code');
    return;
  }

  try {
    // Decode the joiner's answer code
    const answerDescription = JSON.parse(atob(answerCode));
    console.log('Decoded answer description:', answerDescription);

    await peerConnection.setRemoteDescription(answerDescription);
    console.log('Remote description (answer) set:', peerConnection.remoteDescription);
  } catch (error) {
    console.error('Error completing connection:', error);
  }
};