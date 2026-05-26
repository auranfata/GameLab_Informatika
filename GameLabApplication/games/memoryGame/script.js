const icons = ["💻","💻","⚙️","⚙️","🖥️","🖥️","🖱️","🖱️","⌨️","⌨️","🤖","🤖","☁️","☁️","🐑","🐑","🐄","🐄","🦆","🦆","🐓","🐓","🧑‍💻","🧑‍💻","⛑️","⛑️","🪛","🪛", "👷‍♂️","👷‍♂️"];
let shuffled = icons.sort(() => 0.5 - Math.random());

const board = document.getElementById("board");
let firstCard = null;
let lockBoard = false;
let score = 0;
let timeLeft = 80;
let timerId;

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const resultMessage = document.getElementById("resultMessage");

// Inisialisasi Board
function initGame() {
  shuffled.forEach(icon => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.icon = icon;
    card.innerHTML = "?";
    board.appendChild(card);

    card.addEventListener("click", () => handleCardClick(card));
  });

  // Start Timer
  timerId = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function handleCardClick(card) {
  if (lockBoard || card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  card.innerHTML = card.dataset.icon;

  if (!firstCard) {
    firstCard = card;
  } else {
    if (firstCard.dataset.icon === card.dataset.icon) {
      // Match
      firstCard.classList.add("matched");
      card.classList.add("matched");
      score += 10;
      scoreDisplay.textContent = score;
      firstCard = null;

      // Cek apakah semua kartu matched
      if (document.querySelectorAll(".matched").length === icons.length) {
        endGame(true);
      }

    } else {
      // Not match
      lockBoard = true;
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        card.classList.remove("flipped");
        firstCard.innerHTML = "?";
        card.innerHTML = "?";
        firstCard = null;
        lockBoard = false;
      }, 800);
    }
  }
}

function endGame(win) {
  clearInterval(timerId);
  if (win) {
    resultMessage.textContent = `🎉 Selamat! Kamu berhasil menyelesaikan game dengan skor ${score}`;
  } else {
    resultMessage.textContent = `⏳ Waktu habis! Skor akhir kamu ${score}`;
  }
  new bootstrap.Modal(document.getElementById("resultModal")).show();
}

initGame();
