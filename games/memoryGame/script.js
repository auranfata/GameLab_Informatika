class MemoryGame {
  constructor() {
    // 1. Konfigurasi
    this.icons = [
      "💻","💻","⚙️","⚙️","🖥️","🖥️","🖱️","🖱️","⌨️","⌨️",
      "🤖","🤖","☁️","☁️","🐑","🐑","🐄","🐄","🦆","🦆",
      "🐓","🐓","🧑‍💻","🧑‍💻","⛑️","⛑️","🪛","🪛","👷‍♂️","👷‍♂️"
    ];
    this.timeLimit = 80;
    
    // 2. State Game
    this.shuffled = this.icons.sort(() => 0.5 - Math.random());
    this.firstCard = null;
    this.lockBoard = false;
    this.score = 0;
    this.timeLeft = this.timeLimit;
    this.timerId = null;
    this.matchedPairs = 0;
    this.totalPairs = this.icons.length / 2;

    // 3. DOM Elements
    this.board = document.getElementById("board");
    this.scoreDisplay = document.getElementById("score");
    this.timerDisplay = document.getElementById("timer");
    this.resultMessage = document.getElementById("resultMessage");
    this.resultModal = new bootstrap.Modal(document.getElementById("resultModal"));

    // 4. Audio Setup
    this.sounds = {
      flip: new Audio("../../public/assets/collision_sound.wav"),
      match: new Audio("../../public/assets/win_sound.wav"),
      gameOver: new Audio("../../public/assets/game_over_sound.wav")
    };

    // 5. Mulai Game
    this.init();
  }

  playSound(type) {
    if (this.sounds[type]) {
      this.sounds[type].currentTime = 0;
      this.sounds[type].play().catch(() => {});
    }
  }

  init() {
    // Render Board
    this.shuffled.forEach(icon => {
      const card = document.createElement("div");
      card.classList.add("memory-card");
      card.dataset.icon = icon;
      card.innerHTML = "?"; // Tampilan awal (akan ditutup warna font di CSS)
      
      card.addEventListener("click", () => this.handleCardClick(card));
      this.board.appendChild(card);
    });

    // Mulai Timer
    this.timerId = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    this.timeLeft--;
    this.timerDisplay.textContent = this.timeLeft;

    if (this.timeLeft <= 0) {
      this.endGame(false);
    }
  }

  handleCardClick(card) {
    // Cegah klik jika board terkunci, atau kartu yang sama diklik dua kali
    if (this.lockBoard || card.classList.contains("flipped")) return;

    this.playSound("flip");
    card.classList.add("flipped");
    card.innerHTML = card.dataset.icon; // Tampilkan icon sesungguhnya

    if (!this.firstCard) {
      // Kartu pertama yang dibalik
      this.firstCard = card;
    } else {
      // Kartu kedua yang dibalik
      this.checkMatch(card);
    }
  }

  checkMatch(secondCard) {
    const isMatch = this.firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
      this.handleMatch(secondCard);
    } else {
      this.handleMismatch(secondCard);
    }
  }

  handleMatch(secondCard) {
    this.playSound("match");
    this.firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    
    this.score += 10;
    this.scoreDisplay.textContent = this.score;
    this.matchedPairs++;
    this.firstCard = null;

    // Cek kondisi menang
    if (this.matchedPairs === this.totalPairs) {
      this.endGame(true);
    }
  }

  handleMismatch(secondCard) {
    this.lockBoard = true; // Kunci sementara agar tidak bisa klik kartu ke-3
    
    setTimeout(() => {
      this.firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      
      this.firstCard.innerHTML = "?";
      secondCard.innerHTML = "?";
      
      this.firstCard = null;
      this.lockBoard = false;
    }, 800);
  }

  endGame(isWin) {
    clearInterval(this.timerId);
    
    if (isWin) {
      this.playSound("match");
      this.resultMessage.innerHTML = `🎉 Selamat! Kamu menang!<br><span class="text-success fs-5">Skor Akhir: ${this.score}</span>`;
    } else {
      this.playSound("gameOver");
      this.resultMessage.innerHTML = `⏳ Waktu habis!<br><span class="text-danger fs-5">Skor Akhir: ${this.score}</span>`;
    }
    
    this.resultModal.show();
  }
}

// Inisialisasi game setelah halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  new MemoryGame();
});