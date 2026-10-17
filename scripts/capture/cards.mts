/**
 * Writes the feed-card stills (lib/cards.ts) next to each capture's screenshots:
 *
 *   npm run capture:cards            only the missing ones
 *   npm run capture:cards -- --all   rewrite every one
 *
 * `npm run capture` runs it after each capture. Old stills for items that no longer exist are removed.
 */
import { existsSync } from "node:fs";
import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { cardOf, CARD_W } from "../../src/lib/cards";
import { capturedItems } from "../../src/lib/captures";

const PUBLIC = path.join(process.cwd(), "public");
const all = process.argv.includes("--all");

const cards = capturedItems().items.flatMap((i) => cardOf(i) ?? []);
let written = 0;
for (const c of cards) {
  const out = path.join(PUBLIC, c.src);
  if (!all && existsSync(out)) continue;
  const from = path.join(PUBLIC, c.from);
  if (!existsSync(from)) {
    console.warn(`skipped ${c.src}: ${c.from} isn't on disk`);
    continue;
  }
  await sharp(from).extract(c.region).resize({ width: CARD_W }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  written++;
}

/* stills whose item is gone (a block no longer croppable, a capture removed) */
const keep = new Set(cards.map((c) => path.join(PUBLIC, c.src)));
let removed = 0;
for (const dir of existsSync(path.join(PUBLIC, "captures")) ? await readdir(path.join(PUBLIC, "captures")) : []) {
  const full = path.join(PUBLIC, "captures", dir);
  for (const f of existsSync(full) ? await readdir(full).catch(() => []) : []) {
    if (f.startsWith("card-") && !keep.has(path.join(full, f))) {
      await rm(path.join(full, f));
      removed++;
    }
  }
}
console.log(`${written} card stills written, ${cards.length - written} kept${removed ? `, ${removed} stale removed` : ""}`);
