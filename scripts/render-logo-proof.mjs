import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderStill,
} from "@remotion/renderer";
const root = process.cwd();
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  outDir: path.join(root, "build/logo-proof"),
});
const browser = await openBrowser("chrome", {
  browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  logLevel: "error",
});
try {
  const composition = await selectComposition({
    serveUrl,
    id: "LogoProof",
    puppeteerInstance: browser,
  });
  await renderStill({
    serveUrl,
    composition,
    frame: 0,
    output: path.join(root, "outputs/logo-vector-review.png"),
    imageFormat: "png",
    puppeteerInstance: browser,
    logLevel: "error",
  });
  console.log("Logo review rendered.");
} finally {
  await browser.close({ silent: true });
}
