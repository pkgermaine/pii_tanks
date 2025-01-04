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
    console.log('Message received:', data);
    if (data.type === 'update') {
      players = data.players; // Sync player positions
      console.log('Players updated:', players);
    }
  };
}

// Initialize this player's position
function initializePlayer() {
  players[playerId] = { x: Math.random() * gameCanvas.width, y: Math.random() * gameCanvas.height, color: getRandomColor() };
  console.log(`Player initialized: ${playerId}`, players[playerId]);
  sendUpdate();
}

document.addEventListener('keydown', (event) => {
  console.log(`Key pressed: ${event.key}`);
  if (!players[playerId]) {
    console.warn('Player not initialized yet.');
    return;
  }

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
    default:
      return; // Do nothing for other keys
  }

  console.log(`Player moved: ${JSON.stringify(player)}`);
  sendUpdate();
});

// Send player positions to the peer
function sendUpdate() {
  if (dataChannel && dataChannel.readyState === 'open') {
    const update = { type: 'update', players };
    console.log(`Sending update: ${JSON.stringify(update)}`);
    dataChannel.send(JSON.stringify(update));
  } else {
    console.error('Data channel is not open');
  }
}

// Game loop to draw players
function gameLoop() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  console.log(`Rendering players: ${JSON.stringify(players)}`);

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
    await peerConnection.setRemoteDescription(offerDescription);
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
