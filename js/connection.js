import { setupDataChannel } from './game.js';
import { getConfig } from './config.js';

let peerConnection;

export function createOffer() {
  const matchCodeField = document.getElementById('matchCode');
  const config = getConfig();

  peerConnection = new RTCPeerConnection(config);
  const dataChannel = peerConnection.createDataChannel('game');
  setupDataChannel(dataChannel);

  peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => {
      return new Promise(resolve => {
        peerConnection.onicecandidate = event => {
          if (!event.candidate) resolve();
        };
      });
    })
    .then(() => {
      const matchCode = btoa(JSON.stringify(peerConnection.localDescription));
      matchCodeField.value = matchCode;
      console.log('Match Code (offer):', matchCode);
    })
    .catch(error => console.error('Error creating offer:', error));
}

export function joinMatch() {
  const joinCodeField = document.getElementById('joinCode');
  const matchCode = joinCodeField.value;
  const config = getConfig();

  if (!matchCode) {
    alert('Please enter a match code');
    return;
  }

  peerConnection = new RTCPeerConnection(config);

  const offerDescription = JSON.parse(atob(matchCode));
  peerConnection.setRemoteDescription(offerDescription)
    .then(() => peerConnection.createAnswer())
    .then(answer => peerConnection.setLocalDescription(answer))
    .then(() => {
      return new Promise(resolve => {
        peerConnection.onicecandidate = event => {
          if (!event.candidate) resolve();
        };
      });
    })
    .then(() => {
      const answerCode = btoa(JSON.stringify(peerConnection.localDescription));
      joinCodeField.value = answerCode;
      console.log('Send this answer back to the host:', answerCode);
    })
    .catch(error => console.error('Error during join process:', error));
}

export function completeConnection() {
  const joinCodeField = document.getElementById('joinCode');
  const answerCode = joinCodeField.value;

  if (!answerCode) {
    alert('Please enter the answer code');
    return;
  }

  const answerDescription = JSON.parse(atob(answerCode));
  peerConnection.setRemoteDescription(answerDescription)
    .then(() => console.log('Remote description set:', peerConnection.remoteDescription))
    .catch(error => console.error('Error completing connection:', error));
}
