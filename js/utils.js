export function sendUpdate(players) {
    if (dataChannel && dataChannel.readyState === 'open') {
      const update = { type: 'update', players };
      dataChannel.send(JSON.stringify(update));
    } else {
      console.error('Data channel is not open');
    }
  }
  