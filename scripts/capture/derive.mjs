/**
 * Turns raw page measurements (extract.js) into the design facts the app shows:
 * colour roles, a type scale, a spacing rhythm, named blocks and responsive rules.
 *
 * Pure functions over plain data — no browser needed, so heuristics can be
 * re-run over stored measurements when they improve.
 */

/* ---------------------------------------------------------------- colour */

export function toHex(css) {
  const m = String(css).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

export function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** HSL-style saturation scaled by how far from black/white — greys and near-blacks score ~0 */
export function chroma(hex) {
  const c = rgb(hex);
  return Math.max(...c) - Math.min(...c);
}

function mix(a, b, t) {
  const [x, y] = [rgb(a), rgb(b)];
  return "#" + x.map((v, i) => Math.round((v + (y[i] - v) * t) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** Merge near-identical colours (anti-aliasing, 1-step gradients) into their heaviest neighbour */
function tally(entries) {
  const out = [];
  for (const [css, weight] of entries) {
    const hex = toHex(css);
    if (!hex) continue;
    const near = out.find((o) => Math.max(...rgb(o.hex).map((v, i) => Math.abs(v - rgb(hex)[i]))) < 0.025);
    if (near) near.weight += weight;
    else out.push({ hex, weight });
  }
  return out.sort((a, b) => b.weight - a.weight);
}

export function colourRoles(raw) {
  const painted = tally(Object.entries(raw.painted));
  const texts = tally(raw.text.map((t) => [t.color, t.chars]));
  const borders = tally(Object.entries(raw.borders));

  const bg = painted[0]?.hex ?? "#FFFFFF";
  const dark = luminance(bg) < 0.18;
  const neutral = (h) => chroma(h) < 0.12;

  /* surfaces: the next most-painted neutrals that sit close to the background */
  const near = painted.filter((p) => p.hex !== bg && neutral(p.hex) && contrast(p.hex, bg) < 1.6);
  const surface = near[0]?.hex ?? mix(bg, dark ? "#FFFFFF" : "#000000", 0.03);
  const raised = near[1]?.hex ?? mix(surface, dark ? "#FFFFFF" : "#000000", 0.04);

  /* text: of the neutrals carrying real volume, the strongest — greys often outweigh the true ink */
  const readable = texts.filter((t) => contrast(t.hex, bg) >= 3);
  const inks = readable.filter((t) => neutral(t.hex));
  const text =
    inks.filter((t) => t.weight >= (inks[0]?.weight ?? 0) * 0.2).sort((a, b) => contrast(b.hex, bg) - contrast(a.hex, bg))[0]?.hex ??
    (dark ? "#FFFFFF" : "#111111");
  const muted =
    readable.find((t) => t.hex !== text && neutral(t.hex) && contrast(t.hex, bg) < contrast(text, bg))?.hex ??
    mix(text, bg, 0.42);

  /*
   * accent: a saturated control fill wins; a monochrome site's solid CTA (white on black) is its
   * accent too, and only a site with no solid controls at all falls back to a saturated link colour
   */
  const solid = tally(raw.controls.filter((c) => c.opaque).map((c) => [c.bg, 1])).filter(
    (f) => contrast(f.hex, bg) >= 1.6 && contrast(f.hex, surface) >= 1.6,
  );
  const accentFill = solid.find((f) => chroma(f.hex) >= 0.2)?.hex ?? solid[0]?.hex;
  const accentText = texts.find((t) => chroma(t.hex) >= 0.25 && contrast(t.hex, bg) >= 3)?.hex;
  const accent = accentFill ?? accentText ?? text;
  const onAccent = raw.controls.find((c) => c.opaque && toHex(c.bg) === accent);
  const accentFg = onAccent ? toHex(onAccent.color) : contrast(accent, "#FFFFFF") >= contrast(accent, "#000000") ? "#FFFFFF" : "#000000";

  const border = borders.find((b) => b.hex !== text && contrast(b.hex, bg) < 2.2)?.hex ?? mix(bg, text, 0.12);

  /* chart: the distinct saturated colours on the page, accent first */
  const saturated = [accent, ...tally([...Object.entries(raw.painted), ...raw.text.map((t) => [t.color, t.chars]), ...raw.controls.map((c) => [c.bg, 40])])
    .map((c) => c.hex)
    .filter((h) => chroma(h) >= 0.25)];
  const chart = [...new Set(saturated)].slice(0, 4);
  while (chart.length < 4) chart.push(mix(accent, bg, 0.25 * chart.length));

  return { bg, surface, raised, text, muted, accent, accentFg, border, chart, dark };
}

/* ---------------------------------------------------------------- type */

const USE = {
  h1: "Page headline", h2: "Section header", h3: "Card title", h4: "Card title", h5: "Label", h6: "Label",
  p: "Paragraph", a: "Links, buttons", button: "Buttons", label: "Form labels", li: "List items",
};

/** Webfont exports mangle family names ("Inter Variable", "Plusjakartasans 2") — undo the common ones */
const GENERIC =
  /^(?:regular|normal|bold|medium|light|book|ui-sans-serif|ui-serif|system-ui|-apple-system|blinkmacsystemfont|sans-serif|serif|inherit|segoe ui symbol)$|emoji/i;
/* next/font hashes its family names ("__arFont_c0e974") */
const HASHED = /^__\w+_[0-9a-f]{5,}$/i;

export function familyName(stack) {
  const names = stack
    .split(",")
    .map((f) => f.replace(/["']/g, "").replace(/\s+(?:variable|var|\d+)$/i, "").replace(/\s+(?:variable|var|\d+)$/i, "").trim())
    .filter(Boolean);
  /* "regular" or a bare system stack says nothing — the first real family does */
  const real = names.find((n) => !GENERIC.test(n) && !HASHED.test(n));
  if (real) return real;
  if (names.some((n) => HASHED.test(n))) return "Self-hosted (next/font)";
  return names.some((n) => /system|apple|ui-sans/i.test(n)) ? "System UI" : names[0];
}

export function typography(raw) {
  const runs = raw.text.filter((t) => t.size >= 9 && t.size <= 160);
  const total = runs.reduce((s, t) => s + t.chars, 0) || 1;

  const families = {};
  for (const t of runs) {
    const f = familyName(t.family);
    families[f] = (families[f] || 0) + t.chars;
  }
  const fontOf = (pred) => {
    const counts = {};
    for (const t of runs.filter(pred)) {
      const f = familyName(t.family);
      counts[f] = (counts[f] || 0) + t.chars;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  };

  /* steps: bucket by size (±1px) and keep the weight and element that carry most text in each */
  const buckets = new Map();
  for (const t of runs) {
    const size = Math.round(t.size * 2) / 2;
    const key = [...buckets.keys()].find((k) => Math.abs(k - size) <= (size > 24 ? 2 : 0.5)) ?? size;
    const b = buckets.get(key) ?? { size: key, chars: 0, weights: {}, tags: {}, sample: "", lineHeight: t.lineHeight, tracking: t.tracking };
    b.chars += t.chars;
    b.weights[t.weight] = (b.weights[t.weight] || 0) + t.chars;
    b.tags[t.tag] = (b.tags[t.tag] || 0) + t.chars;
    if (!b.sample || (t.tag.startsWith("h") && !b.sampleIsHeading)) {
      b.sample = t.sample;
      b.sampleIsHeading = t.tag.startsWith("h");
    }
    buckets.set(key, b);
  }
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0][0];
  const steps = [...buckets.values()]
    .filter((b) => b.chars / total >= 0.004 || b.size >= 32)
    .map((b) => ({ size: b.size, weight: Number(top(b.weights)), tag: top(b.tags), chars: b.chars, sample: b.sample, lineHeight: b.lineHeight, tracking: b.tracking }))
    .sort((a, b) => b.size - a.size);

  const body = [...steps].filter((s) => s.size >= 13 && s.size <= 20).sort((a, b) => b.chars - a.chars)[0] ?? steps[Math.floor(steps.length / 2)];
  const above = steps.filter((s) => s.size > body.size + 1).slice(0, 4);
  const below = steps.filter((s) => s.size < body.size - 0.5);
  const small = [...below].sort((a, b) => b.chars - a.chars)[0];
  const caption = below.filter((s) => s !== small && s.size < (small?.size ?? 0)).sort((a, b) => b.chars - a.chars)[0];

  const names = ["Display", "H1", "H2", "H3"].slice(4 - above.length);
  const scale = [
    ...above.map((s, i) => ({ name: names[i], size: s.size, weight: s.weight, use: USE[s.tag] ?? "Heading", sample: s.sample })),
    { name: "Body", size: body.size, weight: body.weight, use: "Paragraph", sample: body.sample },
    ...(small ? [{ name: "Small", size: small.size, weight: small.weight, use: USE[small.tag] ?? "Meta, labels", sample: small.sample }] : []),
    ...(caption ? [{ name: "Caption", size: caption.size, weight: caption.weight, use: USE[caption.tag] ?? "Eyebrow, badges", sample: caption.sample }] : []),
  ];

  const lh = parseFloat(body.lineHeight);
  return {
    scale,
    body: `${body.size}px / ${Number.isFinite(lh) ? +(lh / body.size).toFixed(2) : "normal"}`,
    fonts: {
      heading: fontOf((t) => t.tag.startsWith("h")) ?? Object.keys(families)[0],
      body: fontOf((t) => t.tag === "p" || t.tag === "li") ?? Object.entries(families).sort((a, b) => b[1] - a[1])[0]?.[0],
    },
  };
}

/* --------------------------------------------------------- space + grid */

export function rhythm(raw) {
  const ranked = Object.entries(raw.space).map(([v, n]) => [Number(v), n]).sort((a, b) => b[1] - a[1]);
  const total = ranked.reduce((s, [, n]) => s + n, 0) || 1;
  const on = (base) => ranked.filter(([v]) => v % base === 0).reduce((s, [, n]) => s + n, 0) / total;
  const base = on(8) >= 0.6 ? 8 : on(4) >= 0.6 ? 4 : on(2) >= 0.6 ? 2 : 1;
  const spacing = ranked.slice(0, 10).map(([v]) => v).sort((a, b) => a - b);

  const radii = Object.entries(raw.radii).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r]) => Number(r)).sort((a, b) => a - b);
  const container = Object.entries(raw.widths).sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]))[0]?.[0];

  return {
    base,
    spacing,
    radius: radii.length ? radii.join(" / ") + "px" : "0",
    container: container ? `${container}px` : "full width",
  };
}

/* ---------------------------------------------------------------- blocks */

const LABEL = {
  navbar: "Navbar", sidebar: "Sidebar", hero: "Hero", "logo-cloud": "Logo cloud", cards: "Card grid", stats: "Metrics band",
  testimonials: "Testimonials", pricing: "Pricing tiers", faq: "FAQ", cta: "CTA band", footer: "Footer", login: "Sign-in form",
  signup: "Sign-up form", table: "Data table", inputs: "Form", feature: "Feature section", section: "Content section",
};

export function classify(b, i, all) {
  if (b.forced) return b.forced;
  const last = i === all.length - 1;
  if (b.tag === "footer" || b.role === "contentinfo" || (last && b.links >= 8)) return "footer";
  if (b.tag === "header" || b.tag === "nav" || b.role === "banner" || (b.first && b.h < 180 && b.links >= 2)) return "navbar";
  if (b.password) return "login";
  if (b.prices >= 2 && b.repeat >= 2) return "pricing";
  if (b.table) return "table";
  if (b.accordions >= 3 || (b.faqWord && b.accordions >= 1)) return "faq";
  if (b.logos >= 5 && b.h < 420 && !b.h1) return "logo-cloud";
  if (b.h1 || (i <= 1 && b.headingSize >= 36)) return "hero";
  if (b.stats >= 3) return "stats";
  if (b.quotes >= 1 && b.h < 900 && b.repeat < 6) return "testimonials";
  if (b.inputs >= 2 && b.h < 700) return b.email ? "signup" : "inputs";
  if (b.repeat >= 3 && b.columns >= 2 && b.h < 1100) return "cards";
  if (b.heading && b.h >= 600) return "feature";
  if (b.h < 520 && b.buttons >= 1 && b.buttons <= 3 && b.headingSize >= 24) return "cta";
  return "section";
}

/**
 * Small bands with no controls of their own — a lone section heading, an eyebrow link — are
 * the top of the band below them, not sections. Fold them in so the outline reads like a page.
 */
function merge(list) {
  const out = [];
  let carry = null;
  for (const b of list) {
    const fragment = !b.forced && !b.first && b.tag !== "footer" && b.h < 200 && b.logos < 5 && b.inputs === 0 && b.buttons <= 1 && b.links <= 2;
    const cur = carry ? fold(carry, b) : b;
    carry = null;
    if (fragment && cur !== list[list.length - 1]) carry = cur;
    else out.push(cur);
  }
  if (carry) out.push(carry);
  return out;
}

function fold(a, b) {
  const out = { ...b, y: a.y, h: b.y + b.h - a.y, heading: b.heading || a.heading, headingSize: Math.max(a.headingSize, b.headingSize) };
  for (const k of ["links", "visibleLinks", "buttons", "inputs", "accordions", "quotes", "prices", "stats", "logos", "images"]) out[k] = a[k] + b[k];
  out.h1 = a.h1 || b.h1;
  out.faqWord = a.faqWord || b.faqWord;
  return out;
}

/** Untitled sections straight after a titled one are its continuation (comparison rows, a long grid) */
function group(list) {
  const out = [];
  for (const b of list) {
    const prev = out[out.length - 1];
    if (b.type === "section" && !b.heading && prev && ["section", "feature", "pricing", "cards", "table"].includes(prev.type) && prev.heading) {
      out[out.length - 1] = { ...prev, h: b.y + b.h - prev.y };
    } else out.push(b);
  }
  return out;
}

/** One hero per page (later h1s are feature heads), and a top bar always leads the outline */
function tidy(list) {
  let hero = false;
  const out = list.map((b) => {
    if (b.type !== "hero") return b;
    if (hero) return { ...b, type: b.heading && b.h >= 600 ? "feature" : "section" };
    hero = true;
    return b;
  });
  const nav = out.findIndex((b) => b.type === "navbar" && b.y < 120);
  if (nav > 0) out.unshift(...out.splice(nav, 1));
  return out;
}

export function blocks(raw) {
  const list = group(tidy(merge(raw.blocks).map((b, i, all) => ({ ...b, type: classify(b, i, all) }))));
  return list.map((b) => ({
    type: b.type,
    label: LABEL[b.type],
    heading: b.heading || undefined,
    y: +(b.y / raw.docH).toFixed(4),
    h: +(b.h / raw.docH).toFixed(4),
    px: { y: Math.round(b.y), h: Math.round(b.h) },
    columns: b.columns || undefined,
    headingSize: b.headingSize || undefined,
    links: b.visibleLinks,
    menuButton: b.menuButton || undefined,
  }));
}

/* ------------------------------------------------------------ responsive */

/**
 * "How it adapts", read across the three real captures. Blocks are matched by
 * type in page order, so each rule compares the same section at each width.
 */
export function responsive(byVp) {
  const { desktop, tablet, mobile } = byVp;
  const key = (h) => (h || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 24);

  /* the same section at another width: same heading, else same type in the same order, else same place on the page */
  const finder = (list) => {
    const used = new Set();
    return (b) => {
      const pos = b.y + b.h / 2;
      const hit =
        (b.heading && list.find((x) => !used.has(x) && key(x.heading) === key(b.heading))) ||
        list.filter((x) => !used.has(x) && x.type === b.type)[0] ||
        list.filter((x) => !used.has(x)).sort((p, q) => Math.abs(p.y + p.h / 2 - pos) - Math.abs(q.y + q.h / 2 - pos))[0];
      if (hit && Math.abs(hit.y + hit.h / 2 - pos) > 0.25 && !(b.heading && key(hit.heading) === key(b.heading))) return undefined;
      if (hit) used.add(hit);
      return hit;
    };
  };
  const inTablet = finder(tablet.blocks);
  const inMobile = finder(mobile.blocks);

  const rules = [];
  const seen = {};
  for (const b of desktop.blocks) {
    const nth = (seen[b.type] = (seen[b.type] ?? -1) + 1);
    const t = inTablet(b);
    const m = inMobile(b);
    const label = b.heading && b.type !== "navbar" && b.type !== "footer" ? `${b.label}: ${b.heading.slice(0, 32)}` : nth ? `${b.label} ${nth + 1}` : b.label;
    const parts = [];
    if (b.type === "navbar") {
      const fmt = (x) => (!x ? "—" : x.menuButton || x.links <= 2 ? "menu button" : `${x.links} links`);
      parts.push([fmt(b), fmt(t), fmt(m)].join(" → "));
    }
    if (b.type === "sidebar" && !m) parts.push("collapses behind navigation on mobile");
    const cols = [b.columns, t?.columns, m?.columns];
    if (b.type !== "logo-cloud" && b.columns >= 2 && b.columns <= 6 && cols.some((c) => c && c !== b.columns) && cols.every((c) => !c || c <= b.columns))
      parts.push(`${b.columns} columns → ${t?.columns ?? b.columns} → ${m?.columns ?? 1}`);
    if (b.headingSize >= 20 && (t?.headingSize || m?.headingSize))
      parts.push(`heading ${b.headingSize}px → ${t?.headingSize ?? "—"}px → ${m?.headingSize ?? "—"}px`);
    if (parts.length) rules.push([label, parts.join("; "), [b.type]]);
  }
  rules.push(["Page length", `${desktop.docH}px → ${tablet.docH}px → ${mobile.docH}px`, []]);
  return rules;
}

/* ------------------------------------------------------------- metadata */

/**
 * Direction of the page as read, not as declared: some sites leave <html> ltr and set rtl on a
 * wrapper. If most measured text is in an RTL script, the page is RTL.
 */
export function direction(raw) {
  if (raw.dir === "rtl") return "rtl";
  let rtl = 0;
  let letters = 0;
  for (const t of raw.text) {
    const s = t.sample.replace(/[^\p{L}]/gu, "");
    if (!s) continue;
    const share = (s.match(/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g) || []).length / s.length;
    rtl += share * t.chars;
    letters += t.chars;
  }
  return letters && rtl / letters > 0.5 ? "rtl" : "ltr";
}

/** The brand, not the page: og:site_name, else the title segment naming the domain, else the domain */
export function siteName(raw, domain) {
  const label = domain.split(".").slice(-2)[0];
  const parts = [raw.siteName, ...raw.title.split(/\s[|–—·-]\s|:\s/)].map((x) => (x || "").trim()).filter(Boolean);
  return (
    parts.find((x) => x.toLowerCase().replace(/\s/g, "") === label) ??
    label.charAt(0).toUpperCase() + label.slice(1)
  );
}

/** "Pricing" from /pricing; locale segments (/ar-SA, /en) are not page names */
export function pageTitle(pathname) {
  /* locale and market segments (/ar-SA, /en, /uae, /saudi-ar, /sa-ar) are routing, not a page name */
  const market = /^(?:[a-z]{2,3}(?:[-_][a-z]{2,4})?|saudi(?:-\w+)?|uae|ksa|egypt|kuwait|qatar|bahrain|oman|jordan)$/i;
  const seg = pathname.split("/").filter((x) => x && !market.test(x)).pop();
  return seg ? decodeURIComponent(seg).replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "Homepage";
}

export function category(blockList, path) {
  const types = new Set(blockList.map((b) => b.type));
  /* a homepage that shows prices is a storefront, not a pricing page */
  const home = pageTitle(path) === "Homepage";
  if (/pricing|plans/i.test(path) || (types.has("pricing") && !home)) return "pricing";
  if (types.has("login") || /login|sign-?in/i.test(path)) return "auth";
  if (/checkout|cart|basket/i.test(path)) return "checkout";
  if (/docs|documentation/i.test(path)) return "docs";
  if (/blog|journal|news|articles/i.test(path)) return "blog";
  return "landing-page";
}

export const ARCHETYPE_OF = {
  pricing: "pricing", auth: "auth", checkout: "checkout", docs: "docs", blog: "editorial", "landing-page": "saas-landing",
};

export function style(roles, raw) {
  const saturatedShare = Object.entries(raw.painted)
    .filter(([c]) => chroma(toHex(c) ?? "#000000") >= 0.25)
    .reduce((s, [, n]) => s + n, 0) / (Object.values(raw.painted).reduce((s, n) => s + n, 0) || 1);
  if (roles.dark) return "dark";
  if (saturatedShare > 0.25) return "playful";
  if (chroma(roles.accent) < 0.12) return "minimal";
  return "light";
}

export function techList(byVp) {
  const t = byVp.desktop.tech;
  const out = Object.keys(t).filter((k) => t[k]);
  if (t.nextjs && !out.includes("react")) out.unshift("react");
  return out;
}
