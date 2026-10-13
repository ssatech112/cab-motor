const ARTS = {
  maniac: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M8 42 H28 L46 34 L68 20 H112 L132 30 L156 24 L176 16 L188 24 L194 36 V42 H172 L166 46 H150 L144 42 H58 L52 46 H34 L28 42 Z"></path><path class="glass" d="M72 23 H108 L124 31 L64 33 Z"></path><path d="M150 24 L176 16 L184 25 L156 28 Z"></path><circle class="wheel" cx="46" cy="44" r="9"></circle><circle class="wheel" cx="158" cy="44" r="9"></circle></svg>`,
  gt3: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M6 44 L14 36 H36 L52 24 C64 14 86 14 102 20 L128 32 H168 L188 36 L194 44 H176 L170 48 H152 L146 44 H56 L50 48 H30 Z"></path><path class="glass" d="M58 24 H96 L112 33 L50 34 Z"></path><circle class="wheel" cx="44" cy="45" r="9"></circle><circle class="wheel" cx="162" cy="45" r="9"></circle></svg>`,
  v8: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M4 44 L12 34 H78 L92 18 H128 L146 32 H188 L196 44 H174 L168 48 H150 L144 44 H58 L52 48 H28 Z"></path><path class="glass" d="M96 21 H124 L140 32 L88 33 Z"></path><circle class="wheel" cx="42" cy="45" r="10"></circle><circle class="wheel" cx="160" cy="45" r="10"></circle></svg>`,
  v12: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M8 46 L22 38 L48 28 L96 18 H132 L168 30 L192 38 L196 46 H170 L164 49 H148 L142 46 H60 L54 49 H36 Z"></path><path class="glass" d="M70 26 H118 L136 34 L62 36 Z"></path><circle class="wheel" cx="48" cy="46" r="8"></circle><circle class="wheel" cx="156" cy="46" r="8"></circle></svg>`,
  hellcat: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M4 44 L14 32 H70 L86 18 H132 L150 32 H190 L196 44 H172 L166 48 H148 L142 44 H60 L54 48 H30 Z"></path><path class="glass" d="M92 21 H126 L142 32 L84 33 Z"></path><path d="M96 18 L108 8 H124 L132 18 Z"></path><circle class="wheel" cx="42" cy="45" r="10"></circle><circle class="wheel" cx="158" cy="45" r="10"></circle></svg>`,
  hearse: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M14 48 V18 H118 L146 30 H184 L190 48 H168 L162 52 H146 L140 48 H62 L56 52 H36 Z"></path><path class="glass" d="M22 22 H110 V32 H20 Z"></path><circle class="wheel" cx="48" cy="48" r="8"></circle><circle class="wheel" cx="156" cy="48" r="8"></circle></svg>`,
  zen: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M16 42 C28 30 52 24 100 24 C154 24 180 32 190 42 H168 L162 46 H146 L140 42 H62 L56 46 H36 Z"></path><path class="glass" d="M62 28 H138 C146 28 154 32 158 36 H48 C52 31 56 28 62 28 Z"></path><circle class="wheel" cx="52" cy="43" r="8"></circle><circle class="wheel" cx="152" cy="43" r="8"></circle></svg>`,
  rally: `<svg viewBox="0 0 200 56" aria-hidden="true"><path d="M8 44 L16 34 H40 L58 18 H108 L132 30 H156 L178 22 L192 34 V44 H170 L164 48 H148 L142 44 H58 L52 48 H30 Z"></path><path class="glass" d="M64 21 H104 L122 31 L56 32 Z"></path><circle cx="24" cy="30" r="4"></circle><circle cx="36" cy="30" r="4"></circle><circle class="wheel" cx="46" cy="45" r="9"></circle><circle class="wheel" cx="156" cy="45" r="9"></circle></svg>`,
};

const $ = (id) => document.getElementById(id);

