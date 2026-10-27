import { describe, expect, it } from "vitest";
import { ITEMS, bySlug, type Item } from "./data";
import { an } from "@/i18n/format";
import { buildPrompt, DEFAULT_OPTIONS, STACKS, TOOLS, type PromptOptions } from "./prompt";
import { brandMarks, colorRoles, fonts, responsiveRulesPlain, sections, typeScale } from "./spec";

const item = (slug: string) => {
  const i = bySlug(slug);
  if (!i) throw new Error(`no item ${slug}`);
  return i;
};
const PROCEDURAL = item("s019-meridian-journal");
const LTR_CAPTURE = item("x-linear-app");
const RTL_CAPTURE = item("x-tamara-co-ar-sa");
const CAPTURES = ITEMS.filter((i) => i.capture);
const prompt = (i: Item, o: Partial<PromptOptions> = {}) => buildPrompt(i, { ...DEFAULT_OPTIONS, ...o });

describe("buildPrompt", () => {
  it("is deterministic — templated, no model call", () => {
    expect(prompt(LTR_CAPTURE)).toBe(prompt(LTR_CAPTURE));
  });

  it("keeps its shape (update with `npx vitest -u` when the template changes on purpose)", () => {
    expect(prompt(PROCEDURAL)).toMatchSnapshot();
  });

  /* lib/spec is the one derivation both read from — the prompt must say what the Breakdown shows */
  describe("says exactly what the Breakdown shows", () => {
    for (const i of [PROCEDURAL, LTR_CAPTURE, RTL_CAPTURE]) {
      it(i.slug, () => {
        const p = prompt(i);
        for (const r of colorRoles(i)) expect(p).toContain(`--color-${r.token}: ${r.value};`);
        for (const s of sections(i)) expect(p).toContain(`${s.index}. **${s.label}** — ${s.note}`);
        for (const t of typeScale(i)) expect(p).toContain(`| ${t.name} | ${t.size}px | ${t.weight} | ${t.use} |`);
        for (const [k, v] of responsiveRulesPlain(i)) expect(p).toContain(`- **${k}:** ${v}`);
      });
    }
  });

  it("writes tokens in each stack's own syntax", () => {
    const accent = LTR_CAPTURE.palette.accent;
    for (const s of STACKS) {
      const p = prompt(LTR_CAPTURE, { stack: s.id });
      if (s.tokens === "tailwind") expect(p).toContain(`@theme {\n  --color-background:`);
      if (s.tokens === "css") expect(p).toContain(`:root {\n  --background:`);
      if (s.tokens === "swift") {
        expect(p).toContain("extension Color {");
        expect(p).toContain(`static let accent = Color(hex: 0x${accent.slice(1).toUpperCase()})`);
        /* SwiftUI has no hex initialiser of its own — the block must bring one or it won't compile */
        expect(p).toContain("init(hex: UInt32)");
      }
    }
  });

  it("gives each tool its own preamble", () => {
    const preambles = TOOLS.map((t) => prompt(PROCEDURAL, { tool: t.id }).split("\n\n").slice(0, 2).join("\n\n"));
    expect(new Set(preambles).size).toBe(TOOLS.length);
  });

  it("drops each section when it's switched off", () => {
    const off = (k: keyof PromptOptions, heading: string) => {
      expect(prompt(PROCEDURAL)).toContain(heading);
      expect(prompt(PROCEDURAL, { [k]: false })).not.toContain(heading);
    };
    off("includeSections", "## Structure");
    off("includeTokens", "## Colour tokens");
    off("includeType", "## Typography");
    off("includeLayout", "## Layout and spacing");
    off("includeA11y", "## Requirements");
  });

  it("claims measured values only for real captures", () => {
    expect(prompt(LTR_CAPTURE)).toContain("measured from a real interface");
    expect(prompt(PROCEDURAL)).not.toContain("measured from a real interface");
  });

  it("uses the right article", () => {
    expect(an("education")).toBe("an education");
    expect(an("AI")).toBe("an AI");
    expect(an("FAQ")).toBe("an FAQ");
    expect(an("dashboard")).toBe("a dashboard");
    expect(an("SaaS")).toBe("a SaaS");
    expect(prompt(item("x-abwaab-com-ar"))).toContain("for an education product");
  });

  it("builds right-to-left captures RTL-first, and only those", () => {
    expect(prompt(RTL_CAPTURE)).toContain("## Direction");
    expect(prompt(RTL_CAPTURE)).toContain(`<html dir="rtl" lang="${RTL_CAPTURE.capture!.lang}">`);
    expect(prompt(LTR_CAPTURE)).not.toContain("## Direction");
    expect(prompt(PROCEDURAL)).not.toContain("## Direction");
  });

  /* the prompt tells the model not to reproduce a real brand — so it must never hand one over */
  describe("never carries a real brand's name or copy", () => {
    /* words too common to mean the brand when they turn up in a prompt */
    const GENERIC = new Set(["bank", "payments", "academy", "company", "app", "online"]);
    it.each(CAPTURES.map((i) => [i.slug, i] as const))("%s", (_, i) => {
      const marks = brandMarks(i).filter((m) => !GENERIC.has(m));
      for (const t of TOOLS) {
        const p = prompt(i, { tool: t.id });
        /* case-insensitive, from a word start: catches "TapAr" and "Stc Bold", not "laptop" */
        for (const m of marks) expect(p).not.toMatch(new RegExp(`\\b${m}`, "i"));
        if (i.source.tagline) expect(p).not.toContain(i.source.tagline);
        /* a page's own copy — but a one- or two-word heading ("Pricing", "Our plans") is ordinary
           words, not copy; brand names are caught by the marks above */
        for (const b of i.blocks) if (b.heading && b.heading.trim().split(/\s+/).length >= 3) expect(p).not.toContain(b.heading);
      }
    });

    it("describes a brand's own typeface instead of naming it, and says to substitute", () => {
      const tabby = item("x-tabby-ai-ar-sa");
      expect(fonts(tabby)?.heading).toContain("Tabby");
      const p = prompt(tabby);
      expect(p).toContain("A custom brand typeface");
      expect(p).toContain("licensed to it alone");
    });

    it("still names ordinary fonts", () => {
      const f = fonts(LTR_CAPTURE)!;
      expect(prompt(LTR_CAPTURE)).toContain(f.heading);
    });
  });
});

describe("layouts and palettes", () => {
  it("a layout prompt keeps the sections and drops a capture's headings", async () => {
    const { LAYOUTS } = await import("./data");
    const { layoutItem } = await import("./templates");
    for (const l of LAYOUTS) {
      const i = layoutItem(l);
      expect(i.capture).toBeUndefined();
      for (const b of i.blocks) expect(b.label).not.toContain(":");
      expect(prompt(i)).toContain("## Structure");
    }
  });

  it("a palette prompt names the palette and carries its tokens", async () => {
    const { PALETTE_ITEMS } = await import("./data");
    const { paletteItem, PALETTE_DEFAULTS } = await import("./templates");
    const i = paletteItem(PALETTE_ITEMS[0]);
    const p = prompt(i, PALETTE_DEFAULTS);
    expect(p).toContain(`themed with the ${PALETTE_ITEMS[0].palette.name} palette`);
    expect(p).toContain(`--color-accent: ${PALETTE_ITEMS[0].palette.accent};`);
    expect(p).not.toContain("## Structure");
  });
});
