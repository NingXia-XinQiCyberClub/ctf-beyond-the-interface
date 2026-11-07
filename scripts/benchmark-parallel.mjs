import fs from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderMedia,
} from "@remotion/renderer";
const root = process.cwd();
await fs.mkdir(path.join(root, "qa/performance"), { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  outDir: path.join(root, "build/benchmark-parallel"),
});
const results = JSON.parse(
  await fs
    .readFile(path.join(root, "outputs/parallel-benchmark.json"), "utf8")
    .catch(() => "[]"),
);
const settings = process.env.BENCH_WORKERS
  ? [{ workers: Number(process.env.BENCH_WORKERS), concurrency: 6, gl: null }]
  : [
      { workers: 2, concurrency: 8, gl: null },
      { workers: 3, concurrency: 6, gl: null },
    ];
for (const setting of settings) {
  console.log("Parallel benchmark", JSON.stringify(setting));
  const browsers = await Promise.all(
    Array.from({ length: setting.workers }, () =>
      openBrowser("chrome", {
        browserExecutable:
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
        logLevel: "error",
      }),
    ),
  );
  try {
    if (results.length === 0) {
      const info = await browsers[0].connection.send("SystemInfo.getInfo", {});
      console.log(
        "GPU info",
        JSON.stringify({
          renderer: info.value.gpu.auxAttributes.glRenderer,
          status: info.value.gpu.featureStatus,
        }),
      );
    }
    const compositions = await Promise.all(
      browsers.map((b) =>
        selectComposition({
          serveUrl,
          id: "BeyondTheInterface",
          puppeteerInstance: b,
        }),
      ),
    );
    const begin = performance.now();
    await Promise.all(
      browsers.map((browser, i) =>
        renderMedia({
          serveUrl,
          composition: compositions[i],
          puppeteerInstance: browser,
          outputLocation: path.join(
            root,
            `qa/performance/parallel-${setting.workers}-${i}.mp4`,
          ),
          codec: "h264",
          crf: 18,
          pixelFormat: "yuv420p",
          audioCodec: "aac",
          audioBitrate: "320k",
          concurrency: setting.concurrency,
          frameRange: [780, 899],
          overwrite: true,
          logLevel: "error",
          timeoutInMilliseconds: 120000,
        }),
      ),
    );
    const seconds = (performance.now() - begin) / 1000;
    const result = {
      ...setting,
      seconds,
      frames: 120 * setting.workers,
      fps: (120 * setting.workers) / seconds,
    };
    results.push(result);
    console.log(JSON.stringify(result));
    await fs.writeFile(
      path.join(root, "outputs/parallel-benchmark.json"),
      JSON.stringify(results, null, 2) + "\n",
    );
  } finally {
    await Promise.all(browsers.map((b) => b.close({ silent: true })));
  }
}
