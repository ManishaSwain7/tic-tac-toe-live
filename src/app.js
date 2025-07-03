const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');
const startButton = document.querySelector('.start-button');
const pauseButton = document.querySelector('.pause-button');
const restartButton = document.querySelector('.restart-button');
const statusMessage = document.querySelector('.status-message');
const modeButtons = document.querySelectorAll('.mode-button');
const timerDisplay = document.getElementById('timer-display');
const generateCodeButton = document.querySelector('.generate-code-button');
const joinSessionButton = document.querySelector('.join-session-button');
const sessionCodeDisplay = document.getElementById('session-code');
const joinCodeInput = document.getElementById('join-code');

let currentPlayer = 'X';
let gameActive = true;
let isPaused = false;
let isPlayerVsComputer = false;
let gameState = ['', '', '', '', '', '', '', '', ''];
let sessionCode = '';

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let moveTimer;
const moveTimeLimit = 5000; // 5 seconds

function handleCellClick(clickedCell, clickedCellIndex) {
    if (gameState[clickedCellIndex] !== '' || !gameActive || isPaused) {
        return;
    }
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    checkResult();
}

function highlightWinningCombination(winningCombination) {
    winningCombination.forEach(index => {
        cells[index].style.border = '3px solid red';
    });
}

function triggerConfetti() {
    const confettiSettings = { target: 'confetti-canvas', props: ['square', 'line'], colors: [[255, 0, 0], [0, 255, 0], [0, 0, 255]] };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        if (gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            highlightWinningCombination([a, b, c]);
            break;
        }
    }

    if (roundWon) {
        statusMessage.textContent = `Player ${currentPlayer} has won!`;
        gameActive = false;
        triggerConfetti();
        return;
    }

    if (!gameState.includes('')) {
        statusMessage.textContent = 'It\'s a draw!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
}

function resetGame() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.border = '';
    });
    currentPlayer = 'X';
    gameActive = true;
    isPaused = false;
    statusMessage.textContent = 'Game restarted!';
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
}

function startMoveTimer() {
    clearTimeout(moveTimer);
    let timeLeft = moveTimeLimit / 1000;
    timerDisplay.textContent = timeLeft;

    const timerInterval = setInterval(() => {
        timeLeft -= 1;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);

    moveTimer = setTimeout(() => {
        clearInterval(timerInterval);
        if (isPlayerVsComputer && currentPlayer === 'O') {
            computerMove();
        } else {
            statusMessage.textContent = `Player ${currentPlayer} ran out of time!`;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            startMoveTimer();
        }
    }, moveTimeLimit);
}

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (gameState[index] === '' && gameActive && !isPaused) {
            clearTimeout(moveTimer);
            gameState[index] = currentPlayer;
            cell.textContent = currentPlayer;
            checkResult();
            if (isPlayerVsComputer && currentPlayer === 'X' && gameActive) {
                currentPlayer = 'O';
                setTimeout(() => {
                    computerMove();
                    startMoveTimer(); // Start timer after computer move
                }, 500);
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                startMoveTimer(); // Start timer after player move
            }
        }
    });
});

function computerMove() {
    if (!gameActive || isPaused) return;

    const emptyCells = gameState.map((val, index) => (val === '' ? index : null)).filter(val => val !== null);
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameState[randomIndex] = 'O';
        cells[randomIndex].textContent = 'O';
        checkResult();
        currentPlayer = 'X';
        startMoveTimer();
    }
}

startButton.addEventListener('click', () => {
    if (!gameActive) {
        resetGame();
    }
    statusMessage.textContent = 'Game started!';
    gameActive = true;
    startMoveTimer();
});

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    statusMessage.textContent = isPaused ? 'Game paused!' : 'Game resumed!';
    if (!isPaused) {
        startMoveTimer();
    } else {
        clearTimeout(moveTimer);
    }
});

restartButton.addEventListener('click', resetGame);

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        isPlayerVsComputer = button.textContent === 'Player vs Computer';
        resetGame();
    });
});

function generateSessionCode() {
    sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    sessionCodeDisplay.textContent = sessionCode;
    // TODO: Send session code to backend to create a new session
    console.log('Session Code Generated:', sessionCode);
}

function joinSession() {
    const enteredCode = joinCodeInput.value.trim();
    if (enteredCode) {
        // TODO: Connect to backend using entered code
        console.log('Joining session with code:', enteredCode);
    } else {
        alert('Please enter a valid session code.');
    }
}

generateCodeButton.addEventListener('click', generateSessionCode);
joinSessionButton.addEventListener('click', joinSession);