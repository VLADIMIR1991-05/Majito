const state = {
  phase: "start",
  doubt: 0,
  suspicion: 0,
  memory: 0,
  risk: 0,
  obedience: 3,
  clarisse: 0,
  faber: 0,
  fragments: [],
  found: 0,
  dials: [false, false, false, false, false]
};

const phases = {
  start: {
    chapter: "Prólogo",
    title: "La ciudad que sonaba demasiado alto",
    text: "Eres Montag, bombero de una ciudad donde el fuego no rescata: borra. Esta noche recibes una alarma doméstica. El informe dice que hay libros escondidos. El camión espera con el motor encendido.",
    quote: "Cita breve de Ray Bradbury, Fahrenheit 451: “It was a pleasure to burn.”",
    choices: [
      ["Subir al camión y obedecer", { obedience: 1, risk: 1 }, "raid"],
      ["Guardar silencio y observar a tus compañeros", { doubt: 1 }, "raid"]
    ]
  },
  raid: {
    chapter: "Fase 1",
    title: "Registro en la casa",
    text: "La puerta cede. Hay ceniza vieja en la alfombra, marcas de cuadros retirados y una mesa con cajones cerrados. Encuentra tres escondites antes de decidir qué harás con ellos.",
    mini: "search",
    choices: []
  },
  raidChoice: {
    chapter: "Fase 1",
    title: "La primera página",
    text: "Has encontrado libros, una carta doblada y una página arrancada. Nadie te mira durante unos segundos. Es poco tiempo, pero suficiente para convertir una orden en una elección.",
    choices: [
      ["Quemarlo todo sin leer", { obedience: 2, suspicion: -1, memory: -1 }, "clarisse"],
      ["Ocultar una página bajo el guante", { doubt: 2, memory: 1, risk: 2 }, "clarisse"],
      ["Leer una línea antes de quemar", { doubt: 1, memory: 2, suspicion: 1 }, "clarisse"]
    ]
  },
  clarisse: {
    chapter: "Fase 2",
    title: "La muchacha que hacía preguntas",
    text: "En la calle, Clarisse camina a tu lado sin miedo al uniforme. No te acusa. Eso sería más fácil. Solo pregunta cosas que la ciudad ya no sabe contestar.",
    choices: [
      ["Decirle que la felicidad está en no pensar demasiado", { obedience: 1, clarisse: -1 }, "parlor"],
      ["Preguntarle por qué mira tanto la lluvia", { doubt: 2, clarisse: 2, memory: 1 }, "parlor"],
      ["Advertirle que hablar así es peligroso", { suspicion: -1, risk: 1, clarisse: 1 }, "parlor"]
    ]
  },
  parlor: {
    chapter: "Fase 3",
    title: "Las paredes de la sala",
    text: "En casa, las pantallas hablan por todos. Mildred ríe con una familia que no conoce. Para pensar con claridad, ajusta la señal: enciende los interruptores 2, 3 y 5; apaga los demás.",
    mini: "signal",
    choices: []
  },
  woman: {
    chapter: "Fase 4",
    title: "La biblioteca que no quiso huir",
    text: "Otra llamada. Esta vez la dueña de la casa no suplica. Se queda entre sus libros como si ellos también respiraran. Tus compañeros esperan una orden limpia.",
    quote: "Referencia: Ray Bradbury, Fahrenheit 451. Cita usada de forma breve para prueba privada.",
    choices: [
      ["Intentar convencerla de salir", { doubt: 2, risk: 2, memory: 1 }, "beatty"],
      ["Robar un libro pequeño antes del incendio", { memory: 3, suspicion: 2, risk: 2 }, "beatty"],
      ["Cumplir la orden y mirar al suelo", { obedience: 2, doubt: -1, memory: -1 }, "beatty"]
    ]
  },
  beatty: {
    chapter: "Fase 5",
    title: "El capitán sabe demasiado",
    text: "Beatty no necesita gritar. Cita, sonríe, contradice, rodea. Quiere saber si tu silencio es cansancio o pensamiento. Elige una respuesta que no te destruya todavía.",
    choices: [
      ["Responder con frases de manual", { obedience: 1, suspicion: -2, doubt: -1 }, "faber"],
      ["Admitir que la casa te dejó una imagen clavada", { doubt: 2, suspicion: 2, memory: 1 }, "faber"],
      ["Cambiar el tema hacia los reportes de la noche", { suspicion: -1, risk: 1 }, "faber"]
    ]
  },
  faber: {
    chapter: "Fase 6",
    title: "El oído secreto",
    text: "Un profesor retirado acepta hablar contigo. No promete salvarte. Te ofrece algo más incómodo: aprender a escuchar. Ordena las palabras para formar una idea que puedas memorizar.",
    mini: "words",
    choices: []
  },
  chase: {
    chapter: "Fase 7",
    title: "La persecución",
    text: "La ciudad despierta contra ti. Sirenas, cámaras, vecinos mirando desde paredes iluminadas. Debes cruzar tres calles: cada decisión deja una huella.",
    choices: [
      ["Correr por avenidas iluminadas", { risk: 3, suspicion: 2 }, "ending"],
      ["Bajar por el río y perder el olor del uniforme", { risk: -2, memory: 1 }, "ending"],
      ["Enviar una transmisión anónima antes de huir", { risk: 2, memory: 2, faber: 1 }, "ending"]
    ]
  },
  ending: {
    chapter: "Final",
    title: "",
    text: "",
    choices: [
      ["Jugar otra vez", {}, "reset"]
    ]
  }
};

