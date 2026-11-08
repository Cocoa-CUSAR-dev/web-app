// Pre-renders the landing page's static paper layers to WebP (see
// src/modules/home/papercut/raster.ts for why).
//
//   pnpm dev                 # in another terminal
//   pnpm papercut:export     # BASE_URL=http://localhost:5050 by default
//
// Opens /debug/papercut-export, which draws every static layer alone on a
// transparent background and reports how much of the viewBox each one
// really covers, then screenshots each layer and writes:
//   public/images/papercut/<scene>-<layer>.webp
//   src/modules/home/papercut/rasterManifest.json
// Commit both. Run again whenever scene art changes.

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "papercut");
const manifestPath = path.join(
  root,
  "src",
  "modules",
  "home",
  "papercut",
  "rasterManifest.json",
);
const baseUrl = process.env.BASE_URL ?? "http://localhost:5050";

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 4000, height: 2400 },
    deviceScaleFactor: 1,
  });
  await page.goto(`${baseUrl}/debug/papercut-export`, {
    waitUntil: "networkidle",
  });
  // The app's global styles paint the page cream; the layers must come out
  // with transparency, not on that background.
  await page.addStyleTag({
    content: "html, body, body > * { background: transparent !important; }",
  });
  await page.waitForFunction(() => "__papercut" in window, null, {
    timeout: 60_000,
  });
  const bounds = await page.evaluate(() => window.__papercut);

  await mkdir(outDir, { recursive: true });
  for (const file of await readdir(outDir)) {
    if (file.endsWith(".webp")) await rm(path.join(outDir, file));
  }

  let total = 0;
  for (const key of Object.keys(bounds).sort()) {
    const png = await page.locator(`[data-papercut="${key}"]`).screenshot({
      omitBackground: true,
      type: "png",
      animations: "disabled",
    });
    const webp = await sharp(png)
      .webp({ quality: 82, alphaQuality: 90, effort: 6, smartSubsample: true })
      .toBuffer();
    await writeFile(path.join(outDir, `${key}.webp`), webp);
    total += webp.length;
    console.log(`${key}.webp  ${(webp.length / 1024).toFixed(0)} KB`);
  }

  const sorted = Object.fromEntries(
    Object.keys(bounds)
      .sort()
      .map((k) => [k, bounds[k]]),
  );
  await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(
    `${Object.keys(bounds).length} layers, ${(total / 1024).toFixed(0)} KB total`,
  );
} finally {
  await browser.close();
}
