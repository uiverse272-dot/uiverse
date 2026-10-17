import { describe, expect, it } from "vitest";
import { parseState } from "./state";

const N = 5;
const parse = (v: unknown) => parseState(JSON.stringify(v), N);

describe("parseState", () => {
  it("has nothing to say when nothing was saved", () => {
    expect(parseState(null, N)).toBeNull();
    expect(parseState("", N)).toBeNull();
  });

  it("keeps a valid state as it was", () => {
    const s = { status: "active", step: 3, goal: { id: "pricing", industry: "fintech", rtl: true } };
    expect(parse(s)).toEqual(s);
    expect(parse({ status: "off", step: 0 })).toEqual({ status: "off", step: 0 });
  });

  it("turns the guide off for a value it can't read — the welcome was already answered", () => {
    const off = { status: "off", step: 0 };
    for (const raw of ["{nope", "null", "42", '"active"', "[]"]) expect(parseState(raw, N)).toEqual(off);
    expect(parse({ done: true, dismissed: true })).toEqual(off);
    expect(parse({ status: "done", step: 1 })).toEqual(off);
  });

  it("restarts at the first step when the saved one no longer exists", () => {
    for (const step of [99, N, -1, 1.5, "2", null, undefined]) expect(parse({ status: "active", step })).toEqual({ status: "active", step: 0 });
    expect(parse({ status: "active", step: N - 1 })?.step).toBe(N - 1);
  });

  it("drops a goal it doesn't know, and an industry it doesn't know", () => {
    expect(parse({ status: "welcome", step: 0, goal: { id: "spaceship", rtl: false } })?.goal).toBeUndefined();
    expect(parse({ status: "welcome", step: 0, goal: "landing" })?.goal).toBeUndefined();
    expect(parse({ status: "welcome", step: 0, goal: { id: "auth", industry: "mining", rtl: "yes" } })?.goal).toEqual({ id: "auth", rtl: false });
  });
});
