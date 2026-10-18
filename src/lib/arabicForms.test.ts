import { describe, expect, it } from "vitest";
import { arabicForms } from "./arabicForms";

const codes = (s: string) => [...s].map((c) => c.codePointAt(0)!.toString(16));

describe("arabicForms", () => {
  it("joins a word: initial, medial, final, and letters that only join backwards", () => {
    /* ب ا ب: initial beh, final alef, then beh standalone (alef doesn't join forwards) */
    expect(codes(arabicForms("باب"))).toEqual(["fe91", "fe8e", "628"]);
    /* س ل م: initial, medial, final */
    expect(codes(arabicForms("سلم"))).toEqual(["feb3", "fee0", "fee2"]);
  });

  it("writes lam + alef as one ligature, standalone or joined", () => {
    expect(codes(arabicForms("لا"))).toEqual(["fefb"]);
    expect(codes(arabicForms("علا"))).toEqual(["fecb", "fefc"]);
    expect(codes(arabicForms("لأن"))).toEqual(["fef7", "646"]);
  });

  it("drops vowel marks and leaves other text alone", () => {
    expect(arabicForms("مُلتقطة")).toBe(arabicForms("ملتقطة"));
    expect(arabicForms("Al Rajhi 2026")).toBe("Al Rajhi 2026");
  });
});
