/**
 * Original procedural score for 《表面之下》 / 鑫启网安俱乐部.
 * No sample libraries, network requests or third-party recordings.
 * Run with Node >= 20: node scripts/generate-audio.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SR = 48000;
const duration = 150;
const N = SR * duration;
const left = new Float32Array(N);
const right = new Float32Array(N);
const TAU = 2 * Math.PI;
let seed = 0x418b2d73;
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
};
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function put(index, sample, pan = 0) {
  if (index < 0 || index >= N) return;
  left[index] += sample * Math.sqrt((1 - pan) / 2);
  right[index] += sample * Math.sqrt((1 + pan) / 2);
}
function voice(start, length, fn, pan = 0, send = 0) {
  const from = Math.round(start * SR);
  const samples = Math.round(length * SR);
  for (let i = 0; i < samples; i++) {
    const t = i / SR;
    const v = fn(t, i, length);
    put(from + i, v, pan);
    if (send) {
      put(from + i + Math.round(0.1875 * SR), v * send, -pan * 0.8);
      put(from + i + Math.round(0.375 * SR), v * send * 0.46, pan * 0.6);
      put(from + i + Math.round(0.5625 * SR), v * send * 0.2, -pan * 0.4);
    }
  }
}
const envelope = (t, len, a = 0.015, r = 0.3) =>
  Math.min(1, t / a) * Math.min(1, (len - t) / r);

function pad(start, len, chord, volume = 0.018) {
  for (let n = 0; n < chord.length; n++) {
    const f = hz(chord[n]);
    const phase = rand() * TAU;
    const pan = -0.65 + (n * 1.3) / (chord.length - 1);
    voice(
      start,
      len,
      (t, i, l) => {
        const shimmer = 0.7 + 0.3 * Math.sin(TAU * 0.087 * t + phase);
        const a = Math.sin(TAU * f * t + phase);
        const b = Math.sin(TAU * f * 1.0014 * t + phase + 0.7);
        const c = 0.18 * Math.sin(TAU * 2 * f * t + phase);
        const breath = 0.87 + 0.13 * Math.sin(TAU * 0.32 * t + phase);
        return (
          (a + b + c) * volume * envelope(t, l, 1.5, 2.3) * shimmer * breath
        );
      },
      pan,
      0.28,
    );
  }
}
function bass(start, note, v = 0.115, len = 0.39) {
  const f = hz(note);
  voice(
    start,
    len,
    (t, i, l) => {
      const env =
        (1 - Math.exp(-t * 200)) *
        Math.exp(-t * 3.6) *
        Math.min(1, (l - t) / 0.05);
      const harmonic = Math.exp(-t * 7);
      return (
        (Math.sin(TAU * f * t) +
          0.28 * harmonic * Math.sin(TAU * 2 * f * t) +
          0.1 * harmonic * Math.sin(TAU * 3 * f * t)) *
        env *
        v
      );
    },
    0,
    0.05,
  );
}
function pluck(start, note, v = 0.035, pan = 0, len = 1.1) {
  const f = hz(note);
  voice(
    start,
    len,
    (t) => {
      const env = (1 - Math.exp(-t * 350)) * Math.exp(-t * 5.6);
      return (
        (Math.sin(TAU * f * t) +
          0.26 * Math.sin(TAU * f * 2 * t) * Math.exp(-t * 7) +
          0.09 * Math.sin(TAU * f * 3 * t) * Math.exp(-t * 12)) *
        env *
        v
      );
    },
    pan,
    0.35,
  );
}
function kick(start, v = 0.16) {
  voice(start, 0.46, (t) => {
    const freqIntegral = 43 * t + (75 * (1 - Math.exp(-t * 35))) / 35;
    const sub = Math.sin(TAU * freqIntegral) * Math.exp(-t * 9);
    const click = (rand() * 2 - 1) * Math.exp(-t * 190) * 0.16;
    return (sub + click) * v * (1 - Math.exp(-t * 550));
  });
}
function snare(start, v = 0.055) {
  let prev = 0;
  voice(
    start,
    0.22,
    (t) => {
      const noise = rand() * 2 - 1;
      const filtered = noise - prev * 0.65;
      prev = noise;
      const env = (1 - Math.exp(-t * 1000)) * Math.exp(-t * 24);
      return (
        (filtered * 0.75 + Math.sin(TAU * 186 * t) * Math.exp(-t * 35) * 0.4) *
        env *
        v
      );
    },
    0.04,
    0.13,
  );
}
function hat(start, v = 0.011, open = false, pan = 0.2) {
  let p = 0;
  voice(
    start,
    open ? 0.23 : 0.085,
    (t) => {
      const x = rand() * 2 - 1;
      const hp = x - p;
      p = x;
      return (
        hp * v * Math.exp(-t * (open ? 24 : 83)) * (1 - Math.exp(-t * 1300))
      );
    },
    pan,
  );
}
function tick(start, v = 0.035, pan = 0) {
  voice(
    start,
    0.06,
    (t) => {
      const noise = (rand() * 2 - 1) * Math.exp(-t * 120);
      return (
        (noise * 0.65 + Math.sin(TAU * 870 * t) * Math.exp(-t * 190) * 0.15) * v
      );
    },
    pan,
    0.08,
  );
}
function keyboard(start, count = 8, spacing = 0.085) {
  for (let n = 0; n < count; n++)
    tick(
      start + n * spacing + (rand() - 0.5) * 0.022,
      0.021 + rand() * 0.012,
      (rand() - 0.5) * 0.5,
    );
}
function sweep(start, len = 1.25, v = 0.028, rising = true) {
  let filtered = 0;
  voice(
    start,
    len,
    (t, i, l) => {
      const frac = t / l;
      const noise = rand() * 2 - 1;
      filtered = 0.93 * filtered + 0.07 * noise;
      const e = Math.sin(Math.PI * frac) ** 1.8;
      const f = rising
        ? 170 + 1600 * frac * frac
        : 150 + 1500 * (1 - frac) ** 2;
      return (filtered * 2 + 0.09 * Math.sin(TAU * f * t)) * v * e;
    },
    0,
    0.3,
  );
}
function impact(start, v = 0.12) {
  voice(
    start,
    2.3,
    (t) => {
      const p = TAU * (34 * t + (30 * (1 - Math.exp(-t * 8))) / 8);
      return (
        (Math.sin(p) * Math.exp(-t * 3) +
          (rand() * 2 - 1) * 0.15 * Math.exp(-t * 16)) *
        v *
        (1 - Math.exp(-t * 900))
      );
    },
    0,
    0.25,
  );
}
function success(start, large = false) {
  const notes = large ? [74, 77, 81, 86] : [74, 81, 86];
  notes.forEach((n, i) =>
    pluck(start + i * 0.075, n, large ? 0.06 : 0.027, (i - 1) * 0.25, 1.5),
  );
  if (large) impact(start, 0.2);
}
function fail(start) {
  voice(
    start,
    0.5,
    (t) => {
      const f = 160 * t - 40 * t * t;
      return (
        (Math.sin(TAU * f) + 0.2 * Math.sin(TAU * f * 2)) *
        0.028 *
        Math.exp(-t * 9) *
        (1 - Math.exp(-t * 500))
      );
    },
    0,
    0.18,
  );
}

// The exact same event table drives the palette, effects and musical accents.
const cues = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/attack-cues.json"), "utf8"),
);
const BEAT = 60 / cues.bpm; // 0.4 seconds / 12 frames, sample-exact at 48 kHz.
const STEP = BEAT / 4;
const chords = [
  { bass: 38, notes: [50, 57, 62, 65, 69] },
  { bass: 34, notes: [46, 53, 58, 62, 65] },
  { bass: 41, notes: [53, 60, 65, 69, 72] },
  { bass: 36, notes: [48, 55, 60, 64, 67] },
];

function reese(start, note, len = 0.18, volume = 0.15) {
  const f = hz(note);
  let low = 0;
  voice(
    start,
    len,
    (t, i, l) => {
      const env = (1 - Math.exp(-t * 450)) * Math.min(1, (l - t) / 0.025);
      const saw = (freq) => 2 * ((t * freq) % 1) - 1;
      const raw =
        saw(f * 0.997) * 0.55 +
        saw(f * 1.003) * 0.55 +
        Math.sin(TAU * f * t) * 0.7;
      const cutoff = 0.025 + 0.24 * Math.exp(-t * 18);
      low += cutoff * (raw - low);
      const pump = 0.35 + 0.65 * Math.min(1, t / 0.045);
      return Math.tanh(low * 2.7) * env * volume * pump;
    },
    0,
    0.025,
  );
}
function stab(start, note, volume = 0.035, len = 0.18, pan = 0) {
  const f = hz(note);
  voice(
    start,
    len,
    (t, i, l) => {
      const env =
        (1 - Math.exp(-t * 550)) *
        Math.exp(-t * 13) *
        Math.min(1, (l - t) / 0.02);
      const tone = Math.sin(
        TAU * f * t + Math.sin(TAU * f * 2 * t) * Math.exp(-t * 10) * 1.8,
      );
      return Math.tanh(tone * 1.6) * env * volume;
    },
    pan,
    0.13,
  );
}
function metal(start, volume = 0.045) {
  voice(
    start,
    0.35,
    (t) => {
      const body = Math.sin(TAU * 421 * t) * Math.sin(TAU * 629.4 * t);
      return (
        (body + (rand() * 2 - 1) * 0.23) *
        Math.exp(-t * 21) *
        volume *
        (1 - Math.exp(-t * 1200))
      );
    },
    -0.1,
    0.1,
  );
}
function riser(start, len = 1.2, v = 0.035) {
  let low = 0;
  voice(
    start,
    len,
    (t, i, l) => {
      const q = t / l;
      low = low * 0.8 + (rand() * 2 - 1) * 0.2;
      const frequencyPhase = 100 * t + (900 * t * t) / l;
      return (
        (low * 1.2 + Math.sin(TAU * frequencyPhase) * 0.15) *
        q ** 1.7 *
        v *
        Math.min(1, (l - t) / 0.015)
      );
    },
    0,
    0.1,
  );
}
function energyAt(t) {
  if (t < 2.8) return 0.05;
  if (t < 6) return 0.42;
  if (t < 10) return 0.74;
  if (t < 20.8) return 0.72;
  if (t < 32) return 1.0;
  if (t < 40) return 0.74;
  if (t < 52) return 0.95;
  if (t < 64.4) return 0.8;
  if (t < 74) return 1.0;
  if (t < 80.8) return 0.92;
  if (t < 83.2) return 0.22;
  if (t < 96) return 1;
  if (t < 100.8) return 0.43;
  if (t < 110.4) return 0.8;
  if (t < 114) return 0.65;
  return t < 126 ? 0.92 : 1.1;
}

// Low dark pad beneath the attacks; leave room for the heavy drums and bass.
for (let bar = 0; bar < 85; bar += 4) {
  const time = bar * BEAT * 4;
  if (time >= 136) break;
  pad(time, 7, chords[Math.floor(bar / 4) % 4].notes, 0.009);
}

// 150 BPM industrial breakbeat. Each section deliberately restarts its drum phrase.
for (let n = 0; n < Math.ceil(136 / STEP); n++) {
  const time = Number((n * STEP).toFixed(4));
  if (time >= 136) break;
  const sectionStart = [...cues.chapters].reverse().find((s) => time >= s) || 0;
  const local = time - sectionStart;
  const step = Math.round(local / STEP) % 16;
  const energy = energyAt(time);
  const chord = chords[Math.floor((time - 6) / 6.4 + 40) % 4];
  if (time >= 2.8) {
    if ([0, 6, 8, 11].includes(step) || (time > 114 && step === 14))
      kick(time, 0.24 * energy);
    if ([4, 12].includes(step)) {
      snare(time, 0.125 * energy);
      metal(time, 0.028 * energy);
    }
    if (time > 10 && [3, 10, 15].includes(step)) snare(time, 0.025 * energy);
    if (step % 2 === 0)
      hat(time, 0.027 * energy, step === 14, step % 4 ? 0.4 : -0.3);
    if (time > 20.8 && (step === 7 || step === 15))
      hat(time, 0.012 * energy, false, -0.55);
  }
  if (time >= 6) {
    if ([0, 3, 6, 8, 10, 14].includes(step)) {
      const riff = [0, 0, 7, 0, 12, 0, 0, 7, 0, 0, 12, 7, 0, 0, 3, 0];
      reese(
        time,
        chord.bass + riff[step],
        step === 0 || step === 8 ? 0.24 : 0.14,
        0.17 * energy,
      );
    }
    if (step % 2 === 0 && time > 10) {
      const index = [0, 2, 1, 3, 2, 4, 1, 3][Math.floor(step / 2)];
      stab(
        time,
        chord.notes[index] + 12,
        0.039 * energy,
        0.17,
        Math.sin(n * 0.8) * 0.48,
      );
    }
    if (step === 14 && energy > 0.9)
      stab(time, chord.notes[3] + 24, 0.028, 0.25, 0.45);
  }
  // Short rolls lead into section changes without a continuous wash of noise.
  const next = cues.chapters.find((s) => s > time);
  if (next && next - time < 0.4 && time > 8)
    snare(time, (0.035 + (0.4 - (next - time)) * 0.1) * energy);
}

// Action-specific stop edits create a perceptible inhale before each breach.
const attackCues = cues.events.filter((e) =>
  ["breach", "drop", "failure"].includes(e.kind),
);
for (const cue of attackCues) {
  for (
    let i = Math.round((cue.time - 0.16) * SR);
    i < Math.round(cue.time * SR);
    i++
  ) {
    if (i < 0 || i >= N) continue;
    const progress = (i / SR - cue.time + 0.16) / 0.16;
    const gain = progress < 0.63 ? 1 - progress * 0.9 : 0.12;
    left[i] *= gain;
    right[i] *= gain;
  }
}

keyboard(0.7, 13, 0.095);
tick(2.8, 0.065);
riser(4.8, 1.2, 0.048);
for (const time of cues.chapters.filter((t) => t >= 10 && t <= 114)) {
  riser(time - 0.6, 0.6, 0.03);
  impact(time, 0.15);
  metal(time, 0.055);
}
for (const cue of cues.events.filter((e) => e.time < 136)) {
  if (cue.kind === "success") {
    success(cue.time);
    impact(cue.time, 0.13);
  } else if (cue.kind === "failure") {
    fail(cue.time);
    impact(cue.time, 0.2);
    metal(cue.time, 0.075);
  } else if (cue.kind === "breach" || cue.kind === "drop") {
    impact(cue.time, 0.2 * cue.power);
    metal(cue.time, 0.065 * cue.power);
    reese(cue.time, 26, 0.32, 0.14 * cue.power);
  } else {
    tick(cue.time, 0.045 * cue.power);
    stab(cue.time, 86, 0.04, 0.15);
  }
}
for (const [start, count] of [
  [15.2, 7],
  [33.6, 8],
  [59.6, 6],
  [75.6, 12],
  [86.4, 12],
  [115.6, 10],
  [121.2, 14],
  [126.4, 16],
])
  keyboard(start, count, 0.055);
for (let time = 114; time < 138.3; time += 1) {
  pluck(time, 86, time < 132 ? 0.012 : 0.02, 0, 0.12);
  if (time >= 136) {
    voice(
      time,
      0.25,
      (t) => Math.sin(TAU * 43 * t) * Math.exp(-t * 20) * 0.048,
    );
    voice(
      time + 0.23,
      0.18,
      (t) => Math.sin(TAU * 46 * t) * Math.exp(-t * 25) * 0.027,
    );
  }
}

// Preserve the successful V1 ending: the click, one-second wait, release and coda.
for (let i = Math.floor(135.7 * SR); i < Math.floor(138.3 * SR); i++) {
  const t = i / SR;
  const gain =
    t < 136 ? 1 - ((t - 135.7) / 0.3) * 0.93 : t < 137.6 ? 0.07 : 0.013;
  left[i] *= gain;
  right[i] *= gain;
}
tick(137.3, 0.06);
pad(138.3, 11.7, [50, 57, 62, 65, 69, 76], 0.027);
success(138.3, true);
pluck(138.8, 93, 0.045, 0.3, 1.4);
metal(139, 0.028);
sweep(139.2, 1.7, 0.025, false);
for (let i = 0; i < 8; i++)
  pluck(
    140 + i * 0.5,
    [74, 77, 81, 86, 81, 77, 76, 74][i],
    0.039,
    Math.sin(i) * 0.5,
    2,
  );
impact(143, 0.09);
pad(143, 7, [50, 57, 62, 65, 69, 76], 0.018);
pluck(145, 86, 0.028, 0.15, 3);

// Diffuse stereo room: multiple all-pass-ish taps with low-passed returns.
for (const [delay, gain, swap] of [
  [0.043, 0.11, true],
  [0.071, 0.085, false],
  [0.113, 0.06, true],
  [0.239, 0.04, false],
]) {
  const d = Math.round(delay * SR);
  let lpL = 0,
    lpR = 0;
  for (let i = d; i < N; i++) {
    lpL = 0.7 * lpL + 0.3 * left[i - d];
    lpR = 0.7 * lpR + 0.3 * right[i - d];
    left[i] += (swap ? lpR : lpL) * gain;
    right[i] += (swap ? lpL : lpR) * gain;
  }
}

// Remove DC, gentle saturation, fade-out, peak normalization to -1.5 dBFS.
let dcL = 0,
  dcR = 0,
  peak = 0,
  sum = 0;
for (let i = 0; i < N; i++) {
  dcL = dcL * 0.9995 + left[i] * 0.0005;
  dcR = dcR * 0.9995 + right[i] * 0.0005;
  let l = Math.tanh((left[i] - dcL) * 2.6),
    r = Math.tanh((right[i] - dcR) * 2.6);
  const t = i / SR;
  const fade =
    t < 0.08 ? t / 0.08 : t > 148.6 ? Math.max(0, (150 - t) / 1.4) : 1;
  l *= fade;
  r *= fade;
  left[i] = l;
  right[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
const target = 10 ** (-1.5 / 20);
const gain = target / peak;
const out = Buffer.alloc(44 + N * 4);
out.write("RIFF", 0);
out.writeUInt32LE(36 + N * 4, 4);
out.write("WAVE", 8);
out.write("fmt ", 12);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28);
out.writeUInt16LE(4, 32);
out.writeUInt16LE(16, 34);
out.write("data", 36);
out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const l = clamp(left[i] * gain, -1, 1),
    r = clamp(right[i] * gain, -1, 1);
  sum += (l * l + r * r) / 2;
  // TPDF dither at approximately one least significant bit.
  const dl = (rand() - rand()) * 0.5,
    dr = (rand() - rand()) * 0.5;
  out.writeInt16LE(
    clamp(Math.round(l * 32767 + dl), -32768, 32767),
    44 + i * 4,
  );
  out.writeInt16LE(
    clamp(Math.round(r * 32767 + dr), -32768, 32767),
    46 + i * 4,
  );
}
const output = path.join(root, "public", "soundtrack.wav");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, out);
const rms = Math.sqrt(sum / N);
const report = {
  version: "2.0.0",
  bpm: cues.bpm,
  framesPerBeat: BEAT * cues.fps,
  cueEvents: cues.events,
  durationSeconds: duration,
  sampleRate: SR,
  channels: 2,
  bitsPerSample: 16,
  peakDbFS: -1.5,
  rmsDbFS: 20 * Math.log10(rms),
  bytes: out.length,
  output: "public/soundtrack.wav",
};
fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(
  path.join(root, "docs", "audio-analysis.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
