const state = {
  phase: "start",
  ideas: 0,
  kindness: 0,
  reading: 0,
  bravery: 0,
  pagesFound: 0,
  soundsFound: 0,
  wordsPicked: [],
  dials: [false, false, false, false, false],
  fragments: [],
  soundOn: false,
  audio: null
};

const phases = {
  start: {
    chapter: "Mision 1",
    title: "La biblioteca perdio sus colores",
    text: "En la escuela hay una biblioteca muy especial. Cada libro guarda una idea, una pregunta y una forma de imaginar. Hoy las luces se apagaron y algunos libros quedaron desordenados.",
    goal: "Meta: ayuda a la bibliotecaria Maya a ordenar, leer y compartir los libros.",
    choices: [
      ["Entrar con calma y escuchar a Maya", { ideas: 1, kindness: 1 }, "library"],
      ["Buscar rapido una pista en los estantes", { reading: 1, bravery: 1 }, "library"]
    ]
  },
  library: {
    chapter: "Mision 2",
    title: "Encuentra las paginas perdidas",
    text: "Tres paginas importantes se escondieron entre objetos de la biblioteca. Toca las tarjetas y encuentra: una portada, un mapa y una nota.",
    goal: "Meta: encuentra 3 pistas. Si tocas algo que no ayuda, no pasa nada grave: solo pierdes un poco de tiempo.",
    mini: "search",
    choices: []
  },
  chooseBook: {
    chapter: "Mision 3",
    title: "Elige como cuidar un libro",
    text: "Ya encontraste las paginas. Ahora debes decidir que hacer con el libro abierto sobre la mesa.",
    goal: "Meta: elige una accion respetuosa y util.",
    choices: [
      ["Leer el titulo y devolverlo a su lugar", { reading: 2, ideas: 1 }, "friend"],
      ["Preguntar a un amigo si quiere leer contigo", { kindness: 2, reading: 1 }, "friend"],
      ["Cerrar el libro sin mirar y seguir caminando", { bravery: 1 }, "friend"]
    ]
  },
  friend: {
    chapter: "Mision 4",
    title: "Una pregunta dificil",
    text: "Tu amiga Sofi dice: 'No entiendo esta historia'. Puedes ayudarla de varias maneras.",
    goal: "Meta: demuestra que aprender en equipo es mas facil.",
    choices: [
      ["Explicarle con palabras sencillas", { kindness: 2, ideas: 2 }, "sounds"],
      ["Leer un parrafo juntos y comentar", { kindness: 1, reading: 2 }, "sounds"],
      ["Decirle que pregunte despues", { ideas: 1 }, "sounds"]
    ]
  },
  sounds: {
    chapter: "Mision 5",
    title: "Sonidos de lectura",
    text: "La biblioteca necesita recuperar sus sonidos tranquilos. Encuentra los tres sonidos que ayudan a estudiar.",
    goal: "Meta: toca campana suave, paginas y lapiz.",
    mini: "sounds",
    choices: []
  },
  signal: {
    chapter: "Mision 6",
    title: "Prende las luces correctas",
    text: "Para abrir la sala de cuentos debes encender solo las luces 1, 3 y 5. Las demas deben quedar apagadas.",
    goal: "Meta: toca los interruptores hasta que queden encendidos 1, 3 y 5.",
    mini: "signal",
    choices: []
  },
  words: {
    chapter: "Mision 7",
    title: "Arma una frase poderosa",
    text: "Maya encontro palabras sueltas. Ordenalas para formar una frase que todos puedan recordar.",
    goal: "Meta: toca en orden: leer, pensar, preguntar, compartir.",
    mini: "words",
    choices: []
  },
  finalChoice: {
    chapter: "Mision 8",
    title: "La feria de lectura",
    text: "La escuela preparo una pequena feria. Puedes mostrar lo que aprendiste de una forma especial.",
    goal: "Meta: escoge como compartir tus ideas con la clase.",
    choices: [
      ["Hacer un dibujo del cuento", { ideas: 2, bravery: 1 }, "ending"],
      ["Leer una parte en voz alta", { reading: 2, bravery: 2 }, "ending"],
      ["Invitar a otros a contar que entendieron", { kindness: 2, ideas: 1 }, "ending"]
    ]
  },
  ending: {
    chapter: "Final",
    title: "",
    text: "",
    goal: "",
    choices: [
      ["Jugar otra vez", {}, "reset"]
    ]
  }
};

