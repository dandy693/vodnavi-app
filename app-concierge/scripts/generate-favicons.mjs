// Brand favicon generator — emits a #121212 / #D4AF37 monogram suite
// into app-concierge/public/ and site-brand/public/. Source of truth for
// VODNAVI compliance icons (favicon.ico, apple-touch-icon.png, icon-192.png,
// icon-512.png). Re-run after BRAND_DESIGN_GUIDE.md palette changes.
//
// usage (from repo root):
//   node app-concierge/scripts/generate-favicons.mjs

import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

const BG = "#121212";
const GOLD = "#D4AF37";

function buildSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}"/>
  <circle cx="256" cy="256" r="220" fill="none" stroke="${GOLD}" stroke-opacity="0.32" stroke-width="2"/>
  <circle cx="256" cy="256" r="196" fill="none" stroke="${GOLD}" stroke-width="4"/>
  <path d="M 168 168 L 256 376 L 344 168" fill="none" stroke="${GOLD}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  );
}

async function renderPng(size) {
  return sharp(buildSvg()).resize(size, size).png().toBuffer();
}

function buildIco(images) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const tableSize = headerSize + dirEntrySize * images.length;
  const header = Buffer.alloc(tableSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = tableSize;
  images.forEach(({ size, buffer }, i) => {
    const base = headerSize + i * dirEntrySize;
    header.writeUInt8(size >= 256 ? 0 : size, base);
    header.writeUInt8(size >= 256 ? 0 : size, base + 1);
    header.writeUInt8(0, base + 2);
    header.writeUInt8(0, base + 3);
    header.writeUInt16LE(1, base + 4);
    header.writeUInt16LE(32, base + 6);
    header.writeUInt32LE(buffer.length, base + 8);
    header.writeUInt32LE(offset, base + 12);
    offset += buffer.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.buffer)]);
}

const PNG_TARGETS = {
  "icon-192.png": 192,
  "icon-512.png": 512,
  "apple-touch-icon.png": 180,
};
const ICO_SIZES = [16, 32, 48];
const PUBLIC_DIRS = ["app-concierge/public", "site-brand/public"];

async function emit(dirRel) {
  const dir = join(REPO_ROOT, dirRel);
  await mkdir(dir, { recursive: true });
  const written = [];

  for (const [name, size] of Object.entries(PNG_TARGETS)) {
    const buf = await renderPng(size);
    await writeFile(join(dir, name), buf);
    written.push({ name, size: `${size}x${size}`, bytes: buf.length });
  }

  const icoImages = [];
  for (const size of ICO_SIZES) {
    icoImages.push({ size, buffer: await renderPng(size) });
  }
  const ico = buildIco(icoImages);
  await writeFile(join(dir, "favicon.ico"), ico);
  written.push({
    name: "favicon.ico",
    size: ICO_SIZES.join("/"),
    bytes: ico.length,
  });

  return { dir: dirRel, written };
}

const results = [];
for (const dir of PUBLIC_DIRS) {
  results.push(await emit(dir));
}
for (const r of results) {
  console.log(`\n${r.dir}/`);
  for (const w of r.written) {
    console.log(`  ${w.name.padEnd(22)} ${String(w.size).padEnd(12)} ${w.bytes.toLocaleString()} bytes`);
  }
}
