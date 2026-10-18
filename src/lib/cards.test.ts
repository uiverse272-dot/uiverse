import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ITEMS } from "./data";
import { cardOf, firstOf } from "./cards";

describe("feed-card stills", () => {
  const cards = ITEMS.flatMap((i) => (i.capture ? [[i.slug, cardOf(i)!] as const] : []));

  it("every capture has one on disk — run `npm run capture:cards` if this fails", () => {
    const missing = cards.filter(([, c]) => !existsSync(path.join(process.cwd(), "public", c.src))).map(([s]) => s);
    expect(missing).toEqual([]);
  });

  it("each cuts a real region of its screenshot", () => {
    for (const [slug, c] of cards) {
      const shot = ITEMS.find((i) => i.slug === slug)!.capture!.shots.desktop;
      expect(c.region.top, slug).toBeGreaterThanOrEqual(0);
      expect(c.region.top + c.region.height, slug).toBeLessThanOrEqual(shot.h);
      expect(c.h, slug).toBeGreaterThan(0);
    }
  });

  it("every captured screen has a first-screen still at each width", () => {
    const firsts = ITEMS.filter((i) => i.capture && i.kind === "screen").flatMap((i) =>
      (["desktop", "tablet", "mobile"] as const).map((vp) => [`${i.slug} ${vp}`, firstOf(i, vp)!] as const),
    );
    expect(firsts.length).toBeGreaterThan(0);
    const missing = firsts.filter(([, f]) => !existsSync(path.join(process.cwd(), "public", f.src))).map(([s]) => s);
    expect(missing).toEqual([]);
  });

  it("sample designs have none", () => {
    expect(ITEMS.filter((i) => !i.capture).every((i) => cardOf(i) === null)).toBe(true);
  });
});
