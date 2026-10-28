import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { Lang } from "@/i18n/config";
import { itemTitle } from "@/i18n/content";
import { DICTS } from "@/i18n/dict";
import { fill } from "@/i18n/format";
import { arabicForms } from "./arabicForms";
import { dirOf, type Item } from "./data";
import { cropShot } from "./shots";
import { SITE_URL } from "./site";
import { name, CATEGORIES, COMPONENT_TYPES, INDUSTRIES } from "./taxonomy";

/**
 * Share cards for links on social, chat and search — the site's own look (ink on paper, square
 * corners, hard shadow) with the design itself on the right. A real capture shows its screenshot,
 * cropped to the block for a component; a procedural item shows a wireframe in its palette.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#1c1b18";
const PAPER = "#fdf1d6";
const PAPER_2 = "#f6e4bf";
const MUTED = "#4d4a42";
const ACCENT = "#f47a2c";
const SIGNAL = "#f8dc3d";
const PANEL = { w: 500, h: 520 };

/*
 * Arabic cards. The renderer joins Arabic letters but lays every line out left to right, and reads
 * neither variable fonts nor Readex Pro's (or Noto's) contextual lookups — so the face is Tajawal
 * (static, OFL, Latin included), and Arabic text is laid out word by word, right to left.
 */
let tajawal: { name: string; data: Buffer; weight: 400 | 700; style: "normal" }[] | undefined;
/* whole literal paths, so the deployment's file tracing ships the fonts with the function */
const arabicFonts = () =>
  (tajawal ??= [
    { name: "Tajawal", data: readFileSync(path.join(process.cwd(), "src/lib/fonts/Tajawal-Regular.ttf")), weight: 400, style: "normal" },
    { name: "Tajawal", data: readFileSync(path.join(process.cwd(), "src/lib/fonts/Tajawal-Bold.ttf")), weight: 700, style: "normal" },
  ]);
const options = (lang: Lang) => (lang === "ar" ? { ...OG_SIZE, fonts: arabicFonts() } : OG_SIZE);

const ARABIC = /[\u0600-\u06FF]/;
/*
 * An Arabic word in the order the renderer should draw it: shaped letters, reversed — except that
 * it still reverses runs of unjoined letters itself ("وا" in «واجهات», "ان" in «الألوان»), so those
 * runs are put back first.
 */
const visual = (word: string) =>
  [...arabicForms(word)]
    .reverse()
    .join("")
    .replace(/[\u0600-\u06FF]{2,}/g, (run) => [...run].reverse().join(""));
/** A line of text in the card's direction. In Arabic, a run of Latin words ("Al Rajhi Bank") stays together and in order. */
function Text({ text, lang, style }: { text: string; lang: Lang; style: React.CSSProperties }) {
  if (lang !== "ar") return <div style={{ display: "flex", ...style }}>{text}</div>;
  const runs: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = runs.length - 1;
    if (last >= 0 && !ARABIC.test(w) && !ARABIC.test(runs[last])) runs[last] += ` ${w}`;
    else runs.push(w);
  }
  return (
    <div style={{ display: "flex", flexDirection: "row-reverse", flexWrap: "wrap", columnGap: "0.25em", ...style }}>
      {runs.map((r, n) => (
        <span key={n}>{ARABIC.test(r) ? visual(r) : r}</span>
      ))}
    </div>
  );
}

const LOGO =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" fill="#f47a2c" stroke="#1c1b18" stroke-width="2"/><path d="M9 7v11a7 7 0 0 0 14 0V7" fill="none" stroke="#1c1b18" stroke-width="4.5" stroke-linecap="square"/><circle cx="16" cy="17.5" r="3" fill="#f8dc3d" stroke="#1c1b18" stroke-width="1.5"/></svg>',
  ).toString("base64");

function Wordmark({ lang }: { lang: Lang }) {
  return (
    <div style={{ display: "flex", flexDirection: lang === "ar" ? "row-reverse" : "row", alignItems: "center", gap: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
      <img src={LOGO} width={44} height={44} alt="" />
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5, color: INK }}>Uiverse</div>
    </div>
  );
}

/* the top of the capture (or the component's block), at the panel's width */
async function screenshot(item: Item): Promise<{ src: string; h: number } | null> {
  if (item.live) return poster(item);
  const shot = item.capture?.shots.desktop;
  if (!shot) return null;
  const crop = item.kind === "component" ? (item.capture!.crops?.desktop ?? item.crop) : undefined;
  try {
    const { jpeg, h } = await cropShot(shot, crop, { maxH: (PANEL.h / PANEL.w) * shot.css, width: PANEL.w * 2, quality: 80 });
    return { src: `data:image/jpeg;base64,${jpeg.toString("base64")}`, h: Math.round((h / shot.css) * PANEL.w) };
  } catch {
    /* a missing screenshot shouldn't cost the link its card — fall back to the wireframe */
    return null;
  }
}

/* an original's feed still, from the site itself (it isn't in the captures bucket) */
async function poster(item: Item) {
  const live = item.live!;
  try {
    const file = path.join(process.cwd(), "public", live.poster);
    const bytes = existsSync(file) ? await readFile(file) : Buffer.from(await (await fetch(new URL(live.poster, SITE_URL))).arrayBuffer());
    const jpeg = await sharp(bytes).resize({ width: PANEL.w * 2 }).jpeg({ quality: 80 }).toBuffer();
    return { src: `data:image/jpeg;base64,${jpeg.toString("base64")}`, h: Math.round((PANEL.w * live.h) / live.w) };
  } catch {
    return null;
  }
}