const state = {
  carId: "maniac",
  pinned: PINNED_IDS.slice(),
  engine: false,
  crank: 0,
  mode: "gps",
  unit: "kmh",
  volume: 1,
  intensity: 0.5,
  character: 0.75,
  crackle: 0.3,
  speed: 0,
  gpsSpeed: 0,
  gpsOk: false,
  gpsState: "off",
  throttle: 0,
  soundThrottle: 0.08,
  gas: 0,
  brake: 0,
  hold: false,
  rev: false,
  gear: 0,
  rpm: 0,
  shiftLeft: 0,
  shiftDur: 0.22,
  shiftFrom: 0,
  shiftCooldown: 0,
  limit: false,
  overrun: false,
  prevSpeed: 0,
  demo: false,
  demoT: 0,
  watchId: null,
  lastGps: null,
  lastStamp: 0,
  audioError: "",
};

const ui = {
  lastRpmText: "",
  lastSpeedText: "",
  lastGear: "",
  shifting: false,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem("cabmotor-local") || localStorage.getItem("teslasound-local") || "{}";
    const saved = JSON.parse(raw);
    if (saved.carId && carById(saved.carId)) state.carId = saved.carId;
    if (Array.isArray(saved.pinned) && saved.pinned.length === 6) state.pinned = saved.pinned;
    if (saved.unit === "mph" || saved.unit === "kmh") state.unit = saved.unit;
    if (typeof saved.volume === "number") state.volume = saved.volume;
    if (typeof saved.intensity === "number") state.intensity = saved.intensity;
    if (typeof saved.character === "number") state.character = saved.character;
    if (typeof saved.crackle === "number") state.crackle = saved.crackle;
    if (saved.mode === "test" || saved.mode === "gps") state.mode = saved.mode;
  } catch (_) { /* preferencias vacías */ }
}

function savePrefs() {
  try {
  localStorage.setItem("cabmotor-local", JSON.stringify({
    carId: state.carId,
    pinned: state.pinned,
    unit: state.unit,
    volume: state.volume,
    intensity: state.intensity,
    character: state.character,
    crackle: state.crackle,
    mode: state.mode,
  }));
  } catch (_) { /* el navegador puede bloquear el almacenamiento */ }
}

function car() {
  return carById(state.carId);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function polar(frac, radius) {
  const angle = (135 + 270 * frac) * (Math.PI / 180);
  return [200 + radius * Math.cos(angle), 200 + radius * Math.sin(angle)];
}

function arc(from, to, radius) {
  const [x0, y0] = polar(from, radius);
  const [x1, y1] = polar(to, radius);
  const large = to - from > 0.5 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

function buildTach() {
  $("tachTrack").setAttribute("d", arc(0, 1, 168));
  $("tachValue").setAttribute("d", arc(0, 1, 168));
  const ticks = $("tachTicks");
  ticks.replaceChildren();
  for (let i = 0; i <= 20; i++) {
    const frac = i / 20;
    const major = i % 2 === 0;
    const [x1, y1] = polar(frac, 168);
    const [x2, y2] = polar(frac, major ? 150 : 158);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toFixed(2));
    line.setAttribute("y1", y1.toFixed(2));
    line.setAttribute("x2", x2.toFixed(2));
    line.setAttribute("y2", y2.toFixed(2));
    line.setAttribute("class", major ? "tick major" : "tick");
    line.dataset.index = String(i);
    ticks.appendChild(line);
    if (major) {
      const [lx, ly] = polar(frac, 128);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", lx.toFixed(2));
      text.setAttribute("y", ly.toFixed(2));
      text.setAttribute("class", "tick-label");
      text.dataset.index = String(i);
      text.textContent = String(i / 2);
      ticks.appendChild(text);
    }
  }
  paintRedline();
}

function paintRedline() {
  const frac = clamp(car().redline / car().gaugeMax, 0.05, 0.98);
  $("tachRed").setAttribute("d", arc(frac, 1, 168));
  document.querySelectorAll("#tachTicks .tick, #tachTicks .tick-label").forEach((node) => {
    const index = Number(node.dataset.index);
    const at = index / 20;
    node.classList.toggle("red", at >= frac - 0.001 && node.classList.contains("tick"));
    if (node.classList.contains("tick-label")) node.classList.toggle("red", at >= frac - 0.001);
  });
}

function renderPicker() {
  const picker = $("carPicker");
  picker.replaceChildren();
  state.pinned.forEach((id) => {
    const item = carById(id);
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", id === state.carId ? "true" : "false");
    button.innerHTML = `${ARTS[item.id] || ARTS.maniac}<span class="pick-name">${item.name}</span>`;
    button.addEventListener("click", () => selectCar(id));
    picker.appendChild(button);
  });
  const more = document.createElement("button");
  more.type = "button";
  more.className = "pick-all";
  more.innerHTML = `<span class="all-plus">+</span><span class="pick-name">Ver todos<small>${GARAGE.length} coches</small></span>`;
  more.addEventListener("click", openGarage);
  picker.appendChild(more);
}

function renderGarage() {
  const grid = $("allCars");
  grid.replaceChildren();
  GARAGE.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "all-car";
    button.setAttribute("aria-pressed", item.id === state.carId ? "true" : "false");
    button.innerHTML = `${ARTS[item.id] || ARTS.maniac}<span class="all-name">${item.name}</span><span class="all-tag">${item.tag}</span>`;
    button.addEventListener("click", () => {
      selectCar(item.id);
      closeGarage();
    });
    grid.appendChild(button);
  });
}

