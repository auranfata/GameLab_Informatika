class BounceBallGame {
  constructor() {
    // 1. Inisialisasi Canvas
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    // 2. Konfigurasi Game (KISS)
    this.config = {
      paddleWidth: 80,
      paddleHeight: 10,
      ballRadius: 8,
      brickRowCount: 5,
      brickColumnCount: 7,
      brickPadding: 5,
      brickHeight: 20
    };
    this.config.brickWidth = (this.canvas.width / this.config.brickColumnCount) - this.config.brickPadding;
    this.config.protectY = 40 + (this.config.brickHeight + this.config.brickPadding) * this.config.brickRowCount + 20;

    // 3. State Game
    this.state = {
      paddleX: (this.canvas.width - this.config.paddleWidth) / 2,
      ballX: this.canvas.width / 2,
      ballY: this.canvas.height / 2,
      ballDX: 4,
      ballDY: -4,
      rightPressed: false,
      leftPressed: false,
      score: 0,
      lives: 3,
      isGameOver: false,
      animationId: null
    };

    // 4. Data
    this.pointBricks = [];
    this.protectBricks = [];

    // 5. DOM Elements
    this.ui = {
      score: document.getElementById("score"),
      lives: document.getElementById("lives"),
      messageBox: document.getElementById("message"),
      resultText: document.getElementById("resultText")
    };

    // 6. Audio Setup (Path Relatif)
    this.sounds = {
      bg: new Audio("../../public/assets/background_music.mp3"),
      collision: new Audio("../../public/assets/collision_sound.wav"),
      gameOver: new Audio("../../public/assets/game_over_sound.wav"),
      win: new Audio("../../public/assets/win_sound.wav"),
      loseLife: new Audio("../../public/assets/lose_life_sound.wav")
    };
    this.sounds.bg.loop = true;
    this.sounds.bg.volume = 0.3;

    // 7. Bind Events & Start
    this.bindEvents();
    this.init();
  }

  // --- INISIALISASI & RESET ---
  init() {
    this.initBricks();
    this.resetBall();
    this.updateScoreUI();
    this.updateLivesUI();
    
    // Pastikan musik diputar (browsers butuh interaksi user dulu biasanya)
    this.sounds.bg.play().catch(() => console.log("Menunggu interaksi user untuk memutar musik"));
    
    this.state.isGameOver = false;
    this.ui.messageBox.classList.add("hidden");
    this.loop();
  }

  initBricks() {
    this.pointBricks = [];
    this.protectBricks = [];

    // Bricks biasa (Bisa dihancurkan)
    for (let row = 0; row < this.config.brickRowCount; row++) {
      for (let col = 0; col < this.config.brickColumnCount; col++) {
        const x = col * (this.config.brickWidth + this.config.brickPadding);
        const y = row * (this.config.brickHeight + this.config.brickPadding) + 40;
        this.pointBricks.push({ x, y, status: true });
      }
    }

    // Bricks Pelindung (Tidak bisa dihancurkan)
    for (let col = 0; col < this.config.brickColumnCount; col++) {
      if (col < 2 || col > 4) {
        const x = col * (this.config.brickWidth + this.config.brickPadding);
        this.protectBricks.push({ x, y: this.config.protectY });
      }
    }
  }

  resetBall() {
    this.state.ballX = this.canvas.width / 2;
    this.state.ballY = this.canvas.height / 2;
    this.state.ballDX = 4 * (Math.random() > 0.5 ? 1 : -1); // Arah awal acak
    this.state.ballDY = -4;
    this.state.paddleX = (this.canvas.width - this.config.paddleWidth) / 2;
  }

  // --- AUDIO HELPER ---
  playSound(type) {
    if (this.sounds[type]) {
      this.sounds[type].currentTime = 0;
      this.sounds[type].play().catch(() => {});
    }
  }

  // --- EVENT LISTENERS ---
  bindEvents() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    if (e.key === "Right" || e.key === "ArrowRight") this.state.rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") this.state.leftPressed = true;
    
    // Restart Game dengan Space
    else if (e.code === "Space" && this.state.isGameOver) {
      this.state.score = 0;
      this.state.lives = 3;
      this.init();
    }
  }

  handleKeyUp(e) {
    if (e.key === "Right" || e.key === "ArrowRight") this.state.rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") this.state.leftPressed = false;
  }

  // --- GAME LOGIC ---
  checkCollisions() {
    const { state, config } = this;

    // Tembok Kiri & Kanan
    if (state.ballX + state.ballDX > this.canvas.width - config.ballRadius || state.ballX + state.ballDX < config.ballRadius) {
      state.ballDX = -state.ballDX;
      this.playSound("collision");
    }
    
    // Atap
    if (state.ballY + state.ballDY < config.ballRadius) {
      state.ballDY = -state.ballDY;
      this.playSound("collision");
    } 
    // Jatuh ke bawah (Kehilangan Nyawa)
    else if (state.ballY + state.ballDY > this.canvas.height - config.ballRadius) {
      state.lives--;
      this.updateLivesUI();
      
      if (state.lives <= 0) {
        this.playSound("gameOver");
        this.endGame(false);
        return;
      } else {
        this.playSound("loseLife");
        this.resetBall();
      }
    }

    // Pantulan Paddle
    const paddleTop = this.canvas.height - config.paddleHeight - 10;
    if (
      state.ballY + config.ballRadius >= paddleTop &&
      state.ballY + config.ballRadius <= paddleTop + config.paddleHeight &&
      state.ballX >= state.paddleX &&
      state.ballX <= state.paddleX + config.paddleWidth
    ) {
      state.ballDY = -state.ballDY;
      this.playSound("collision");
    }

    // Pantulan Bricks (Point)
    this.pointBricks.forEach(b => {
      if (b.status) {
        if (
          state.ballX > b.x && state.ballX < b.x + config.brickWidth &&
          state.ballY > b.y && state.ballY < b.y + config.brickHeight
        ) {
          state.ballDY = -state.ballDY;
          b.status = false;
          state.score += 10;
          this.updateScoreUI();
          this.playSound("collision");
        }
      }
    });

    // Pantulan Bricks (Protect)
    this.protectBricks.forEach(b => {
      if (
        state.ballX > b.x && state.ballX < b.x + config.brickWidth &&
        state.ballY > b.y && state.ballY < b.y + config.brickHeight
      ) {
        state.ballDY = -state.ballDY;
        this.playSound("collision");
      }
    });
  }

  endGame(isWin) {
    this.state.isGameOver = true;
    cancelAnimationFrame(this.state.animationId);
    
    this.sounds.bg.pause();
    this.sounds.bg.currentTime = 0;

    this.ui.resultText.innerText = isWin 
      ? "Menang! 🏆\nWaktunya join ke prodi Teknik Informatika!" 
      : "Game Over! 💀\nMungkin karena kamu belum daftar UMC prodi Teknik Informatika";
    
    this.ui.messageBox.classList.remove("hidden");
  }

  // --- RENDERING ---
  updateScoreUI() {
    this.ui.score.innerText = `Score: ${this.state.score}`;
  }

  updateLivesUI() {
    this.ui.lives.innerHTML = "";
    for (let i = 0; i < this.state.lives; i++) {
      const img = document.createElement("img");
      img.src = "../../public/assets/love.png";
      img.style.width = "20px";
      img.style.marginLeft = "4px";
      this.ui.lives.appendChild(img);
    }
  }

  draw() {
    // Bersihkan Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Gambar Point Bricks
    this.ctx.fillStyle = "#ff4757"; // Merah
    this.pointBricks.forEach(b => {
      if (b.status) this.ctx.fillRect(b.x, b.y, this.config.brickWidth, this.config.brickHeight);
    });

    // Gambar Protect Bricks
    this.ctx.fillStyle = "#2ed573"; // Hijau
    this.protectBricks.forEach(b => {
      this.ctx.fillRect(b.x, b.y, this.config.brickWidth, this.config.brickHeight);
    });

    // Gambar Paddle
    this.ctx.fillStyle = "#0773ff"; // Biru Tema
    this.ctx.fillRect(this.state.paddleX, this.canvas.height - this.config.paddleHeight - 10, this.config.paddleWidth, this.config.paddleHeight);

    // Gambar Bola
    this.ctx.beginPath();
    this.ctx.arc(this.state.ballX, this.state.ballY, this.config.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#fff";
    this.ctx.fill();
    this.ctx.closePath();
  }

  // --- GAME LOOP ---
  loop() {
    if (this.state.isGameOver) return;

    this.checkCollisions();

    // Update Posisi Bola
    this.state.ballX += this.state.ballDX;
    this.state.ballY += this.state.ballDY;

    // Update Posisi Paddle
    if (this.state.rightPressed && this.state.paddleX < this.canvas.width - this.config.paddleWidth) {
      this.state.paddleX += 6;
    }
    if (this.state.leftPressed && this.state.paddleX > 0) {
      this.state.paddleX -= 6;
    }

    // Cek Menang
    if (this.pointBricks.every(b => !b.status)) {
      this.playSound("win");
      this.endGame(true);
      return;
    }

    this.draw();
    this.state.animationId = requestAnimationFrame(() => this.loop());
  }
}

// Inisialisasi Game saat Halaman Dimuat
document.addEventListener("DOMContentLoaded", () => {
  new BounceBallGame();
});