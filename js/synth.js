const DSP_URL = "js/engine-dsp.js";
const FADE_S = 0.35;
const CLIP_KNEE = 0.92;
const CLIP_CEIL = 0.99;
const CLIP_RANGE = 3;
/** Cabeza antes del compresor: el DSP ya lleva drive/saturation interno. */
const ENGINE_TRIM = 0.58;

let audioCtx = null;
let engineNode = null;
let masterGain = null;
let workletLoad = null;
let suspendTimer = 0;

function clipCurve() {
  const n = 4097;
  const curve = new Float32Array(n);
  const k = CLIP_CEIL - CLIP_KNEE;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1) * 2 - 1) * CLIP_RANGE;
    const a = Math.abs(x);
    const y = a <= CLIP_KNEE ? a : CLIP_KNEE + k * Math.tanh((a - CLIP_KNEE) / k);
    curve[i] = x < 0 ? -y : y;
  }
  return curve;
}

function gainForVolume(v) {
  return Math.pow(Math.max(0, Math.min(1, v)), 1.55) * 0.98;
}

async function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) throw new Error("Este navegador no tiene Web Audio.");
    if (!window.EngineDSP && !window.AudioWorkletNode) {
      throw new Error("Falta js/engine-dsp.js");
    }
    try {
      if (navigator.audioSession) navigator.audioSession.type = "playback";
    } catch (_) { /* iOS */ }
    audioCtx = new Ctx({ latencyHint: "interactive" });
    const car = typeof carById === "function" ? carById(typeof state !== "undefined" ? state.carId : "maniac") : null;
    const config = car ? buildEngineConfig(car) : buildEngineConfig({ id: "maniac", idle: 850, redline: 9000 });
    const seed = (Math.random() * 4294967295) >>> 0;

    if (audioCtx.audioWorklet) {
      if (!workletLoad) workletLoad = audioCtx.audioWorklet.addModule(DSP_URL);
      await workletLoad;
      engineNode = new AudioWorkletNode(audioCtx, "engine-processor", {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        processorOptions: { config, seed },
      });
    } else if (window.EngineDSP) {
      const dsp = window.EngineDSP.create(audioCtx.sampleRate, config, seed);
      engineNode = audioCtx.createScriptProcessor(1024, 1, 2);
      engineNode.onaudioprocess = (e) => {
        dsp.process(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1), e.outputBuffer.length);
      };
      engineNode._dsp = dsp;
      engineNode.port = {
        postMessage(msg) {
          dsp.message(msg);
        },
      };
    } else {
      throw new Error("AudioWorklet no disponible.");
    }

    const preGain = audioCtx.createGain();
    preGain.gain.value = ENGINE_TRIM;
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 32;
    highpass.Q.value = 0.65;
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 12;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.16;
    const tone = audioCtx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 11500;
    tone.Q.value = 0.55;
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    const clipIn = audioCtx.createGain();
    clipIn.gain.value = 1 / CLIP_RANGE;
    const clip = audioCtx.createWaveShaper();
    clip.curve = clipCurve();
    clip.oversample = "none";
    engineNode.connect(preGain);
    preGain.connect(highpass);
    highpass.connect(compressor);
    compressor.connect(tone);
    tone.connect(masterGain);
    masterGain.connect(clipIn);
    clipIn.connect(clip);
    clip.connect(audioCtx.destination);
  }
  clearTimeout(suspendTimer);
  if (audioCtx.state === "suspended") await audioCtx.resume();
  const g = masterGain.gain;
  const now = audioCtx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(gainForVolume(typeof state !== "undefined" ? state.volume : 0.8), now + FADE_S);
  return audioCtx;
}

function setMasterVolume(value) {
  if (!masterGain || !audioCtx) return;
  masterGain.gain.setTargetAtTime(gainForVolume(value), audioCtx.currentTime, 0.05);
}

function pushEngine(params) {
  if (!engineNode) return;
  engineNode.port.postMessage({ type: "params", ...params });
}

function pushClick(strength) {
  if (!engineNode) return;
  engineNode.port.postMessage({ type: "click", strength: strength ?? 1 });
}

function pushClutch(down) {
  if (!engineNode) return;
  engineNode.port.postMessage({ type: "clutch", down: !!down });
}

function applyEngineConfig() {
  if (!engineNode || typeof carById !== "function" || typeof state === "undefined") return;
  engineNode.port.postMessage({ type: "config", config: buildEngineConfig(carById(state.carId)) });
}

function audioSupported() {
  return !!(window.AudioContext || window.webkitAudioContext) && (!!window.EngineDSP || !!window.AudioWorkletNode);
}

function stopEngineAudio() {
  if (!audioCtx || !masterGain) return;
  clearTimeout(suspendTimer);
  const g = masterGain.gain;
  const now = audioCtx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(0, now);
  if (audioCtx.state === "running") {
    audioCtx.suspend().catch(() => {});
  }
}

function suspendAudio() {
  stopEngineAudio();
}

function resumeAudio() {
  if (!audioCtx) return Promise.resolve();
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = audioCtx.createBuffer(1, 1, 22050);
    src.connect(audioCtx.destination);
    src.start(0);
  } catch (_) { /* ignore */ }
  return audioCtx.resume();
}