function selectCar(id) {
  state.carId = id;
  if (!state.pinned.includes(id)) {
    state.pinned = state.pinned.slice();
    state.pinned[state.pinned.length - 1] = id;
  }
  state.gear = 0;
  state.shiftLeft = 0;
  $("carName").textContent = car().name;
  $("carTag").textContent = car().tag;
  paintRedline();
  renderPicker();
  savePrefs();
  applyEngineConfig();
  pushAudio();
}

function openGarage() {
  renderGarage();
  $("modal").hidden = false;
}

function closeGarage() {
  $("modal").hidden = true;
}

function displaySpeed(kmh) {
  return state.unit === "mph" ? kmh * 0.621371 : kmh;
}

function rpmAt(speed, gearIndex) {
  const current = car();
  const ratio = current.ratios[clamp(gearIndex, 0, current.ratios.length - 1)];
  return speed * ratio * current.rpmPerKmh;
}

function setStatus(text, kind) {
  const node = $("status");
  node.textContent = text || "";
  node.className = "status" + (kind ? " " + kind : "");
}

function updateChips() {
  const gps = $("chipGps");
  const engine = $("chipEngine");
  const gpsCopy = {
    off: ["GPS off", "bad"],
    wait: ["Buscando GPS", "wait"],
    ok: ["GPS listo", "ok"],
    weak: ["GPS débil", "wait"],
    denied: ["GPS bloqueado", "bad"],
    test: ["Modo prueba", "ok"],
  };
  const [label, tone] = state.mode === "test" ? gpsCopy.test : (gpsCopy[state.gpsState] || gpsCopy.off);
  gps.textContent = label;
  gps.dataset.state = tone;
  if (!state.engine) {
    engine.textContent = "Motor off";
    engine.dataset.state = "bad";
  } else if (state.crank > 0.05) {
    engine.textContent = "Arrancando";
    engine.dataset.state = "wait";
  } else {
    engine.textContent = "En marcha";
    engine.dataset.state = "ok";
  }
}

function applySlidersFromState() {
  $("vol").value = String(Math.round(state.volume * 100));
  $("intensity").value = String(Math.round(state.intensity * 100));
  $("character").value = String(Math.round(state.character * 100));
  $("crackle").value = String(Math.round(state.crackle * 100));
  $("volOut").textContent = `${$("vol").value}%`;
  $("intOut").textContent = `${$("intensity").value}%`;
  $("charOut").textContent = `${$("character").value}%`;
  $("crackOut").textContent = `${$("crackle").value}%`;
  const mph = state.unit === "mph";
  $("unitKmh").setAttribute("aria-checked", mph ? "false" : "true");
  $("unitMph").setAttribute("aria-checked", mph ? "true" : "false");
  $("unit").textContent = mph ? "mph" : "km/h";
  document.body.classList.toggle("mode-demo", state.mode === "test");
  $("modeGps").setAttribute("aria-checked", state.mode === "gps" ? "true" : "false");
  $("modeTest").setAttribute("aria-checked", state.mode === "test" ? "true" : "false");
}

