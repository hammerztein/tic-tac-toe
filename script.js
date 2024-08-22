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
