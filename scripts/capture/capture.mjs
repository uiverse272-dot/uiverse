#!/usr/bin/env node
/**
 * Capture a live page into the index.
 *
 *   npm run capture -- https://example.com/pricing --industry saas
 *   npm run capture -- https://example.com --name "Example" --title "Homepage" --style minimal
 *   npm run capture -- --rederive          re-run derive.mjs over stored measurements
 *   npm run capture -- --opt-out example.com --ref TD-…   honour a takedown (docs/08 §4)
 *
 * Renders the page at laptop, tablet and phone widths, measures it (extract.js),
 * derives design facts (derive.mjs), writes screenshots to public/captures/<slug>/
 * and upserts the record into src/content/captures.json, which the app reads.
 */
import { chromium, devices } from "playwright";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { measurePage } from "./extract.mjs";
import * as D from "./derive.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INDEX = path.join(ROOT, "src/content/captures.json");
const RAW = path.join(ROOT, ".captures-raw");
const OPTOUT = path.join(ROOT, "src/content/optout.json");
/* a full page longer than this is cut — the feed only ever shows the top, the frame scrolls */
const MAX_H = 14000;

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  tablet: { ...devices["iPad Pro 11"], viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  mobile: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
};

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      out[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    } else out._.push(argv[i]);
  }
  return out;
}

const slugify = (s) => s.toLowerCase().replace(/^www\./, "").replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-|-$/g, "");

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  /* consent banners cover the page; accept the common ones rather than capture them */
  const accept = /^(accept( all)?( cookies)?|allow all|agree|i agree|got it|ok|okay|قبول|موافق|أوافق|قبول الكل)$/i;
  for (const frame of page.frames()) {
    const btn = frame.getByRole("button", { name: accept }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ timeout: 2000 }).catch(() => {});
      break;
    }
  }
  /* scroll through once so lazy images load and scroll-triggered reveals fire */
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight && y < 20000; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
}

async function shoot(browser, url, vp, outDir, locale = "en-US") {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], locale, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
    await settle(page);
    const raw = await page.evaluate(measurePage);
    const { width } = VIEWPORTS[vp].viewport;
    const height = Math.min(raw.docH, MAX_H);
    const file = path.join(outDir, `${vp}.jpg`);
    await page.screenshot({
      path: file,
      type: "jpeg",
      quality: 80,
      fullPage: true,
      clip: { x: 0, y: 0, width, height },
      animations: "disabled",
    });
    const dpr = VIEWPORTS[vp].deviceScaleFactor;
    return { raw, shot: { w: width * dpr, h: height * dpr, css: width, cssH: height } };
  } finally {
    await ctx.close();
  }
}

function record({ url, slug, opts, byVp, shots, capturedAt }) {
  const u = new URL(url);
  const domain = u.hostname.replace(/^www\./, "");
  const d = byVp.desktop;
  const derived = Object.fromEntries(
    Object.entries(byVp).map(([vp, raw]) => [vp, { blocks: D.blocks(raw), docH: raw.docH }]),
  );
  const palette = D.colourRoles(d);
  const category = opts.category ?? D.category(derived.desktop.blocks, u.pathname);
  const name = opts.name ?? D.siteName(d, domain);
  const title = opts.title ?? D.pageTitle(u.pathname);

  return {
    slug,
    url,
    capturedAt,
    title,
    source: {
      slug: slugify(domain),
      name,
      domain,
      about: d.description,
      tagline: d.title,
    },
    category,
    archetype: D.ARCHETYPE_OF[category],
    industry: opts.industry ?? "saas",
    style: opts.style ?? D.style(palette, d),
    tech: D.techList(byVp),
    dir: D.direction(d),
    lang: d.lang,
    palette,
    type: D.typography(d),
    rhythm: D.rhythm(d),
    blocks: derived.desktop.blocks,
    crops: {
      tablet: derived.tablet.blocks.map(({ type, y, h, heading }) => ({ type, y, h, heading })),
      mobile: derived.mobile.blocks.map(({ type, y, h, heading }) => ({ type, y, h, heading })),
    },
    responsive: D.responsive(derived),
    /* docH lets the app place block crops on a screenshot that was cut at MAX_H */
    shots: Object.fromEntries(Object.entries(shots).map(([vp, s]) => [vp, { ...s, docH: byVp[vp].docH }])),
  };
}

