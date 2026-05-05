/**
 * Web-ready logos from `public/brand/source-logo.png`:
 * - Transparent PNG (edge flood-fill + near-black removal + glow fringe cleanup)
 * - Tight trim, optional min width
 * - `public/logo.png` (full wordmark)
 * - `public/logo-icon.png` (icon-only, no “ARROW BİLİŞİM” text — left cluster crop)
 *
 * Run: npm run logo:transparent
 */
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const INPUT = join(root, "public", "brand", "source-logo.png");
const OUT_MAIN = join(root, "public", "logo.png");
const OUT_ICON = join(root, "public", "logo-icon.png");

const MIN_MAIN_WIDTH = 1000;
/** Compact variant max width (high-DPI friendly, still small file for UI icons) */
const SMALL_MAX_WIDTH = 640;

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function medianChannel(samples, ch) {
  const arr = samples.map((p) => p[ch]).sort((a, b) => a - b);
  return arr[Math.floor(arr.length / 2)];
}

function idx(w, x, y) {
  return y * w + x;
}

/** Remove semi-transparent outer glow / JPEG fringe */
function stripGlowFringe(raw, w, h, alphaCutoff = 28) {
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    const a = raw[p + 3];
    if (a < alphaCutoff) {
      raw[p] = 0;
      raw[p + 1] = 0;
      raw[p + 2] = 0;
      raw[p + 3] = 0;
    }
  }
}

/** Any residual pure-near-black (common JPEG noise on former bg) */
function punchNearBlack(raw, w, h) {
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    const r = raw[p];
    const g = raw[p + 1];
    const b = raw[p + 2];
    if (r < 14 && g < 14 && b < 14 && luminance(r, g, b) < 18) {
      raw[p] = 0;
      raw[p + 1] = 0;
      raw[p + 2] = 0;
      raw[p + 3] = 0;
    }
  }
}

/** Find vertical gap between icon cluster (left) and wordmark (right) via alpha column sums */
function findIconSplitX(raw, w, h) {
  const colSum = new Float64Array(w);
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = 0; y < h; y++) {
      s += raw[idx(w, x, y) * 4 + 3];
    }
    colSum[x] = s;
  }

  const smooth = new Float64Array(w);
  const r = 3;
  for (let x = 0; x < w; x++) {
    let sum = 0;
    let cnt = 0;
    for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx;
      if (xx >= 0 && xx < w) {
        sum += colSum[xx];
        cnt++;
      }
    }
    smooth[x] = sum / cnt;
  }

  const maxS = Math.max(...smooth);
  /** Ignore outer margins — valley between graphic block and “ARROW” is usually mid-band */
  const lo = Math.floor(w * 0.38);
  const hi = Math.ceil(w * 0.66);

  let minX = lo;
  let minVal = Infinity;
  for (let x = lo; x < hi; x++) {
    if (smooth[x] < minVal) {
      minVal = smooth[x];
      minX = x;
    }
  }

  const confident = maxS > 0 && minVal < maxS * 0.12;
  let split = confident ? minX : Math.floor(w * 0.54);
  const ratio = split / w;
  if (ratio < 0.36 || ratio > 0.72) {
    split = Math.floor(w * 0.54);
  }

  const padded = Math.max(16, split - 8);
  return Math.min(padded, w - 1);
}

async function rasterFromSharp(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    raw: new Uint8Array(data),
    w: info.width,
    h: info.height
  };
}

async function toSharpPng(raw, w, h) {
  return sharp(Buffer.from(raw), {
    raw: { width: w, height: h, channels: 4 }
  }).png({ compressionLevel: 9, effort: 10 });
}