const el = {
  chapter: document.getElementById("chapter"),
  title: document.getElementById("title"),
  text: document.getElementById("text"),
  goal: document.getElementById("goal"),
  choices: document.getElementById("choices"),
  miniGame: document.getElementById("miniGame"),
  fragments: document.getElementById("fragments"),
  canvas: document.getElementById("scene"),
  soundBtn: document.getElementById("soundBtn")
};

document.getElementById("restartBtn").addEventListener("click", resetGame);
el.soundBtn.addEventListener("click", toggleSound);

function clamp(value) {
  return Math.max(0, Math.min(10, value));
}

function applyDelta(delta) {
  for (const [key, value] of Object.entries(delta)) {
    state[key] = clamp((state[key] || 0) + value);
  }
}

function addFragment(text) {
  if (!state.fragments.includes(text)) state.fragments.push(text);
}

function go(next, delta = {}) {
  if (next === "reset") return resetGame();
  applyDelta(delta);
  playTone(520, .08);
  state.phase = next;
  render();
}

function render() {
  const phase = phases[state.phase];
  if (state.phase === "ending") setEnding(phase);
  el.chapter.textContent = phase.chapter;
  el.title.textContent = phase.title;
  el.text.innerHTML = phase.text;
  el.goal.textContent = phase.goal || "";
  el.goal.style.display = phase.goal ? "block" : "none";
  renderHud();
  renderFragments();
  renderMini(phase.mini);
  renderChoices(phase.choices);
}

function renderHud() {
  ["ideas", "kindness", "reading", "bravery"].forEach((key) => {
    const val = clamp(state[key]);
    document.getElementById(`${key}Val`).textContent = val;
    document.getElementById(`${key}Bar`).style.transform = `scaleX(${val / 10})`;
  });
}

function renderFragments() {
  el.fragments.innerHTML = "";
  const items = state.fragments.length ? state.fragments : ["Aun no hay logros. Empieza la aventura."];
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.fragments.appendChild(li);
  });
}

function renderChoices(choices) {
  el.choices.innerHTML = "";
  choices.forEach(([label, delta, next]) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.innerHTML = `${label}<small>${describeDelta(delta)}</small>`;
    btn.addEventListener("click", () => {
      addFragment(label);
      go(next, delta);
    });
    el.choices.appendChild(btn);
  });
}

function describeDelta(delta) {
  const names = {
    ideas: "ideas claras",
    kindness: "amistad",
    reading: "lectura",
    bravery: "valentia"
  };
  const parts = Object.entries(delta)
    .filter(([key]) => names[key])
    .map(([key, value]) => `${value > 0 ? "+" : ""}${value} ${names[key]}`);
  return parts.join(" | ") || "Vuelve al inicio";
}

function renderMini(type) {
  el.miniGame.innerHTML = "";
  if (!type) return;
  if (type === "search") renderSearch();
  if (type === "sounds") renderSounds();
  if (type === "signal") renderSignal();
  if (type === "words") renderWords();
}

function createStatus(text) {
  const status = document.createElement("p");
  status.className = "mini-status";
  status.textContent = text;
  el.miniGame.appendChild(status);
  return status;
}

function renderSearch() {
  const labels = ["portada", "globo", "mapa", "silla", "nota", "regla", "mochila", "planta", "reloj"];
  const targets = new Set(["portada", "mapa", "nota"]);
  const status = createStatus(`Pistas encontradas: ${state.pagesFound}/3`);
  const grid = document.createElement("div");
  grid.className = "search-grid";
  labels.forEach((label) => {
    const btn = document.createElement("button");
    btn.className = "token";
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      if (targets.has(label) && !btn.classList.contains("found")) {
        btn.classList.add("found");
        state.pagesFound += 1;
        state.reading = clamp(state.reading + 1);
        addFragment(`Pista encontrada: ${label}`);
        playTone(660, .09);
      } else {
        state.ideas = clamp(state.ideas + 1);
        playTone(360, .05);
      }
      status.textContent = `Pistas encontradas: ${state.pagesFound}/3`;
      renderHud();
      renderFragments();
      if (state.pagesFound >= 3) go("chooseBook", { reading: 1 });
    });
    grid.appendChild(btn);
  });
  el.miniGame.appendChild(grid);
}

