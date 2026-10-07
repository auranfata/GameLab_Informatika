class TicTacToe {
  constructor() {
    // State Game
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.gameActive = true;
    this.winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Baris
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Kolom
      [0, 4, 8], [2, 4, 6]             // Diagonal
    ];

    // DOM Elements
    this.cells = document.querySelectorAll(".cell");
    this.turnIndicator = document.querySelector("#turn-indicator span");
    this.message = document.getElementById("ttt-message");
    this.resetButton = document.getElementById("ttt-reset");

    // Audio Setup (Sesuaikan path dengan struktur folder public/assets Anda)
    this.sounds = {
      move: new Audio("../../public/assets/collision_sound.wav"),
      win: new Audio("../../public/assets/win_sound.wav"),
      draw: new Audio("../../public/assets/game_over_sound.wav")
    };

    // Inisialisasi Event Listener
    this.init();
  }

  init() {
    this.cells.forEach((cell, index) => {
      cell.addEventListener("click", () => this.handleCellClick(cell, index));
    });
    this.resetButton.addEventListener("click", () => this.resetGame());
  }

  playSound(type) {
    // Reset waktu audio agar bisa diputar berulang dengan cepat
    if (this.sounds[type]) {
      this.sounds[type].currentTime = 0;
      this.sounds[type].play().catch(e => console.log("Audio play prevented:", e));
    }
  }

  handleCellClick(cell, index) {
    // Cegah klik jika game sudah selesai atau kotak sudah terisi
    if (!this.gameActive || this.board[index] !== "") return;

    // Update State
    this.board[index] = this.currentPlayer;
    cell.textContent = this.currentPlayer;
    
    // Beri warna berbeda untuk X dan O (opsional)
    cell.style.color = this.currentPlayer === "X" ? "#0773ff" : "#ff4757";
    
    this.playSound("move");
    this.checkWinner();
  }

  checkWinner() {
    let roundWon = false;
    let winningCells = [];

    // Cek setiap kombinasi kemenangan
    for (let i = 0; i < this.winningCombinations.length; i++) {
      const [a, b, c] = this.winningCombinations[i];
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        roundWon = true;
        winningCells = [a, b, c];
        break;
      }
    }

    if (roundWon) {
      this.message.textContent = `🎉 Pemain ${this.currentPlayer} Menang!`;
      this.message.className = "mb-3 fw-bold text-success";
      this.highlightWinningCells(winningCells);
      this.playSound("win");
      this.gameActive = false;
      return;
    }

    // Cek jika seri (board penuh tanpa pemenang)
    if (!this.board.includes("")) {
      this.message.textContent = "😅 Permainan Seri!";
      this.message.className = "mb-3 fw-bold text-warning";
      this.playSound("draw");
      this.gameActive = false;
      return;
    }

    // Jika game masih lanjut, ganti giliran
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    this.turnIndicator.textContent = this.currentPlayer;
    this.turnIndicator.className = `badge ${this.currentPlayer === "X" ? 'bg-primary' : 'bg-danger'}`;
  }

  highlightWinningCells(cellsArray) {
    cellsArray.forEach(index => {
      this.cells[index].classList.add("win-highlight");
    });
  }

  resetGame() {
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.gameActive = true;
    
    this.turnIndicator.textContent = "X";
    this.turnIndicator.className = "badge bg-primary";
    
    this.message.textContent = "";
    this.message.className = "mb-3 fw-bold";

    this.cells.forEach(cell => {
      cell.textContent = "";
      cell.style.color = ""; // Reset warna spesifik
      cell.classList.remove("win-highlight");
    });
  }
}

// Jalankan game saat DOM sudah siap
document.addEventListener("DOMContentLoaded", () => {
  new TicTacToe();
});