const el = {
  chapter: document.getElementById("chapter"),
  title: document.getElementById("title"),
  text: document.getElementById("text"),
  quote: document.getElementById("quote"),
  choices: document.getElementById("choices"),
  miniGame: document.getElementById("miniGame"),
  fragments: document.getElementById("fragments"),
  canvas: document.getElementById("scene")
};

document.getElementById("restartBtn").addEventListener("click", resetGame);

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
  state.phase = next;
  render();
}

function render() {
  const phase = phases[state.phase];
  if (state.phase === "ending") setEnding(phase);
  el.chapter.textContent = phase.chapter;
  el.title.textContent = phase.title;
  el.text.innerHTML = phase.text;
  el.quote.textContent = phase.quote || "";
  el.quote.style.display = phase.quote ? "block" : "none";
  renderHud();
  renderFragments();
  renderMini(phase.mini);
  renderChoices(phase.choices);
}

function renderHud() {
  ["doubt", "suspicion", "memory", "risk"].forEach((key) => {
    const val = clamp(state[key]);
    document.getElementById(`${key}Val`).textContent = val;
    document.getElementById(`${key}Bar`).style.transform = `scaleX(${val / 10})`;
  });
}

function renderFragments() {
  el.fragments.innerHTML = "";
  const items = state.fragments.length ? state.fragments : ["Todavía no has conservado nada."];
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
      if (delta.memory > 0) addFragment(label);
      go(next, delta);
    });
    el.choices.appendChild(btn);
  });
}

function describeDelta(delta) {
  const names = { doubt: "duda", suspicion: "sospecha", memory: "memoria", risk: "riesgo", obedience: "obediencia" };
  const parts = Object.entries(delta)
    .filter(([key]) => names[key])
    .map(([key, value]) => `${value > 0 ? "+" : ""}${value} ${names[key]}`);
  return parts.join(" · ") || "Sin cambio inmediato";
}

function renderMini(type) {
  el.miniGame.innerHTML = "";
  if (!type) return;
  if (type === "search") renderSearch();
  if (type === "signal") renderSignal();
  if (type === "words") renderWords();
}

function renderSearch() {
  const labels = ["chimenea", "cajón", "florero", "ventana", "alfombra", "reloj", "marco", "radio", "sillón"];
  const targets = new Set(["cajón", "alfombra", "marco"]);
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
        state.found += 1;
        state.memory = clamp(state.memory + 1);
        addFragment(`Escondite: ${label}`);
        renderHud();
        renderFragments();
        if (state.found >= 3) go("raidChoice", { suspicion: 1 });
      } else if (!targets.has(label)) {
        state.risk = clamp(state.risk + 1);
        renderHud();
      }
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
      const solved = JSON.stringify(state.dials) === JSON.stringify([false, true, true, false, true]);
      if (solved) {
        addFragment("Silencio recuperado entre las pantallas");
        go("woman", { doubt: 1, memory: 1 });
      } else {
        render();
      }
    });
    wrap.appendChild(btn);
  });
  el.miniGame.appendChild(wrap);
}