function renderSounds() {
  const labels = ["campana suave", "grito", "paginas", "trueno", "lapiz", "bocina"];
  const targets = new Set(["campana suave", "paginas", "lapiz"]);
  const status = createStatus(`Sonidos tranquilos: ${state.soundsFound}/3`);
  const grid = document.createElement("div");
  grid.className = "search-grid";
  labels.forEach((label, index) => {
    const btn = document.createElement("button");
    btn.className = "token";
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      if (targets.has(label) && !btn.classList.contains("found")) {
        btn.classList.add("found");
        state.soundsFound += 1;
        state.kindness = clamp(state.kindness + 1);
        addFragment(`Sonido tranquilo: ${label}`);
        playTone(500 + index * 40, .1);
      } else {
        state.bravery = clamp(state.bravery + 1);
        playTone(240, .05);
      }
      status.textContent = `Sonidos tranquilos: ${state.soundsFound}/3`;
      renderHud();
      renderFragments();
      if (state.soundsFound >= 3) go("signal", { kindness: 1 });
    });
    grid.appendChild(btn);
  });
  el.miniGame.appendChild(grid);
}

function renderSignal() {
  const wrap = document.createElement("div");
  wrap.className = "signal";
  state.dials.forEach((on, index) => {
    const btn = document.createElement("button");
    btn.className = `dial ${on ? "on" : ""}`;
    btn.type = "button";
    btn.textContent = index + 1;
    btn.addEventListener("click", () => {
      state.dials[index] = !state.dials[index];
      const solved = JSON.stringify(state.dials) === JSON.stringify([true, false, true, false, true]);
      if (solved) {
        addFragment("Luces correctas: 1, 3 y 5");
        go("words", { ideas: 2, bravery: 1 });
      } else {
        playTone(state.dials[index] ? 440 : 300, .06);
        render();
      }
    });
    wrap.appendChild(btn);
  });
  el.miniGame.appendChild(wrap);
}

function renderWords() {
  const target = ["leer", "pensar", "preguntar", "compartir"];
  const pool = ["compartir", "leer", "guardar", "preguntar", "pensar", "correr"];
  const status = createStatus("Frase: ");
  const box = document.createElement("div");
  box.className = "search-grid";
  pool.forEach((word) => {
    const btn = document.createElement("button");
    btn.className = "token";
    btn.type = "button";
    btn.textContent = word;
    btn.addEventListener("click", () => {
      if (state.wordsPicked.length >= 4 || btn.classList.contains("found")) return;
      state.wordsPicked.push(word);
      btn.classList.add("found");
      status.textContent = `Frase: ${state.wordsPicked.join(" -> ")}`;
      playTone(420 + state.wordsPicked.length * 70, .08);
      if (state.wordsPicked.length === 4) {
        const solved = target.every((item, i) => state.wordsPicked[i] === item);
        if (solved) {
          addFragment("Frase completa: leer, pensar, preguntar, compartir");
          go("finalChoice", { reading: 2, ideas: 2, kindness: 1 });
        } else {
          addFragment("Intento valiente de formar una frase");
          go("finalChoice", { bravery: 2, ideas: 1 });
        }
      }
    });
    box.appendChild(btn);
  });
  el.miniGame.append(status, box);
}

