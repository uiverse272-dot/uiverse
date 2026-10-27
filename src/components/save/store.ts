/**
 * Saves live in a tiny external store rather than in an effect-driven provider.
 *
 * Reading persisted state during a render is not possible (the server has no
 * localStorage), and writing it back with setState inside an effect causes a
 * cascading re-render. useSyncExternalStore is the sanctioned shape: the server
 * snapshot is empty, the client snapshot is read once on first subscribe.
 *
 * Two modes. A guest's saves are kept in this browser (KEY). Signed in, the account on the
 * server is the source of truth: the provider calls `signIn`, which merges the guest's saves
 * into the account once. Every change is then applied here first and put in an outbox, which
 * the provider sends in order; a change leaves the outbox only once the server has it, so one
 * cut off by leaving the page is sent on the next visit. A per-user copy in this browser paints
 * the next visit before the server answers.
 *
 * A save is a design kept; a pin puts it on a board, and one design can be on many boards. A
 * design on none is "unsorted". Storage written before boards had one collection per save, and
 * is read into pins.
 */

import type { GuestState, SavesState } from "@/lib/saves/db";
import type { SaveOp } from "./actions";

export type Collection = { id: string; name: string; description?: string };
export type Save = { slug: string; at: number; note?: string };
export type Pin = { slug: string; collectionId: string; at: number };
export type State = { saves: Save[]; collections: Collection[]; pins: Pin[]; hydrated: boolean };
/* the server's own types: one definition of the wire format, so the two sides can't drift */
type Op = SaveOp;
/* told when the outbox has something to send */
type Remote = () => void;

const KEY = "uiv.saves.v1";
const accountKey = (userId: string) => `uiv.saves.u:${userId}`;
const outboxKey = (userId: string) => `uiv.saves.outbox:${userId}`;
const ACCOUNT_KEYS = /^uiv\.saves\.(u|outbox):/;
/* ids that are views of the saves (/saved/all, /saved/unsorted) or the old default bucket, never boards */
const RESERVED = new Set(["all", "unsorted", "recent"]);
const EMPTY: State = { saves: [], collections: [], pins: [], hydrated: false };

let state: State = EMPTY;
let loaded = false;
let account: { userId: string; remote: Remote } | null = null;
const listeners = new Set<() => void>();
const key = () => (account ? accountKey(account.userId) : KEY);

/*
 * Storage is outside our control — an older schema, a hand edit, another app on the origin.
 * Anything that isn't the expected shape is dropped rather than trusted: one bad entry used to
 * crash every page, because this provider wraps the whole app.
 */
const isSave = (s: unknown): s is Save & { collectionId?: unknown } => !!s && typeof (s as Save).slug === "string";
const isCollection = (c: unknown): c is Collection =>
  !!c && typeof (c as Collection).id === "string" && typeof (c as Collection).name === "string" && !RESERVED.has((c as Collection).id);
const isPin = (p: unknown): p is Pin =>
  !!p && typeof (p as Pin).slug === "string" && typeof (p as Pin).collectionId === "string";

function read(k = key()): State {
  try {
    const parsed = JSON.parse(localStorage.getItem(k) ?? "{}") as Record<string, unknown>;
    const raw = Array.isArray(parsed.saves) ? parsed.saves.filter(isSave) : [];
    const collections = (Array.isArray(parsed.collections) ? parsed.collections.filter(isCollection) : []).map(({ id, name, description }) => ({
      id,
      name,
      ...(typeof description === "string" && description ? { description } : {}),
    }));
    const boards = new Set(collections.map((c) => c.id));
    const saves = raw.map(({ slug, at, note }) => ({ slug, at: Number(at) || 0, ...(typeof note === "string" && note ? { note } : {}) }));
    const saved = new Set(saves.map((s) => s.slug));
    const pins = [
      ...(Array.isArray(parsed.pins) ? parsed.pins.filter(isPin) : []),
      /* the shape before boards: each save in one collection */
      ...raw.flatMap((s) => (typeof s.collectionId === "string" ? [{ slug: s.slug, collectionId: s.collectionId, at: Number(s.at) || 0 }] : [])),
    ].filter((p, i, all) => boards.has(p.collectionId) && saved.has(p.slug) && all.findIndex((q) => q.slug === p.slug && q.collectionId === p.collectionId) === i);
    return { saves, collections, pins, hydrated: true };
  } catch {
    /* private mode, blocked storage or malformed JSON — the app works, it just won't persist */
    return { ...EMPTY, hydrated: true };
  }
}

/* another tab saved something — take its state, or two tabs would overwrite each other's saves */
function onStorage(e: StorageEvent) {
  if (e.key !== key()) return;
  state = read();
  emit();
}

const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded) return;
  loaded = true;
  state = read();
  window.addEventListener("storage", onStorage);
}

function write(next: State) {
  state = next;
  try {
    localStorage.setItem(key(), JSON.stringify({ saves: state.saves, collections: state.collections, pins: state.pins }));
  } catch {}
  emit();
}

/** Apply a change here; signed in, queue it for the server */
function commit(next: State, op: Op) {
  write(next);
  if (!account) return;
  writeOutbox([...pending(), op]);
  account.remote();
}

/* ------------------------------------------------------------- outbox */

