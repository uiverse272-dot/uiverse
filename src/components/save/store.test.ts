import { beforeEach, describe, expect, it, vi } from "vitest";

/* the store reads localStorage and listens on window; a Map stands in for both */
const data = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => data.get(k) ?? null,
  setItem: (k: string, v: string) => data.set(k, v),
  removeItem: (k: string) => data.delete(k),
});
vi.stubGlobal("window", { addEventListener() {} });

/* a fresh module per test: the store keeps its state at module level */
async function fresh(stored?: unknown) {
  data.clear();
  if (stored) data.set("uiv.saves.v1", JSON.stringify(stored));
  vi.resetModules();
  const store = await import("./store");
  store.subscribe(() => {});
  return store;
}

beforeEach(() => data.clear());

describe("saves store", () => {
  it("reads the shape before boards: each save's collection becomes a pin", async () => {
    const store = await fresh({
      saves: [
        { slug: "a", collectionId: "refs", at: 2 },
        { slug: "b", collectionId: "recent", at: 1 },
        { slug: "c", collectionId: "gone", at: 0 },
      ],
      collections: [
        { id: "recent", name: "Recently saved", sections: [] },
        { id: "refs", name: "Refs", sections: [] },
      ],
    });
    const s = store.getSnapshot();
    expect(s.collections).toEqual([{ id: "refs", name: "Refs" }]);
    expect(s.saves).toEqual([{ slug: "a", at: 2 }, { slug: "b", at: 1 }, { slug: "c", at: 0 }]);
    expect(s.pins).toEqual([{ slug: "a", collectionId: "refs", at: 2 }]);
  });

  it("pins one design to many boards; unsaving takes it off all of them", async () => {
    const store = await fresh();
    const a = store.create("Client A");
    const b = store.create("Client B");
    store.pin("x", a, true); // pinning saves it
    store.pin("x", b, true);
    expect(store.isSaved("x")).toBe(true);
    expect(store.getSnapshot().pins.map((p) => p.collectionId).sort()).toEqual([a, b].sort());
    store.pin("x", a, false);
    expect(store.getSnapshot().pins.map((p) => p.collectionId)).toEqual([b]);
    expect(store.toggle("x")).toBe(false);
    expect(store.getSnapshot()).toMatchObject({ saves: [], pins: [] });
  });

  it("deleting a board keeps its designs saved", async () => {
    const store = await fresh();
    const id = store.create("Old");
    store.pin("x", id, true);
    store.remove(id);
    expect(store.getSnapshot()).toMatchObject({ collections: [], pins: [], saves: [{ slug: "x" }] });
  });

  it("never makes a board whose id is a view of the saves", async () => {
    const store = await fresh();
    expect(store.create("All")).toBe("all-board");
    expect(store.create("Unsorted")).toBe("unsorted-board");
  });

  it("keeps a note per saved design, and persists across a reload", async () => {
    const store = await fresh();
    store.toggle("x");
    store.note("x", "  spacing  ");
    store.note("y", "not saved"); // ignored
    const stored = JSON.parse(data.get("uiv.saves.v1")!);
    const again = await fresh(stored);
    expect(again.getSnapshot().saves).toEqual([{ slug: "x", at: expect.any(Number), note: "spacing" }]);
  });
});
