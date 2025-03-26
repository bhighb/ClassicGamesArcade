// Game instructions for each game
const gameInstructions = {
    snake: `
        <h3>Snake Game Instructions</h3>
        <p>Use the arrow keys to control the snake's direction.</p>
        <p>Eat the food to grow longer and increase your score.</p>
        <p>Avoid hitting the walls or yourself.</p>
        <p>Each food eaten is worth 10 points.</p>
    `,
    tetris: `
        <h3>Tetris Game Instructions</h3>
        <p>Use the arrow keys to move and rotate pieces.</p>
        <p>Left/Right arrows: Move piece horizontally</p>
        <p>Up arrow: Rotate piece</p>
        <p>Down arrow: Move piece down faster</p>
        <p>Space: Drop piece instantly</p>
        <p>Complete lines to score points and clear space.</p>
    `,
    pong: `
        <h3>Pong Game Instructions</h3>
        <p>Player 1: Use W/S keys to move paddle up/down</p>
        <p>Player 2: Use Up/Down arrows to move paddle up/down</p>
        <p>First player to reach 5 points wins!</p>
        <p>Each point is worth 10 points.</p>
    `,
    spaceInvaders: `
        <h3>Space Invaders Game Instructions</h3>
        <p>Use Left/Right arrows to move your ship</p>
        <p>Space to shoot</p>
        <p>Destroy all aliens to win</p>
        <p>Avoid enemy bullets</p>
        <p>Each alien is worth 20 points.</p>
    `,
    pacman: `
        <h3>Pac-Man Game Instructions</h3>
        <p>Use arrow keys to move Pac-Man</p>
        <p>Eat all dots to win</p>
        <p>Avoid ghosts</p>
        <p>Eat power dots to temporarily make ghosts vulnerable</p>
        <p>Each dot is worth 10 points, power dot is 50 points.</p>
    `,
    breakout: `
        <h3>Breakout Game Instructions</h3>
        <p>Use Left/Right arrows to move the paddle</p>
        <p>Break all bricks to win</p>
        <p>Don't let the ball fall below the paddle</p>
        <p>Each brick is worth 10 points.</p>
    `
};

// Game state
let currentGame = null;
let isPaused = false;
let score = 0;

// DOM elements
let gameSelector;
let instructionsDisplay;
let gameArea;
let startButton;
let pauseButton;
let scoreDisplay;

// Game instances
const games = {
    snake: null,
    tetris: null,
    pong: null,
    spaceInvaders: null,
    pacman: null,
    breakout: null
};

// Load game scripts
const gameScripts = {
    snake: 'games/snake.js',
    tetris: 'games/tetris.js',
    pong: 'games/pong.js',
    spaceInvaders: 'games/space-invaders.js',
    pacman: 'games/pacman.js',
    breakout: 'games/breakout.js'
};

// Load all game scripts sequentially
async function loadGameScripts() {
    for (const [gameName, scriptPath] of Object.entries(gameScripts)) {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptPath;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        } catch (error) {
            console.error(`Failed to load ${gameName} script:`, error);
        }
    }
}

function initializeDOM() {
    // Get DOM elements
    gameSelector = document.getElementById('gameSelector');
    instructionsDisplay = document.getElementById('instructionsDisplay');
    gameArea = document.getElementById('gameArea');
    startButton = document.getElementById('startButton');
    pauseButton = document.getElementById('pauseButton');
    scoreDisplay = document.getElementById('score');

    // Add event listeners
    gameSelector.addEventListener('change', handleGameSelection);
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    window.addEventListener('resize', handleWindowResize);

    // Initialize the game scripts
    loadGameScripts().then(() => {
        console.log('All game scripts loaded successfully');
    }).catch(error => {
        console.error('Error loading game scripts:', error);
    });
}

function handleWindowResize() {
    if (currentGame && typeof currentGame.handleResize === 'function') {
        currentGame.handleResize();
    }
}

function handleGameSelection() {
    const selectedGame = gameSelector.value;
    if (selectedGame === '') {
        instructionsDisplay.innerHTML = '';
        gameArea.innerHTML = '<p>Select a game to begin!</p>';
        return;
    }

    // Destroy current game if exists
    if (currentGame) {
        currentGame.destroy();
    }

    // Update instructions
    instructionsDisplay.innerHTML = gameInstructions[selectedGame];

    try {
        // Initialize new game
        switch (selectedGame) {
            case 'snake':
                currentGame = new Snake();
                break;
            case 'tetris':
                currentGame = new Tetris();
                break;
            case 'pong':
                currentGame = new Pong();
                break;
            case 'spaceInvaders':
                currentGame = new SpaceInvaders();
                break;
            case 'pacman':
                currentGame = new Pacman();
                break;
            case 'breakout':
                currentGame = new Breakout();
                break;
        }

        // Initialize the game
        currentGame.init();
    } catch (error) {
        console.error('Error initializing game:', error);
        gameArea.innerHTML = '<p>Error loading game. Please try again.</p>';
    }
}

function startGame() {
    if (currentGame) {
        try {
            currentGame.start();
            startButton.textContent = 'Restart Game';
        } catch (error) {
            console.error('Error starting game:', error);
            gameArea.innerHTML = '<p>Error starting game. Please try again.</p>';
        }
    }
}

function togglePause() {
    if (currentGame) {
        isPaused = !isPaused;
        currentGame.pause(isPaused);
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    }
}

// Global function to update score
window.updateScore = function(points) {
    score += points;
    scoreDisplay.textContent = score;
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeDOM);
