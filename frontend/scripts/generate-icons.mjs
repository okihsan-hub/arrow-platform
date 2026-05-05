/**
 * Builds app/icon.png and app/apple-icon.png from public/brand/logo.png.
 * Run: npm run icons
 */
import { readFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const logoPath = join(root, "public", "brand", "logo.png");
const appDir = join(root, "app");

/** bg-corporate-950 */
const BG = { r: 10, g: 15, b: 26, alpha: 1 };

async function squareIcon(size, insetRatio) {
  const logoBuf = await readFile(logoPath);
  const inset = Math.round(size * insetRatio);
  const innerMax = Math.max(1, size - inset * 2);

  const fitted = await sharp(logoBuf)
    .resize(innerMax, innerMax, { fit: "inside" })
    .ensureAlpha()
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG }
  })
    .composite([{ input: fitted, gravity: "centre" }])
    .png();
}

await mkdir(appDir, { recursive: true });

const mainIcon = await squareIcon(512, 0.12);
await mainIcon.toFile(join(appDir, "icon.png"));

const appleIcon = await squareIcon(180, 0.14);
await appleIcon.toFile(join(appDir, "apple-icon.png"));

console.log("Wrote app/icon.png (512×512), app/apple-icon.png (180×180)");
