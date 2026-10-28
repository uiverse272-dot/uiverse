/**
 * Publishes an approved Finds submission (lib/finds.ts). The submission email ends with this
 * command already filled in:
 *
 *   npm run finds:add -- --title "Weather widget" --creator "Sara" --creator-url https://… \
 *     --url https://… --image https://….png --tags interface,motion
 *
 * It downloads the image the creator pointed to (or reads a local file), keeps a copy at most
 * 1200px wide in public/finds/, and adds the record to src/content/finds.json. Remove a find by
 * deleting its record and its image.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { isFindTag, type Find } from "../src/lib/finds";

const { values: a } = parseArgs({
  options: {
    title: { type: "string" },
    creator: { type: "string" },
    "creator-url": { type: "string" },
    url: { type: "string" },
    image: { type: "string" },
    tags: { type: "string", default: "" },
  },
});

function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}
const web = (s?: string) => !!s && /^https?:\/\/[^/\s]+\.[^/\s]+/.test(s);
const title = a.title || die("--title and --creator are required.");
const creator = a.creator || die("--title and --creator are required.");
const url = web(a.url) ? a.url! : die("--url must be the work's https:// address.");
const image = a.image || die("--image must be an https:// image address or a local file.");
const tags = a.tags.split(",").map((t) => t.trim()).filter(Boolean);
const unknown = tags.filter((t) => !isFindTag(t));
if (unknown.length) die(`Unknown tag(s): ${unknown.join(", ")}. See FIND_TAGS in src/lib/finds.ts.`);

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60);
const slug = slugify(`${creator}-${title}`) || `find-${Date.now()}`;

const DATA = path.join(process.cwd(), "src/content/finds.json");
const finds = JSON.parse(await readFile(DATA, "utf8")) as Find[];
if (finds.some((f) => f.slug === slug)) die(`A find called ${slug} is already published.`);

/* the image: fetched as a browser would, then proven to be an image by decoding it */
let bytes: Buffer;
if (web(image)) {
  const res = await fetch(image, { headers: { "User-Agent": "Mozilla/5.0 (Uiverse finds)" }, redirect: "follow" });
  if (!res.ok) die(`Couldn't download the image (${res.status}).`);
  bytes = Buffer.from(await res.arrayBuffer());
} else {
  if (!existsSync(image)) die(`No file at ${image}.`);
  bytes = await readFile(image);
}
const meta = await sharp(bytes).metadata().catch(() => null);
if (!meta?.width || !meta.height) die("That isn't an image Uiverse can read (PNG, JPG, WebP or GIF).");

const OUT = path.join(process.cwd(), "public", "finds");
await mkdir(OUT, { recursive: true });
const info = await sharp(bytes, { animated: false })
  .rotate()
  .resize({ width: 1200, withoutEnlargement: true })
  .flatten({ background: "#ffffff" })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(OUT, `${slug}.jpg`));

const find: Find = {
  slug,
  title,
  creator,
  creatorUrl: web(a["creator-url"]) ? a["creator-url"]! : url,
  url,
  image: { src: `/finds/${slug}.jpg`, w: info.width, h: info.height },
  tags: tags.filter(isFindTag),
  addedAt: new Date().toISOString(),
};
finds.push(find);
await writeFile(DATA, JSON.stringify(finds, null, 1) + "\n");
console.log(`Published "${find.title}" by ${find.creator} (${info.width}×${info.height}) — /finds. Commit src/content/finds.json and public/finds/${slug}.jpg to put it live.`);
