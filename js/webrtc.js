let peerConnection;
let dataChannel;

export function createPeerConnection(config, setupDataChannel) {
    peerConnection = new RTCPeerConnection(config);

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log('New ICE candidate:', event.candidate);
        } else {
            console.log('All ICE candidates sent');
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('Peer connection state:', peerConnection.connectionState);
    };

    peerConnection.ondatachannel = event => {
        setupDataChannel(event.channel);
    };

    return peerConnection;
}

export function createDataChannel(label, setupDataChannel) {
    dataChannel = peerConnection.createDataChannel(label);
    setupDataChannel(dataChannel);
    return dataChannel;
}

export function setRemoteDescription(description) {
    return peerConnection.setRemoteDescription(description);
}

export function getLocalDescription() {
    return peerConnection.localDescription;
}

export function createOffer() {
    return peerConnection.createOffer();
}

export function createAnswer() {
    return peerConnection.createAnswer();
}

export function setLocalDescription(description) {
    return peerConnection.setLocalDescription(description);
}

export function sendData(data) {
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(data));
    } else {
        console.error('Data channel is not open');
    }
}
