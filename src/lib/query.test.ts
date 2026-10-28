import { describe, expect, it } from "vitest";
import { DICTS } from "@/i18n/dict";
import { dirOf, ITEMS } from "./data";
import { lookDistance } from "./look";
import { applyFilters, arNorm, parseQuery, searchItems, similarTo } from "./query";

/* the parse as [param, value] pairs — what becomes URL state */
const parsed = (q: string, lang: "en" | "ar" = "en") => parseQuery(q, lang).terms.map((t) => [t.param, t.value]);

describe("parseQuery — English", () => {
  it("reads each word into its dimension", () => {
    expect(parsed("dark fintech dashboard")).toEqual([
      ["style", "dark"],
      ["industry", "fintech"],
      ["category", "dashboard"],
    ]);
    expect(parseQuery("dark fintech dashboard").residual).toBe("");
  });

  it("maps synonyms to the taxonomy", () => {
    expect(parsed("banking landing")).toEqual([
      ["industry", "fintech"],
      ["category", "landing-page"],
    ]);
  });

  it("reads two-word names as one term rather than word by word", () => {
    expect(parsed("real estate portfolio")).toEqual([
      ["industry", "real-estate"],
      ["category", "portfolio"],
    ]);
  });

  it("never parses into a filter with no results — saas is a Type and an Industry, only the Industry has items", () => {
    expect(parsed("saas")).toEqual([["industry", "saas"]]);
  });

  it("takes one value per dimension and leaves the rest as free text", () => {
    const { terms, residual } = parseQuery("dark light");
    expect(terms.map((t) => t.value)).toEqual(["dark"]);
    expect(residual).toBe("light");
  });

  it("keeps unknown words as free text", () => {
    expect(parseQuery("dark fintech zebra").residual).toBe("zebra");
  });

  it("remembers the words typed, so removing a chip removes them", () => {
    expect(parseQuery("Real Estate dark").terms.map((t) => t.word)).toEqual(["real estate", "dark"]);
  });

  it("labels chips in the page's language", () => {
    /* the parser names the value; the dimension label comes from the page's own dictionary */
    const chip = (lang: "en" | "ar") => (t: { param: keyof typeof DICTS.en.search.dimensions; label: string }) =>
      `${DICTS[lang].search.dimensions[t.param]}: ${t.label}`;
    expect(parseQuery("dark fintech").terms.map(chip("en"))).toEqual(["Style: Dark", "Industry: Fintech"]);
    expect(parseQuery("dark fintech", "ar").terms.map(chip("ar"))).toEqual([
      "الأسلوب: داكن",
      "القطاع: التقنية المالية",
    ]);
  });
});

describe("parseQuery — Arabic", () => {
  it("reads Arabic taxonomy names, including multi-word ones", () => {
    expect(parsed("لوحة تحكم داكنة")).toEqual([
      ["category", "dashboard"],
      ["style", "dark"],
    ]);
    expect(parsed("التقنية المالية")).toEqual([["industry", "fintech"]]);
  });

  it("matches however it's spelled: with or without «ال», hamza, taa marbuta", () => {
    for (const q of ["التقنية المالية", "تقنية مالية", "تقنيه ماليه"]) expect(parsed(q)).toEqual([["industry", "fintech"]]);
    for (const q of ["الأزياء", "ازياء"]) expect(parsed(q)).toEqual([["industry", "fashion"]]);
  });

  it("maps Arabic synonyms", () => {
    expect(parsed("بنك")).toEqual([["industry", "fintech"]]);
    expect(parsed("متجر فاخر")).toEqual([
      ["category", "ecommerce"],
      ["style", "luxury"],
    ]);
  });

  it("works the same on an English page — only the labels change", () => {
    expect(parsed("لوحة تحكم داكنة", "en")).toEqual(parsed("لوحة تحكم داكنة", "ar"));
    expect(parseQuery("لوحة تحكم", "en").terms[0].label).toBe("Dashboard");
  });
});

describe("arNorm", () => {
  it("normalizes the spellings people actually type", () => {
    expect(arNorm("الإزالة")).toBe("ازاله");
    expect(arNorm("مُصَمِّم")).toBe("مصمم"); // diacritics
    expect(arNorm("مستشفى")).toBe("مستشفي"); // alef maqsura
    expect(arNorm("ـمرحبـا")).toBe("مرحبا"); // tatweel
  });

  it("drops «ال» from each word but not from short words", () => {
    expect(arNorm("الذكاء الاصطناعي")).toBe("ذكاء اصطناعي");
    expect(arNorm("ال")).toBe("ال");
  });

  it("leaves Latin text alone", () => {
    expect(arNorm("dark fintech")).toBe("dark fintech");
  });
});

describe("searchItems", () => {
  it("returns only items that match every parsed term", () => {
    const { results } = searchItems("dark fintech");
    expect(results.length).toBeGreaterThan(0);
    for (const i of results) {
      expect(i.style).toBe("dark");
      expect(i.industry).toBe("fintech");
    }
  });

  it("treats free text as a recall booster, not a gate: nonsense doesn't empty the results", () => {
    expect(searchItems("dark zzqx").results).toEqual(searchItems("dark").results);
  });

  it("finds Arabic right-to-left captures by «عربي», in any spelling", () => {
    const rtl = applyFilters(ITEMS, { dir: "rtl" });
    expect(rtl.length).toBeGreaterThan(0);
    for (const q of ["عربي", "عربية"]) {
      const { results } = searchItems(q);
      expect(results.length).toBe(rtl.length);
      expect(results.every((i) => dirOf(i) === "rtl")).toBe(true);
    }
  });

  it("agrees with the filters it parsed into", () => {
    const { results } = searchItems("لوحة تحكم داكنة");
    expect(results).toEqual(applyFilters(ITEMS, { category: "dashboard", style: "dark" }));
  });
});

describe("similarTo — more like this", () => {
  const screens = ITEMS.filter((i) => i.kind === "screen");
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  it("stays in the design's kind and never repeats it", () => {
    for (const item of [screens[0], ITEMS.find((i) => i.kind === "component")!]) {
      const more = similarTo(item, 60);
      expect(more.length).toBeGreaterThan(0);
      expect(more.every((i) => i.kind === item.kind && i.slug !== item.slug)).toBe(true);
      expect(new Set(more.map((i) => i.slug)).size).toBe(more.length);
    }
  });

  it("leads with designs on the same device that look like it", () => {
    for (const item of screens.filter((i) => i.capture).slice(0, 10)) {
      const more = similarTo(item, screens.length);
      const head = more.slice(0, 6);
      const tail = more.slice(-6);
      expect(head.filter((i) => i.device === item.device).length).toBeGreaterThanOrEqual(4);
      expect(mean(head.map((i) => lookDistance(item.palette, i)))).toBeLessThan(mean(tail.map((i) => lookDistance(item.palette, i))));
    }
  });
});
