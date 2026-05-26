const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 80, paddleHeight = 10;
const ballRadius = 8;
const brickRowCount = 5, brickColumnCount = 7;
const brickPadding = 5;
const brickWidth = canvas.width / brickColumnCount - brickPadding;
const brickHeight = 20;
const protectY = 40 + (brickHeight + brickPadding) * brickRowCount + 20;

let paddleX = (canvas.width - paddleWidth) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDX = 4;
let ballDY = -4;
let rightPressed = false;
let leftPressed = false;
let score = 0;
let lives = 3;
let isGameOver = false;
let isWin = false;

const pointBricks = [];
const protectBricks = [];

const bgMusic = new Audio("/public/assets/background_music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

const collisionSound = new Audio("/public/assets/collision_sound.wav");
const gameOverSound = new Audio("/public/assets/game_over_sound.wav");
const winSound = new Audio("/public/assets/win_sound.wav");
const loseLifeSound = new Audio("/public/assets/lose_life_sound.wav");

function initBricks() {
  pointBricks.length = 0;
  protectBricks.length = 0;
  for (let row = 0; row < brickRowCount; row++) {
    for (let col = 0; col < brickColumnCount; col++) {
      const x = col * (brickWidth + brickPadding);
      const y = row * (brickHeight + brickPadding) + 40;
      pointBricks.push({ x, y, status: true });
    }
  }
  for (let col = 0; col < brickColumnCount; col++) {
    if (col < 2 || col > 4) {
      const x = col * (brickWidth + brickPadding);
      protectBricks.push({ x, y: protectY });
    }
  }
}

function drawBricks() {
  ctx.fillStyle = "red";
  pointBricks.forEach(b => {
    if (b.status) ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
  });
  ctx.fillStyle = "green";
  protectBricks.forEach(b => {
    ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
  });
}

function drawPaddle() {
  ctx.fillStyle = "white";
  ctx.fillRect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function drawLives() {
  const livesDiv = document.getElementById("lives");
  livesDiv.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const img = document.createElement("img");
    img.src = "/public/assets/love.png";
    livesDiv.appendChild(img);
  }
}

function drawScore() {
  document.getElementById("score").innerText = `Score: ${score}`;
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballDY = -ballDY;
}

function gameOver(win) {
  isGameOver = true;
  isWin = win;
  const msg = document.getElementById("message");
  document.getElementById("resultText").innerText = win ? "Kamu Menang! Sekarang waktunya join ke prodi Teknik Informatika" : "Kamu Kalah! Mungkin karena kamu belum daftar ke UMC prodi Teknik Informatika";
  msg.classList.remove("hidden");
  bgMusic.pause();
  bgMusic.currentTime = 0;
  if (win) winSound.play();
  else gameOverSound.play();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawPaddle();
  drawBall();
  drawLives();
  drawScore();

  if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
    ballDX = -ballDX;
    collisionSound.play();
  }
  if (ballY + ballDY < ballRadius) {
    ballDY = -ballDY;
    collisionSound.play();
  } else if (ballY + ballDY > canvas.height - ballRadius) {
    lives--;
    loseLifeSound.play();
    if (!lives) {
      gameOver(false);
      return;
    } else resetBall();
  }

  const paddleTop = canvas.height - paddleHeight - 10;
  if (
    ballY + ballRadius >= paddleTop &&
    ballY + ballRadius <= paddleTop + paddleHeight &&
    ballX >= paddleX &&
    ballX <= paddleX + paddleWidth
  ) {
    ballDY = -ballDY;
    collisionSound.play();
  }

  pointBricks.forEach(b => {
    if (b.status) {
      if (
        ballX > b.x &&
        ballX < b.x + brickWidth &&
        ballY > b.y &&
        ballY < b.y + brickHeight
      ) {
        ballDY = -ballDY;
        b.status = false;
        score += 10;
        collisionSound.play();
      }
    }
  });

  protectBricks.forEach(b => {
    if (
      ballX > b.x &&
      ballX < b.x + brickWidth &&
      ballY > b.y &&
      ballY < b.y + brickHeight
    ) {
      ballDY = -ballDY;
      collisionSound.play();
    }
  });

  ballX += ballDX;
  ballY += ballDY;

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6;
  if (leftPressed && paddleX > 0) paddleX -= 6;

  if (pointBricks.every(b => !b.status)) {
    gameOver(true);
    return;
  }

  requestAnimationFrame(draw);
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  else if (e.code === "Space" && isGameOver) {
    isGameOver = false;
    score = 0;
    lives = 3;
    initBricks();
    document.getElementById("message").classList.add("hidden");
    resetBall();
    bgMusic.play();
    draw();
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

initBricks();
bgMusic.play();
draw();