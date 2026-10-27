import { describe, expect, it } from "vitest";
import { ARCHETYPES, type Archetype } from "./archetypes";
import { buildPrompt, DEFAULT_OPTIONS } from "./prompt";
import { PALETTES } from "./palettes";
import { boxesFrom, closestArchetype, guessType, ordered, sketchBlocks, sketchItem, type Box } from "./sketch";
import { responsiveRulesPlain, sections } from "./spec";

const box = (type: string, x: number, y: number, w: number, h: number, id = type): Box => ({ id, type, x, y, w, h });
const OPTS = { device: "desktop" as const, palette: PALETTES[0], industry: "fintech", style: "dark" };

describe("guessType", () => {
  it("reads a desktop page from position and shape", () => {
    expect(guessType({ x: 0, y: 0, w: 1, h: 0.05 }, "desktop")).toBe("navbar");
    expect(guessType({ x: 0, y: 0.06, w: 1, h: 0.3 }, "desktop")).toBe("hero");
    expect(guessType({ x: 0, y: 0.9, w: 1, h: 0.1 }, "desktop")).toBe("footer");
    expect(guessType({ x: 0, y: 0, w: 0.18, h: 1 }, "desktop")).toBe("sidebar");
    expect(guessType({ x: 0.3, y: 0.3, w: 0.4, h: 0.4 }, "desktop")).toBe("login");
  });

  it("reads the rest of an app once there is a sidebar", () => {
    const side = [box("sidebar", 0, 0, 0.18, 1)];
    expect(guessType({ x: 0.2, y: 0.1, w: 0.78, h: 0.12 }, "desktop", side)).toBe("stats");
    expect(guessType({ x: 0.2, y: 0.4, w: 0.78, h: 0.3 }, "desktop", side)).toBe("table");
  });

  it("gives a phone's bottom bar to tabs, not a footer", () => {
    expect(guessType({ x: 0, y: 0.92, w: 1, h: 0.08 }, "mobile")).toBe("tabs");
  });
});

it("orders a sidebar first, then top to bottom and left to right", () => {
  const out = ordered([box("cards", 0.5, 0.5, 0.4, 0.2, "r"), box("cards", 0.2, 0.505, 0.3, 0.2, "l"), box("sidebar", 0, 0, 0.18, 1), box("navbar", 0.2, 0, 0.8, 0.05)]);
  expect(out.map((b) => b.id)).toEqual(["sidebar", "navbar", "l", "r"]);
});

it("numbers repeated sections the way captures do", () => {
  expect(sketchBlocks([box("cards", 0, 0.1, 1, 0.1, "a"), box("cards", 0, 0.3, 1, 0.1, "b")]).map((b) => b.label)).toEqual(["Cards", "Cards 2"]);
});

describe("closestArchetype", () => {
  /* every archetype, laid out as boxes, must read back as itself — or as one with the same sections */
  for (const a of Object.keys(ARCHETYPES) as Archetype[]) {
    it(a, () => {
      const types = sketchBlocks(boxesFrom(a)).map((b) => b.type);
      const got = closestArchetype(types, ARCHETYPES[a].device);
      const set = (x: Archetype) => [...new Set(ARCHETYPES[x].blocks.map((b) => b.type))].sort().join();
      expect(set(got)).toBe(set(a));
    });
  }
});

describe("sketchItem", () => {
  const boxes = [box("navbar", 0, 0, 1, 0.05), box("hero", 0, 0.06, 1, 0.3), box("pricing", 0, 0.4, 1, 0.3), box("footer", 0, 0.9, 1, 0.1)];
  const item = sketchItem(boxes, OPTS);

  it("is a screen of the closest archetype, in the chosen look", () => {
    expect(item).toMatchObject({ kind: "screen", archetype: "pricing", category: "pricing", industry: "fintech", style: "dark", device: "desktop" });
    expect(item.palette).toBe(PALETTES[0]);
  });

  it("takes the page type the person picks over the closest match, on the same device only", () => {
    expect(sketchItem(boxes, { ...OPTS, archetype: "saas-landing" }).archetype).toBe("saas-landing");
    expect(sketchItem(boxes, { ...OPTS, archetype: "mobile-feed" }).archetype).toBe("pricing");
  });

  it("is the same item for the same drawing — one prompt credit, not one per render", () => {
    expect(sketchItem(boxes.map((b) => ({ ...b, x: b.x + 0.001 })), OPTS).slug).toBe(item.slug);
    expect(sketchItem([...boxes, box("faq", 0, 0.75, 1, 0.1)], OPTS).slug).not.toBe(item.slug);
  });

  it("prompts with the drawn sections, and only the reflow rules for them", () => {
    const p = buildPrompt(item, DEFAULT_OPTIONS);
    for (const s of sections(item)) expect(p).toContain(`${s.index}. **${s.label}** — ${s.note}`);
    expect(responsiveRulesPlain(item).map(([k]) => k)).not.toContain("FAQ");
    expect(p).not.toContain("Logo cloud");
  });
});
