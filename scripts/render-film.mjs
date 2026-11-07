import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderMedia,
} from "@remotion/renderer";

const root = process.cwd();
const preview = process.argv.includes("--preview");
const sample = process.argv.includes("--sample");
const output = path.join(
  root,
  "dist",
  preview
    ? "preview-v3.1-720p.mp4"
    : sample
      ? "transition-v3.1-sample.mp4"
      : "beyond-the-interface-v3.1-1080p.mp4",
);
await fs.mkdir(path.dirname(output), { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  outDir: path.join(root, "build/film-v3.1"),
});
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
  let lastUpdate = 0;
  await renderMedia({
    serveUrl,
    composition,
    puppeteerInstance: browser,
    outputLocation: output,
    codec: "h264",
    crf: preview ? 23 : 18,
    pixelFormat: "yuv420p",
    audioCodec: "aac",
    audioBitrate: "320k",
    scale: preview ? 2 / 3 : 1,
    concurrency: Number(process.env.RENDER_CONCURRENCY || 8),
    frameRange: sample ? [87 * 30, 100 * 30 - 1] : undefined,
    timeoutInMilliseconds: 120000,
    logLevel: "error",
    overwrite: true,
    onProgress: ({ renderedFrames, encodedFrames, progress }) => {
      const now = Date.now();
      if (now - lastUpdate > 15000 || progress === 1) {
        console.log(
          `${Math.round(progress * 100)}% | rendered ${renderedFrames} | encoded ${encodedFrames}`,
        );
        lastUpdate = now;
      }
    },
  });
} finally {
  await browser.close({ silent: true });
}
console.log(`Rendered: ${output}`);
