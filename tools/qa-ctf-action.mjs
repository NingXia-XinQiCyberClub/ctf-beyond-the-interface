import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderStill,
} from "@remotion/renderer";
const url = await bundle({ entryPoint: "src/index.ts" });
const browser = await openBrowser("chrome", {
  browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
await fs.mkdir("qa/ctf-action", { recursive: true });
try {
  const composition = await selectComposition({
    serveUrl: url,
    id: "BeyondTheInterface",
    puppeteerInstance: browser,
  });
  for (const time of [
    11.9, 12.8, 23.8, 26.2, 36.7, 37.8, 45.7, 49, 59.5, 74.5, 88.8, 110, 140.8,
  ]) {
    await renderStill({
      serveUrl: url,
      composition,
      puppeteerInstance: browser,
      frame: Math.round(time * 30),
      output: `qa/ctf-action/${time}.png`,
      imageFormat: "png",
      logLevel: "error",
    });
  }
} finally {
  await browser.close({ silent: true });
}
console.log("CTF action review frames rendered.");
