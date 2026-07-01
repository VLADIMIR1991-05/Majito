const state = {
  level: 0,
  score: 0,
  streak: 0,
  hints: 3,
  selected: "",
  wordOrder: [],
  cards: [],
  soundOn: false,
  audio: null
};

const rewards = [
  {
    title: "La ciudad de fuego",
    label: "Carta epica",
    image: "city",
    quote: "It was a pleasure to burn."
  },
  {
    title: "El libro escondido",
    label: "Carta epica",
    image: "book",
    quote: "Una pagina puede despertar una pregunta."
  },
  {
    title: "El rio y la memoria",
    label: "Carta epica",
    image: "river",
    quote: "Recordar tambien es resistir."
  },
  {
    title: "El bombero que duda",
    label: "Carta epica",
    image: "fireman",
    quote: "Pensar cambia el camino."
  }
];

const challenges = [
  {
    type: "crossword",
    chapter: "Reto 1",
    title: "Mini crucigrama de la chispa",
    text: "Llena las casillas con palabras clave del libro. Usa letras mayusculas o minusculas.",
    goal: "Respuestas: FUEGO, LIBRO y MONTAG.",
    hint: "La primera palabra es lo que usan los bomberos en esta historia.",
    words: [
      { answer: "FUEGO", row: 0, col: 1, dir: "across", clue: "Lo que destruye los libros." },
      { answer: "LIBRO", row: 2, col: 0, dir: "across", clue: "Objeto que guarda ideas." },
      { answer: "MONTAG", row: 4, col: 1, dir: "across", clue: "Apellido del protagonista." }
    ]
  },
  {
    type: "quiz",
    chapter: "Reto 2",
    title: "Quiz relampago",
    text: "Marca la respuesta correcta. Este reto mide si entendiste la idea central.",
    goal: "Pregunta: En esta historia, por que son importantes los libros?",
    hint: "Piensa en ideas, memoria y preguntas.",
    answers: [
      "Porque decoran las paredes",
      "Porque guardan ideas y ayudan a pensar",
      "Porque hacen ruido en la ciudad",
      "Porque todos pesan igual"
    ],
    correct: "Porque guardan ideas y ayudan a pensar"
  },
  {
    type: "sentence",
    chapter: "Reto 3",
    title: "Completa la oracion secreta",
    text: "Escribe las palabras que faltan. Las pistas estan debajo.",
    goal: "Oracion: Montag empieza a ___ cuando descubre el valor de los ___.",
    hint: "Las respuestas son acciones e ideas del libro.",
    blanks: ["pensar", "libros"],
    bank: ["correr", "pensar", "libros", "pantallas"]
  },
  {
    type: "image",
    chapter: "Reto 4",
    title: "Senala la pista en la imagen",
    text: "Observa la escena. Hay una pantalla, una llama y un libro escondido.",
    goal: "Toca el libro escondido para salvar la idea.",
    hint: "Busca en el estante de la izquierda.",
    correct: "book"
  },
  {
    type: "order",
    chapter: "Reto 5",
    title: "Ordena la frase clave",
    text: "Toca las palabras en el orden correcto para formar una idea sencilla.",
    goal: "Forma: leer ayuda a pensar",
    hint: "Empieza con una accion que haces con los libros.",
    words: ["pensar", "leer", "ayuda", "a"],
    correct: ["leer", "ayuda", "a", "pensar"]
  },
  {
    type: "quiz",
    chapter: "Reto 6",
    title: "Decision de guardian",
    text: "Elige la accion mas valiente y responsable.",
    goal: "Pregunta: Si alguien no entiende una lectura, que conviene hacer?",
    hint: "La mejor respuesta ayuda a aprender juntos.",
    answers: [
      "Reirse de esa persona",
      "Cambiar de tema siempre",
      "Leer juntos y hacer preguntas",
      "Guardar silencio para no participar"
    ],
    correct: "Leer juntos y hacer preguntas"
  }
];

