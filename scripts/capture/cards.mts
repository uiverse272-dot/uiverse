/**
 * Writes the stills (lib/cards.ts) next to each capture's screenshots — feed cards, and the first
 * screen at each width for the detail frame:
 *
 *   npm run capture:cards            only the missing ones, and those older than their screenshot
 *   npm run capture:cards -- --all   rewrite every one
 *
 * `npm run capture` runs it after each capture. Old stills for items that no longer exist are removed.
 */
import { existsSync, statSync } from "node:fs";
import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { cardOf, firstOf } from "../../src/lib/cards";
import { capturedItems } from "../../src/lib/captures";

const PUBLIC = path.join(process.cwd(), "public");
const all = process.argv.includes("--all");

const items = capturedItems().items;
const VIEWPORTS = ["desktop", "tablet", "mobile"] as const;
const cards = [...items.flatMap((i) => cardOf(i) ?? []), ...items.flatMap((i) => VIEWPORTS.flatMap((vp) => firstOf(i, vp) ?? []))];
let written = 0;
for (const c of cards) {
  const out = path.join(PUBLIC, c.src);
  const from = path.join(PUBLIC, c.from);
  if (!existsSync(from)) {
    console.warn(`skipped ${c.src}: ${c.from} isn't on disk`);
    continue;
  }
  /* a still is kept until its screenshot is newer — a re-capture replaces both */
  if (!all && existsSync(out) && statSync(out).mtimeMs >= statSync(from).mtimeMs) continue;
  await sharp(from).extract(c.region).resize({ width: c.w, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  written++;
}

/* stills whose item is gone (a block no longer croppable, a capture removed) */
const keep = new Set(cards.map((c) => path.join(PUBLIC, c.src)));
let removed = 0;
for (const dir of existsSync(path.join(PUBLIC, "captures")) ? await readdir(path.join(PUBLIC, "captures")) : []) {
  const full = path.join(PUBLIC, "captures", dir);
  for (const f of existsSync(full) ? await readdir(full).catch(() => []) : []) {
    if ((f.startsWith("card-") || f.startsWith("first-")) && !keep.has(path.join(full, f))) {
      await rm(path.join(full, f));
      removed++;
    }
  }
}
console.log(`${written} stills written, ${cards.length - written} kept${removed ? `, ${removed} stale removed` : ""}`);
