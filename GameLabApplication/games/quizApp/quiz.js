class QuizGame {
  constructor() {
    // 1. Data Pertanyaan
    this.questions = [
      {
        question: "Apa kepanjangan dari CPU?",
        options: ["Central Programming Unit", "Central Processing Unit", "Control Processing Unit", "Central Program Unit"],
        answer: "Central Processing Unit"
      },
      {
        question: "Bahasa pemrograman manakah yang biasa digunakan untuk pengembangan web di sisi klien (frontend)?",
        options: ["Python", "Java", "JavaScript", "C#"],
        answer: "JavaScript"
      },
      {
        question: "Apa fungsi utama dari sistem operasi?",
        options: ["Mengatur perangkat keras dan perangkat lunak", "Menjalankan program antivirus", "Mengedit video", "Menulis dokumen"],
        answer: "Mengatur perangkat keras dan perangkat lunak"
      },
      {
        question: "Istilah 'bug' dalam pemrograman merujuk pada...",
        options: ["Fitur baru", "Error dalam kode", "Nama file", "Database"],
        answer: "Error dalam kode"
      },
      {
        question: "Manakah dari berikut ini yang termasuk sistem operasi open source?",
        options: ["Windows", "macOS", "Linux", "iOS"],
        answer: "Linux"
      }
    ];

    // 2. State Game
    this.currentQuestion = 0;
    this.score = 0;

    // 3. DOM Elements
    this.ui = {
      content: document.getElementById("quiz-content"),
      question: document.getElementById("question"),
      options: document.getElementById("options"),
      feedback: document.getElementById("feedback"),
      nextBtn: document.getElementById("next-btn"),
      result: document.getElementById("quiz-result")
    };

    // 4. Inisialisasi
    this.init();
  }

  init() {
    // Bind event untuk tombol next
    this.ui.nextBtn.addEventListener("click", () => this.handleNext());
    this.showQuestion();
  }

  showQuestion() {
    const q = this.questions[this.currentQuestion];
    
    // Tampilkan teks pertanyaan dengan nomor
    this.ui.question.textContent = `${this.currentQuestion + 1}. ${q.question}`;
    
    // Reset area opsi dan feedback
    this.ui.options.innerHTML = "";
    this.ui.feedback.textContent = "";
    this.ui.feedback.className = "fw-bold mt-3 text-center";
    this.ui.nextBtn.classList.add("d-none"); // Sembunyikan tombol next

    // Buat tombol untuk setiap opsi
    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary fw-semibold p-3 rounded-3 text-start transition";
      btn.textContent = opt;
      btn.onclick = () => this.selectAnswer(btn, opt, q.answer);
      this.ui.options.appendChild(btn);
    });
  }

  selectAnswer(selectedBtn, selectedText, correctAnswer) {
    const isCorrect = selectedText === correctAnswer;

    // Evaluasi semua tombol (Kunci setelah memilih)
    Array.from(this.ui.options.children).forEach(btn => {
      btn.disabled = true; // Matikan klik
      
      // Highlight jawaban yang benar dengan warna hijau
      if (btn.textContent === correctAnswer) {
        btn.classList.replace("btn-outline-primary", "btn-success");
        btn.classList.add("text-white");
      }
    });

    // Beri feedback pada pilihan user
    if (isCorrect) {
      this.score++;
      this.ui.feedback.textContent = "Jawaban benar! 🎉";
      this.ui.feedback.classList.add("text-success");
    } else {
      // Jika salah, ubah tombol yang dipilih jadi merah
      selectedBtn.classList.replace("btn-outline-primary", "btn-danger");
      selectedBtn.classList.add("text-white");
      
      this.ui.feedback.textContent = "Jawaban salah! ❌";
      this.ui.feedback.classList.add("text-danger");
    }

    // Munculkan tombol next
    this.ui.nextBtn.classList.remove("d-none");
  }

  handleNext() {
    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++;
      this.showQuestion();
    } else {
      this.showResult();
    }
  }

  showResult() {
    // Sembunyikan area pertanyaan
    this.ui.content.classList.add("d-none");
    
    const average = this.questions.length / 2;
    const isGood = this.score > average;

    const message = isGood
      ? "<span class='text-success'>Wih pengetahuan kamu tentang informatika bagus, saatnya join ke Teknik Informatika! 🎓</span>"
      : "<span class='text-danger'>Wah pengetahuan kamu tentang informatika kurang ya, ayo join Teknik Informatika agar kamu lebih banyak tahu tentang dunia teknologi! 🚀</span>";

    // Tampilkan hasil akhir
    this.ui.result.innerHTML = `
      <h3 class="fw-bold mb-3">Quiz Selesai!</h3>
      <h1 class="text-primary fw-bold display-4 mb-3">${this.score} / ${this.questions.length}</h1>
      <p class="fs-5">${message}</p>
      <button class="btn btn-primary w-100 mt-4 fw-bold" onclick="location.reload()">
        <i class="fa-solid fa-rotate-right"></i> Main Lagi
      </button>
    `;
  }
}

// Jalankan game saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  new QuizGame();
});