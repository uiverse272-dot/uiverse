import { describe, expect, it } from "vitest";
import { ITEMS, bySlug } from "@/lib/data";
import { responsiveRules } from "@/lib/spec";
import { localize, stripLang } from "./config";
import { blockLabel, itemTitle, ruleText, sourceAbout } from "./content";
import { DICTS } from "./dict";
import { compactNum, plural, timeAgo, type Plural } from "./format";

describe("plural", () => {
  const books: Plural = { zero: "z", one: "o", two: "t", few: "f{n}", many: "m{n}", other: "x{n}" };
  it("picks all six Arabic forms by CLDR rules", () => {
    const cases: [number, string][] = [[0, "z"], [1, "o"], [2, "t"], [3, "f3"], [10, "f10"], [11, "m11"], [99, "m99"], [100, "x100"], [102, "x102"], [103, "f103"], [111, "m111"]];
    for (const [n, want] of cases) expect(plural(books, n, "ar")).toBe(want);
  });

  it("uses one / other in English", () => {
    const p: Plural = { one: "{n} result", other: "{n} results" };
    expect([0, 1, 2].map((n) => plural(p, n, "en"))).toEqual(["0 results", "1 result", "2 results"]);
  });

  it("falls back to other when a form is missing", () => {
    expect(plural({ other: "{n} x" }, 2, "ar")).toBe("2 x");
  });
});

describe("numbers", () => {
  it("compacts English with k and M", () => {
    const want = { 0: "0", 7: "7", 999: "999", 1000: "1.0k", 2140: "2.1k", 9999: "10.0k", 10000: "10k", 48210: "48k", 1_250_000: "1.3M" };
    for (const [n, s] of Object.entries(want)) expect(compactNum(Number(n), "en")).toBe(s);
  });

  it("writes Arabic with the unit, Latin digits", () => {
    expect(compactNum(2140, "ar")).toBe("2.1 ألف");
    expect(compactNum(1_250_000, "ar")).toBe("1.3 مليون");
  });

  it("says how long ago in either language", () => {
    expect([0, 3, 14, 60, 800].map((d) => timeAgo(d, "en"))).toEqual(["today", "3d ago", "2w ago", "2mo ago", "2y ago"]);
    expect([0, 1, 2, 3, 14].map((d) => timeAgo(d, "ar"))).toEqual(["اليوم", "منذ يوم", "منذ يومين", "منذ 3 أيام", "منذ أسبوعين"]);
  });
});

describe("URLs", () => {
  it("prefixes Arabic paths and leaves English, external and already-prefixed ones alone", () => {
    expect(localize("ar", "/web/fintech?sort=new")).toBe("/ar/web/fintech?sort=new");
    expect(localize("ar", "/")).toBe("/ar");
    expect(localize("ar", "/ar/web")).toBe("/ar/web");
    expect(localize("ar", "/archive")).toBe("/ar/archive"); // not mistaken for /ar
    expect(localize("ar", "https://example.com")).toBe("https://example.com");
    expect(localize("en", "/web")).toBe("/web");
  });

  it("strips the locale so server and client agree on the path", () => {
    expect(["/ar/web", "/en/web", "/web", "/ar", "/en", "/archive"].map(stripLang)).toEqual(["/web", "/web", "/web", "/", "/", "/archive"]);
  });
});

