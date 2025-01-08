import { loadConfig } from './config.js';
import { createOffer, joinMatch, completeConnection } from './connection.js';
import { initializePlayer, handleKeydown } from './game.js';

// Element references
const createOfferButton = document.getElementById('createOffer');
const joinMatchButton = document.getElementById('joinMatch');
const connectButton = document.getElementById('connect');
const joinCodeField = document.getElementById('joinCode');

document.addEventListener('keydown', handleKeydown);

// Load configuration
loadConfig();

// Button actions
createOfferButton.onclick = createOffer;
joinMatchButton.onclick = joinMatch;
connectButton.onclick = completeConnection;
