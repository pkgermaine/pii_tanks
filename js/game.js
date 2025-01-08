import { sendUpdate } from './utils.js';

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
let players = {};
const playerId = Math.random().toString(36).substring(2, 15);

export function setupDataChannel(channel) {
    channel.onopen = () => {
      console.log('Data channel is open!');
      initializePlayer(channel); // Pass the dataChannel here
    };
  
    channel.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        Object.assign(players, data.players);
      }
    };
  }

export function initializePlayer() {
  players[playerId] = { 
    x: Math.random() * gameCanvas.width, 
    y: Math.random() * gameCanvas.height, 
    color: getRandomColor() 
  };
  console.log(`Player initialized: ${playerId}`, players[playerId]);
  sendUpdate(players, dataChannel);
}



export function handleKeydown(event) {
  if (!players[playerId]) return;

  const player = players[playerId];
  switch (event.key) {
    case 'ArrowUp': player.y -= 10; break;
    case 'ArrowDown': player.y += 10; break;
    case 'ArrowLeft': player.x -= 10; break;
    case 'ArrowRight': player.x += 10; break;
  }
  sendUpdate(players);
}

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

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
