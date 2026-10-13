class EngineProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const cfg = (options.processorOptions && options.processorOptions.config) || {};
    this.seed = ((options.processorOptions && options.processorOptions.seed) || 1) >>> 0;
    this.tone = cfg.tone != null ? cfg.tone : 1;
    this.lump = cfg.lump != null ? cfg.lump : 0.2;

    this.rpm = 900;
    this.throttle = 0.1;
    this.character = 0.75;
    this.crackle = 0.3;
    this.cylinders = 6;
    this.running = 0;
    this.kind = 0;
    this.blower = 0;
    this.overrun = 0;
    this.rev = 0;
    this.crank = 0;
    this.limit = 0;

    this.outGain = 0;
    this.fireAcc = 0;
    this.fireIdx = 0;
    this.imp = 0;
    this.imp2 = 0;
    this.lope = 0;
    this.body = 0;
    this.rumble = 0;
    this.exh = 0;
    this.intake = 0;
    this.bp0 = 0;
    this.lp0 = 0;
    this.bp1 = 0;
    this.lp1 = 0;
    this.bp2 = 0;
    this.lp2 = 0;
    this.bp3 = 0;
    this.lp3 = 0;
    this.wide = 0;
    this.pop = 0;
    this.popT = 0;
    this.sc = 0;
    this.revEnv = 0;
    this.clickEnv = 0;
    this.clickFreq = 0;
    this.clickPhase = 0;
    this.dcL = 0;
    this.dcR = 0;

    this.phase = 0;
    this.lp = 0;
    this.bp = 0;
    this.heart = 0;
    this.heartEnv = 0;
    this.heartDub = 0;
    this.moan = 0;
    this.screamEnv = 0;
    this.screamPhase = 0;
    this.evPhase = 0;
    this.evPhase2 = 0;
    this.wind = 0;

    this.port.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === "click") {
        this.clickEnv = Math.max(0.2, Math.min(1, data.strength || 1));
        this.clickFreq = 900 + this.rand() * 600;
        return;
      }
      if (data.type === "seed") {
        this.seed = (data.seed >>> 0) || 1;
        return;
      }
      if (data.tone != null) this.tone = data.tone;
      if (data.lump != null) this.lump = data.lump;
      if (data.rpm != null) this.rpm = data.rpm;
      if (data.throttle != null) this.throttle = data.throttle;
      if (data.load != null) this.throttle = data.load;
      if (data.character != null) this.character = data.character;
      if (data.crackle != null) this.crackle = data.crackle;
      if (data.cylinders != null) this.cylinders = data.cylinders;
      if (data.running != null) this.running = data.running;
      if (data.kind != null) this.kind = data.kind;
      if (data.blower != null) this.blower = data.blower;
      if (data.overrun != null) this.overrun = data.overrun;
      if (data.rev != null) this.rev = data.rev;
      if (data.crank != null) this.crank = data.crank;
      if (data.limit != null) this.limit = data.limit;
    };
  }

  rand() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  process(_inputs, outputs) {
    const L = outputs[0] && outputs[0][0];
    const R = outputs[0] && outputs[0][1];
    if (!L) return true;
    for (let i = 0; i < L.length; i++) {
      const s = this.tick();
      L[i] = s.l;
      if (R) R[i] = s.r;
    }
    return true;
  }

  tick() {
    const alive = this.running > 0 || this.crank > 0.05;
    this.outGain += ((alive ? 1 : 0) - this.outGain) * 0.0012;
    if (this.outGain < 0.001 && !alive) return { l: 0, r: 0 };

    let sample = 0;
    if (this.kind === 1) sample = this.tickEv();
    else if (this.kind === 2) sample = this.tickHaunt();
    else sample = this.tickIce();

    sample = Math.tanh(sample * 1.08);
    this.dcL += (sample - this.dcL) * 0.0018;
    const mono = (sample - this.dcL) * this.outGain;
    const wide = this.wide * this.outGain * 0.35;
    return { l: mono + wide, r: mono - wide };
  }

  svf(input, hz, q, lpKey, bpKey) {
    const f = Math.max(40, Math.min(hz, sampleRate * 0.22));
    const g = 2 * Math.sin((Math.PI * f) / sampleRate);
    let bp = this[bpKey];
    let lp = this[lpKey];
    bp += g * (input - bp / Math.max(0.25, q) - lp);
    bp = Math.max(-3, Math.min(3, bp));
    lp += g * bp;
    lp = Math.max(-3, Math.min(3, lp));
    this[bpKey] = bp;
    this[lpKey] = lp;
    return lp * 0.78 + bp * 0.42;
  }

  tickIce() {
    const rpm = Math.max(350, this.rpm);
    const cyl = Math.max(2, this.cylinders);
    const load = Math.max(0, Math.min(1, this.throttle));
    const open = 0.28 + this.character * 0.72;

    const fireHz = (rpm * cyl) / 120;
    let rate = fireHz;
    if (this.rev > 0) rate *= 1.35 + load * 0.25;
    this.fireAcc += rate / sampleRate;

    const lopeHz = Math.max(1.2, rpm / 220);
    this.lope += lopeHz / sampleRate;
    const lopeMod = 1 + this.lump * 0.42 * Math.sin(this.lope * Math.PI * 2);

    while (this.fireAcc >= 1) {
      this.fireAcc -= 1;
      this.fireIdx = (this.fireIdx + 1) % cyl;
      let bank = 1;
      if (cyl >= 8 && this.lump > 0.25) {
        bank = this.fireIdx % 2 === 0 ? 1.18 : 0.82;
      }
      const jit = 0.88 + this.rand() * 0.24;
      const hit = (0.55 + load * 1.05) * lopeMod * bank * jit;
      this.imp = Math.max(this.imp, hit);
      this.imp2 = Math.max(this.imp2, hit * (0.35 + this.tone * 0.25));
    }

    this.imp *= 0.9992 - load * 0.00015;
    this.imp2 *= 0.9988;

    const f0 = Math.max(18, fireHz);
    const f1 = f0 * 2;
    const f2 = f0 * 3.5;
    const f3 = f0 * 5.2;
    const exc = this.imp;
    const exc2 = this.imp2 * (0.4 + this.tone * 0.35);

    const body = this.svf(exc * 0.9, 95 + f0 * 0.35, 0.9, "lp0", "bp0");
    const mid = this.svf(exc, f0, 1.1 + open * 0.8, "lp1", "bp1");
    const upper = this.svf(exc2, f1, 0.85 + this.tone * 0.35, "lp2", "bp2");
    const bite = this.svf(exc2, f2, 0.65 + open, "lp3", "bp3");

    this.body += (body - this.body) * 0.014;
    this.rumble += ((rpm / 60) / sampleRate);
    const rumble = Math.sin(this.rumble * Math.PI * 2) * this.body * (0.08 + this.lump * 0.12);

    const noise = this.rand() * 2 - 1;
    const hiss = noise * (0.018 + open * 0.05) * (0.25 + load * 0.85);
    this.exh += (hiss - this.exh) * 0.06;
    this.intake += (noise * load * 0.04 - this.intake) * 0.08;

    let y = this.body * (0.55 + load * 0.35);
    y += mid * (0.42 + load * 0.55) * (0.75 + this.tone * 0.35);
    y += upper * (0.22 + open * 0.35) * this.tone;
    y += bite * open * 0.28 * this.tone;
    y += this.exh + this.intake;
    y += rumble;

    if (this.crank > 0.08) {
      y += noise * this.crank * 0.35;
      y += Math.sin(this.rumble * Math.PI * 4) * this.crank * 0.15;
    }

    this.revEnv += ((this.rev > 0 ? 1 : 0) - this.revEnv) * 0.0035;
    if (this.revEnv > 0.02) {
      y += this.svf(noise * this.revEnv, 180 + rpm * 0.08, 0.7, "lp1", "bp1") * 0.55 * this.revEnv;
      y += load * this.revEnv * 0.35;
    }

    if (this.blower > 0) {
      const hz = 70 + rpm * 0.055 + load * 120;
      this.sc += hz / sampleRate;
      const w = Math.sin(this.sc * Math.PI * 2);
      y += w * w * (0.025 + load * 0.11);
    }

    if (this.limit > 0) {
      y += Math.sin(this.rumble * Math.PI * 6) * 0.06 * load;
    }

    if (this.overrun > 0 && this.rand() < this.crackle * 0.0015) {
      this.pop = 0.65 + this.rand() * 0.35;
      this.popT = Math.floor(sampleRate * (0.06 + this.rand() * 0.12));
    }
    if (this.popT > 0) {
      const n = this.rand() * 2 - 1;
      const env = this.popT / (sampleRate * 0.14);
      y += n * this.pop * this.crackle * env * env;
      this.popT -= 1;
    }

    if (this.clickEnv > 0.001) {
      this.clickPhase += this.clickFreq / sampleRate;
      this.clickEnv *= 0.992;
      y += Math.sin(this.clickPhase * Math.PI * 2) * this.clickEnv * 0.22;
    }

    this.wide = this.svf(exc * 0.35, f1 * 1.02, 1.4, "lp2", "bp2") - this.svf(exc * 0.35, f1 * 0.98, 1.4, "lp3", "bp3");

    return y * (0.62 + load * 0.38);
  }

  tickEv() {
    const rpm = Math.max(0, this.rpm);
    const th = this.throttle;
    const hz = 42 + Math.pow(rpm / 9000, 0.82) * 620;
    this.evPhase += hz / sampleRate;
    this.evPhase2 += (hz * 2.02) / sampleRate;
    const a = Math.sin(this.evPhase * Math.PI * 2);
    const b = Math.sin(this.evPhase2 * Math.PI * 2);
    const noise = this.rand() * 2 - 1;
    const drive = 0.04 + th * 0.9;
    const coast = th < 0.08 ? 0.18 : 1;
    let y = (a * 0.62 + b * 0.16) * drive * coast;
    y += noise * drive * 0.04 * Math.min(1, rpm / 4000);
    return this.svf(y, 120 + rpm * 0.04, 1.1, "lp", "bp") * 0.85;
  }

  tickHaunt() {
    const rpm = Math.max(0, this.rpm);
    const th = this.throttle;
    const bpm = 58 + th * 46 + Math.min(70, rpm / 90);
    this.heart += bpm / 60 / sampleRate;
    if (this.heart >= 1) {
      this.heart -= 1;
      this.heartEnv = 1;
      this.heartDub = 0.22;
    }
    if (this.heartDub > 0) {
      this.heartDub -= 1 / sampleRate;
      if (this.heartDub <= 0) this.heartEnv = Math.max(this.heartEnv, 0.72);
    }
    this.heartEnv *= Math.exp(-1 / (sampleRate * 0.045));
    const noise = this.rand() * 2 - 1;
    let y = this.svf(noise * this.heartEnv * 0.85, 58 + th * 30, 1.4, "lp", "bp");
    const windAmt = Math.min(1, rpm / 7000);
    this.wind += (noise - this.wind) * (0.01 + windAmt * 0.08);
    y += (noise - this.wind) * windAmt * 0.22;
    this.moan += ((0.35 + windAmt * 1.4) * (40 + rpm * 0.01)) / sampleRate;
    if (this.overrun > 0) y += Math.sin(this.moan) * 0.08 * Math.min(1, rpm / 3000);
    const screamTarget = this.rev > 0 ? 1 : 0;
    this.screamEnv += (screamTarget - this.screamEnv) * 0.002;
    if (this.screamEnv > 0.01) {
      this.screamPhase += (640 + this.screamEnv * 900) / sampleRate;
      y += (Math.sin(this.screamPhase * Math.PI * 2) * 0.35 + noise * 0.4) * this.screamEnv;
    }
    return y;
  }
}

registerProcessor("engine-synth", EngineProcessor);
