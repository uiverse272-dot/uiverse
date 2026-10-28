import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ITEMS, bySlug } from "./data";
import { CRAFT_RECORDS } from "./craft";
import { CATEGORIES, COMPONENT_TYPES, INDUSTRIES, STYLES } from "./taxonomy";

const pub = (src: string) => path.join(process.cwd(), "public", src);
const originals = ITEMS.filter((i) => i.live);
const arabic = /[؀-ۿ]/;

describe("Uiverse Originals", () => {
  it("are all in the catalogue, under their own source", () => {
    expect(originals.length).toBe(CRAFT_RECORDS.length);
    for (const i of originals) {
      expect(bySlug(i.slug)).toBe(i);
      expect(i.source.slug).toBe("uiverse-originals");
      expect(i.hasCode).toBe(true);
    }
  });

  it("have their piece and its poster on disk (npm run craft:posters)", () => {
    for (const i of originals) {
      expect(existsSync(pub(i.live!.src)), i.live!.src).toBe(true);
      expect(existsSync(pub(i.live!.poster)), `${i.live!.poster} — run npm run craft:posters`).toBe(true);
    }
  });

  it("file under terms the filters know", () => {
    const has = (list: readonly { slug: string }[], slug?: string) => list.some((t) => t.slug === slug);
    for (const r of CRAFT_RECORDS) {
      expect(has(CATEGORIES, r.category), `${r.slug}: ${r.category}`).toBe(true);
      expect(has(INDUSTRIES, r.industry), `${r.slug}: ${r.industry}`).toBe(true);
      expect(has(STYLES, r.style), `${r.slug}: ${r.style}`).toBe(true);
      if (r.kind === "component") expect(has(COMPONENT_TYPES, r.componentType), `${r.slug}: ${r.componentType}`).toBe(true);
    }
  });

  it("say what they are in Arabic too", () => {
    for (const r of CRAFT_RECORDS) {
      expect(arabic.test(r.titleAr), r.slug).toBe(true);
      expect(arabic.test(r.aboutAr), r.slug).toBe(true);
    }
  });

  /* the frame's policy (next.config.ts) blocks every request, so a piece that needs one is broken */
  it("are self-contained: no outside requests, no inline handlers, a licence line, reduced motion respected", () => {
    for (const i of originals) {
      const html = readFileSync(pub(i.live!.src), "utf8");
      const urls = [...html.matchAll(/(?:src|href)="((?:https?:)?\/\/[^"]+)"|url\(["']?((?:https?:)?\/\/[^)"']+)/g)].map((m) => m[1] ?? m[2]);
      expect(urls, i.slug).toEqual([]);
      expect(html, i.slug).not.toMatch(/\son[a-z]+="/);
      expect(html, i.slug).toMatch(/Uiverse Originals\. Free to use and adapt \(MIT\)/);
      if (/@keyframes|requestAnimationFrame|transition:/.test(html)) expect(html, i.slug).toMatch(/prefers-reduced-motion/);
    }
  });
});