const isOp = (o: unknown): o is Op =>
  !!o && typeof o === "object" && ["set", "pin", "move", "create", "update", "delete", "note"].includes((o as Op).type);

/** Changes not yet confirmed by the server, oldest first */
export function pending(): Op[] {
  if (!account) return [];
  try {
    const list = JSON.parse(localStorage.getItem(outboxKey(account.userId)) ?? "[]");
    return Array.isArray(list) ? list.filter(isOp) : [];
  } catch {
    return [];
  }
}

function writeOutbox(ops: Op[]) {
  if (!account) return;
  try {
    if (ops.length) localStorage.setItem(outboxKey(account.userId), JSON.stringify(ops));
    else localStorage.removeItem(outboxKey(account.userId));
  } catch {}
}

/** The server has this change (or refused it for good): take it off the front of the outbox */
export function ack(op: Op) {
  const [first, ...rest] = pending();
  if (first && JSON.stringify(first) === JSON.stringify(op)) writeOutbox(rest);
}

export function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getSnapshot = () => state;
export const getServerSnapshot = () => EMPTY;

export const isSaved = (slug: string) => state.saves.some((s) => s.slug === slug);
const isPinned = (slug: string, collectionId: string) => state.pins.some((p) => p.slug === slug && p.collectionId === collectionId);

/** Saves or unsaves; true when the design is now saved. Unsaving takes it off every board. */
export function toggle(slug: string): boolean {
  if (isSaved(slug)) {
    commit(
      { ...state, saves: state.saves.filter((s) => s.slug !== slug), pins: state.pins.filter((p) => p.slug !== slug) },
      { type: "set", slug, saved: false },
    );
    return false;
  }
  commit({ ...state, saves: [{ slug, at: Date.now() }, ...state.saves] }, { type: "set", slug, saved: true });
  return true;
}

/** Put a design on a board (saving it first if needed) or take it off one. It stays saved either way. */
export function pin(slug: string, collectionId: string, pinned: boolean) {
  if (!state.collections.some((c) => c.id === collectionId) || isPinned(slug, collectionId) === pinned) return;
  const at = Date.now();
  if (!pinned) {
    commit({ ...state, pins: state.pins.filter((p) => !(p.slug === slug && p.collectionId === collectionId)) }, { type: "pin", slug, collectionId, pinned });
    return;
  }
  const saves = isSaved(slug) ? state.saves : [{ slug, at }, ...state.saves];
  commit({ ...state, saves, pins: [{ slug, collectionId, at }, ...state.pins] }, { type: "pin", slug, collectionId, pinned });
}

/** A new board, or the existing one with the same id; returns its id. */
export function create(name: string, description = "") {
  let id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || `c${Date.now()}`;
  if (RESERVED.has(id)) id = `${id}-board`;
  if (!state.collections.some((c) => c.id === id)) {
    commit({ ...state, collections: [...state.collections, { id, name, description }] }, { type: "create", id, name, description });
  }
  return id;
}

export function update(id: string, name: string, description: string) {
  const at = state.collections.findIndex((c) => c.id === id);
  if (at < 0 || !name.trim()) return;
  const collections = state.collections.with(at, { id, name: name.trim(), description: description.trim() });
  commit({ ...state, collections }, { type: "update", id, name: name.trim(), description: description.trim() });
}

/** Delete a board and its pins; the designs stay saved. */
export function remove(id: string) {
  commit(
    { ...state, collections: state.collections.filter((c) => c.id !== id), pins: state.pins.filter((p) => p.collectionId !== id) },
    { type: "delete", id },
  );
}

/** The person's note on a saved design; empty clears it. */
export function note(slug: string, text: string) {
  const clean = text.trim();
  if (!isSaved(slug)) return;
  commit(
    { ...state, saves: state.saves.map((s) => (s.slug === slug ? { slug: s.slug, at: s.at, ...(clean ? { note: clean } : {}) } : s)) },
    { type: "note", slug, note: clean },
  );
}

/* ------------------------------------------------------------- account */

/** What this browser saved as a guest — sent once at sign-in to be merged into the account. */
export function guestState(): GuestState | null {
  const g = read(KEY);
  return g.saves.length || g.collections.length ? { saves: g.saves, collections: g.collections, pins: g.pins } : null;
}

/** Signed in: paint from this user's cached copy, until `adopt` brings the server's. */
export function signIn(userId: string, remote: Remote) {
  load();
  account = { userId, remote };
  state = read();
  emit();
}

/** The account's state from the server; the guest copy has been merged into it, so it's cleared. */
export function adopt(server: SavesState) {
  write({
    saves: server.saves.map(({ slug, at, note }) => ({ slug, at, ...(note ? { note } : {}) })),
    collections: server.collections,
    pins: server.pins,
    hydrated: true,
  });
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/**
 * Signed out: forget every account copy on this browser and go back to the guest store. Every,
 * not just the current one — a session that expired or ended elsewhere leaves a copy whose owner
 * this page never learned.
 */
export function signOut() {
  try {
    for (const k of Object.keys(localStorage)) if (ACCOUNT_KEYS.test(k)) localStorage.removeItem(k);
  } catch {}
  if (!account) return;
  account = null;
  state = read();
  emit();
}