/* a domain that opted out — and its subdomains — is never captured again (lib/captures.ts reads the same list) */
const optOuts = async () => (existsSync(OPTOUT) ? JSON.parse(await readFile(OPTOUT, "utf8")) : []);
const covered = (list, domain) => list.some((o) => domain === o.domain || domain.endsWith(`.${o.domain}`));
const hostOf = (url) => new URL(url).hostname.toLowerCase().replace(/^www\./, "");

/* captures run in parallel; the index is read-modified-written, so writes take turns */
let writing = Promise.resolve();
const upsert = (rec) => (writing = writing.then(() => write(rec)));

const remove = (slug) =>
  (writing = writing.then(async () => {
    const list = JSON.parse(await readFile(INDEX, "utf8"));
    await writeFile(INDEX, JSON.stringify(list.filter((r) => r.slug !== slug), null, 1) + "\n");
    await rm(path.join(ROOT, "public/captures", slug), { recursive: true, force: true });
    await rm(path.join(RAW, `${slug}.json`), { force: true });
  }));

async function write(rec) {
  const list = existsSync(INDEX) ? JSON.parse(await readFile(INDEX, "utf8")) : [];
  const next = [...list.filter((r) => r.slug !== rec.slug), rec].sort((a, b) => a.slug.localeCompare(b.slug));
  await mkdir(path.dirname(INDEX), { recursive: true });
  await writeFile(INDEX, JSON.stringify(next, null, 1) + "\n");
}

async function main() {
  const opts = args(process.argv.slice(2));

  if (opts["opt-out"]) {
    const domain = String(opts["opt-out"]).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[/:?#].*$/, "");
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
      console.error(`"${opts["opt-out"]}" isn't a domain — usage: npm run capture -- --opt-out example.com [--ref TD-…]`);
      process.exit(1);
    }
    const list = await optOuts();
    if (!covered(list, domain)) {
      const ref = typeof opts.ref === "string" ? { ref: opts.ref } : {};
      list.push({ domain, removedAt: new Date().toISOString().slice(0, 10), ...ref });
      list.sort((a, b) => a.domain.localeCompare(b.domain));
      await writeFile(OPTOUT, JSON.stringify(list, null, 2) + "\n");
    }
    const index = existsSync(INDEX) ? JSON.parse(await readFile(INDEX, "utf8")) : [];
    const gone = index.filter((r) => covered([{ domain }], r.source.domain));
    for (const r of gone) remove(r.slug);
    await writing;
    console.log(`✓ ${domain} opted out — ${gone.length} capture(s) removed${gone.length ? `: ${gone.map((r) => r.slug).join(", ")}` : ""}`);
    console.log(`  next: npm run capture:upload -- --prune   (deletes the bucket copies)`);
    console.log(`        commit src/content/optout.json and deploy, then reply to the requester`);
    return;
  }

  if (opts.rederive) {
    const list = JSON.parse(await readFile(INDEX, "utf8"));
    const opted = await optOuts();
    for (const old of list) {
      if (covered(opted, old.source.domain)) {
        await remove(old.slug);
        console.log(`removed ${old.slug}: ${old.source.domain} opted out`);
        continue;
      }
      const file = path.join(RAW, `${old.slug}.json`);
      if (!existsSync(file)) {
        console.warn(`skip ${old.slug}: no stored measurements`);
        continue;
      }
      const { byVp, opts: o } = JSON.parse(await readFile(file, "utf8"));
      /* the gate improves too: drop anything already indexed that it now rejects */
      const why = rejection(byVp.desktop);
      if (why) {
        await remove(old.slug);
        console.log(`removed ${old.slug}: ${why}`);
        continue;
      }
      await upsert(record({ url: old.url, slug: old.slug, opts: o, byVp, shots: old.shots, capturedAt: old.capturedAt }));
      console.log(`re-derived ${old.slug}`);
    }
    return;
  }

  if (opts.batch) {
    const seeds = JSON.parse(await readFile(path.resolve(opts.batch), "utf8"));
    const browser = await chromium.launch();
    const failed = [];
    let next = 0;
    const worker = async () => {
      while (next < seeds.length) {
        const seed = seeds[next++];
        const { url, ...flags } = seed;
        if (opts["skip-existing"] && existsSync(path.join(RAW, `${slugFor(url, flags)}.json`))) continue;
        try {
          report(await captureOne(browser, url, flags));
        } catch (e) {
          failed.push([url, e.message.split("\n")[0]]);
          console.log(`✗ ${url} — ${e.message.split("\n")[0]}`);
        }
      }
    };
    try {
      await Promise.all(Array.from({ length: Number(opts.concurrency ?? 3) }, worker));
    } finally {
      await browser.close();
    }
    console.log(`\n${seeds.length - failed.length}/${seeds.length} captured`);
    for (const [u, why] of failed) console.log(`  ✗ ${u}: ${why}`);
    return;
  }

  const url = opts._[0];
  if (!url || !/^https?:\/\//.test(url)) {
    console.error("usage: npm run capture -- <https://url> [--name N] [--title T] [--industry I] [--style S] [--category C] [--locale ar-SA]");
    console.error("       npm run capture -- --batch seeds/file.json [--concurrency 3] [--skip-existing]");
    console.error("       npm run capture -- --opt-out example.com [--ref TD-…]");
    process.exit(1);
  }
  const browser = await chromium.launch();
  try {
    report(await captureOne(browser, url, Object.fromEntries(Object.entries(opts).filter(([k]) => k !== "_"))));
  } finally {
    await browser.close();
  }
}

