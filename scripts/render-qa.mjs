import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  renderStill,
  selectComposition,
} from "@remotion/renderer";

const root = process.cwd();
const destination = path.join(root, "qa");
await fs.mkdir(destination, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  outDir: path.join(root, "build"),
  enableCaching: false,
});
console.log("Bundle prepared.");
const browserExecutable =
  process.env.REMOTION_BROWSER_EXECUTABLE ||
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);
const browser = await openBrowser("chrome", {
  browserExecutable,
  logLevel: "error",
});
try {
  const composition = await selectComposition({
    serveUrl,
    id: "BeyondTheInterface",
    puppeteerInstance: browser,
    timeoutInMilliseconds: 120000,
  });
  for (const second of [
    1.5, 4, 8, 14, 23, 29, 39, 46, 50, 57, 64, 71, 79, 87, 94, 101, 107, 112,
    119, 129, 135, 137.8, 138.7, 139.3, 143, 146, 149,
  ]) {
    const output = path.join(
      destination,
      `frame-${String(second).padStart(5, "0")}.png`,
    );
    await renderStill({
      serveUrl,
      composition,
      frame: Math.round(second * 30),
      output,
      imageFormat: "png",
      puppeteerInstance: browser,
      timeoutInMilliseconds: 120000,
      logLevel: "error",
    });
    console.log(`QA ${second}s`);
  }
  const cover = await selectComposition({
    serveUrl,
    id: "FilmCover",
    puppeteerInstance: browser,
    timeoutInMilliseconds: 120000,
  });
  await renderStill({
    serveUrl,
    composition: cover,
    frame: 0,
    output: path.join(root, "public/cover.jpg"),
    imageFormat: "jpeg",
    jpegQuality: 95,
    puppeteerInstance: browser,
    timeoutInMilliseconds: 120000,
    logLevel: "error",
  });
} finally {
  await browser.close({ silent: true });
}
console.log("Representative frames and cover ready.");
