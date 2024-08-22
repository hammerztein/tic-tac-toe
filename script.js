// Player factory function
const Player = (name, ticker) => {
	// Private score
	let score = 0;

	// Exposed methods
	const getName = () => name;
	const getTicker = () => ticker;
	const getScore = () => score;
	const addScore = () => score++;

	return {
		getName,
		getTicker,
		getScore,
		addScore,
	};
};

const Gameboard = (() => {
	// Store game board
	const board = [];

	// Method to create game board
	const createBoard = () => {
		// Clean up game board
		board.splice(0, board.length);

		for (let i = 1; i <= 9; i++) {
			board.push(null);
		}
	};

	// Method to expose private game board array
	const getBoard = () => board;

	// Methods to move player to specified cell
	const movePlayer = (playerTicker, cell) => {
		// If current cell has value, it is occupied
		if (board[cell] !== null) return;
		// Set current index of array to equal player ticker
		board[cell] = playerTicker;
	};

	return {
		createBoard,
		getBoard,
		movePlayer,
	};
})();

const GameController = (() => {
	// Winning conditions
	const winningConditions = [
		[0, 1, 2], // Top row
		[0, 4, 8], // Diagonal top left to bottom right
		[0, 3, 6], // Left column
		[1, 4, 7], // Middle column
		[2, 4, 6], // Diagonal top right to bottom left
		[2, 5, 8], // Right column
		[3, 4, 5], // Middle row
		[6, 7, 8], // Bottom row
	];

	// Players
	let playerOne = null;
	let playerTwo = null;
	// Store current player
	let activePlayer = playerOne;
	// Store winner
	let winnerText = null;
	// Keep track of game status
	let isGameActive = false;
	// Keep track of rounds
	let round = 0;

	// Methods
	const startGame = (playerOneName, playerTwoName) => {
		// Set game state to active
		isGameActive = true;
		// Create players
		playerOne = Player(playerOneName, 'X');
		playerTwo = Player(playerTwoName, 'O');
		// Set first player as active
		activePlayer = playerOne;
	};

	const switchPlayer = () => {
		activePlayer === playerOne
			? (activePlayer = playerTwo)
			: (activePlayer = playerOne);
	};

	const playTurn = (cell) => {
		// If game is not active return
		if (!isGameActive) return;
		// Print whos turn to the console
		console.log(`It's ${activePlayer.getName()}s turn`);
		// Move player to desired cell
		Gameboard.movePlayer(activePlayer.getTicker(), cell);
		// Print board to the console
		prindBoard();
		// Increment round
		round++;
		// Check for winner
		checkWinner();
		// If no winner found switch players
		switchPlayer();
	};

	// Helper method to help visualize game board
	const prindBoard = () => {
		const board = Gameboard.getBoard();
		console.log(`
		${board[0] || ' '} | ${board[1] || ' '} | ${board[2] || ' '}
		---|---|---
		${board[3] || ' '} | ${board[4] || ' '} | ${board[5] || ' '}
		---|---|---
		${board[6] || ' '} | ${board[7] || ' '} | ${board[8] || ' '}
		`);
	};

	const checkWinner = () => {
		// If board has less than non-empty values there can not be a winner
		if (Gameboard.getBoard().filter((cell) => cell !== null).length < 5) return;
		// If there are no more empty cells it's a tie
		if (Gameboard.getBoard().filter((cell) => cell !== null).length === 9) {
			winnerText = "It's a tie!";
			printWinner();
			return;
		}

		// Find active players positions in the game board
		const activePlayerPositions = findPlayerPositions(activePlayer.getTicker());

		// Loop over winning conditions and find if any of them match
		for (const condition of winningConditions) {
			if (
				condition.every((position) => activePlayerPositions.includes(position))
			) {
				// Increment score
				activePlayer.addScore();
				// Set winner text
				winnerText = `Winner is ${activePlayer.getName()}`;
				// print winner
				printWinner();
			}
		}
	};

	const printWinner = () => {
		console.log(winnerText);
		console.log(
			`${playerOne.getName()} : ${playerOne.getScore()} | ${playerTwo.getName()} : ${playerTwo.getScore()}`,
		);
		isGameActive = false;
	};

	const findPlayerPositions = (playerTicker) => {
		// Array to hold positions
		const positions = [];

		// Find all indexes that match player ticker in the board
		Gameboard.getBoard().forEach((cell, index) => {
			if (cell === playerTicker) {
				positions.push(index);
			}
		});

		return positions;
	};

	// Play next round
	const playNextRound = () => {
		// Set game to be active
		isGameActive = true;
		// Create new board
		Gameboard.createBoard();
	};

	const resetGame = (playerOneName, playerTwoName) => {
		// Set game to be active
		isGameActive = true;
		// Reset round
		round = 0;
		// Create new board
		Gameboard.createBoard();
		// Start game as new
		startGame(playerOneName, playerTwoName);
	};

	//
	const getGameInfo = () => {
		return {
			activePlayer,
			round,
			isGameActive,
		};
	};

	return {
		playTurn,
		startGame,
		playNextRound,
		resetGame,
		getGameInfo,
	};
})();

const DisplayController = (() => {
	// Display modal on the first render of the screen
	const modal = document.querySelector('dialog').showModal();
	// Draw a game board
	const drawBoard = () => {
		const gameboardEl = document.querySelector('#game');
		// Create empty board
		Gameboard.createBoard();
		// Fill UI with cells
		Gameboard.getBoard().forEach((cell, index) => {
			const cellEl = document.createElement('button');
			cellEl.className = 'cell';
			cellEl.dataset.position = index;
			gameboardEl.appendChild(cellEl);
		});
	};

	drawBoard();
})();
