import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderMedia,
} from "@remotion/renderer";

const exec = promisify(execFile),
  root = process.cwd();
const preview = process.argv.includes("--preview"),
  sample = process.argv.includes("--sample");
const name = preview
  ? "preview-v3.2.1-720p.mp4"
  : sample
    ? "transition-v3.2.1-sample.mp4"
    : "beyond-the-interface-v3.2.1-1080p.mp4";
const output = path.join(root, "dist", name),
  folder = path.join(root, "build/film-v3.2.1-segments");
await fs.mkdir(folder, { recursive: true });
await fs.mkdir(path.dirname(output), { recursive: true });
const native =
  process.platform === "win32"
    ? "compositor-win32-x64-msvc"
    : "compositor-linux-x64-gnu";
const ff = path.join(
  root,
  "node_modules/@remotion",
  native,
  process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg",
);
const probe = path.join(
  path.dirname(ff),
  process.platform === "win32" ? "ffprobe.exe" : "ffprobe",
);
const maxForMemory = Math.max(
  1,
  Math.floor((os.freemem() - 2 * 1024 ** 3) / 1024 ** 3),
);
const workers = Math.min(Number(process.env.RENDER_WORKERS || 4), maxForMemory);
const concurrency = Number(process.env.RENDER_CONCURRENCY || 6);
const from = sample ? 87 * 30 : 0,
  count = sample ? 13 * 30 : 4500;
const pieces = Array.from({ length: workers }, (_, i) => ({
  i,
  start: from + Math.floor((count * i) / workers),
  end: from + Math.floor((count * (i + 1)) / workers) - 1,
}));
const status = pieces.map(() => ({ rendered: 0, encoded: 0 }));
let lastUpdate = 0;
const started = performance.now();
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  outDir: path.join(root, "build/film-v3.2.1"),
});
console.log(
  `Full render: ${count} frames, ${workers} independent browsers × ${concurrency} pages. 1080p/30fps/CRF18/medium.`,
);
const results = await Promise.allSettled(
  pieces.map(async (piece) => {
    const browser = await openBrowser("chrome", {
      browserExecutable:
        process.env.REMOTION_BROWSER_EXECUTABLE ||
        (process.platform === "win32"
          ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
          : undefined),
      logLevel: "error",
    });
    try {
      const composition = await selectComposition({
        serveUrl,
        id: "BeyondTheInterface",
        puppeteerInstance: browser,
      });
      const filename = path.join(folder, `part-${piece.i}.mp4`);
      await renderMedia({
        serveUrl,
        composition,
        puppeteerInstance: browser,
        outputLocation: filename,
        codec: "h264",
        crf: preview ? 23 : 18,
        x264Preset: "medium",
        pixelFormat: "yuv420p",
        scale: preview ? 2 / 3 : 1,
        concurrency,
        frameRange: [piece.start, piece.end],
        muted: true,
        timeoutInMilliseconds: 120000,
        logLevel: "error",
        overwrite: true,
        onProgress: ({ renderedFrames, encodedFrames, progress }) => {
          status[piece.i] = {
            rendered: renderedFrames,
            encoded: encodedFrames,
          };
          const now = Date.now();
          if (now - lastUpdate > 15000 || progress === 1) {
            const rendered = status.reduce((a, b) => a + b.rendered, 0),
              encoded = status.reduce((a, b) => a + b.encoded, 0);
            console.log(
              `${Math.round((rendered / count) * 100)}% | rendered ${rendered}/${count} | encoded ${encoded}/${count}`,
            );
            lastUpdate = now;
          }
        },
      });
      const { stdout } = await exec(probe, [
        "-v",
        "error",
        "-show_streams",
        "-of",
        "json",
        filename,
      ]);
      const streams = JSON.parse(stdout).streams,
        v = streams.find((s) => s.codec_type === "video");
      if (
        streams.length !== 1 ||
        Number(v.nb_frames) !== piece.end - piece.start + 1
      )
        throw new Error(`Part ${piece.i} frame count mismatch`);
      return {
        ...piece,
        frames: Number(v.nb_frames),
        duration: Number(v.duration),
        file: filename,
        codec: v.codec_name,
        pixelFormat: v.pix_fmt,
        width: v.width,
        height: v.height,
      };
    } finally {
      await browser.close({ silent: true });
    }
  }),
);
for (const result of results)
  if (result.status !== "fulfilled") throw result.reason;
const parts = results.map((r) => r.value);
if (parts.reduce((n, p) => n + p.frames, 0) !== count)
  throw new Error("Incomplete full-frame coverage");
const list = path.join(folder, "concat.txt");
await fs.writeFile(
  list,
  parts
    .map((p) => `file 'part-${p.i}.mp4'\nduration ${p.frames / 30}\n`)
    .join(""),
);
// Each frame above is freshly rendered. Concatenation stream-copies H.264;
// the single, complete score is encoded once to avoid AAC gaps between parts.
await exec(
  ff,
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "concat",
    "-safe",
    "0",
    "-auto_convert",
    "0",
    "-i",
    list,
    "-ss",
    String(from / 30),
    "-i",
    path.join(root, "public/soundtrack-v3.wav"),
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "320k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-t",
    String(count / 30),
    "-movflags",
    "+faststart",
    "-y",
    output,
  ],
  { maxBuffer: 8 * 1024 ** 2 },
);
const { stdout } = await exec(probe, [
  "-v",
  "error",
  "-show_streams",
  "-of",
  "json",
  output,
]);
const video = JSON.parse(stdout).streams.find((s) => s.codec_type === "video");
if (
  Number(video.nb_frames) !== count ||
  Math.abs(Number(video.duration) - count / 30) > 0.01
)
  throw new Error("Joined frame count or duration mismatch");
const packetHashes = async (file) => {
  const { stdout } = await exec(
    probe,
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_packets",
      "-show_entries",
      "packet=data_hash",
      "-show_data_hash",
      "sha256",
      "-of",
      "json",
      file,
    ],
    { maxBuffer: 8 * 1024 ** 2 },
  );
  return JSON.parse(stdout).packets.map((p) => p.data_hash);
};
const expected = (
  await Promise.all(parts.map((p) => packetHashes(p.file)))
).flat();
const actual = await packetHashes(output);
if (
  expected.length !== count ||
  actual.length !== count ||
  expected.some((hash, i) => hash !== actual[i])
)
  throw new Error("Encoded video payload changed during join");
const report = {
  fullRerender: !sample,
  totalFrames: count,
  workers,
  pagesPerBrowser: concurrency,
  crf: preview ? 23 : 18,
  preset: "medium",
  scale: preview ? 2 / 3 : 1,
  parts,
  concatenation: "H.264 stream copy, no second video encode",
  encodedPacketIntegrityVerified: true,
  elapsedSeconds: (performance.now() - started) / 1000,
  output,
};
await fs.writeFile(
  path.join(root, "outputs/full-render-performance.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Full render and lossless join complete: ${report.elapsedSeconds.toFixed(1)}s / ${output}`,
);