describe("design facts in Arabic", () => {
  const capture = bySlug("x-tamara-co-ar-sa")!;

  it("translates the capture script's rule templates, keeping every step", () => {
    expect(ruleText("heading 48px → 36px → 24px", capture, "ar")).toBe("العنوان 48px → 36px → 24px");
    expect(ruleText("3 columns → 2 → 1; heading 40px → —px → 28px", capture, "ar")).toBe("3 أعمدة → 2 → 1; العنوان 40px → —px → 28px");
    expect(ruleText("7 links → menu button → menu button", capture, "ar")).toBe("7 روابط → زر القائمة → زر القائمة");
    expect(ruleText("2 links → 11 links → —", capture, "ar")).toBe("رابطان → 11 رابطًا → —");
  });

  /* words, not just measurements: "48px → 40px → 30px" reads the same in both */
  const hasWords = (x: string) => /[a-z]{2,}/i.test(x.replace(/\d+px|px\b/g, ""));
  const arabic = (x: string) => /[\u0600-\u06FF]/.test(x);

  it("translates every reflow rule in the catalogue, keeping its steps", () => {
    for (const i of ITEMS) {
      for (const [label, rule] of responsiveRules(i)) {
        const ar = ruleText(rule, i, "ar");
        if (hasWords(rule)) expect(arabic(ar), `${i.slug}: ${rule}`).toBe(true);
        expect(ar.split(" → ").length, `${i.slug}: ${rule}`).toBe(rule.split(" → ").length);
        expect(arabic(blockLabel(label, undefined, "ar")), `${i.slug}: ${label}`).toBe(true);
      }
    }
  });

  it("has Arabic for every invented brand's description (captured brands keep their own words)", () => {
    for (const i of ITEMS.filter((x) => !x.capture)) expect(arabic(sourceAbout(i.source, "ar")), i.source.slug).toBe(true);
  });

  it("has Arabic for every screen title and block label", () => {
    for (const i of ITEMS) {
      expect(arabic(itemTitle(i, "ar")), `${i.slug}: ${i.title}`).toBe(true);
      for (const b of i.blocks) expect(arabic(blockLabel(b.label, b.type, "ar")), `${i.slug}: ${b.label}`).toBe(true);
    }
  });

  it("keeps a block label's number and the page's own heading", () => {
    expect(blockLabel("Card grid 2", "cards", "ar")).toBe("شبكة البطاقات 2");
    expect(blockLabel("Hero: حلمك بيدك", "hero", "ar")).toBe("القسم الافتتاحي: حلمك بيدك");
    expect(blockLabel("Something new", "hero", "ar")).toBe("القسم الافتتاحي"); // unknown label → its type's name
    expect(blockLabel("Card grid", "cards", "en")).toBe("Card grid");
  });

  it("leaves English untouched", () => {
    expect(ruleText("heading 48px → 36px → 24px", capture, "en")).toBe("heading 48px → 36px → 24px");
  });
});

/* TypeScript proves ar.ts has every key; this proves a translation didn't drop or invent a {placeholder} */
describe("dictionaries", () => {
  const holes = (s: string) => new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
  const walk = (en: unknown, ar: unknown, path: string, out: [string, unknown, unknown][]) => {
    if (typeof en === "string") return void out.push([path, en, ar]);
    if (en && typeof en === "object") for (const k of Object.keys(en)) walk((en as never)[k], (ar as never)?.[k], `${path}.${k}`, out);
  };
  const pairs: [string, unknown, unknown][] = [];
  walk(DICTS.en, DICTS.ar, "t", pairs);

  it("has no empty Arabic strings (except where English is empty on purpose)", () => {
    for (const [path, en, ar] of pairs) if (en !== "") expect(ar, path).toBeTruthy();
  });

  it("keeps the same placeholders in both languages", () => {
    const isPlural = (p: string) => /\.(zero|one|two|few|many|other)$/.test(p);
    for (const [path, en, ar] of pairs) {
      if (typeof ar !== "string" || isPlural(path)) continue;
      expect([...holes(ar)].sort(), path).toEqual([...holes(en as string)].sort());
    }
  });

  it("uses no placeholder in a plural that English doesn't have", () => {
    for (const [path, , ar] of pairs) {
      if (!/\.(zero|one|two|few|many|other)$/.test(path) || typeof ar !== "string") continue;
      const enOther = pairs.find(([p]) => p === path.replace(/\.\w+$/, ".other"))?.[1] as string;
      for (const h of holes(ar)) expect(holes(enOther).has(h), `${path} uses {${h}}`).toBe(true);
    }
  });
});
