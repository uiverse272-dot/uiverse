import { beforeAll, describe, expect, it } from "vitest";
import { ITEMS } from "@/lib/data";
import { openLocal, type Db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { createCollection, importSaves, LIMITS, loadSaves, moveSave, SavesError, setSaved } from "./db";

let db: Db;
const [A, B, C] = ITEMS.map((i) => i.slug);
let n = 0;
/* a fresh user per test, so tests don't share state */
async function newUser() {
  const id = `u${++n}`;
  await db.insert(user).values({ id, name: id, email: `${id}@example.com` });
  return id;
}

beforeAll(async () => {
  db = await openLocal(); // in memory, with the real migrations
});

describe("saves", () => {
  it("saves into recent by default, newest first, and unsaves", async () => {
    const u = await newUser();
    await setSaved(db, u, A, true, undefined, 1);
    await setSaved(db, u, B, true, undefined, 2);
    expect((await loadSaves(db, u)).saves).toEqual([
      { slug: B, collectionId: "recent", at: 2 },
      { slug: A, collectionId: "recent", at: 1 },
    ]);
    await setSaved(db, u, A, false);
    expect((await loadSaves(db, u)).saves.map((s) => s.slug)).toEqual([B]);
  });

  it("is idempotent: saving twice keeps one row where it was", async () => {
    const u = await newUser();
    await createCollection(db, u, "work", "Work");
    await moveSave(db, u, A, "work", 1);
    await setSaved(db, u, A, true, "recent", 2);
    expect((await loadSaves(db, u)).saves).toEqual([{ slug: A, collectionId: "work", at: 1 }]);
    await setSaved(db, u, A, false);
    await setSaved(db, u, A, false);
    expect((await loadSaves(db, u)).saves).toEqual([]);
  });

  it("moves between collections, saving if needed", async () => {
    const u = await newUser();
    await createCollection(db, u, "refs", "References");
    await moveSave(db, u, A, "refs", 5);
    expect((await loadSaves(db, u)).saves).toEqual([{ slug: A, collectionId: "refs", at: 5 }]);
  });

  it("refuses unknown items and collections instead of guessing", async () => {
    const u = await newUser();
    await expect(setSaved(db, u, "not-an-item", true)).rejects.toThrow(SavesError);
    await expect(setSaved(db, u, A, true, "nope")).rejects.toThrow("unknown-collection");
    await expect(moveSave(db, u, A, "nope")).rejects.toThrow("unknown-collection");
    await expect(createCollection(db, u, "Bad Id!", "x")).rejects.toThrow("invalid");
    await expect(createCollection(db, u, "recent", "x")).rejects.toThrow("invalid");
    await expect(createCollection(db, u, "ok", "   ")).rejects.toThrow("invalid");
  });

  it("caps collection names", async () => {
    const u = await newUser();
    await createCollection(db, u, "long", "x".repeat(200));
    expect((await loadSaves(db, u)).collections[0].name).toHaveLength(LIMITS.name);
  });

  it("keeps users apart", async () => {
    const u = await newUser();
    const v = await newUser();
    await createCollection(db, u, "mine", "Mine");
    await setSaved(db, u, A, true);
    expect(await loadSaves(db, v)).toEqual({ saves: [], collections: [] });
    /* another user's collection id doesn't exist for you */
    await expect(setSaved(db, v, A, true, "mine")).rejects.toThrow("unknown-collection");
  });

  it("deletes a user's saves and collections with the user", async () => {
    const u = await newUser();
    await createCollection(db, u, "gone", "Gone");
    await setSaved(db, u, A, true, "gone");
    const { eq } = await import("drizzle-orm");
    await db.delete(user).where(eq(user.id, u));
    expect(await loadSaves(db, u)).toEqual({ saves: [], collections: [] });
  });
});

describe("importSaves — a guest signing in", () => {
  it("merges the guest's saves and collections, the account winning on overlap", async () => {
    const u = await newUser();
    await createCollection(db, u, "account-board", "Account board");
    await moveSave(db, u, A, "account-board", 10);

    const merged = await importSaves(db, u, {
      collections: [
        { id: "recent", name: "Recently saved" },
        { id: "guest-board", name: "Guest board" },
      ],
      saves: [
        { slug: A, collectionId: "recent", at: 99 }, // already in the account → account wins
        { slug: B, collectionId: "guest-board", at: 20 },
        { slug: C, collectionId: "vanished", at: 30 }, // collection didn't come along → recent
        { slug: "not-an-item", collectionId: "recent", at: 40 }, // dropped
      ],
    });

    expect(merged.collections.map((c) => c.id).sort()).toEqual(["account-board", "guest-board"]);
    expect(merged.saves).toEqual([
      { slug: C, collectionId: "recent", at: 30 },
      { slug: B, collectionId: "guest-board", at: 20 },
      { slug: A, collectionId: "account-board", at: 10 },
    ]);
  });

  it("is safe to run twice", async () => {
    const u = await newUser();
    const guest = { collections: [{ id: "b", name: "B" }], saves: [{ slug: A, collectionId: "b", at: 1 }] };
    const once = await importSaves(db, u, guest);
    expect(await importSaves(db, u, guest)).toEqual(once);
  });

  it("survives junk from browser storage", async () => {
    const u = await newUser();
    const junk = {
      collections: [{ id: "Bad Id!", name: "x" }, { id: "fine", name: "" }],
      saves: [{ slug: A, collectionId: "Bad Id!", at: Number.NaN }],
    };
    const merged = await importSaves(db, u, junk);
    expect(merged.collections).toEqual([]);
    expect(merged.saves).toHaveLength(1);
    expect(merged.saves[0].collectionId).toBe("recent");
    expect(merged.saves[0].at).toBeGreaterThan(0);
  });
});
