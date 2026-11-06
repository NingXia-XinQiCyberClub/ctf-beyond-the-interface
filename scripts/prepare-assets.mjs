import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const fontDir = path.join(publicDir, "fonts");
await fs.mkdir(fontDir, { recursive: true });

const metadataPath = path.join(fontDir, "font-source.json");
const fontFiles = [
  { name: "NotoSansSC.ttf", weight: 400 },
  { name: "NotoSansSC-Bold.ttf", weight: 700 },
];
let networkRequests = 0;

async function nonemptyFile(filename, expectedBytes) {
  try {
    const stat = await fs.stat(filename);
    return stat.size > 0 && (!expectedBytes || stat.size === expectedBytes);
  } catch {
    return false;
  }
}

async function fetchAsset(url, timeout = 30000) {
  networkRequests += 1;
  const response = await fetch(url, {
    headers: { "User-Agent": "ctf-beyond-the-interface-asset-preparer" },
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok)
    throw new Error(`Asset download failed: ${response.status} ${url}`);
  return response;
}

async function sourceCharacters(directory) {
  let text = "";
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) text += await sourceCharacters(filename);
    else if (/\.(tsx?|css)$/.test(entry.name))
      text += await fs.readFile(filename, "utf8");
  }
  return text;
}

const ascii = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(i + 32),
).join("");
const requiredText =
  (await sourceCharacters(path.join(root, "src"))) +
  ascii +
  "宁夏大学鑫启网安俱乐部表面之下另有入口下一道题一起解正确答案验证通过还有一道每一次失败都留下线索偏移已确认再验证一次";
const requiredCharacters = new Set(
  [...requiredText].filter((character) => character.codePointAt(0) >= 32),
);
let metadata;
try {
  metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
} catch {
  metadata = undefined;
}
const cachedCharacters = new Set([...(metadata?.characters || "")]);
const coverageUnchanged = [...requiredCharacters].every((character) =>
  cachedCharacters.has(character),
);
const cacheComplete =
  coverageUnchanged &&
  (
    await Promise.all(
      fontFiles.map(async ({ name, weight }) => {
        const source = metadata?.files?.find(
          (file) => file.name === name && file.weight === weight,
        );
        return (
          Boolean(source) &&
          (await nonemptyFile(path.join(fontDir, name), source.bytes))
        );
      }),
    )
  ).every(Boolean);

if (!cacheComplete) {
  // Keep previous glyphs when source text changes, so a shorter edit does not
  // trigger needless shrinking and downloading of an already useful subset.
  const characters = [...new Set([...cachedCharacters, ...requiredCharacters])]
    .sort()
    .join("");
  let cssUrl = metadata?.cssUrl;
  let sources = coverageUnchanged ? metadata?.files : undefined;
  const hasSavedUrls = fontFiles.every(({ name, weight }) =>
    sources?.some(
      (file) =>
        file.name === name &&
        file.weight === weight &&
        new URL(file.url).hostname === "fonts.gstatic.com",
    ),
  );
  if (!hasSavedUrls) {
    cssUrl =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap&text=" +
      encodeURIComponent(characters);
    const css = await (await fetchAsset(cssUrl, 20000)).text();
    sources = [];
    for (const block of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
      const weight = Number(block[1].match(/font-weight:\s*(\d+)/)?.[1]);
      const url = block[1].match(/url\(([^)]+)\)/)?.[1];
      const spec = fontFiles.find((file) => file.weight === weight);
      if (spec && url && new URL(url).hostname === "fonts.gstatic.com")
        sources.push({ ...spec, url });
    }
    if (
      !fontFiles.every(({ weight }) =>
        sources.some((file) => file.weight === weight),
      )
    )
      throw new Error(
        "Google Fonts did not return the expected static 400/700 subsets.",
      );
  }

  const prepared = await Promise.all(
    fontFiles.map(async ({ name, weight }) => {
      const source = sources.find(
        (file) => file.name === name && file.weight === weight,
      );
      const destination = path.join(fontDir, name);
      if (coverageUnchanged && (await nonemptyFile(destination, source.bytes)))
        return source;
      const bytes = Buffer.from(
        await (await fetchAsset(source.url, 40000)).arrayBuffer(),
      );
      if (bytes.length < 1024 || bytes.readUInt32BE(0) !== 0x00010000)
        throw new Error(`Unexpected TrueType subset data for ${name}.`);
      return { ...source, bytes: bytes.length, data: bytes };
    }),
  );
  // Finish both requests before replacing either cached font.
  for (const font of prepared) {
    if (font.data) await fs.writeFile(path.join(fontDir, font.name), font.data);
  }
  metadata = {
    family: "Noto Sans SC",
    subset: true,
    characters,
    characterCount: [...characters].length,
    cssUrl,
    files: prepared.map(({ data, ...source }) => source),
    license: "OFL.txt",
  };
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2) + "\n");
}

const licensePath = path.join(fontDir, "OFL.txt");
if (!(await nonemptyFile(licensePath))) {
  let license;
  try {
    license = await (
      await fetchAsset(
        "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt",
        20000,
      )
    ).text();
  } catch {
    const info = await (
      await fetchAsset(
        "https://api.github.com/repos/google/fonts/contents/ofl/notosanssc/OFL.txt",
        20000,
      )
    ).json();
    if (info.encoding !== "base64" || !info.content)
      throw new Error("Could not retrieve the Noto Sans SC OFL license.");
    license = Buffer.from(info.content, "base64").toString("utf8");
  }
  if (!license.includes("SIL OPEN FONT LICENSE"))
    throw new Error(
      "The downloaded font license is not the expected OFL text.",
    );
  await fs.writeFile(licensePath, license);
}

await QRCode.toFile(
  path.join(publicDir, "club-qr.png"),
  "https://github.com/NingXia-XinQiCyberClub",
  {
    type: "png",
    width: 630,
    margin: 3,
    errorCorrectionLevel: "M",
    color: { dark: "#041224", light: "#ffffff" },
  },
);
console.log(
  `Prepared static Noto Sans SC 400/700 subsets (${metadata.characterCount} characters) and club QR code; ${networkRequests} network requests.`,
);
