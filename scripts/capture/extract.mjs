/**
 * Runs inside the captured page (serialised by Playwright), so it must stay
 * self-contained: no imports, no closures over Node values.
 *
 * It measures and does not interpret. Every number is read from computed
 * styles or layout boxes; turning those into roles, a type scale and named
 * blocks happens in derive.mjs, where it can be tested without a browser.
 */
export function measurePage() {
  const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const all = Array.from(document.body.querySelectorAll("*")).slice(0, 12000);

  const visible = (el, cs = getComputedStyle(el)) => {
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  /* boxes in page coordinates — the page may be scrolled while measuring */
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  };
  const opaque = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    const parts = m[1].split(/[,\s/]+/).filter(Boolean);
    return parts.length < 4 || Number(parts[3]) >= 0.85;
  };

  /* ------------------------------------------------------------ text */
  const text = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n && text.length < 4000; n = walker.nextNode()) {
    const t = n.textContent.replace(/\s+/g, " ").trim();
    const el = n.parentElement;
    if (!t || !el || seen.has(el) || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) continue;
    seen.add(el);
    const heading = el.closest("h1,h2,h3,h4,h5,h6");
    const control = el.closest("a,button,[role=button],label");
    text.push({
      chars: Math.min(t.length, 400),
      sample: t.slice(0, 60),
      color: cs.color,
      size: parseFloat(cs.fontSize),
      weight: Number(cs.fontWeight) || 400,
      lineHeight: cs.lineHeight,
      tracking: cs.letterSpacing,
      family: cs.fontFamily,
      tag: heading ? heading.tagName.toLowerCase() : control ? control.tagName.toLowerCase() : el.tagName.toLowerCase(),
      y: box(el).y,
    });
  }

  /* ------------------------------------------------- painted background */
  /* sample the page on a grid and record what is actually painted at each point */
  const painted = {};
  let media = 0;
  const cols = 24;
  const step = Math.max(40, Math.round(vh / 12));
  for (let top = 0; top < Math.min(docH, 20000); top += vh) {
    window.scrollTo(0, top);
    for (let y = step / 2; y < vh && top + y < docH; y += step) {
      for (let c = 0; c < cols; c++) {
        let el = document.elementFromPoint(((c + 0.5) * vw) / cols, y);
        let hit = null;
        while (el) {
          const cs = getComputedStyle(el);
          if (["IMG", "VIDEO", "CANVAS", "PICTURE", "IFRAME"].includes(el.tagName) || (cs.backgroundImage !== "none" && !cs.backgroundImage.startsWith("linear-gradient(rgba(0, 0, 0, 0)"))) {
            hit = "media";
            break;
          }
          if (opaque(cs.backgroundColor)) {
            hit = cs.backgroundColor;
            break;
          }
          el = el.parentElement;
        }
        if (!hit) hit = getComputedStyle(document.body).backgroundColor;
        if (!opaque(hit) && hit !== "media") hit = getComputedStyle(document.documentElement).backgroundColor;
        if (!opaque(hit) && hit !== "media") hit = "rgb(255, 255, 255)";
        if (hit === "media") media++;
        else painted[hit] = (painted[hit] || 0) + 1;
      }
    }
  }
  window.scrollTo(0, 0);

  /* ------------------------------------- controls, borders, radii, space */
  const controls = [];
  const borders = {};
  const radii = {};
  const space = {};
  const widths = {};
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) continue;
    const b = box(el);

    if (el.matches("a,button,[role=button],input[type=submit]") && b.w < 480 && b.h < 120) {
      controls.push({ bg: cs.backgroundColor, color: cs.color, opaque: opaque(cs.backgroundColor), w: b.w, h: b.h, radius: cs.borderTopLeftRadius });
    }
    for (const side of ["Top", "Bottom", "Left", "Right"]) {
      if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== "none" && opaque(cs[`border${side}Color`])) {
        const len = side === "Top" || side === "Bottom" ? b.w : b.h;
        borders[cs[`border${side}Color`]] = (borders[cs[`border${side}Color`]] || 0) + len;
      }
    }
    const r = parseFloat(cs.borderTopLeftRadius);
    if (r > 0 && r < 200 && (opaque(cs.backgroundColor) || parseFloat(cs.borderTopWidth) > 0)) radii[Math.round(r)] = (radii[Math.round(r)] || 0) + 1;
    for (const p of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
      const v = Math.round(parseFloat(cs[p]));
      if (v > 0 && v <= 160) space[v] = (space[v] || 0) + 1;
    }
    /* a centred box narrower than the viewport is a container candidate */
    const left = b.x;
    const right = vw - (b.x + b.w);
    if (b.w >= 600 && b.w < vw - 40 && Math.abs(left - right) < 2 && b.h > 80) {
      const w = Math.round(b.w);
      widths[w] = (widths[w] || 0) + 1;
    }
  }

  /* ---------------------------------------------------------- sections */
  const significant = (el) => {
    if (!(el instanceof HTMLElement) || ["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK"].includes(el.tagName)) return false;
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) return false;
    if (cs.position === "fixed" && !el.matches("header,nav,[role=banner]")) return false; // cookie banners, chat bubbles
    const b = box(el);
    return b.h >= 40 && b.w >= vw * 0.5;
  };
  const kids = (el) => Array.from(el.children).filter(significant);

  /* descend through single-child wrappers, then expand tall wrappers into their bands */
  let root = document.body;
  for (let i = 0; i < 12; i++) {
    const k = kids(root);
    if (k.length !== 1) break;
    root = k[0];
  }
  const expand = (els, depth) =>
    els.flatMap((el) => {
      if (depth >= 8 || box(el).h <= vh * 1.4 || el.matches("header,footer,nav,[role=banner],[role=contentinfo]")) return [el];
      const k = kids(el);
      if (k.length === 1) return expand(k, depth + 1);
      /* mostly a vertical run of children — side-by-side layouts stay one band */
      const below = k.filter((c, i) => i === 0 || box(c).y >= box(k[i - 1]).y + box(k[i - 1]).h - 4).length;
      return k.length >= 2 && below >= k.length * 0.8 ? expand(k, depth + 1) : [el];
    });
  let bands = expand(kids(root), 0);

  /* app layouts: a narrow tall column beside a wide one is a sidebar, not a band */
  const sidebar = Array.from(document.querySelectorAll("aside,nav,[role=navigation]")).find((el) => {
    const b = box(el);
    return visible(el) && b.x < 4 && b.w >= 160 && b.w <= 360 && b.h >= vh * 0.8;
  });

  /* animated headings often render their text twice (one copy visually hidden) */
  const once = (t) => {
    const again = t.length > 24 ? t.indexOf(t.slice(0, 16), 8) : -1;
    return again > 0 ? t.slice(0, again).trim() : t;
  };

  const PRICE = /(?:[$€£¥₹]|SAR|AED|ر\.س|ريال|درهم)\s?\d|\d\s?(?:[$€£¥₹]|SAR|AED|ر\.س|ريال|درهم)/;
  const STAT = /^[\s+~<>≈]*[\d.,]+\s*(?:[%xX+kKmMbB]|ms|s|hrs?|million|billion|k\+|M\+)?\+?$/;

  const describe = (el, forced) => {
    const b = box(el);
    const heading = el.querySelector("h1,h2,h3,[role=heading]");
    /* innerText, not textContent: a <br> between words must stay a space */
    const textOf = (e) => (e?.innerText || e?.textContent || "").replace(/\s+/g, " ").trim();
    const leaves = Array.from(el.querySelectorAll("*")).filter((e) => e.children.length === 0 && visible(e));
    const imgs = Array.from(el.querySelectorAll("img,svg")).filter((e) => visible(e));
    const smallLogos = imgs.filter((e) => {
      const r = e.getBoundingClientRect();
      return r.height >= 12 && r.height <= 64 && r.width >= 40 && r.width <= 240;
    });

    /* the largest run of siblings that look alike: a grid of cards */
    let repeat = 0;
    let columns = 0;
    for (const p of [el, ...el.querySelectorAll("*")].slice(0, 600)) {
      if (p.closest("svg")) continue; // stacked shapes in an illustration are not a grid
      const c = Array.from(p.children).filter((x) => visible(x) && box(x).w > 80 && box(x).h > 60);
      if (c.length < 3) continue;
      const w0 = box(c[0]).w;
      const alike = c.filter((x) => Math.abs(box(x).w - w0) < w0 * 0.15);
      if (alike.length > repeat) {
        repeat = alike.length;
        columns = new Set(alike.map((x) => Math.round(box(x).x / 8))).size;
      }
    }

    const mainHeading = heading ? getComputedStyle(heading) : null;
    return {
      forced: forced || null,
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      y: b.y,
      h: b.h,
      x: b.x,
      w: b.w,
      first: false,
      heading: once(textOf(heading)).slice(0, 90),
      headingSize: mainHeading ? parseFloat(mainHeading.fontSize) : 0,
      h1: !!el.querySelector("h1"),
      links: el.querySelectorAll("a").length,
      visibleLinks: Array.from(el.querySelectorAll("a")).filter((a) => visible(a)).length,
      buttons: Array.from(el.querySelectorAll("button,a")).filter((a) => {
        const cs = getComputedStyle(a);
        return visible(a, cs) && opaque(cs.backgroundColor) && a.getBoundingClientRect().height >= 28;
      }).length,
      menuButton: !!Array.from(el.querySelectorAll("button,[role=button]")).find((x) => visible(x) && /menu|nav|القائمة/i.test(x.getAttribute("aria-label") || "")),
      inputs: el.querySelectorAll("input:not([type=hidden]),select,textarea").length,
      password: !!el.querySelector("input[type=password]"),
      email: !!el.querySelector("input[type=email],input[name*=email]"),
      table: !!el.querySelector("table"),
      accordions: el.querySelectorAll("details,[aria-expanded]").length,
      faqWord: /faq|frequently|questions|الأسئلة/i.test(textOf(el).slice(0, 400)),
      quotes: el.querySelectorAll("blockquote,q,figure figcaption").length + (/[“”«»]/.test(textOf(el).slice(0, 600)) ? 1 : 0),
      prices: leaves.filter((e) => PRICE.test(textOf(e))).length,
      stats: leaves.filter((e) => {
        const t = textOf(e);
        return t.length <= 12 && STAT.test(t) && parseFloat(getComputedStyle(e).fontSize) >= 28;
      }).length,
      logos: smallLogos.length,
      images: imgs.length,
      repeat,
      columns,
    };
  };

  bands = bands.filter((el) => !sidebar || !sidebar.contains(el));

  /* a fixed header often lives in a zero-height wrapper the walk above never enters */
  if (!bands.some((el) => box(el).y < 120 && box(el).h < 200)) {
    const header = Array.from(document.querySelectorAll("header,[role=banner],nav")).find((el) => {
      const b = box(el);
      return visible(el) && b.y < 120 && b.w >= vw * 0.8 && b.h >= 30 && b.h <= 200 && !bands.some((x) => x.contains(el));
    });
    if (header) bands.unshift(header);
  }
  const blocks = bands.map((el) => describe(el)).sort((a, b) => a.y - b.y);
  if (blocks[0]) blocks[0].first = true;
  if (sidebar) blocks.unshift({ ...describe(sidebar, "sidebar"), y: 0 });

  /* ---------------------------------------------------------------- tech */
  const scripts = Array.from(document.scripts).map((s) => s.src);
  const classes = Array.from(document.querySelectorAll("[class]"))
    .slice(0, 3000)
    .flatMap((e) => (typeof e.className === "string" ? e.className.split(/\s+/) : []));
  const twLike = classes.filter((c) => /^(?:[a-z0-9-]+:)*-?(?:p[xytrbl]?|m[xytrbl]?|gap|w|h|text|bg|rounded|font|items|justify|grid-cols|flex|leading|tracking|border)-[\w.[\]/#%-]+$/.test(c)).length;
  const reactish = Array.from(document.querySelectorAll("body *")).slice(0, 400).some((e) => Object.keys(e).some((k) => k.startsWith("__react")));
  const tech = {
    nextjs: !!document.getElementById("__NEXT_DATA__") || !!window.next || scripts.some((s) => s.includes("/_next/")),
    react: reactish,
    vue: !!window.__VUE__ || !!window.__NUXT__ || !!document.querySelector("[data-v-app],[data-server-rendered]"),
    svelte: !!document.querySelector('[class*="svelte-"]'),
    tailwind: twLike >= 150 || twLike / Math.max(classes.length, 1) > 0.25 || !!getComputedStyle(document.body).getPropertyValue("--tw-ring-offset-width"),
    webflow: !!document.documentElement.getAttribute("data-wf-page"),
    framer: !!document.querySelector("[data-framer-name],[data-framer-component-type]") || /framer/i.test(document.querySelector("meta[name=generator]")?.content || ""),
    shopify: !!window.Shopify,
  };

  const meta = (sel) => document.querySelector(sel)?.getAttribute("content") || "";
  return {
    viewport: { w: vw, h: vh },
    docH,
    dir: getComputedStyle(document.documentElement).direction || document.dir || "ltr",
    lang: document.documentElement.lang || "",
    title: document.title,
    description: meta("meta[name=description]") || meta("meta[property='og:description']"),
    siteName: meta("meta[property='og:site_name']") || meta("meta[name=application-name]"),
    themeColor: meta("meta[name=theme-color]"),
    generator: meta("meta[name=generator]"),
    text,
    painted,
    media,
    controls,
    borders,
    radii,
    space,
    widths,
    blocks,
    tech,
  };
}