const el = {
  chapter: document.getElementById("chapter"),
  title: document.getElementById("title"),
  text: document.getElementById("text"),
  goal: document.getElementById("goal"),
  challenge: document.getElementById("challenge"),
  feedback: document.getElementById("feedback"),
  checkBtn: document.getElementById("checkBtn"),
  hintBtn: document.getElementById("hintBtn"),
  cardsList: document.getElementById("cardsList"),
  reward: document.getElementById("reward"),
  rewardImage: document.getElementById("rewardImage"),
  rewardLabel: document.getElementById("rewardLabel"),
  rewardTitle: document.getElementById("rewardTitle"),
  rewardQuote: document.getElementById("rewardQuote"),
  nextBtn: document.getElementById("nextBtn"),
  closeReward: document.getElementById("closeReward"),
  soundBtn: document.getElementById("soundBtn"),
  canvas: document.getElementById("scene")
};

document.getElementById("restartBtn").addEventListener("click", resetGame);
el.soundBtn.addEventListener("click", toggleSound);
el.hintBtn.addEventListener("click", showHint);
el.checkBtn.addEventListener("click", checkCurrent);
el.nextBtn.addEventListener("click", nextChallenge);
el.closeReward.addEventListener("click", nextChallenge);

function render() {
  const item = challenges[state.level];
  if (!item) return renderEnding();

  state.selected = "";
  state.wordOrder = [];
  el.chapter.textContent = item.chapter;
  el.title.textContent = item.title;
  el.text.textContent = item.text;
  el.goal.textContent = item.goal;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.checkBtn.style.display = "inline-block";
  el.hintBtn.style.display = "inline-block";
  el.challenge.innerHTML = "";

  if (item.type === "crossword") renderCrossword(item);
  if (item.type === "quiz") renderQuiz(item);
  if (item.type === "sentence") renderSentence(item);
  if (item.type === "image") renderImageTask();
  if (item.type === "order") renderOrder(item);

  renderHud();
  renderCards();
}

function renderCrossword(item) {
  const grid = document.createElement("div");
  grid.className = "crossword";
  const active = new Map();

  item.words.forEach((word, wordIndex) => {
    [...word.answer].forEach((letter, i) => {
      const row = word.row + (word.dir === "down" ? i : 0);
      const col = word.col + (word.dir === "across" ? i : 0);
      active.set(`${row}-${col}`, { letter, wordIndex });
    });
  });

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const key = `${row}-${col}`;
      const input = document.createElement("input");
      input.maxLength = 1;
      input.className = active.has(key) ? "cell" : "cell empty";
      input.dataset.key = key;
      input.setAttribute("aria-label", active.has(key) ? "Letra del crucigrama" : "Casilla vacia");
      if (!active.has(key)) input.disabled = true;
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase().replace(/[^A-Z]/g, "");
        const inputs = [...document.querySelectorAll(".cell:not(.empty)")];
        const index = inputs.indexOf(input);
        if (input.value && inputs[index + 1]) inputs[index + 1].focus();
      });
      grid.appendChild(input);
    }
  }

  const clues = document.createElement("p");
  clues.className = "mini-status";
  clues.textContent = item.words.map((word, i) => `${i + 1}. ${word.clue}`).join("  ");
  el.challenge.append(grid, clues);
}

function renderQuiz(item) {
  const grid = document.createElement("div");
  grid.className = "quiz-grid";
  item.answers.forEach((answer) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.type = "button";
    btn.textContent = answer;
    btn.addEventListener("click", () => selectButton(btn, answer, ".answer"));
    grid.appendChild(btn);
  });
  el.challenge.appendChild(grid);
}

function renderSentence(item) {
  const box = document.createElement("div");
  box.className = "sentence-box";
  box.innerHTML = 'Montag empieza a <input class="sentence-input" data-answer="pensar" aria-label="Primera palabra"> cuando descubre el valor de los <input class="sentence-input" data-answer="libros" aria-label="Segunda palabra">.';

  const bank = document.createElement("div");
  bank.className = "word-bank";
  item.bank.forEach((word) => {
    const chip = document.createElement("button");
    chip.className = "word-chip";
    chip.type = "button";
    chip.textContent = word;
    chip.addEventListener("click", () => {
      const empty = [...document.querySelectorAll(".sentence-input")].find((input) => !input.value.trim());
      if (empty) empty.value = word;
    });
    bank.appendChild(chip);
  });

  el.challenge.append(box, bank);
}

