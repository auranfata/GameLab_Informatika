  const cells = document.querySelectorAll(".cell");
  const turnIndicator = document.getElementById("turn-indicator");
  const message = document.getElementById("ttt-message");
  const resetButton = document.getElementById("ttt-reset");

  let currentPlayer = "X";
  let board = Array(9).fill("");
  let gameActive = true;

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const moveSound = new Audio("/assets/sounds/ttt_move.wav");
  const winSound = new Audio("/assets/sounds/ttt_win.wav");
  const drawSound = new Audio("/assets/sounds/ttt_draw.wav");

  function checkWinner() {
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        message.textContent = `Pemain ${board[a]} Menang!`;
        winSound.play();
        gameActive = false;
        return;
      }
    }
    if (!board.includes("")) {
      message.textContent = "Seri!";
      drawSound.play();
      gameActive = false;
    }
  }

  function handleClick(e, index) {
    if (!gameActive || board[index] !== "") return;
    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    moveSound.play();
    checkWinner();
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    turnIndicator.textContent = `Giliran: ${currentPlayer}`;
  }

  cells.forEach((cell, i) => {
    cell.addEventListener("click", (e) => handleClick(e, i));
  });

  resetButton.addEventListener("click", () => {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    cells.forEach(cell => cell.textContent = "");
    turnIndicator.textContent = "Giliran: X";
    message.textContent = "";
  });