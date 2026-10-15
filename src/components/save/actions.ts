"use server";

import { currentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { rateLimiter } from "@/lib/rateLimit";
import { createCollection, importSaves, loadSaves, moveSave, SavesError, setSaved, type SavesState } from "@/lib/saves/db";

/**
 * The browser store's server side for signed-in users (store.ts). Each call checks the session
 * itself — a server action is a public endpoint, whatever the UI shows.
 */

export type SaveOp =
  | { type: "set"; slug: string; saved: boolean; collectionId?: string }
  | { type: "move"; slug: string; collectionId: string }
  | { type: "create"; id: string; name: string };

export type OpResult = { ok: true } | { ok: false; error: SavesError["code"] | "signed-out" | "rate" | "failed" };

/* generous for a person clicking, tight for a script */
const limit = rateLimiter(120, 60_000);

async function context() {
  const [user, db] = await Promise.all([currentUser(), getDb()]);
  return user && db ? { userId: user.id, db } : null;
}

/** The account's saves, after merging in what this browser saved as a guest (if anything). Null when signed out. */
export async function syncSaves(guest: SavesState | null): Promise<SavesState | null> {
  const ctx = await context();
  if (!ctx) return null;
  const valid =
    guest && Array.isArray(guest.saves) && Array.isArray(guest.collections) && (guest.saves.length || guest.collections.length);
  return valid ? importSaves(ctx.db, ctx.userId, guest) : loadSaves(ctx.db, ctx.userId);
}

export async function saveOp(op: SaveOp): Promise<OpResult> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "signed-out" };
  if (limit(ctx.userId) !== null) return { ok: false, error: "rate" };
  try {
    if (op.type === "set") await setSaved(ctx.db, ctx.userId, String(op.slug), !!op.saved, op.collectionId ? String(op.collectionId) : undefined);
    else if (op.type === "move") await moveSave(ctx.db, ctx.userId, String(op.slug), String(op.collectionId));
    else if (op.type === "create") await createCollection(ctx.db, ctx.userId, String(op.id), String(op.name));
    else return { ok: false, error: "failed" };
    return { ok: true };
  } catch (e) {
    if (e instanceof SavesError) return { ok: false, error: e.code };
    console.error("[saves]", e);
    return { ok: false, error: "failed" };
  }
}