const slugFor = (url, flags) => {
  const u = new URL(url);
  return flags.slug ?? slugify(u.hostname + (u.pathname === "/" ? "" : u.pathname));
};

/**
 * What a bot wall, an error page or a blank render looks like. Better to drop a capture than to
 * index a "Just a moment…" page as a design.
 */
function rejection(raw) {
  const chars = raw.text.reduce((n, t) => n + t.chars, 0);
  const BLOCKED =
    /just a moment|attention required|access denied|forbidden|blocked|captcha|are you a robot|verify you are human|unusual traffic|security check|not found|404|403|error|تم حظرك|غير مصرح|الوصول مرفوض|الصفحة غير موجودة/i;
  if (BLOCKED.test(raw.title)) return `looks like a block or error page ("${raw.title.slice(0, 50)}")`;
  /* some walls keep the site's own title — check what the first screen actually says */
  const above = raw.text.filter((t) => t.y < raw.viewport.h).map((t) => t.sample).join(" ");
  if (BLOCKED.test(above) && raw.docH < raw.viewport.h * 1.5) return "first screen reads like a block page";
  if (raw.docH < 700) return `page is only ${raw.docH}px tall`;
  if (chars < 250) return `only ${chars} characters of text rendered`;
  if (raw.blocks.length < 2) return "no sections found";
  return null;
}

async function captureOne(browser, url, flags) {
  if (covered(await optOuts(), hostOf(url))) throw new Error(`${hostOf(url)} opted out — see src/content/optout.json`);
  const slug = slugFor(url, flags);
  const outDir = path.join(ROOT, "public/captures", slug);
  await mkdir(outDir, { recursive: true });
  await mkdir(RAW, { recursive: true });

  const byVp = {};
  const shots = {};
  try {
    for (const vp of Object.keys(VIEWPORTS)) {
      const { raw, shot } = await shoot(browser, url, vp, outDir, flags.locale);
      const why = vp === "desktop" ? rejection(raw) : null;
      if (why) throw new Error(why);
      byVp[vp] = raw;
      shots[vp] = { src: `/captures/${slug}/${vp}.jpg`, ...shot };
    }
  } catch (e) {
    await rm(outDir, { recursive: true, force: true });
    throw e;
  }

  await writeFile(path.join(RAW, `${slug}.json`), JSON.stringify({ byVp, opts: flags }));
  const rec = record({ url, slug, opts: flags, byVp, shots, capturedAt: new Date().toISOString() });
  await upsert(rec);
  return rec;
}

function report(rec) {
  console.log(`\n✓ ${rec.source.name} — ${rec.title} (${rec.category}, ${rec.dir})`);
  console.log(`  palette  bg ${rec.palette.bg} · text ${rec.palette.text} · accent ${rec.palette.accent}`);
  console.log(`  type     ${rec.type.fonts.heading} / ${rec.type.fonts.body} · ${rec.type.scale.map((s) => s.size).join(", ")}`);
  console.log(`  rhythm   ${rec.rhythm.base}px base · radius ${rec.rhythm.radius} · container ${rec.rhythm.container}`);
  console.log(`  blocks   ${rec.blocks.map((b) => b.type).join(" → ")}`);
  console.log(`  tech     ${rec.tech.join(", ") || "—"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
