import { and, count, desc, eq } from "drizzle-orm";
import { bySlug } from "@/lib/data";
import type { Db } from "@/lib/db";
import { collection, save } from "@/lib/db/schema";

/**
 * Saves and collections for a signed-in user — the server side of components/save/store.ts.
 * Every function takes the database, so tests run against an in-memory one.
 *
 * Writes are idempotent and say what they want ("saved", not "toggle"), so a retried or
 * duplicated request can't flip a save back. The client store mirrors this shape exactly.
 */

export type SavesState = {
  saves: { slug: string; collectionId: string; at: number }[];
  collections: { id: string; name: string }[];
};

export const RECENT = "recent";
export const LIMITS = { saves: 5000, collections: 100, name: 60 };
const ID = /^[a-z0-9-]{1,40}$/;

export class SavesError extends Error {
  constructor(public code: "unknown-item" | "unknown-collection" | "invalid" | "limit") {
    super(code);
  }
}

export async function loadSaves(db: Db, userId: string): Promise<SavesState> {
  const [saves, collections] = await Promise.all([
    db.select({ slug: save.slug, collectionId: save.collectionId, at: save.at }).from(save).where(eq(save.userId, userId)).orderBy(desc(save.at)),
    db.select({ id: collection.id, name: collection.name }).from(collection).where(eq(collection.userId, userId)).orderBy(collection.createdAt),
  ]);
  return { saves, collections };
}

async function hasCollection(db: Db, userId: string, id: string) {
  if (id === RECENT) return true;
  const [row] = await db.select({ id: collection.id }).from(collection).where(and(eq(collection.userId, userId), eq(collection.id, id)));
  return !!row;
}

/** Save or unsave one item. Saving into a collection that doesn't exist is refused, not guessed. */
export async function setSaved(db: Db, userId: string, slug: string, saved: boolean, collectionId = RECENT, at = Date.now()) {
  if (!saved) {
    await db.delete(save).where(and(eq(save.userId, userId), eq(save.slug, slug)));
    return;
  }
  if (!bySlug(slug)) throw new SavesError("unknown-item");
  if (!(await hasCollection(db, userId, collectionId))) throw new SavesError("unknown-collection");
  const [{ n }] = await db.select({ n: count() }).from(save).where(eq(save.userId, userId));
  if (n >= LIMITS.saves) throw new SavesError("limit");
  /* already saved: leave it where it is, as the browser store does */
  await db.insert(save).values({ userId, slug, collectionId, at }).onConflictDoNothing();
}

/** Move a saved item into a collection — saving it there if it wasn't saved yet. */
export async function moveSave(db: Db, userId: string, slug: string, collectionId: string, at = Date.now()) {
  if (!bySlug(slug)) throw new SavesError("unknown-item");
  if (!(await hasCollection(db, userId, collectionId))) throw new SavesError("unknown-collection");
  await db
    .insert(save)
    .values({ userId, slug, collectionId, at })
    .onConflictDoUpdate({ target: [save.userId, save.slug], set: { collectionId, at } });
}

export async function createCollection(db: Db, userId: string, id: string, name: string) {
  const clean = name.trim().slice(0, LIMITS.name);
  if (!ID.test(id) || id === RECENT || !clean) throw new SavesError("invalid");
  const [{ n }] = await db.select({ n: count() }).from(collection).where(eq(collection.userId, userId));
  if (n >= LIMITS.collections) throw new SavesError("limit");
  await db.insert(collection).values({ userId, id, name: clean }).onConflictDoNothing();
}

/**
 * What a guest saved before signing in, merged into the account. The account wins where both
 * have an item; unknown items are dropped; a save whose collection didn't come along lands in
 * "recent". Returns the merged state.
 */
export async function importSaves(db: Db, userId: string, guest: SavesState): Promise<SavesState> {
  const ids = new Set<string>([RECENT]);
  for (const c of guest.collections.slice(0, LIMITS.collections)) {
    if (c.id === RECENT) continue;
    try {
      await createCollection(db, userId, c.id, c.name);
      ids.add(c.id);
    } catch {
      /* invalid or over the limit — its saves fall back to "recent" */
    }
  }
  for (const c of (await loadSaves(db, userId)).collections) ids.add(c.id);

  const rows = guest.saves
    .filter((s) => bySlug(s.slug))
    .slice(0, LIMITS.saves)
    .map((s) => ({ userId, slug: s.slug, collectionId: ids.has(s.collectionId) ? s.collectionId : RECENT, at: Number(s.at) || Date.now() }));
  if (rows.length) {
    const [{ n }] = await db.select({ n: count() }).from(save).where(eq(save.userId, userId));
    const room = Math.max(0, LIMITS.saves - n);
    if (room) await db.insert(save).values(rows.slice(0, room)).onConflictDoNothing();
  }
  return loadSaves(db, userId);
}