function setEnding(phase) {
  const total = state.ideas + state.kindness + state.reading + state.bravery;
  let title = "Buen aprendiz";
  let text = "Terminaste la aventura y ayudaste a la biblioteca. Aprendiste que leer tambien es preguntar y compartir.";
  if (total >= 25) {
    title = "Gran guardian de los libros";
    text = "La biblioteca recupero sus colores. Tus ideas, tu amistad y tu valentia ayudaron a toda la clase.";
  } else if (state.kindness >= 7) {
    title = "Companero estrella";
    text = "Ayudaste a otros a entender. Cuando una clase aprende unida, todos avanzan mejor.";
  } else if (state.reading >= 7) {
    title = "Explorador de historias";
    text = "Leiste con atencion y encontraste pistas importantes. Cada libro puede abrir una puerta nueva.";
  } else if (state.bravery >= 7) {
    title = "Voz valiente";
    text = "Te animaste a participar. Hablar, preguntar y equivocarse tambien son parte de aprender.";
  }
  phase.title = title;
  phase.text = `<span class="ending">${text}</span><br><br>Puntaje final: ideas ${state.ideas}, amistad ${state.kindness}, lectura ${state.reading}, valentia ${state.bravery}.`;
}

function resetGame() {
  Object.assign(state, {
    phase: "start",
    ideas: 0,
    kindness: 0,
    reading: 0,
    bravery: 0,
    pagesFound: 0,
    soundsFound: 0,
    wordsPicked: [],
    dials: [false, false, false, false, false],
    fragments: []
  });
  render();
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  el.soundBtn.classList.toggle("is-on", state.soundOn);
  el.soundBtn.textContent = state.soundOn ? "♫" : "♪";
  if (state.soundOn) playTone(620, .12);
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
  gradient.addColorStop(0, "#a9def9");
  gradient.addColorStop(.55, "#f7f0c6");
  gradient.addColorStop(1, "#b8e6a3");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#fff7d6";
  ctx.beginPath();
  ctx.arc(w * .82, h * .18, 58 + Math.sin(time * .002) * 3, 0, Math.PI * 2);
  ctx.fill();

  drawSchool(w, h);
  drawTrees(w, h, time);
  drawBooks(w, h, time);
  drawMascot(w, h, time);

  requestAnimationFrame(drawScene);
}

function drawSchool(w, h) {
  ctx.fillStyle = "#ffd6a5";
  ctx.fillRect(w * .56, h * .42, w * .28, h * .28);
  ctx.fillStyle = "#e76f51";
  ctx.beginPath();
  ctx.moveTo(w * .54, h * .42);
  ctx.lineTo(w * .70, h * .30);
  ctx.lineTo(w * .86, h * .42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#457b9d";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(w * (.60 + i * .07), h * .48, 34, 34);
  }
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(w * .68, h * .58, 48, 86);
}

function drawTrees(w, h, time) {
  for (let i = 0; i < 5; i++) {
    const x = w * (.08 + i * .08);
    const y = h * .63 + Math.sin(time * .002 + i) * 2;
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(x, y, 20, 95);
    ctx.fillStyle = i % 2 ? "#52b788" : "#40916c";
    ctx.beginPath();
    ctx.arc(x + 10, y - 8, 48, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBooks(w, h, time) {
  const baseX = w * .17;
  const baseY = h * .78;
  const colors = ["#2f80ed", "#f26b7a", "#7b61ff", "#4caf50", "#ffbe55"];
  colors.forEach((color, i) => {
    ctx.save();
    ctx.translate(baseX + i * 34, baseY + Math.sin(time * .003 + i) * 4);
    ctx.rotate((i - 2) * .08);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 28, 76);
    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.fillRect(6, 12, 16, 5);
    ctx.restore();
  });
}

function drawMascot(w, h, time) {
  const x = w * .42;
  const y = h * .66 + Math.sin(time * .004) * 5;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 62, y - 60, 124, 90);
  ctx.fillStyle = "#2f80ed";
  ctx.fillRect(x - 58, y - 56, 116, 12);
  ctx.fillStyle = "#24313f";
  ctx.beginPath();
  ctx.arc(x - 25, y - 20, 5, 0, Math.PI * 2);
  ctx.arc(x + 25, y - 20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#24313f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y - 12, 22, 0, Math.PI);
  ctx.stroke();
}

render();
drawScene();
