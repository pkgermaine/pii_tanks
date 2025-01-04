// Element references
const createOfferButton = document.getElementById('createOffer');
const joinMatchButton = document.getElementById('joinMatch');
const connectButton = document.getElementById('connect');
const matchCodeField = document.getElementById('matchCode');
const joinCodeField = document.getElementById('joinCode');
const messageSection = document.getElementById('messageSection');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessage');
const messageLog = document.getElementById('messageLog');
const matchmakingSection = document.getElementById('matchmakingSection');
const messagingSection = document.getElementById('messagingSection');

let peerConnection;
let dataChannel;

// STUN Server Configuration for WebRTC
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Utility function to switch views
function showMessagingPage() {
    matchmakingSection.style.display = 'none';
    messagingSection.style.display = 'block';
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

    console.log(`Data channel setup: ${channel.label}`);
    dataChannel.onopen = () => {
        console.log('Data channel is open!');
        logMessage('Connection established. You can now send messages.');
        showMessagingPage(); // Switch to messaging page
    };

    dataChannel.onclose = () => {
        console.log('Data channel has closed.');
        logMessage('Data channel closed.');
    };

    dataChannel.onmessage = (event) => {
        console.log('Message received:', event.data);
        logMessage(`Peer: ${event.data}`);
    };

    // Periodically log the data channel state for debugging
    setInterval(() => {
        console.log(`Data channel current state: ${dataChannel.readyState}`);
    }, 1000);
}

// Log messages in the message log
function logMessage(message) {
    const li = document.createElement('li');
    li.textContent = message;
    messageLog.appendChild(li);
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
        logMessage('Connection established.');
        showMessagingPage(); // Switch to messaging page
    } catch (error) {
        console.error('Error completing connection:', error);
    }
};

// Send a message through the data channel
sendMessageButton.onclick = () => {
    const message = messageInput.value;
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(message);
        logMessage(`You: ${message}`);
        messageInput.value = '';
    } else {
        console.error('Cannot send message, data channel is not open. Current state:', dataChannel ? dataChannel.readyState : 'No data channel');
        alert('Data channel is not open.');
    }
};