function Wireframe({ item }: { item: Item }) {
  const p = item.palette;
  const bar = (w: number | string, h: number, c: string) => <div style={{ width: w, height: h, background: c, display: "flex" }} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: p.bg, padding: 28, gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {bar(90, 14, p.text)}
        <div style={{ display: "flex", gap: 12 }}>
          {bar(44, 10, p.muted)}
          {bar(44, 10, p.muted)}
          {bar(70, 24, p.accent)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 34 }}>
        {bar("82%", 30, p.text)}
        {bar("58%", 30, p.text)}
        {bar("70%", 12, p.muted)}
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          {bar(120, 38, p.accent)}
          {bar(120, 38, p.surface)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
        {[0, 1, 2].map((n) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, height: 150, background: p.surface, padding: 16 }}>
            {bar(36, 36, n === 1 ? p.accent : p.raised)}
            {bar("80%", 10, p.text)}
            {bar("60%", 10, p.muted)}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function itemCard(item: Item, lang: Lang = "en") {
  const t = DICTS[lang].og;
  const ar = lang === "ar";
  const shot = await screenshot(item);
  const kind = item.kind === "component" ? name(COMPONENT_TYPES, item.componentType, lang) : name(CATEGORIES, item.category, lang);
  const tags = [item.kind === "component" ? t.component : t.screen, kind, name(INDUSTRIES, item.industry, lang)];
  if (dirOf(item) === "rtl") tags.push(t.rtl);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: ar ? "row-reverse" : "row",
          width: "100%",
          height: "100%",
          background: PAPER,
          padding: 48,
          gap: 48,
          color: INK,
          /* the renderer can't take an unset font, so English keeps its default by not naming one */
          ...(ar ? { fontFamily: "Tajawal" } : {}),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: ar ? "flex-end" : "flex-start", flex: 1 }}>
          <Wordmark lang={lang} />
          <div style={{ display: "flex", flexDirection: ar ? "row-reverse" : "row", gap: 8, marginTop: 44, flexWrap: "wrap" }}>
            {tags.map((tag, n) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: 20,
                  padding: "6px 12px",
                  border: `2px solid ${INK}`,
                  background: n === 0 ? SIGNAL : PAPER,
                  textTransform: "uppercase",
                  letterSpacing: ar ? 0 : 1,
                }}
              >
                <Text text={tag} lang={lang} style={{}} />
              </div>
            ))}
          </div>
          <Text text={item.source.name} lang={lang} style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: ar ? 0 : -2, marginTop: 28 }} />
          <Text text={itemTitle(item, lang)} lang={lang} style={{ fontSize: 38, color: MUTED, marginTop: 10 }} />
          <div style={{ display: "flex", flexDirection: ar ? "row-reverse" : "row", alignItems: "center", gap: 18, marginTop: "auto" }}>
            <div style={{ display: "flex" }}>
              {item.colors.slice(0, 5).map((c, n) => (
                <div key={n} style={{ display: "flex", width: 44, height: 44, background: c, border: `2px solid ${INK}`, marginLeft: n ? -2 : 0 }} />
              ))}
            </div>
            <Text
              text={item.capture ? fill(t.capturedFrom, { domain: item.source.domain }) : t.sample}
              lang={lang}
              style={{ fontSize: 22, color: MUTED }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: PANEL.w,
            height: PANEL.h + 4,
            marginTop: 2,
            border: `2px solid ${INK}`,
            boxShadow: `10px 10px 0 ${INK}`,
            background: shot ? item.palette.bg : PAPER_2,
            overflow: "hidden",
            alignItems: item.kind === "component" ? "center" : "flex-start",
          }}
        >
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser
            <img src={shot.src} width={PANEL.w - 4} height={shot.h} alt="" />
          ) : (
            <Wireframe item={item} />
          )}
        </div>
      </div>
    ),
    options(lang),
  );
}

/* the default card, for every page without its own */
export function siteCard(lang: Lang = "en") {
  const t = DICTS[lang].og;
  const ar = lang === "ar";
  const swatches = [ACCENT, SIGNAL, "#2d6a4f", "#1d3557", "#e9c46a", INK];
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: ar ? "flex-end" : "flex-start",
          width: "100%",
          height: "100%",
          background: PAPER,
          padding: 64,
          color: INK,
          /* the renderer can't take an unset font, so English keeps its default by not naming one */
          ...(ar ? { fontFamily: "Tajawal" } : {}),
        }}
      >
        <Wordmark lang={lang} />
        <Text text={t.headline} lang={lang} style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.1, letterSpacing: ar ? 0 : -3, marginTop: 64, maxWidth: 900 }} />
        <Text text={t.sub} lang={lang} style={{ fontSize: 32, color: MUTED, marginTop: 28, maxWidth: 860, lineHeight: 1.4 }} />
        <div style={{ display: "flex", flexDirection: ar ? "row-reverse" : "row", marginTop: "auto" }}>
          {swatches.map((c, n) => (
            <div key={n} style={{ display: "flex", width: 72, height: 72, background: c, border: `2px solid ${INK}`, marginLeft: n ? -2 : 0 }} />
          ))}
        </div>
      </div>
    ),
    options(lang),
  );
}
