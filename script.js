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
		console.log(activePlayer.getTicker(), activePlayer.getName());
		activePlayer === playerOne
			? (activePlayer = playerTwo)
			: (activePlayer = playerOne);
		console.log(activePlayer.getTicker(), activePlayer.getName());
	};

	const playTurn = (cell) => {
		// If game is not active return
		if (!isGameActive) return;
		// Print whos turn to the console
		console.log(`It's ${activePlayer.getName()}s turn`);
		// Move player to desired cell
		Gameboard.movePlayer(activePlayer.getTicker(), cell);
		// Check for winner
		if (checkWinner()) {
			round++;
			isGameActive = false;
			return;
		}
		switchPlayer();
	};

	const checkWinner = () => {
		// If board has less than non-empty values there can not be a winner
		if (Gameboard.getBoard().filter((cell) => cell !== null).length < 5)
			return false;

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
				return true;
			}
		}
		// If there are no more empty cells it's a tie
		if (Gameboard.getBoard().filter((cell) => cell !== null).length === 9) {
			winnerText = "It's a tie!";
			return true;
		}
		return false;
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
			winnerText,
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
	// Cache all DOM elements
	const domElements = {
		modal: {
			container: document.querySelector('dialog'),
			playerOneInput: document.querySelector('dialog #player-one'),
			playerTwoInput: document.querySelector('dialog #player-two'),
			startGameBtn: document.querySelector('dialog form button'),
		},
		game: {
			board: document.querySelector('#game'),
			roundText: document.querySelector('#round-number'),
			playerOneName: document.querySelector('#player-one-name'),
			playerOneScore: document.querySelector('#player-one-score'),
			playerTwoName: document.querySelector('#player-two-name'),
			playerTwoScore: document.querySelector('#player-two-score'),
			gameStatus: document.querySelector('#game-status'),
			nextRoundBtn: document.querySelector('#next-round'),
			restartGameBtn: document.querySelector('#restart-game'),
		},
	};

	// Draw a game board
	const drawBoard = () => {
		// Create empty board
		Gameboard.createBoard();
		// Fill UI with cells
		Gameboard.getBoard().forEach((cell, index) => {
			const cellEl = document.createElement('button');
			cellEl.className = 'cell';
			cellEl.dataset.position = index;
			cellEl.removeAttribute('disabled');
			domElements.game.board.appendChild(cellEl);
		});
	};

	const openModal = () => {
		// Open modal
		domElements.modal.container.showModal();
		// Gather inputs
		domElements.modal.startGameBtn.addEventListener('click', initializeGame);
	};

	// Set player names gathered from modal
	const initializeGame = (e) => {
		e.preventDefault();
		if (
			!domElements.modal.playerOneInput.value ||
			!domElements.modal.playerTwoInput.value
		) {
			return;
		}
		// Set player names
		domElements.game.playerOneName.textContent =
			domElements.modal.playerOneInput.value;
		domElements.game.playerTwoName.textContent =
			domElements.modal.playerTwoInput.value;

		// Set game status
		domElements.game.gameStatus.textContent = '';
		// Set player scores
		domElements.game.playerOneScore.textContent = 0;
		domElements.game.playerTwoScore.textContent = 0;
		// Set round
		domElements.game.roundText.textContent = 1;
		// Empty player inputs
		domElements.modal.playerOneInput.value = '';
		domElements.modal.playerTwoInput.value = '';

		domElements.modal.container.close();
		startGame();
	};

	// Start the game and gather player names
	const startGame = () => {
		drawBoard();
		// Start game
		GameController.startGame(
			domElements.game.playerOneName.textContent,
			domElements.game.playerTwoName.textContent,
		);
		// Attach board event listener
		domElements.game.board.addEventListener('click', playGame);
	};

	const playGame = (e) => {
		// Dont play if game is not active
		if (!GameController.getGameInfo().isGameActive) {
			return;
		}
		const cell = e.target;
		if (!cell.matches('.cell')) return;
		if (cell.textContent !== '') return;
		const position = cell.dataset.position;
		cell.textContent = GameController.getGameInfo().activePlayer.getTicker();
		GameController.playTurn(position);
		// If winner text is true there is a winner
		if (GameController.getGameInfo().winnerText) {
			updateRoundWinUI();
		}
	};

	/*
		Update UI
			Get game info and update UI elements
	*/
	const updateRoundWinUI = () => {
		domElements.game.playerOneScore.textContent =
			GameController.getGameInfo().activePlayer.getScore();
		domElements.game.gameStatus.textContent =
			GameController.getGameInfo().winnerText;
	};

	/*
		Handle event
			Play a round of a game
				Use dataset-position as cell to play round
			Update UI
	*/

	/*
		Round end
			Display winner text and update score for winner 
			Disable all cells
	*/

	/*
		Play next round
			Attach event listener that will play next round
			Redraw board
	*/

	/*
		Restart game
			Get user input via modal
			Close modal
			Call reset game
			Call draw board
	*/

	openModal();
})();
