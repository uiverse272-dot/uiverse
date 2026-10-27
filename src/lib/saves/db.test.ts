import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { ITEMS } from "@/lib/data";
import { openLocal, type Db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import {
  createCollection, deleteCollection, importSaves, LIMITS, loadSaves, SavesError, setNote, setPinned, setSaved, updateCollection,
} from "./db";

let db: Db;
const [A, B, C] = ITEMS.map((i) => i.slug);
let n = 0;
/* a fresh user per test, so tests don't share state */
async function newUser() {
  const id = `u${++n}`;
  await db.insert(user).values({ id, name: id, email: `${id}@example.com` });
  return id;
}
const EMPTY = { saves: [], collections: [], pins: [] };

beforeAll(async () => {
  db = await openLocal(); // in memory, with the real migrations
});

describe("saves", () => {
  it("saves newest first, unsorted, and unsaves", async () => {
    const u = await newUser();
    await setSaved(db, u, A, true, undefined, 1);
    await setSaved(db, u, B, true, undefined, 2);
    expect(await loadSaves(db, u)).toEqual({
      saves: [
        { slug: B, at: 2, note: "" },
        { slug: A, at: 1, note: "" },
      ],
      collections: [],
      pins: [],
    });
    await setSaved(db, u, A, false);
    expect((await loadSaves(db, u)).saves.map((s) => s.slug)).toEqual([B]);
  });

  it("is idempotent: saving twice keeps the first save and its boards", async () => {
    const u = await newUser();
    await createCollection(db, u, "work", "Work");
    await setPinned(db, u, A, "work", true, 1);
    await setSaved(db, u, A, true, undefined, 2);
    const s = await loadSaves(db, u);
    expect(s.saves).toEqual([{ slug: A, at: 1, note: "" }]);
    expect(s.pins).toEqual([{ slug: A, collectionId: "work", at: 1 }]);
    await setSaved(db, u, A, false);
    await setSaved(db, u, A, false);
    expect(await loadSaves(db, u)).toMatchObject({ saves: [], pins: [] });
  });

  it("refuses unknown items and boards instead of guessing", async () => {
    const u = await newUser();
    await expect(setSaved(db, u, "not-an-item", true)).rejects.toThrow(SavesError);
    await expect(setSaved(db, u, A, true, "nope")).rejects.toThrow("unknown-collection");
    await expect(setPinned(db, u, A, "nope", true)).rejects.toThrow("unknown-collection");
    await expect(setPinned(db, u, A, "recent", true)).rejects.toThrow("unknown-collection");
    for (const id of ["Bad Id!", "recent", "all", "unsorted"]) await expect(createCollection(db, u, id, "x")).rejects.toThrow("invalid");
    await expect(createCollection(db, u, "ok", "   ")).rejects.toThrow("invalid");
    expect(await loadSaves(db, u)).toEqual(EMPTY);
  });

  it("caps board names, descriptions and notes", async () => {
    const u = await newUser();
    await createCollection(db, u, "long", "x".repeat(200), "d".repeat(900));
    await setSaved(db, u, A, true);
    await setNote(db, u, A, "n".repeat(900));
    const s = await loadSaves(db, u);
    expect(s.collections[0].name).toHaveLength(LIMITS.name);
    expect(s.collections[0].description).toHaveLength(LIMITS.description);
    expect(s.saves[0].note).toHaveLength(LIMITS.note);
  });

  it("keeps users apart", async () => {
    const u = await newUser();
    const v = await newUser();
    await createCollection(db, u, "mine", "Mine");
    await setPinned(db, u, A, "mine", true);
    expect(await loadSaves(db, v)).toEqual(EMPTY);
    /* another user's board doesn't exist for you, and you can't change or delete it */
    await expect(setPinned(db, v, A, "mine", true)).rejects.toThrow("unknown-collection");
    await expect(updateCollection(db, v, "mine", "Taken", "")).rejects.toThrow("unknown-collection");
    await deleteCollection(db, v, "mine");
    expect((await loadSaves(db, u)).pins).toHaveLength(1);
  });

  it("deletes a user's saves, boards and pins with the user", async () => {
    const u = await newUser();
    await createCollection(db, u, "gone", "Gone");
    await setPinned(db, u, A, "gone", true);
    await setNote(db, u, A, "kept until the account goes");
    await db.delete(user).where(eq(user.id, u));
    expect(await loadSaves(db, u)).toEqual(EMPTY);
  });
});

describe("boards", () => {
  it("puts one design on many boards, newest pin first", async () => {
    const u = await newUser();
    await createCollection(db, u, "client-a", "Client A");
    await createCollection(db, u, "client-b", "Client B");
    await setPinned(db, u, A, "client-a", true, 1);
    await setPinned(db, u, A, "client-b", true, 2);
    await setPinned(db, u, B, "client-b", true, 3);
    const s = await loadSaves(db, u);
    /* pinning saved them, once each */
    expect(s.saves.map((x) => x.slug).sort()).toEqual([A, B].sort());
    expect(s.pins).toEqual([
      { slug: B, collectionId: "client-b", at: 3 },
      { slug: A, collectionId: "client-b", at: 2 },
      { slug: A, collectionId: "client-a", at: 1 },
    ]);
  });

  it("takes a design off one board and leaves it saved and on the others", async () => {
    const u = await newUser();
    await createCollection(db, u, "a", "A");
    await createCollection(db, u, "b", "B");
    await setPinned(db, u, A, "a", true);
    await setPinned(db, u, A, "b", true);
    await setPinned(db, u, A, "a", false);
    await setPinned(db, u, A, "a", false); // twice is fine
    const s = await loadSaves(db, u);
    expect(s.saves.map((x) => x.slug)).toEqual([A]);
    expect(s.pins.map((p) => p.collectionId)).toEqual(["b"]);
  });

  it("unsaving takes a design off every board", async () => {
    const u = await newUser();
    await createCollection(db, u, "a", "A");
    await createCollection(db, u, "b", "B");
    await setPinned(db, u, A, "a", true);
    await setPinned(db, u, A, "b", true);
    await setSaved(db, u, A, false);
    expect(await loadSaves(db, u)).toMatchObject({ saves: [], pins: [] });
  });

  it("renames and describes a board, keeping its id", async () => {
    const u = await newUser();
    await createCollection(db, u, "launch", "Launch");
    await updateCollection(db, u, "launch", "  Launch site  ", "  Hero and pricing refs ");
    expect((await loadSaves(db, u)).collections).toEqual([{ id: "launch", name: "Launch site", description: "Hero and pricing refs" }]);
    await expect(updateCollection(db, u, "launch", " ", "")).rejects.toThrow("invalid");
    await expect(updateCollection(db, u, "missing", "X", "")).rejects.toThrow("unknown-collection");
  });

  it("deleting a board takes its pins and leaves the designs saved", async () => {
    const u = await newUser();
    await createCollection(db, u, "old", "Old");
    await setPinned(db, u, A, "old", true);
    await deleteCollection(db, u, "old");
    await deleteCollection(db, u, "old");
    expect(await loadSaves(db, u)).toMatchObject({ collections: [], pins: [], saves: [{ slug: A }] });
  });

  it("keeps one note per design, and clears it", async () => {
    const u = await newUser();
    await setNote(db, u, A, "not saved — nowhere to keep it");
    expect((await loadSaves(db, u)).saves).toEqual([]);
    await setSaved(db, u, A, true, undefined, 1);
    await setNote(db, u, A, "  the client liked this spacing ");
    expect((await loadSaves(db, u)).saves).toEqual([{ slug: A, at: 1, note: "the client liked this spacing" }]);
    await setNote(db, u, A, "");
    expect((await loadSaves(db, u)).saves[0].note).toBe("");
  });
});

describe("importSaves — a guest signing in", () => {
  it("merges the guest's saves, boards, pins and notes, the account winning on overlap", async () => {
    const u = await newUser();
    await createCollection(db, u, "account-board", "Account board");
    await setPinned(db, u, A, "account-board", true, 10);

    const merged = await importSaves(db, u, {
      collections: [
        { id: "guest-board", name: "Guest board", description: "From the browser" },
        { id: "account-board", name: "Renamed by the guest" }, // the account's stays
      ],
      saves: [
        { slug: A, at: 99, note: "guest note" }, // already in the account → account wins
        { slug: B, at: 20, note: "keep the header" },
        { slug: C, at: 30 },
        { slug: "not-an-item", at: 40 }, // dropped
      ],
      pins: [
        { slug: A, collectionId: "guest-board", at: 21 }, // a second board for A
        { slug: B, collectionId: "guest-board", at: 22 },
        { slug: C, collectionId: "vanished", at: 23 }, // board didn't come along → C stays saved, unsorted
        { slug: "not-an-item", collectionId: "guest-board", at: 24 },
      ],
    });

    expect(merged.collections).toEqual([
      { id: "account-board", name: "Account board", description: "" },
      { id: "guest-board", name: "Guest board", description: "From the browser" },
    ]);
    expect(merged.saves).toEqual([
      { slug: C, at: 30, note: "" },
      { slug: B, at: 20, note: "keep the header" },
      { slug: A, at: 10, note: "" },
    ]);
    expect(merged.pins).toEqual([
      { slug: B, collectionId: "guest-board", at: 22 },
      { slug: A, collectionId: "guest-board", at: 21 },
      { slug: A, collectionId: "account-board", at: 10 },
    ]);
  });

  it("reads the older shape, one collection per save", async () => {
    const u = await newUser();
    const merged = await importSaves(db, u, {
      collections: [{ id: "refs", name: "Refs" }],
      saves: [
        { slug: A, collectionId: "refs", at: 2 },
        { slug: B, collectionId: "recent", at: 1 },
      ],
    });
    expect(merged.pins).toEqual([{ slug: A, collectionId: "refs", at: 2 }]);
    expect(merged.saves.map((s) => s.slug)).toEqual([A, B]);
  });

  it("is safe to run twice", async () => {
    const u = await newUser();
    const guest = { collections: [{ id: "b", name: "B" }], saves: [{ slug: A, at: 1 }], pins: [{ slug: A, collectionId: "b", at: 1 }] };
    const once = await importSaves(db, u, guest);
    expect(await importSaves(db, u, guest)).toEqual(once);
  });

  it("survives junk from browser storage", async () => {
    const u = await newUser();
    const junk = {
      collections: [{ id: "Bad Id!", name: "x" }, { id: "fine", name: "" }, { id: "all", name: "All" }, null],
      saves: [{ slug: A, at: Number.NaN, note: 42 }, null],
      pins: [{ slug: A, collectionId: "Bad Id!", at: 1 }, null],
    } as unknown as Parameters<typeof importSaves>[2];
    const merged = await importSaves(db, u, junk);
    expect(merged.collections).toEqual([]);
    expect(merged.pins).toEqual([]);
    expect(merged.saves).toHaveLength(1);
    expect(merged.saves[0].note).toBe("");
    expect(merged.saves[0].at).toBeGreaterThan(0);
  });
});

describe("the boards migration", () => {
  it("turns each save's collection into a pin, and keeps saves in no collection unsorted", async () => {
    /* a database at the first migration, with saves in the shape before boards */
    const dir = mkdtempSync(path.join(tmpdir(), "uiv-migrations-"));
    cpSync(path.join(process.cwd(), "drizzle"), dir, { recursive: true });
    const journalPath = path.join(dir, "meta", "_journal.json");
    const journal = JSON.parse(readFileSync(journalPath, "utf8"));
    writeFileSync(journalPath, JSON.stringify({ ...journal, entries: journal.entries.slice(0, 1) }));

    const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
      import("@electric-sql/pglite"),
      import("drizzle-orm/pglite"),
      import("drizzle-orm/pglite/migrator"),
    ]);
    const client = new PGlite();
    const old = drizzle(client);
    await migrate(old, { migrationsFolder: dir });
    await client.exec(`
      INSERT INTO "user" (id, name, email) VALUES ('m1', 'm1', 'm1@example.com');
      INSERT INTO collection ("userId", id, name) VALUES ('m1', 'refs', 'Refs');
      INSERT INTO save ("userId", slug, "collectionId", at) VALUES ('m1', '${A}', 'refs', 2), ('m1', '${B}', 'recent', 1);
    `);

    await migrate(old, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    const migrated = await loadSaves(drizzle(client, { schema: await import("@/lib/db/schema") }) as unknown as Db, "m1");
    expect(migrated).toEqual({
      saves: [
        { slug: A, at: 2, note: "" },
        { slug: B, at: 1, note: "" },
      ],
      collections: [{ id: "refs", name: "Refs", description: "" }],
      pins: [{ slug: A, collectionId: "refs", at: 2 }],
    });
  });
});
