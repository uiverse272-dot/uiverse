import { and, count, desc, eq, inArray } from "drizzle-orm";
import { bySlug } from "@/lib/data";
import type { Db } from "@/lib/db";
import { collection, pin, save } from "@/lib/db/schema";

/**
 * Saves and boards for a signed-in user — the server side of components/save/store.ts.
 * Every function takes the database, so tests run against an in-memory one.
 *
 * A save is a design the person kept; a pin puts a saved design on a board, and one design can
 * be on many boards. Writes are idempotent and say what they want ("pinned", not "toggle"), so a
 * retried or duplicated request can't flip anything back. The client store mirrors this shape.
 */

export type SavesState = {
  saves: { slug: string; at: number; note: string }[];
  collections: { id: string; name: string; description: string }[];
  pins: { slug: string; collectionId: string; at: number }[];
};

/** Ids that name views of the saves rather than boards (/saved/all, /saved/unsorted), and the old default bucket */
export const RESERVED = new Set(["all", "unsorted", "recent"]);
export const LIMITS = { saves: 5000, collections: 100, pins: 20000, name: 60, description: 280, note: 500 };
const ID = /^[a-z0-9-]{1,40}$/;

export class SavesError extends Error {
  constructor(public code: "unknown-item" | "unknown-collection" | "invalid" | "limit") {
    super(code);
  }
}

export async function loadSaves(db: Db, userId: string): Promise<SavesState> {
  const [saves, collections, pins] = await Promise.all([
    db.select({ slug: save.slug, at: save.at, note: save.note }).from(save).where(eq(save.userId, userId)).orderBy(desc(save.at)),
    db
      .select({ id: collection.id, name: collection.name, description: collection.description })
      .from(collection)
      .where(eq(collection.userId, userId))
      .orderBy(collection.createdAt),
    db.select({ slug: pin.slug, collectionId: pin.collectionId, at: pin.at }).from(pin).where(eq(pin.userId, userId)).orderBy(desc(pin.at)),
  ]);
  return { saves, collections, pins };
}

async function hasCollection(db: Db, userId: string, id: string) {
  const [row] = await db.select({ id: collection.id }).from(collection).where(and(eq(collection.userId, userId), eq(collection.id, id)));
  return !!row;
}

/* save a design if it isn't saved yet; an existing save keeps its time and note */
async function ensureSaved(db: Db, userId: string, slug: string, at: number) {
  if (!bySlug(slug)) throw new SavesError("unknown-item");
  const [[row], [{ n }]] = await Promise.all([
    db.select({ slug: save.slug }).from(save).where(and(eq(save.userId, userId), eq(save.slug, slug))),
    db.select({ n: count() }).from(save).where(eq(save.userId, userId)),
  ]);
  if (row) return;
  if (n >= LIMITS.saves) throw new SavesError("limit");
  await db.insert(save).values({ userId, slug, at }).onConflictDoNothing();
}

/**
 * Save or unsave one design. Saving straight onto a board pins it there too; a board that doesn't
 * exist is refused, not guessed. Unsaving takes it off every board.
 */
export async function setSaved(db: Db, userId: string, slug: string, saved: boolean, collectionId?: string, at = Date.now()) {
  if (!saved) {
    await db.delete(save).where(and(eq(save.userId, userId), eq(save.slug, slug)));
    return;
  }
  if (collectionId) return setPinned(db, userId, slug, collectionId, true, at);
  await ensureSaved(db, userId, slug, at);
}

/** Put a design on a board (saving it if it wasn't) or take it off; it stays saved either way. */
export async function setPinned(db: Db, userId: string, slug: string, collectionId: string, pinned: boolean, at = Date.now()) {
  if (!pinned) {
    await db.delete(pin).where(and(eq(pin.userId, userId), eq(pin.collectionId, collectionId), eq(pin.slug, slug)));
    return;
  }
  if (!(await hasCollection(db, userId, collectionId))) throw new SavesError("unknown-collection");
  const [{ n }] = await db.select({ n: count() }).from(pin).where(eq(pin.userId, userId));
  if (n >= LIMITS.pins) throw new SavesError("limit");
  await ensureSaved(db, userId, slug, at);
  await db.insert(pin).values({ userId, collectionId, slug, at }).onConflictDoNothing();
}

/* a usable board id and its cleaned name, or null */
const valid = (id: string, name: string) => {
  const clean = name.trim().slice(0, LIMITS.name);
  return ID.test(id) && !RESERVED.has(id) && clean ? clean : null;
};
const cleanDescription = (d: unknown) => (typeof d === "string" ? d.trim().slice(0, LIMITS.description) : "");