function renderWords() {
  const target = ["leer", "recordar", "elegir", "actuar"];
  const pool = ["actuar", "obedecer", "leer", "olvidar", "elegir", "recordar"];
  const picked = [];
  const box = document.createElement("div");
  box.className = "search-grid";
  const status = document.createElement("p");
  status.textContent = "Secuencia: ";
  pool.forEach((word) => {
    const btn = document.createElement("button");
    btn.className = "token";
    btn.type = "button";
    btn.textContent = word;
    btn.addEventListener("click", () => {
      if (picked.length >= 4 || btn.classList.contains("found")) return;
      picked.push(word);
      btn.classList.add("found");
      status.textContent = `Secuencia: ${picked.join(" → ")}`;
      if (picked.length === 4) {
        const solved = target.every((word, i) => picked[i] === word);
        if (solved) {
          addFragment("Leer, recordar, elegir, actuar");
          go("chase", { memory: 3, doubt: 1, faber: 2 });
        } else {
          go("chase", { memory: 1, suspicion: 1, risk: 1 });
        }
      }
    });
    box.appendChild(btn);
  });
  el.miniGame.append(status, box);
}

function setEnding(phase) {
  let title = "Ceniza obediente";
  let text = "Sobrevives volviendo al uniforme. La ciudad te premia con ruido, velocidad y una paz que no pregunta nada.";
  if (state.memory >= 8 && state.risk <= 6) {
    title = "El hombre-libro";
    text = "Llegas al margen de la ciudad con suficientes fragmentos para no empezar desde cero. No salvaste todos los libros, pero salvaste una manera de leer el mundo.";
  } else if (state.suspicion >= 7 || state.risk >= 8) {
    title = "La pantalla te alcanza";
    text = "La persecución se vuelve espectáculo. Incluso así, alguien oye una frase antes del corte de transmisión.";
  } else if (state.doubt >= 7) {
    title = "Rebelión silenciosa";
    text = "No hay proclama. Hay una página copiada a mano, una puerta que queda abierta, una pregunta que pasa de boca en boca.";
  } else if (state.obedience >= 7) {
    title = "El fuego continúa";
    text = "Aprendes a no mirar las manos cuando arden. El sistema conserva tu lealtad, pero pierde para siempre tu inocencia.";
  }
  phase.title = title;
  phase.text = `<span class="ending">${text}</span><br><br>Puntuación final: duda ${state.doubt}, sospecha ${state.suspicion}, memoria ${state.memory}, riesgo ${state.risk}.`;
}

function resetGame() {
  Object.assign(state, {
    phase: "start",
    doubt: 0,
    suspicion: 0,
    memory: 0,
    risk: 0,
    obedience: 3,
    clarisse: 0,
    faber: 0,
    fragments: [],
    found: 0,
    dials: [false, false, false, false, false]
  });
  render();
}

const ctx = el.canvas.getContext("2d");
function drawScene(time = 0) {
  const w = el.canvas.width;
  const h = el.canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#15191b");
  gradient.addColorStop(.5, "#22201d");
  gradient.addColorStop(1, "#0b0c0d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#080909";
  for (let i = 0; i < 18; i++) {
    const x = i * 82 - 30;
    const height = 180 + ((i * 47) % 260);
    ctx.fillRect(x, h - height, 58, height);
    ctx.fillStyle = i % 3 === 0 ? "rgba(255,191,105,.16)" : "rgba(46,196,182,.1)";
    ctx.fillRect(x + 14, h - height + 34, 12, 22);
    ctx.fillStyle = "#080909";
  }

  for (let i = 0; i < 70; i++) {
    const x = (i * 97 + time * (0.03 + (i % 5) * 0.01)) % w;
    const y = h - ((i * 53 + time * .045) % h);
    const size = 1 + (i % 4);
    ctx.fillStyle = i % 2 ? "rgba(255,107,53,.75)" : "rgba(255,191,105,.52)";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,107,53,.2)";
  ctx.beginPath();
  ctx.ellipse(w * .7, h * .78, 260 + Math.sin(time * .002) * 18, 90, 0, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(drawScene);
}

render();
drawScene();
