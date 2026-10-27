import { describe, expect, it } from "vitest";
import { ITEMS } from "./data";
import { guessDevice, lookFromParams, lookFromPixels, lookQuery, similarToLook } from "./look";
import { PALETTES } from "./palettes";

/** An RGBA image of horizontal bands — [hex, share of rows] — like a page's background, copy and buttons */
function bands(w: number, h: number, parts: [string, number][]) {
  const data = new Uint8ClampedArray(w * h * 4);
  let row = 0;
  for (const [hex, share] of parts) {
    const n = parseInt(hex.slice(1), 16);
    const end = Math.min(h, row + Math.round(share * h));
    for (; row < end; row++)
      for (let x = 0; x < w; x++) data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], (row * w + x) * 4);
  }
  return data;
}

describe("lookFromPixels", () => {
  it("reads background, text and accent from coverage, contrast and saturation", () => {
    const look = lookFromPixels(bands(40, 100, [["#0b0d10", 0.8], ["#f2f5f8", 0.12], ["#5b8cff", 0.08]]), 40, 100);
    expect(look).toEqual({ bg: "#0b0d10", text: "#f2f5f8", accent: "#5b8cff" });
  });

  it("gives a monochrome page its text as the accent", () => {
    const look = lookFromPixels(bands(40, 100, [["#ffffff", 0.9], ["#14110e", 0.1]]), 40, 100);
    expect(look.accent).toBe(look.text);
  });

  it("ignores transparent pixels", () => {
    expect(lookFromPixels(new Uint8ClampedArray(16), 2, 2)).toEqual({ bg: "#ffffff", text: "#111111", accent: "#111111" });
  });
});

describe("similarToLook", () => {
  it("ranks a palette's own screens first for that palette's colours", () => {
    for (const p of PALETTES.slice(0, 4)) {
      const top = similarToLook({ bg: p.bg, text: p.text, accent: p.accent }, ITEMS, 3);
      expect(top.length).toBe(3);
      for (const i of top) expect(i.palette).toMatchObject({ bg: p.bg, accent: p.accent });
    }
  });

  it("returns screens on the asked-for device", () => {
    const p = PALETTES[0];
    const top = similarToLook({ bg: p.bg, text: p.text, accent: p.accent, device: "mobile" }, ITEMS, 5);
    for (const i of top) expect(i.kind === "screen" && i.device === "mobile").toBe(true);
  });
});

describe("the look in a URL", () => {
  it("round-trips", () => {
    const look = { bg: "#0b0d10", text: "#f2f5f8", accent: "#5b8cff", device: "mobile" as const };
    expect(lookFromParams(Object.fromEntries(new URLSearchParams(lookQuery(look))))).toEqual(look);
  });

  it("refuses anything that isn't three hex colours", () => {
    expect(lookFromParams({ bg: "0b0d10", accent: "red", text: "f2f5f8" })).toBeNull();
    expect(lookFromParams({ bg: "0b0d10", text: "f2f5f8" })).toBeNull();
    expect(lookFromParams({ bg: "0b0d10", accent: "5b8cff", text: "f2f5f8", device: "fridge" })?.device).toBeUndefined();
  });
});

it("guessDevice: a phone shot is narrow and portrait, a full-page desktop shot is wide in pixels", () => {
  expect(guessDevice(1179, 2556)).toBe("mobile");
  expect(guessDevice(1440, 900)).toBe("desktop");
  expect(guessDevice(1440, 5200)).toBe("desktop");
});