export async function createCollection(db: Db, userId: string, id: string, name: string, description = "") {
  const clean = valid(id, name);
  if (!clean) throw new SavesError("invalid");
  const [{ n }] = await db.select({ n: count() }).from(collection).where(eq(collection.userId, userId));
  if (n >= LIMITS.collections) throw new SavesError("limit");
  await db.insert(collection).values({ userId, id, name: clean, description: cleanDescription(description) }).onConflictDoNothing();
}

/** Rename a board or change its description. Its id — and so its address — stays. */
export async function updateCollection(db: Db, userId: string, id: string, name: string, description: string) {
  const clean = valid(id, name);
  if (!clean) throw new SavesError("invalid");
  const done = await db
    .update(collection)
    .set({ name: clean, description: cleanDescription(description) })
    .where(and(eq(collection.userId, userId), eq(collection.id, id)))
    .returning({ id: collection.id });
  if (!done.length) throw new SavesError("unknown-collection");
}

/** Delete a board and its pins. The designs stay saved. Deleting one that's gone already is fine. */
export async function deleteCollection(db: Db, userId: string, id: string) {
  await db.delete(collection).where(and(eq(collection.userId, userId), eq(collection.id, id)));
}

/** The person's note on a saved design; empty clears it. A design that isn't saved has nowhere to keep one. */
export async function setNote(db: Db, userId: string, slug: string, note: string) {
  const clean = typeof note === "string" ? note.trim().slice(0, LIMITS.note) : "";
  await db.update(save).set({ note: clean }).where(and(eq(save.userId, userId), eq(save.slug, slug)));
}

/** What a guest's browser kept — the current shape, or the older one with one collection per save. */
export type GuestState = {
  saves: { slug: string; at: number; note?: string; collectionId?: string }[];
  collections: { id: string; name: string; description?: string }[];
  pins?: { slug: string; collectionId: string; at: number }[];
};

/**
 * What a guest saved before signing in, merged into the account. The account wins where both
 * have a design or a board; unknown designs are dropped; a pin whose board didn't come along is
 * dropped too (the design stays saved, unsorted). Returns the merged state.
 */
export async function importSaves(db: Db, userId: string, guest: GuestState): Promise<SavesState> {
  /* boards in one insert: the valid, new ones that fit under the limit */
  const existing = await db.select({ id: collection.id }).from(collection).where(eq(collection.userId, userId));
  const ids = new Set<string>(existing.map((c) => c.id));
  const fresh = new Map<string, { name: string; description: string }>();
  for (const c of guest.collections) {
    const clean = c && valid(String(c.id), String(c.name ?? ""));
    if (clean && !ids.has(c.id) && !fresh.has(c.id)) fresh.set(c.id, { name: clean, description: cleanDescription(c.description) });
  }
  const added = [...fresh].slice(0, Math.max(0, LIMITS.collections - existing.length));
  if (added.length) {
    await db
      .insert(collection)
      .values(added.map(([id, c]) => ({ userId, id, ...c })))
      .onConflictDoNothing();
  }
  for (const [id] of added) ids.add(id);

  const known = guest.saves.filter((s) => s && typeof s.slug === "string" && bySlug(s.slug));
  const rows = known.slice(0, LIMITS.saves).map((s) => ({
    userId,
    slug: s.slug,
    at: Number(s.at) || Date.now(),
    note: typeof s.note === "string" ? s.note.trim().slice(0, LIMITS.note) : "",
  }));
  if (rows.length) {
    const [{ n }] = await db.select({ n: count() }).from(save).where(eq(save.userId, userId));
    const room = Math.max(0, LIMITS.saves - n);
    if (room) await db.insert(save).values(rows.slice(0, room)).onConflictDoNothing();
  }

  /* pins: the guest's own, plus the older one-collection-per-save shape */
  const wanted = [
    ...(Array.isArray(guest.pins) ? guest.pins : []),
    ...known.flatMap((s) => (s.collectionId ? [{ slug: s.slug, collectionId: s.collectionId, at: s.at }] : [])),
  ].filter((p) => p && ids.has(p.collectionId));
  if (wanted.length) {
    const slugs = [...new Set(wanted.map((p) => p.slug))];
    const saved = new Set(
      (await db.select({ slug: save.slug }).from(save).where(and(eq(save.userId, userId), inArray(save.slug, slugs)))).map((r) => r.slug),
    );
    const [{ n }] = await db.select({ n: count() }).from(pin).where(eq(pin.userId, userId));
    const pins = wanted
      .filter((p) => saved.has(p.slug))
      .map((p) => ({ userId, collectionId: p.collectionId, slug: p.slug, at: Number(p.at) || Date.now() }))
      .slice(0, Math.max(0, LIMITS.pins - n));
    if (pins.length) await db.insert(pin).values(pins).onConflictDoNothing();
  }
  return loadSaves(db, userId);
}
