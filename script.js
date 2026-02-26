document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const restartBtn = document.getElementById('restartBtn');
    const diffSelect = document.getElementById('difficulty');
    const btnX = document.getElementById('btn-x');
    const btnO = document.getElementById('btn-o');

    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let currentPlayer = 'X';
    let humanPlayer = 'X'; // Default Human
    let aiPlayer = 'O';
    let difficulty = 'impossible';

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // UI Listeners
    restartBtn.addEventListener('click', restartGame);
    diffSelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        restartGame();
    });
    btnX.addEventListener('click', () => setPlayer('X'));
    btnO.addEventListener('click', () => setPlayer('O'));

    function setPlayer(p) {
        humanPlayer = p;
        aiPlayer = (p === 'X') ? 'O' : 'X';
        btnX.classList.toggle('active', p === 'X');
        btnO.classList.toggle('active', p === 'O');
        restartGame();
    }

    function handleCellClick(e) {
        const index = parseInt(e.target.getAttribute('data-index'));

        if (gameState[index] !== '' || !gameActive) return;

        // Human Turn
        makeMove(index, humanPlayer);
        
        if (checkWin(gameState, humanPlayer)) {
            endGame(`You Win! 🎉`);
            return;
        }
        if (checkDraw(gameState)) {
            endGame("Draw! 🤝");
            return;
        }

        // AI Turn
        currentPlayer = aiPlayer;
        status.innerText = "AI Thinking...";
        setTimeout(aiMove, 500); // Delay biar natural
    }

    function aiMove() {
        if (!gameActive) return;

        let bestMove;
        if (difficulty === 'easy') {
            bestMove = getRandomMove();
        } else if (difficulty === 'medium') {
            // 30% chance to make mistake
            if (Math.random() > 0.7) bestMove = getRandomMove();
            else bestMove = getBestMove(gameState, aiPlayer);
        } else {
            // Impossible (Minimax)
            bestMove = getBestMove(gameState, aiPlayer);
        }

        makeMove(bestMove, aiPlayer);

        if (checkWin(gameState, aiPlayer)) {
            endGame("AI Wins! 🤖");
        } else if (checkDraw(gameState)) {
            endGame("Draw! 🤝");
        } else {
            currentPlayer = humanPlayer;
            status.innerText = "Your Turn";
        }
    }

    function makeMove(index, player) {
        gameState[index] = player;
        cells[index].innerText = player;
        cells[index].classList.add(player.toLowerCase());
    }

    function getRandomMove() {
        const available = [];
        gameState.forEach((cell, index) => {
            if (cell === '') available.push(index);
        });
        return available[Math.floor(Math.random() * available.length)];
    }

    function getBestMove(board, player) {
        // Minimax Algorithm
        let bestScore = -Infinity;
        let move;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = player;
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function minimax(board, depth, isMaximizing) {
        if (checkWin(board, aiPlayer)) return 10 - depth;
        if (checkWin(board, humanPlayer)) return depth - 10;
        if (checkDraw(board)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiPlayer;
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = humanPlayer;
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWin(board, player) {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return board[index] === player;
            });
        });
    }

    function checkDraw(board) {
        return board.every(cell => cell !== '');
    }

    function endGame(message) {
        status.innerText = message;
        gameActive = false;
    }

    function restartGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        status.innerText = (humanPlayer === 'X') ? "Your Turn (X)" : "AI's Turn (X)";
        cells.forEach(cell => {
            cell.innerText = '';
            cell.className = 'cell';
            cell.removeEventListener('click', handleCellClick);
            cell.addEventListener('click', handleCellClick);
        });

        // Jika AI jalan duluan (Human pilih O)
        if (humanPlayer === 'O') {
            currentPlayer = aiPlayer;
            setTimeout(aiMove, 500);
        }
    }

    // Initialize
    restartGame();
});