function bindSlider(id, outId, key) {
  $(id).addEventListener("input", () => {
    const value = Number($(id).value);
    state[key] = value / 100;
    $(outId).textContent = `${value}%`;
    if (key === "volume" && state.engine) setMasterVolume(state.volume);
    savePrefs();
  });
}

function setMode(mode) {
  state.mode = mode;
  state.demo = false;
  $("demoBtn").classList.remove("running");
  $("demoBtn").textContent = "Recorrido demo";
  if (mode === "test") {
    stopGps();
    state.gpsState = "off";
    setStatus("Prueba sin mover el coche. Pisa el gas o lanza el recorrido.");
  } else if (state.engine) {
    startGps();
  }
  applySlidersFromState();
  savePrefs();
  updateChips();
  diagnose();
}

function setUnit(unit) {
  state.unit = unit;
  applySlidersFromState();
  savePrefs();
}

async function toggleEngine() {
  if (state.engine) {
    state.engine = false;
    state.crank = 0;
    state.demo = false;
    state.rev = false;
    state.rpm = 0;
    state.soundThrottle = 0;
    state.throttle = 0;
    $("demoBtn").classList.remove("running");
    stopGps();
    pushAudio();
    stopEngineAudio();
    paintStart();
    updateChips();
    return;
  }
  try {
    await ensureAudio();
    setMasterVolume(state.volume);
    state.engine = true;
    state.crank = 1;
    state.rpm = 180;
    state.audioError = "";
    setStatus(state.mode === "gps" ? "Motor en marcha. El GPS marca las vueltas." : "Motor en marcha. Pisa el gas.");
    if (state.mode === "gps") startGps();
  } catch (error) {
    state.engine = false;
    state.audioError = error && error.message ? error.message : "No se pudo arrancar el audio.";
    setStatus(state.audioError, "error");
  }
  paintStart();
  updateChips();
  diagnose();
}

function paintStart() {
  $("startBtn").classList.toggle("on", state.engine);
  $("startLabel").textContent = state.engine ? "Parar motor" : "Arrancar motor";
}

function startGps() {
  if (!navigator.geolocation) {
    state.gpsState = "denied";
    setStatus("Este navegador no da la ubicación. Usa el modo prueba.", "warn");
    updateChips();
    return;
  }
  if (state.watchId != null) return;
  state.gpsState = "wait";
  updateChips();
  state.watchId = navigator.geolocation.watchPosition(
    (pos) => onGps(pos),
    (error) => {
      if (state.mode !== "gps" || !state.engine) return;
      state.gpsOk = false;
      state.gpsState = error.code === 1 ? "denied" : "weak";
      const text = error.code === 1
        ? "Ubicación bloqueada. En el candado de la barra, permite la ubicación, o cambia a Prueba."
        : "Sin señal GPS todavía. Espera un momento o usa Prueba.";
      setStatus(text, error.code === 1 ? "error" : "warn");
      updateChips();
      diagnose();
    },
    { enableHighAccuracy: true, maximumAge: 250, timeout: 8000 }
  );
}

function stopGps() {
  if (state.watchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(state.watchId);
  }
  state.watchId = null;
  state.lastGps = null;
  state.gpsOk = false;
  if (state.mode === "gps") state.gpsState = "off";
}

