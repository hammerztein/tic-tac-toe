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

	const createBoard = () => {
		// Clean up game board
		board.splice(0, board.length);

		for (let i = 1; i <= 9; i++) {
			board.push(null);
		}
	};

	const getBoard = () => board;

	const movePlayer = (playerTicker, cell) => {
		// If current cell has value, it is occupied
		if (board[cell] !== null) return;
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

	let playerOne = null;
	let playerTwo = null;
	let activePlayer = null;
	let isGameActive = false;
	let round = 1;
	let winnerCombo = null;

	const startGame = (playerOneName, playerTwoName) => {
		// Set game state to active
		isGameActive = true;
		// Create players
		playerOne = Player(playerOneName, 'X');
		playerTwo = Player(playerTwoName, 'O');
		// Set first player as active
		activePlayer = playerOne;
		// Set starting round
		round = 1;
		// Reset Combo
		winnerCombo = null;
	};

	const switchPlayer = () => {
		activePlayer === playerOne
			? (activePlayer = playerTwo)
			: (activePlayer = playerOne);
	};

	const playTurn = (cell) => {
		// If game is not active return
		if (!isGameActive) return;
		// Move player to desired cell
		Gameboard.movePlayer(activePlayer.getTicker(), cell);
		if (checkWinner()) {
			isGameActive = false;
			round++;
			activePlayer.addScore();
			return `Winner is ${activePlayer.getName()}`;
		}
		if (checkTie()) {
			isGameActive = false;
			round++;
			return "It's a tie!";
		}
		switchPlayer();
	};

	const checkWinner = () => {
		// If board has less than 5 non-empty values there can not be a winner
		if (Gameboard.getBoard().filter((cell) => cell !== null).length < 5)
			return false;

		// Find active players positions in the game board
		const activePlayerPositions = findPlayerPositions(activePlayer.getTicker());

		// Loop over winning conditions and find if any of them match
		for (const condition of winningConditions) {
			if (
				condition.every((position) => activePlayerPositions.includes(position))
			) {
				// Assign winner combination
				winnerCombo = condition;
				return true;
			}
		}
		return false;
	};

	const checkTie = () => {
		// If there are no more empty cells it's a tie
		if (Gameboard.getBoard().filter((cell) => cell !== null).length === 9) {
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

	const nextRound = () => {
		// Reset game variables
		isGameActive = true;
		activePlayer = playerOne;
		winnerCombo = null;
		Gameboard.createBoard();
	};

	const getGameInfo = () => {
		return {
			winnerCombo,
			activePlayer,
			round,
			isGameActive,
			playerOne,
			playerTwo,
		};
	};

	return {
		playTurn,
		startGame,
		getGameInfo,
		nextRound,
	};
})();

const DisplayController = (() => {
	// DOM
	const modal = document.querySelector('dialog');
	const playerOneInput = modal.querySelector('#player-one');
	const playerTwoInput = modal.querySelector('#player-two');
	const startGameBtn = modal.querySelector('form button');
	const gameboardEl = document.querySelector('#game');
	const playerOneName = document.querySelector('#player-one-name');
	const playerOneScore = document.querySelector('#player-one-score');
	const playerTwoName = document.querySelector('#player-two-name');
	const playerTwoScore = document.querySelector('#player-two-score');
	const playerContainers = document.querySelectorAll('.player');
	const roundNumber = document.querySelector('#round-number');
	const gameStatus = document.querySelector('#game-status');
	const nextRoundBtn = document.querySelector('#next-round');
	const restartBtn = document.querySelector('#restart-game');

	const showModal = () => {
		modal.showModal();
	};

	const startGame = (e) => {
		// Gather player names
		e.preventDefault();
		if (!playerOneInput.value || !playerTwoInput.value) return;
		// Create game
		GameController.startGame(playerOneInput.value, playerTwoInput.value);
		// Set initial Game UI
		setUI();
		// Create board
		Gameboard.createBoard();
		// Draw board
		drawBoard();
		// Clean up inputs
		playerOneInput.value = '';
		playerTwoInput.value = '';
		// Close modal
		modal.close();
	};

	const drawBoard = () => {
		const board = Gameboard.getBoard();
		// If board element not empty, clear it out
		if (gameboardEl.children.length > 0) {
			gameboardEl.textContent = '';
		}
		// Draw board
		board.forEach((cell, index) => {
			const boardTile = document.createElement('button');
			boardTile.className = 'cell';
			// If cell has value, display it
			if (cell) {
				boardTile.textContent = cell;
			}
			boardTile.dataset.position = index;
			gameboardEl.appendChild(boardTile);
		});
	};

	const setUI = () => {
		// Player one is always starting player
		playerContainers[0].classList.add('active');
		playerContainers[1].classList.remove('active');
		nextRoundBtn.textContent = 'Restart Round';
		playerOneName.textContent =
			GameController.getGameInfo().playerOne.getName();
		playerOneName.classList.add('active');
		playerTwoName.textContent =
			GameController.getGameInfo().playerTwo.getName();
		playerOneScore.textContent =
			GameController.getGameInfo().playerOne.getScore();
		playerTwoScore.textContent =
			GameController.getGameInfo().playerTwo.getScore();
		roundNumber.textContent = GameController.getGameInfo().round;
		gameStatus.textContent = `It's ${GameController.getGameInfo().activePlayer.getName()}s turn`;
	};

	const playTurn = (e) => {
		const cell = e.target;
		// Turn validation
		if (!cell.matches('.cell')) return;
		if (!GameController.getGameInfo().isGameActive) return;
		const result = GameController.playTurn(cell.dataset.position);
		// Update board
		drawBoard();
		// If result is true round has been concluded
		if (result) {
			// update Round UI
			updateRoundUI(result);
			highlightWinningCells();
			return;
		}
		// Update turn
		updateTurnUI();
	};

	const highlightWinningCells = () => {
		const cells = gameboardEl.querySelectorAll('.cell');
		GameController.getGameInfo().winnerCombo.forEach((combo) => {
			cells[combo].classList.add('winner');
		});
		// Remove pointer events
		cells.forEach((cell) => cell.classList.add('disabled'));
	};

	const highlightPlayer = () => {
		playerContainers.forEach((container) =>
			container.classList.toggle('active'),
		);
	};

	const updateTurnUI = () => {
		// Display whose turn it is
		gameStatus.textContent = ` It's ${GameController.getGameInfo().activePlayer.getName()}s turn`;
		highlightPlayer();
	};

	const updateRoundUI = (winner) => {
		gameStatus.textContent = winner;
		if (
			GameController.getGameInfo().activePlayer.getName() ===
			playerOneName.textContent
		) {
			playerOneScore.textContent =
				GameController.getGameInfo().activePlayer.getScore();
		} else {
			playerTwoScore.textContent =
				GameController.getGameInfo().activePlayer.getScore();
		}
		nextRoundBtn.textContent = 'Next Round';
	};

	const playNextRound = () => {
		GameController.nextRound();
		drawBoard();
		setUI();
	};

	const restartGame = () => {
		showModal();
	};

	const attachEventListeners = () => {
		startGameBtn.addEventListener('click', startGame);
		gameboardEl.addEventListener('click', playTurn);
		nextRoundBtn.addEventListener('click', playNextRound);
		restartBtn.addEventListener('click', restartGame);
	};

	showModal();
	attachEventListeners();
})();
