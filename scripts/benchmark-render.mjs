import fs from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";

const root = process.cwd();
await fs.mkdir(path.join(root, "qa/performance"), { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  outDir: path.join(root, "build/benchmark"),
});
const cases = [
  {
    name: "baseline-8",
    concurrency: 8,
    gl: null,
    chromeMode: "headless-shell",
  },
  {
    name: "gpu-24",
    concurrency: 24,
    gl: "angle",
    chromeMode: "chrome-for-testing",
  },
  {
    name: "gpu-32",
    concurrency: 32,
    gl: "angle",
    chromeMode: "chrome-for-testing",
  },
];
const results = [];
for (const c of cases) {
  console.log("Starting benchmark:", c.name);
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromeMode: c.chromeMode,
    chromiumOptions: { gl: c.gl },
    logLevel: "error",
  });
  try {
    const composition = await selectComposition({
      serveUrl,
      id: "BeyondTheInterface",
      puppeteerInstance: browser,
    });
    await renderStill({
      serveUrl,
      composition,
      frame: 780,
      output: path.join(root, `qa/performance/${c.name}.png`),
      imageFormat: "png",
      puppeteerInstance: browser,
      logLevel: "error",
    });
    const start = performance.now();
    await renderMedia({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      outputLocation: path.join(root, `qa/performance/${c.name}.mp4`),
      codec: "h264",
      crf: 18,
      pixelFormat: "yuv420p",
      audioCodec: "aac",
      audioBitrate: "320k",
      scale: 1,
      concurrency: c.concurrency,
      frameRange: [780, 899],
      overwrite: true,
      timeoutInMilliseconds: 120000,
      logLevel: "error",
    });
    const seconds = (performance.now() - start) / 1000;
    const result = { ...c, seconds, frames: 120, fps: 120 / seconds };
    results.push(result);
    console.log(JSON.stringify(result));
    await fs.writeFile(
      path.join(root, "outputs/render-benchmark.json"),
      JSON.stringify(results, null, 2) + "\n",
    );
  } finally {
    await browser.close({ silent: true });
  }
}
console.log("BENCHMARK DONE", JSON.stringify(results));
