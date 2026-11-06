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

// Harmonic palette: D minor / B-flat / F / C; final release opens to D minor add9.
const chords = [
  { bass: 38, notes: [50, 57, 62, 65, 69] },
  { bass: 34, notes: [46, 53, 58, 62, 65] },
  { bass: 41, notes: [53, 60, 65, 69, 72] },
  { bass: 36, notes: [48, 55, 60, 64, 67] },
];
function intensity(t) {
  if (t < 3) return 0.05;
  if (t < 10) return 0.2 + ((t - 3) / 7) * 0.23;
  if (t < 32) return 0.55;
  if (t < 52) return 0.64;
  if (t < 74) return 0.72;
  if (t < 81) return 0.8;
  if (t < 84) return 0.35;
  if (t < 96) return 0.74;
  if (t < 114) return 0.62;
  if (t < 126) return 0.86;
  if (t < 136) return 1;
  if (t < 138.3) return 0;
  return t < 140 ? 1 : 0.62;
}

// Sustained bed; pads overlap, avoiding hard harmonic boundaries.
for (let bar = 0; bar < 70; bar += 2) {
  const t = bar * 2;
  const chord = chords[Math.floor(bar / 4) % 4];
  pad(t, 6.7, chord.notes, 0.014 + (t > 110 ? 0.006 : 0));
}
pad(138.3, 11.7, [50, 57, 62, 65, 69, 76], 0.024);

// Beat-synchronous score. Lower activity at the start, fuller arrangement near the finish.
for (let step = 0; step < 1120; step++) {
  const t = step * 0.125;
  if (t >= 136) break;
  const energy = intensity(t);
  const chord = chords[Math.floor(t / 8) % 4];
  const beat = step % 4 === 0;
  if (t >= 6 && beat) {
    const beatInBar = Math.floor(step / 4) % 4;
    if (beatInBar === 0 || beatInBar === 2 || t > 114) kick(t, 0.13 * energy);
    if (t >= 10 && (beatInBar === 1 || beatInBar === 3))
      snare(t, 0.07 * energy);
  }
  if (t >= 10 && step % 2 === 0)
    hat(
      t,
      0.013 * energy * (step % 4 === 0 ? 0.7 : 1),
      step % 16 === 14,
      step % 4 === 0 ? -0.25 : 0.25,
    );
  if (t >= 114 && step % 2 === 1)
    hat(t, 0.006 * energy, false, (rand() - 0.5) * 0.7);
  if (t >= 8 && step % 4 === 0) {
    const pattern = [0, 0, 7, 0, 0, 12, 7, 0];
    bass(
      t,
      chord.bass + pattern[Math.floor(step / 4) % 8],
      0.12 * energy,
      0.32,
    );
  }
  if (t >= 10 && step % 2 === 0) {
    const pattern = [0, 2, 1, 3, 2, 4, 1, 3];
    const index = pattern[Math.floor(step / 2) % pattern.length];
    const note = chord.notes[index] + 12;
    const accent = step % 8 === 0 ? 1.1 : 0.62;
    pluck(t, note, 0.033 * energy * accent, Math.sin(step * 0.8) * 0.48, 0.95);
  }
  if (t >= 32 && step % 16 === 8)
    pluck(t, chord.notes[3] + 24, 0.012 * energy, -0.5, 1.2);
}

// A simple evolving lead ties the sequences together without competing with readable UI.
const motif = [74, 77, 81, 79, 77, 74, 72, 69];
for (const section of [20, 40, 60, 88, 104, 118, 126]) {
  motif.forEach((note, i) =>
    pluck(
      section + i * 0.5,
      note,
      0.022 + (section > 114 ? 0.008 : 0),
      Math.sin(i) * 0.35,
      1.3,
    ),
  );
}

// Original UI foley; matched to the approved shot timings.
keyboard(0.85, 13, 0.105);
tick(2.55, 0.045);
impact(3.1, 0.1);
sweep(4.7, 1.3, 0.035);
impact(6, 0.12);
[6.2, 6.7, 7.2, 7.7, 8.2].forEach((t) => pluck(t, 81, 0.018, 0, 0.5));
[10, 32, 52, 74, 96, 114].forEach((t) => {
  sweep(t - 0.65, 0.65, 0.019);
  impact(t, 0.07);
});
tick(11.4);
keyboard(15.3, 5);
pluck(18.7, 86, 0.025, 0.25, 0.6);
success(28.8);
keyboard(33.5, 8);
pluck(40.1, 81, 0.028, -0.2, 0.6);
success(50.2);
fail(52.5);
tick(59.7, 0.03);
keyboard(64, 6);
success(71.5);
keyboard(75.6, 16, 0.074);
fail(81.1);
keyboard(86.4, 12, 0.069);
tick(93.4, 0.035);
tick(97.1);
sweep(101.2, 2, 0.018);
success(110.7);
keyboard(115.4, 10, 0.08);
keyboard(121.1, 15, 0.072);
keyboard(126.5, 14, 0.06);
impact(128.2, 0.09);
pluck(130.7, 86, 0.028, 0.2, 0.8);
tick(133.2, 0.03);
tick(134.1, 0.03);

// Audible countdown and restrained heart-like low pulse.
for (let t = 114; t < 138.3; t += 1) {
  pluck(t, 86, t < 132 ? 0.009 : 0.016, 0, 0.12);
  if (t >= 136) {
    voice(
      t,
      0.25,
      (tt) => Math.sin(TAU * 43 * tt) * Math.exp(-tt * 20) * 0.048,
    );
    voice(
      t + 0.23,
      0.18,
      (tt) => Math.sin(TAU * 46 * tt) * Math.exp(-tt * 25) * 0.027,
    );
  }
}

// Apply the pre-submit hush to existing music and delay tails before adding click and success.
for (let i = Math.floor(135.7 * SR); i < Math.floor(138.3 * SR); i++) {
  const t = i / SR;
  const g = t < 136 ? 1 - ((t - 135.7) / 0.3) * 0.93 : t < 137.6 ? 0.07 : 0.013;
  left[i] *= g;
  right[i] *= g;
}
tick(137.3, 0.06);
success(138.3, true);
pluck(138.8, 93, 0.04, 0.3, 1.4);
sweep(139.2, 1.7, 0.025, false);

// Spacious branded coda.
for (let i = 0; i < 8; i++)
  pluck(
    140 + i * 0.5,
    [74, 77, 81, 86, 81, 77, 76, 74][i],
    0.035,
    Math.sin(i) * 0.5,
    2,
  );
impact(143, 0.08);
pad(143, 7, [50, 57, 62, 65, 69, 76], 0.016);
pluck(145, 86, 0.025, 0.15, 3);

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
  let l = Math.tanh((left[i] - dcL) * 1.15),
    r = Math.tanh((right[i] - dcR) * 1.15);
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
