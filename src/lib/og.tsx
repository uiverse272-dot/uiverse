import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { Item } from "./data";
import { shotBytes } from "./shots";
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

const LOGO =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" fill="#f47a2c" stroke="#1c1b18" stroke-width="2"/><path d="M9 7v11a7 7 0 0 0 14 0V7" fill="none" stroke="#1c1b18" stroke-width="4.5" stroke-linecap="square"/><circle cx="16" cy="17.5" r="3" fill="#f8dc3d" stroke="#1c1b18" stroke-width="1.5"/></svg>',
  ).toString("base64");

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
      <img src={LOGO} width={44} height={44} alt="" />
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5, color: INK }}>Uiverse</div>
    </div>
  );
}

/* the top of the capture (or the component's block), at the panel's width */
async function screenshot(item: Item): Promise<{ src: string; h: number } | null> {
  const shot = item.capture?.shots.desktop;
  if (!shot) return null;
  const crop = item.kind === "component" ? (item.capture!.crops?.desktop ?? item.crop) : undefined;
  const top = crop ? crop.y * shot.docH : 0;
  const h = Math.min(crop ? crop.h * shot.docH : shot.cssH, (PANEL.h / PANEL.w) * shot.css, shot.cssH - top);
  const scale = shot.w / shot.css;
  try {
    const buf = await sharp(await shotBytes(shot.src))
      .extract({ left: 0, top: Math.round(top * scale), width: shot.w, height: Math.max(1, Math.round(h * scale)) })
      .resize({ width: PANEL.w * 2, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    return { src: `data:image/jpeg;base64,${buf.toString("base64")}`, h: Math.round((h / shot.css) * PANEL.w) };
  } catch {
    /* a missing screenshot shouldn't cost the link its card — fall back to the wireframe */
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

export async function itemCard(item: Item) {
  const shot = await screenshot(item);
  const kind = item.kind === "component" ? name(COMPONENT_TYPES, item.componentType) : name(CATEGORIES, item.category);
  const tags = [item.kind === "component" ? "Component" : "Screen", kind, name(INDUSTRIES, item.industry)];
  if (item.capture?.dir === "rtl") tags.push("RTL");

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: PAPER, padding: 48, gap: 48, color: INK }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Wordmark />
          <div style={{ display: "flex", gap: 8, marginTop: 44, flexWrap: "wrap" }}>
            {tags.map((t, n) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  fontSize: 20,
                  padding: "6px 12px",
                  border: `2px solid ${INK}`,
                  background: n === 0 ? SIGNAL : PAPER,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2, marginTop: 28 }}>
            {item.source.name}
          </div>
          <div style={{ display: "flex", fontSize: 38, color: MUTED, marginTop: 10 }}>{item.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: "auto" }}>
            <div style={{ display: "flex" }}>
              {item.colors.slice(0, 5).map((c, n) => (
                <div key={n} style={{ display: "flex", width: 44, height: 44, background: c, border: `2px solid ${INK}`, marginLeft: n ? -2 : 0 }} />
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 22, color: MUTED }}>
              {item.capture ? `Captured from ${item.source.domain}` : "Palette · type scale · layout"}
            </div>
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
    OG_SIZE,
  );
}

/* the default card, for every page without its own */
export function siteCard() {
  const swatches = [ACCENT, SIGNAL, "#2d6a4f", "#1d3557", "#e9c46a", INK];
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: PAPER, padding: 64, color: INK }}>
        <Wordmark />
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: -3, marginTop: 64, maxWidth: 900 }}>
          Interfaces worth building.
        </div>
        <div style={{ display: "flex", fontSize: 32, color: MUTED, marginTop: 28, maxWidth: 860, lineHeight: 1.3 }}>
          Real websites, apps and components, broken down into palette, type scale, spacing and layout.
        </div>
        <div style={{ display: "flex", marginTop: "auto" }}>
          {swatches.map((c, n) => (
            <div key={n} style={{ display: "flex", width: 72, height: 72, background: c, border: `2px solid ${INK}`, marginLeft: n ? -2 : 0 }} />
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
