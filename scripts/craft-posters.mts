/**
 * Renders the still each Uiverse Original shows in a feed card before it runs (lib/craft.ts):
 *
 *   npm run craft:posters            only the missing ones, and those older than their piece
 *   npm run craft:posters -- --all   rewrite every one
 *   npm run craft:posters -- <slug>  just these
 *
 * Each piece is opened in a browser at its frame size, given its moment (src/content/craft.json:
 * a wait, a hover, a click, some typing) and photographed. Posters for pieces that no longer exist
 * are removed.
 */
import { existsSync, statSync } from "node:fs";
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { CRAFT_RECORDS, craftScale, craftViewport } from "../src/lib/craft";

const PUBLIC = path.join(process.cwd(), "public");
const OUT = path.join(PUBLIC, "craft", "posters");
const args = process.argv.slice(2);
const all = args.includes("--all");
const only = new Set(args.filter((a) => !a.startsWith("--")));

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
let written = 0;
for (const r of CRAFT_RECORDS) {
  if (only.size && !only.has(r.slug)) continue;
  const src = path.join(PUBLIC, "craft", `${r.slug}.html`);
  const out = path.join(OUT, `${r.slug}.jpg`);
  if (!existsSync(src)) {
    console.warn(`skipped ${r.slug}: public/craft/${r.slug}.html isn't there`);
    continue;
  }
  if (!all && !only.size && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;

  const [width, height] = craftViewport(r);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: craftScale(r) });
  page.on("pageerror", (e) => console.warn(`${r.slug}: ${e.message}`));
  await page.goto(pathToFileURL(src).href);
  await page.waitForTimeout(300);
  const { hover, click, type, wait = 1200 } = r.poster;
  if (hover) await page.hover(hover, { force: true });
  if (click) await page.click(click);
  if (type) await page.keyboard.type(type, { delay: 60 });
  await page.waitForTimeout(wait);
  await sharp(await page.screenshot()).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  await page.close();
  written++;
}
await browser.close();

const keep = new Set(CRAFT_RECORDS.map((r) => `${r.slug}.jpg`));
let removed = 0;
for (const f of await readdir(OUT)) {
  if (keep.has(f)) continue;
  await rm(path.join(OUT, f));
  removed++;
}
console.log(`${written} poster${written === 1 ? "" : "s"} written${removed ? `, ${removed} removed` : ""}.`);
