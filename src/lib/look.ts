import type { Item } from "./data";

/**
 * Visual search without a model: an uploaded screenshot is reduced to the same facts every item
 * already carries — background, text and accent colour, and the device it was taken on — and the
 * catalogue is ranked by distance to them in OKLab. The image never leaves the browser; only the
 * three colours and the device go into the URL, so a result page is shareable and server-rendered.
 */

export type Device = "desktop" | "mobile";
export type Look = { bg: string; text: string; accent: string; device?: Device };

type Lab = [number, number, number];

const lin = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

function rgbLab(r: number, g: number, b: number): Lab {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const parseHex = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

export const isHex = (s: unknown): s is string => typeof s === "string" && /^#[0-9a-f]{6}$/i.test(s);
export const lab = (hex: string) => rgbLab(...parseHex(hex));
const dist = (a: Lab, b: Lab) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const chroma = (c: Lab) => Math.hypot(c[1], c[2]);
export const isDark = (hex: string) => lab(hex)[0] < 0.6;

/**
 * The look of an image from its RGBA pixels (a downscaled canvas is plenty). Colours are binned
 * at 4 bits a channel: the biggest bin is the background, the bin furthest from it in lightness is
 * the text, and the most saturated bin with real coverage is the accent — a monochrome page has
 * none, and its accent is its text, as in the catalogue's own monochrome palettes.
 */
export function lookFromPixels(data: ArrayLike<number>, width: number, height: number): Look {
  const bins = new Map<number, { n: number; r: number; g: number; b: number }>();
  let total = 0;
  for (let i = 0; i < width * height * 4; i += 4) {
    if (data[i + 3] < 128) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bin = bins.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bin.n++;
    bin.r += r;
    bin.g += g;
    bin.b += b;
    bins.set(key, bin);
    total++;
  }
  const colours = [...bins.values()]
    .sort((a, b) => b.n - a.n)
    .map((x) => {
      const hex = toHex(x.r / x.n, x.g / x.n, x.b / x.n);
      return { hex, share: x.n / Math.max(1, total), lab: lab(hex) };
    });
  if (!colours.length) return { bg: "#ffffff", text: "#111111", accent: "#111111" };

  const bg = colours[0];
  const text =
    colours
      .filter((c) => c.share >= 0.003)
      .reduce((best, c) => (Math.abs(c.lab[0] - bg.lab[0]) > Math.abs(best.lab[0] - bg.lab[0]) ? c : best), bg);
  /* fall back to black or white when nothing on the page contrasts with its background */
  const textHex = Math.abs(text.lab[0] - bg.lab[0]) > 0.3 ? text.hex : bg.lab[0] > 0.6 ? "#111111" : "#fafafa";
  const accent = colours
    .filter((c) => c.share >= 0.002 && chroma(c.lab) > 0.06 && dist(c.lab, bg.lab) > 0.12)
    .map((c) => ({ c, score: chroma(c.lab) * Math.log1p(c.share * 1000) }))
    .sort((a, b) => b.score - a.score)[0]?.c;

  return { bg: bg.hex, text: textHex, accent: accent?.hex ?? textHex };
}

/**
 * Device from an image's size. A phone screenshot is narrow and portrait; a desktop one is wide —
 * or, as a full-page capture, tall but well over a phone's pixel width. It's a guess the page shows
 * and lets the viewer change.
 */
export const guessDevice = (width: number, height: number): Device =>
  width / height < 0.7 && width <= 1300 ? "mobile" : "desktop";

/** How far an item's palette is from a look: lower is closer. Accent carries most of a brand's identity. */
export function lookDistance(look: Look, item: Item) {
  const p = item.palette;
  let d =
    dist(lab(look.bg), lab(p.bg)) +
    1.4 * dist(lab(look.accent), lab(p.accent)) +
    0.5 * dist(lab(look.text), lab(p.text));
  if (isDark(look.bg) !== p.dark) d += 0.25;
  return d;
}

/**
 * Screens closest to a look, on its device when it names one — a chosen device is a filter, not a
 * preference. Real captures win ties: they're the evidence, procedural previews the filler.
 */
export function similarToLook(look: Look, items: Item[], n = 48) {
  return items
    .filter((i) => i.kind === "screen" && (!look.device || (i.device === "mobile") === (look.device === "mobile")))
    .map((i) => ({ i, d: lookDistance(look, i) - (i.capture ? 0.02 : 0) }))
    .sort((a, b) => a.d - b.d || b.i.weight - a.i.weight)
    .slice(0, n)
    .map((x) => x.i);
}

/** A look as URL params and back — the result page is a link, not a session. */
export const lookQuery = (look: Look) =>
  new URLSearchParams({
    bg: look.bg.slice(1),
    accent: look.accent.slice(1),
    text: look.text.slice(1),
    ...(look.device ? { device: look.device } : {}),
  }).toString();

export function lookFromParams(sp: Record<string, string | string[] | undefined>): Look | null {
  const hex = (k: string) => (typeof sp[k] === "string" ? `#${(sp[k] as string).toLowerCase()}` : undefined);
  const [bg, accent, text] = [hex("bg"), hex("accent"), hex("text")];
  if (!isHex(bg) || !isHex(accent) || !isHex(text)) return null;
  const device = sp.device === "mobile" || sp.device === "desktop" ? sp.device : undefined;
  return { bg, accent, text, device };
}