async function main() {
  const { data, info } = await sharp(INPUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const raw = new Uint8Array(data);

  const edgeSamples = [];
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = idx(w, x, y) * 4;
      edgeSamples.push([raw[i], raw[i + 1], raw[i + 2]]);
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const i = idx(w, x, y) * 4;
      edgeSamples.push([raw[i], raw[i + 1], raw[i + 2]]);
    }
  }

  const bgR = medianChannel(edgeSamples, 0);
  const bgG = medianChannel(edgeSamples, 1);
  const bgB = medianChannel(edgeSamples, 2);

  function distBg(r, g, b) {
    return Math.hypot(r - bgR, g - bgG, b - bgB);
  }

  const TOL = 52;
  const LUM_MAX = 82;

  function isBgCandidate(r, g, b) {
    const lum = luminance(r, g, b);
    const nearBlack = r < 22 && g < 22 && b < 22 && lum < 28;
    const edgeLike = distBg(r, g, b) < TOL && lum < LUM_MAX;
    return nearBlack || edgeLike;
  }

  const visited = new Uint8Array(w * h);
  const queue = [];

  function trySeed(x, y) {
    const i = idx(w, x, y);
    if (visited[i]) return;
    const p = i * 4;
    const r = raw[p];
    const g = raw[p + 1];
    const b = raw[p + 2];
    if (!isBgCandidate(r, g, b)) return;
    visited[i] = 1;
    queue.push(i);
  }

  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    trySeed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y);
    trySeed(w - 1, y);
  }

  let qh = 0;
  while (qh < queue.length) {
    const i = queue[qh++];
    const base = i * 4;
    raw[base + 3] = 0;
    const x = i % w;
    const y = Math.floor(i / w);
    const neigh = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];
    for (const [nx, ny] of neigh) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = idx(w, nx, ny);
      if (visited[ni]) continue;
      const nb = ni * 4;
      const r = raw[nb];
      const g = raw[nb + 1];
      const b = raw[nb + 2];
      if (!isBgCandidate(r, g, b)) continue;
      visited[ni] = 1;
      queue.push(ni);
    }
  }

  punchNearBlack(raw, w, h);
  stripGlowFringe(raw, w, h, 26);

  let buf = await toSharpPng(raw, w, h).then((p) => p.toBuffer());

  buf = await sharp(buf)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .sharpen({ sigma: 0.55, m1: 0.65, m2: 3 })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  let meta = await sharp(buf).metadata();
  if (meta.width && meta.width < MIN_MAIN_WIDTH) {
    buf = await sharp(buf)
      .resize({
        width: MIN_MAIN_WIDTH,
        height: Math.round((meta.height * MIN_MAIN_WIDTH) / meta.width),
        kernel: sharp.kernel.lanczos3,
        fit: "fill"
      })
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
    meta = await sharp(buf).metadata();
  }

  await writeFile(OUT_MAIN, buf);
  console.log(`Wrote ${OUT_MAIN} (${meta.width}×${meta.height}, ${(buf.length / 1024).toFixed(1)} KiB)`);

  /* ----- Compact icon (graphic cluster only) ----- */
  const trimmedMain = await rasterFromSharp(buf);
  const split = findIconSplitX(trimmedMain.raw, trimmedMain.w, trimmedMain.h);
  let iconBuf = await sharp(buf)
    .extract({
      left: 0,
      top: 0,
      width: split,
      height: trimmedMain.h
    })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  let iconMeta = await sharp(iconBuf).metadata();
  if (iconMeta.width && iconMeta.width > SMALL_MAX_WIDTH) {
    iconBuf = await sharp(iconBuf)
      .resize({
        width: SMALL_MAX_WIDTH,
        height: Math.round(((iconMeta.height ?? 1) * SMALL_MAX_WIDTH) / iconMeta.width),
        kernel: sharp.kernel.lanczos3,
        fit: "fill"
      })
      .sharpen({ sigma: 0.45, m1: 0.55, m2: 2.5 })
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
    iconMeta = await sharp(iconBuf).metadata();
  }

  await writeFile(OUT_ICON, iconBuf);
  console.log(`Wrote ${OUT_ICON} (${iconMeta.width}×${iconMeta.height}, ${(iconBuf.length / 1024).toFixed(1)} KiB)`);
  console.log(`Edge bg median: rgb(${Math.round(bgR)}, ${Math.round(bgG)}, ${Math.round(bgB)}) · icon split x≈${split}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
