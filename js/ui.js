// DOM Element References
export const matchmakingSection = document.getElementById('matchmakingSection');
export const gameSection = document.getElementById('gameSection');

/**
 * Function to show the game page and hide the matchmaking section.
 */
// Utility function to switch views
export function showGamePage() {
    matchmakingSection.style.display = 'none';
    gameSection.style.display = 'block';
    setTimeout(() => {
      gameLoop(); // Start the game loop slightly later to ensure player initialization
    }, 100);
  }