function renderImageTask() {
  const scene = document.createElement("div");
  scene.className = "image-task";
  scene.innerHTML = '<div class="shelf"></div><div class="screen"></div><button class="book-target" type="button" aria-label="Libro escondido"></button><button class="match" type="button" aria-label="Llama"></button>';
  scene.querySelector(".book-target").addEventListener("click", () => {
    state.selected = "book";
    markImageChoice(".book-target");
  });
  scene.querySelector(".match").addEventListener("click", () => {
    state.selected = "match";
    markImageChoice(".match");
  });
  el.challenge.appendChild(scene);
}

function renderOrder(item) {
  const status = document.createElement("p");
  status.className = "mini-status";
  status.textContent = "Frase: ";
  const bank = document.createElement("div");
  bank.className = "word-bank";
  item.words.forEach((word) => {
    const chip = document.createElement("button");
    chip.className = "word-chip";
    chip.type = "button";
    chip.textContent = word;
    chip.addEventListener("click", () => {
      if (chip.classList.contains("selected")) return;
      chip.classList.add("selected");
      state.wordOrder.push(word);
      status.textContent = `Frase: ${state.wordOrder.join(" ")}`;
      playTone(430 + state.wordOrder.length * 50, .06);
    });
    bank.appendChild(chip);
  });
  el.challenge.append(status, bank);
}

function selectButton(btn, value, selector) {
  document.querySelectorAll(selector).forEach((item) => item.classList.remove("selected"));
  btn.classList.add("selected");
  state.selected = value;
  playTone(420, .05);
}

function markImageChoice(selector) {
  document.querySelectorAll(".book-target,.match").forEach((item) => item.classList.remove("selected"));
  document.querySelector(selector).classList.add("selected");
  playTone(460, .06);
}

function checkCurrent() {
  const item = challenges[state.level];
  let ok = false;

  if (item.type === "crossword") ok = checkCrossword(item);
  if (item.type === "quiz") ok = state.selected === item.correct;
  if (item.type === "sentence") ok = checkSentence();
  if (item.type === "image") ok = state.selected === item.correct;
  if (item.type === "order") ok = item.correct.join(" ") === state.wordOrder.join(" ");

  if (ok) {
    state.score += 1;
    state.streak += 1;
    showFeedback("Correcto. Carta epica desbloqueada.", true);
    unlockReward();
  } else {
    state.streak = 0;
    showFeedback("Casi. Revisa la pista e intenta otra vez.", false);
    playTone(180, .12);
  }
  renderHud();
}

function checkCrossword(item) {
  const values = {};
  document.querySelectorAll(".cell:not(.empty)").forEach((input) => {
    values[input.dataset.key] = input.value.toUpperCase();
  });

  return item.words.every((word) => {
    return [...word.answer].every((letter, i) => {
      const row = word.row + (word.dir === "down" ? i : 0);
      const col = word.col + (word.dir === "across" ? i : 0);
      return values[`${row}-${col}`] === letter;
    });
  });
}

function checkSentence() {
  return [...document.querySelectorAll(".sentence-input")].every((input) => {
    return normalize(input.value) === input.dataset.answer;
  });
}

function normalize(value) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function showFeedback(text, ok) {
  el.feedback.textContent = text;
  el.feedback.className = `feedback ${ok ? "ok" : "bad"}`;
}

function showHint() {
  const item = challenges[state.level];
  if (state.hints <= 0) {
    showFeedback("Ya no quedan pistas. Tu puedes resolverlo.", false);
    return;
  }
  state.hints -= 1;
  showFeedback(`Pista: ${item.hint}`, true);
  renderHud();
}

function unlockReward() {
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  state.cards.push(reward.title);
  el.rewardImage.className = `reward-image ${reward.image}`;
  el.rewardLabel.textContent = reward.label;
  el.rewardTitle.textContent = reward.title;
  el.rewardQuote.textContent = reward.quote;
  el.reward.classList.add("show");
  playTone(740, .12);
  renderCards();
}

function nextChallenge() {
  el.reward.classList.remove("show");
  state.level += 1;
  render();
}