function onGps(pos) {
  if (state.mode !== "gps" || !state.engine) return;
  const coords = pos.coords;
  const stamp = pos.timestamp || performance.now();
  let next = null;
  if (typeof coords.speed === "number" && coords.speed >= 0 && !Number.isNaN(coords.speed)) {
    next = coords.speed * 3.6;
  } else if (state.lastGps && stamp > state.lastStamp) {
    const dt = (stamp - state.lastStamp) / 1000;
    const dist = haversine(state.lastGps, coords);
    if (dt > 0.2 && dt < 5) next = (dist / dt) * 3.6;
  }
  state.lastGps = { latitude: coords.latitude, longitude: coords.longitude };
  state.lastStamp = stamp;
  if (next == null || next > 280) {
    state.gpsState = "weak";
    updateChips();
    return;
  }
  const accuracy = coords.accuracy || 999;
  state.gpsOk = true;
  state.gpsState = accuracy > 40 ? "weak" : "ok";
  const jump = Math.abs(next - state.gpsSpeed);
  if (jump < 50) state.gpsSpeed = next;
  if (state.engine && state.mode === "gps") setStatus("");
  updateChips();
  diagnose();
}

function haversine(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const lat1 = a.latitude * rad;
  const lat2 = b.latitude * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function demoSpeed(t, top) {
  let speed = 0;
  if (t < 1.2) speed = 0;
  else if (t < 7) speed = ((t - 1.2) / 5.8) * Math.min(80, top);
  else if (t < 11) speed = Math.min(80, top) + ((t - 7) / 4) * Math.min(50, Math.max(0, top - 80));
  else if (t < 13.5) speed = Math.min(top, 130);
  else if (t < 18) speed = Math.min(top, 130) * (1 - (t - 13.5) / 4.5);
  else speed = 0;
  return clamp(speed, 0, top);
}

function stepDrive(dt) {
  const current = car();
  if (!state.engine) {
    state.speed = Math.max(0, state.speed - 40 * dt);
    state.throttle = 0;
    state.soundThrottle = 0;
    state.demo = false;
    return;
  }
  if (state.mode === "test") {
    if (state.demo) {
      state.demoT += dt;
      const target = demoSpeed(state.demoT, current.topKmh);
      state.speed += (target - state.speed) * Math.min(1, dt * 2.2);
      state.throttle = target > state.prevSpeed + 0.4 ? 0.75 : target < state.speed - 0.2 ? 0.05 : 0.22;
      if (state.demoT > 19) {
        state.demo = false;
        $("demoBtn").classList.remove("running");
        $("demoBtn").textContent = "Recorrido demo";
      }
    } else {
      const gas = state.gas;
      const brake = state.brake;
      if (state.hold && gas < 0.22) {
        state.throttle = 0.2;
      } else if (gas > 0.04) {
        const effort = clamp((gas - 0.12) / 0.88, 0, 1);
        const pull = current.pull * (0.65 + state.intensity * 0.7) * effort;
        const drag = 1 - state.speed / (current.topKmh * 1.15);
        state.speed += pull * Math.max(0.25, drag) * dt;
        state.throttle = 0.25 + effort * 0.75;
      } else {
        state.throttle = 0.08;
        state.speed -= (1.6 + state.speed * 0.035) * dt;
      }
      if (brake > 0.02) {
        state.speed -= brake * (36 + state.speed * 0.25) * dt;
        state.throttle = 0.02;
      }
      state.speed = clamp(state.speed, 0, current.topKmh);
    }
  } else {
    const follow = 1 - Math.exp(-dt / 0.45);
    state.speed += (state.gpsSpeed - state.speed) * follow;
    const accel = (state.speed - state.prevSpeed) / Math.max(dt, 0.016);
    const gain = 16 * (1.35 - state.intensity * 0.7);
    const rawThrottle = clamp(accel / gain, 0, 1);
    state.throttle += (rawThrottle - state.throttle) * Math.min(1, dt * 8);
    if (accel > -1.5 && state.speed > 6) state.throttle = Math.max(state.throttle, 0.1);
    if (state.speed < 1) state.throttle = 0.08;
  }

  if (state.rev && state.speed < 4) state.soundThrottle = 1;
  else state.soundThrottle = state.throttle;
}

function stepGear(dt) {
  const current = car();
  state.shiftCooldown = Math.max(0, state.shiftCooldown - dt);
  if (state.shiftLeft > 0) state.shiftLeft = Math.max(0, state.shiftLeft - dt);

  if (!state.engine || state.speed < 1.2) {
    state.gear = 0;
    return;
  }

  if (current.kind === "ev") {
    state.gear = 0;
    return;
  }

  const up = current.redline * (0.68 + state.intensity * 0.26);
  const down = up * 0.58;
  let gear = state.gear;
  const rpm = rpmAt(state.speed, gear);
  const lug = rpm < current.idle * 1.4 && state.speed > 2;
  if ((state.shiftCooldown <= 0 || lug) && state.shiftLeft <= 0) {
    if (gear < current.gears - 1 && rpm >= up && state.soundThrottle > 0.18) {
      beginShift(gear + 1, current.manual);
    } else if (gear > 0 && rpm <= down && rpmAt(state.speed, gear - 1) < up * 0.92) {
      beginShift(gear - 1, false);
      if (lug) state.shiftCooldown = 0.12;
    }
  }
}

function beginShift(next, manual) {
  state.shiftFrom = state.rpm;
  state.gear = next;
  state.shiftDur = manual ? 0.34 : 0.2;
  state.shiftLeft = state.shiftDur;
  state.shiftCooldown = manual ? 0.48 : 0.36;
  ui.shifting = true;
  pushClick(manual ? 1 : 0.72);
}

function stepRpm(dt) {
  const current = car();
  if (state.crank > 0) state.crank = Math.max(0, state.crank - dt / 0.7);

  if (!state.engine) {
    const k = 1 - Math.exp(-dt / 0.25);
    state.rpm += (0 - state.rpm) * k;
    state.limit = false;
    return;
  }

  let target;
  const slip = clamp(state.speed / 14, 0, 1);
  const coupled = rpmAt(state.speed, state.gear);
  const blip = current.idle + state.soundThrottle * (current.redline * 0.55 - current.idle);

  if (state.speed < 1.4) {
    const idleHunt = Math.sin(performance.now() / 450) * 28 + Math.sin(performance.now() / 180) * 12;
    target = state.rev || state.soundThrottle > 0.35 ? blip : current.idle + idleHunt;
  } else {
    target = coupled * slip + Math.max(current.idle, blip) * (1 - slip);
  }

  if (state.shiftLeft > 0 && state.speed > 1.4) {
    const u = 1 - state.shiftLeft / state.shiftDur;
    if (current.manual && u < 0.4) target = Math.min(current.redline, state.shiftFrom * 1.03);
    else target = state.shiftFrom + (Math.max(current.idle, coupled) - state.shiftFrom) * clamp((u - (current.manual ? 0.4 : 0)) / 0.7, 0, 1);
  }

  state.limit = target >= current.redline * 0.985 && state.soundThrottle > 0.45;
  target = clamp(target, current.kind === "ev" ? 0 : 0, current.redline);
  const tau = state.shiftLeft > 0 ? 0.05 : 0.09;
  state.rpm += (target - state.rpm) * (1 - Math.exp(-dt / tau));
}

function gearLabel() {
  const current = car();
  if (!state.engine) return "–";
  if (current.kind === "ev") return state.speed < 1 ? "P" : "D";
  if (state.speed < 1.2) return "N";
  return String(state.gear + 1);
}

function pushAudio() {
  if (!state.engine) {
    pushEngine({
      rpm: 0,
      load: 0,
      overrun: 0,
      cut: 0,
      character: state.character,
      crackle: state.crackle,
      whinePitch: 1,
      whineLevel: 1,
      speed: 0,
      rev: 0,
    });
    return;
  }
  const current = car();
  const falling = state.speed < state.prevSpeed - 0.15;
  state.overrun = falling && state.soundThrottle < 0.16 && state.rpm > 1500;
  const cut = state.limit
    || (state.shiftLeft > 0 && current.manual && state.soundThrottle > 0.4);
  if (current.manual) pushClutch(state.shiftLeft > 0);
  const revOn = state.rev || (current.kind === "haunt" && state.speed < 4 && state.soundThrottle > 0.75);
  pushEngine({
    rpm: state.rpm,
    load: state.soundThrottle,
    overrun: state.overrun ? 1 : 0,
    cut: cut ? 1 : 0,
    character: state.character,
    crackle: state.crackle,
    whinePitch: 1,
    whineLevel: 1,
    speed: state.speed / 3.6,
    rev: revOn ? 1 : 0,
  });
}

function paintGauge() {
  const current = car();
  const shown = Math.round(displaySpeed(Math.max(0, state.speed)));
  const speedText = String(shown);
  if (speedText !== ui.lastSpeedText) {
    $("speed").textContent = speedText;
    ui.lastSpeedText = speedText;
  }
  const rpmText = String(Math.round(Math.max(0, state.rpm)));
  if (rpmText !== ui.lastRpmText) {
    $("rpm").textContent = rpmText;
    ui.lastRpmText = rpmText;
  }
  const gear = gearLabel();
  if (gear !== ui.lastGear) {
    $("gear").textContent = gear;
    ui.lastGear = gear;
  }
  const frac = clamp(state.rpm / current.gaugeMax, 0, 1);
  $("tachValue").setAttribute("stroke-dasharray", `${(frac * 100).toFixed(2)} 100`);
  $("tachValue").classList.toggle("shift", state.shiftLeft > 0);
  $("gearBox").classList.toggle("shift", state.shiftLeft > 0);
  $("throttleFill").style.width = `${Math.round(clamp(state.soundThrottle, 0, 1) * 100)}%`;
  $("driveState").textContent = !state.engine ? "Parado" : state.demo ? "Demo" : state.speed < 1 ? "Ralentí" : "En marcha";

  const showRev = state.engine && state.mode === "gps" && state.speed < 3;
  $("revPad").classList.toggle("shown", showRev);
  $("revPad").classList.toggle("active", state.rev);
  $("gasPedal").classList.toggle("active", state.gas > 0.02);
  $("brakePedal").classList.toggle("active", state.brake > 0.02);
  $("gasPedal").querySelector(".pedal-plate").style.setProperty("--press", state.gas.toFixed(3));
  $("brakePedal").querySelector(".pedal-plate").style.setProperty("--press", state.brake.toFixed(3));
}

let lastFrame = performance.now();
function frame(now) {
  const dt = clamp((now - lastFrame) / 1000, 0.001, 0.05);
  lastFrame = now;
  stepDrive(dt);
  stepGear(dt);
  stepRpm(dt);
  pushAudio();
  paintGauge();
  updateChips();
  state.prevSpeed = state.speed;
  requestAnimationFrame(frame);
}

function pedalAmount(event, element) {
  const plate = element.querySelector(".pedal-plate");
  const rect = plate.getBoundingClientRect();
  const y = (event.clientY - rect.top) / rect.height;
  return clamp(y, 0, 1);
}

function bindPedal(id, key) {
  const node = $(id);
  const set = (event, active) => {
    if (!active) {
      state[key] = 0;
      if (key === "gas") state.hold = false;
      return;
    }
    state.demo = false;
    $("demoBtn").classList.remove("running");
    const amount = pedalAmount(event, node);
    state[key] = amount;
    if (key === "gas") state.hold = amount < 0.16;
  };
  node.addEventListener("pointerdown", (event) => {
    node.setPointerCapture(event.pointerId);
    set(event, true);
  });
  node.addEventListener("pointermove", (event) => {
    if (node.hasPointerCapture(event.pointerId)) set(event, true);
  });
  node.addEventListener("pointerup", () => set(null, false));
  node.addEventListener("pointercancel", () => set(null, false));
}

function bindRev(node) {
  const down = (event) => {
    event.preventDefault();
    state.rev = true;
    node.classList.add("active");
  };
  const up = () => {
    state.rev = false;
    node.classList.remove("active");
  };
  node.addEventListener("pointerdown", down);
  node.addEventListener("pointerup", up);
  node.addEventListener("pointerleave", up);
  node.addEventListener("pointercancel", up);
}

function diagnose() {
  const list = $("diag");
  const secure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const rows = [
    [secure, "Conexión segura (HTTPS o localhost)"],
    [!!(window.AudioContext || window.webkitAudioContext), "Web Audio"],
    [!!window.AudioWorkletNode, "AudioWorklet"],
    ["geolocation" in navigator, "Ubicación (GPS)"],
  ];
  if (state.gpsState === "ok") rows.push([true, "Permiso de ubicación concedido"]);
  else if (state.gpsState === "denied") rows.push([false, "Permiso de ubicación bloqueado"]);
  else if (state.gpsState === "weak" || state.gpsState === "wait") rows.push(["wait", "Esperando una posición precisa"]);
  list.replaceChildren();
  rows.forEach(([ok, label]) => {
    const li = document.createElement("li");
    const mark = document.createElement("span");
    if (ok === "wait") {
      mark.className = "warn";
      mark.textContent = "…";
    } else if (ok) {
      mark.className = "ok";
      mark.textContent = "✓";
    } else {
      mark.className = "bad";
      mark.textContent = "✗";
    }
    li.append(mark, document.createTextNode(" " + label));
    list.appendChild(li);
  });
}

function bindKeys() {
  const held = new Set();
  const apply = () => {
    if (state.mode !== "test") return;
    state.gas = held.has("up") ? 0.95 : 0;
    state.brake = held.has("down") ? 0.9 : 0;
    state.hold = false;
    if (state.gas || state.brake) state.demo = false;
  };
  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === "arrowup" || key === "w") held.add("up");
    if (key === "arrowdown" || key === "s") held.add("down");
    if (key === " ") {
      state.rev = true;
      event.preventDefault();
    }
    if (key === "escape") closeGarage();
    apply();
  });
  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (key === "arrowup" || key === "w") held.delete("up");
    if (key === "arrowdown" || key === "s") held.delete("down");
    if (key === " ") state.rev = false;
    apply();
  });
  window.addEventListener("blur", () => {
    held.clear();
    state.gas = 0;
    state.brake = 0;
    state.hold = false;
    state.rev = false;
  });
}

