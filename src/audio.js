// Tiny synthesized sound effects + ambient space pad (Web Audio API, no files).

let ctx = null;
let master = null;
let padNodes = null;
let muted = false;

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
}

export function isMuted() {
  return muted;
}

function blip(freq, dur, type = 'sine', gain = 0.18, when = 0) {
  const ac = ensureCtx();
  const t = ac.currentTime + when;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export function sfxClick() {
  blip(660, 0.12, 'triangle', 0.15);
  blip(990, 0.1, 'sine', 0.1, 0.05);
}

export function sfxWhoosh() {
  const ac = ensureCtx();
  const t = ac.currentTime;
  const len = 0.9;
  const buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(2200, t + len * 0.7);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

export function sfxSparkle() {
  [880, 1175, 1568, 2093].forEach((f, i) => blip(f, 0.35, 'sine', 0.09, i * 0.09));
}

export function startAmbientPad() {
  if (padNodes) return;
  const ac = ensureCtx();
  const g = ac.createGain();
  g.gain.value = 0.05;
  g.connect(master);

  const freqs = [55, 82.4, 110, 164.8];
  const oscs = freqs.map((f, i) => {
    const o = ac.createOscillator();
    o.type = i % 2 ? 'sine' : 'triangle';
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 4;
    const og = ac.createGain();
    og.gain.value = 0.25;
    o.connect(og).connect(g);
    o.start();
    return o;
  });

  // slow shimmer LFO on the pad volume
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain).connect(g.gain);
  lfo.start();

  padNodes = { oscs, lfo, g };
}