function renderEnding() {
  el.chapter.textContent = "Final";
  el.title.textContent = "Biblioteca encendida";
  el.text.textContent = "Completaste todos los retos. Ahora conoces palabras clave, ideas centrales y escenas importantes de la historia.";
  el.goal.textContent = `Resultado: ${state.score} aciertos y ${state.cards.length} cartas epicas desbloqueadas.`;
  el.challenge.innerHTML = "";
  el.feedback.textContent = "";
  el.checkBtn.style.display = "none";
  el.hintBtn.style.display = "none";
  renderHud();
  renderCards();
}

function renderHud() {
  const max = challenges.length;
  updateMeter("score", state.score, max);
  updateMeter("streak", state.streak, max);
  updateMeter("hints", state.hints, 3);
  updateMeter("level", Math.min(state.level + 1, max), max);
}

function updateMeter(key, value, max) {
  document.getElementById(`${key}Val`).textContent = value;
  document.getElementById(`${key}Bar`).style.transform = `scaleX(${Math.max(0, Math.min(1, value / max))})`;
}

function renderCards() {
  el.cardsList.innerHTML = "";
  const items = state.cards.length ? state.cards : ["Aun no hay cartas. Resuelve un reto."];
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.cardsList.appendChild(li);
  });
}

function resetGame() {
  Object.assign(state, {
    level: 0,
    score: 0,
    streak: 0,
    hints: 3,
    selected: "",
    wordOrder: [],
    cards: []
  });
  el.reward.classList.remove("show");
  render();
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  el.soundBtn.classList.toggle("is-on", state.soundOn);
  if (state.soundOn) playTone(620, .1);
}

function playTone(freq, duration) {
  if (!state.soundOn) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!state.audio) state.audio = new AudioContext();
  const osc = state.audio.createOscillator();
  const gain = state.audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(.045, state.audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, state.audio.currentTime + duration);
  osc.connect(gain);
  gain.connect(state.audio.destination);
  osc.start();
  osc.stop(state.audio.currentTime + duration);
}

const ctx = el.canvas.getContext("2d");

function drawScene(time = 0) {
  const w = el.canvas.width;
  const h = el.canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#171313");
  gradient.addColorStop(.52, "#35160e");
  gradient.addColorStop(1, "#070606");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  drawCity(w, h);
  drawFlames(w, h, time);
  drawAsh(w, h, time);
  requestAnimationFrame(drawScene);
}

function drawCity(w, h) {
  ctx.fillStyle = "#080808";
  for (let i = 0; i < 18; i++) {
    const x = i * 82 - 20;
    const height = 180 + ((i * 53) % 260);
    ctx.fillRect(x, h - height, 58, height);
    ctx.fillStyle = i % 3 === 0 ? "rgba(255,209,102,.18)" : "rgba(46,196,182,.1)";
    ctx.fillRect(x + 14, h - height + 34, 12, 22);
    ctx.fillStyle = "#080808";
  }
}

function drawFlames(w, h, time) {
  for (let i = 0; i < 9; i++) {
    const x = w * (.08 + i * .105);
    const y = h + 10;
    const flameH = 150 + Math.sin(time * .004 + i) * 34;
    const flameW = 72 + (i % 3) * 18;
    const grad = ctx.createRadialGradient(x, y - flameH * .38, 8, x, y - flameH * .42, flameH);
    grad.addColorStop(0, "rgba(255,236,153,.9)");
    grad.addColorStop(.38, "rgba(255,107,53,.72)");
    grad.addColorStop(1, "rgba(232,74,42,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x, y - flameH);
    ctx.bezierCurveTo(x - flameW, y - flameH * .55, x - flameW * .42, y - 20, x, y);
    ctx.bezierCurveTo(x + flameW * .52, y - 20, x + flameW, y - flameH * .55, x, y - flameH);
    ctx.fill();
  }
}

function drawAsh(w, h, time) {
  for (let i = 0; i < 70; i++) {
    const x = (i * 97 + time * (0.025 + (i % 5) * .008)) % w;
    const y = h - ((i * 53 + time * .04) % h);
    const size = 1 + (i % 4);
    ctx.fillStyle = i % 2 ? "rgba(255,107,53,.72)" : "rgba(255,209,102,.52)";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

render();
drawScene();