function boot() {
  loadPrefs();
  buildTach();
  selectCar(state.carId);
  applySlidersFromState();
  paintStart();
  updateChips();
  diagnose();
  bindSlider("vol", "volOut", "volume");
  bindSlider("intensity", "intOut", "intensity");
  bindSlider("character", "charOut", "character");
  bindSlider("crackle", "crackOut", "crackle");
  $("startBtn").addEventListener("click", toggleEngine);
  $("modeGps").addEventListener("click", () => setMode("gps"));
  $("modeTest").addEventListener("click", () => setMode("test"));
  $("unitKmh").addEventListener("click", () => setUnit("kmh"));
  $("unitMph").addEventListener("click", () => setUnit("mph"));
  $("demoBtn").addEventListener("click", async () => {
    if (!state.engine) await toggleEngine();
    if (!state.engine) return;
    state.demo = !state.demo;
    state.demoT = 0;
    $("demoBtn").classList.toggle("running", state.demo);
    $("demoBtn").textContent = state.demo ? "Parar demo" : "Recorrido demo";
  });
  $("fullBtn").addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  $("modalClose").addEventListener("click", closeGarage);
  $("modal").addEventListener("click", (event) => {
    if (event.target === $("modal")) closeGarage();
  });
  bindPedal("gasPedal", "gas");
  bindPedal("brakePedal", "brake");
  bindRev($("revPad"));
  bindKeys();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (audioCtx && audioCtx.state === "running") audioCtx.suspend().catch(() => {});
    } else if (state.engine) {
      resumeAudio().then(() => setMasterVolume(state.volume));
    }
  });
  if (!window.isSecureContext) {
    setStatus("Para el GPS hace falta HTTPS o localhost. La prueba funciona igual.", "warn");
  }
  requestAnimationFrame(frame);
}

boot();
