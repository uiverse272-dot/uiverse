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
 */

export type Collection = { id: string; name: string; sections: string[] };
export type Save = { slug: string; collectionId: string; at: number; note?: string };
export type State = { saves: Save[]; collections: Collection[]; hydrated: boolean };
export type Op =
  | { type: "set"; slug: string; saved: boolean; collectionId?: string }
  | { type: "move"; slug: string; collectionId: string }
  | { type: "create"; id: string; name: string };
/* told when the outbox has something to send */
type Remote = () => void;

const KEY = "uiv.saves.v1";
const accountKey = (userId: string) => `uiv.saves.u:${userId}`;
const outboxKey = (userId: string) => `uiv.saves.outbox:${userId}`;
const ACCOUNT_KEYS = /^uiv\.saves\.(u|outbox):/;
const DEFAULT_COLLECTIONS: Collection[] = [{ id: "recent", name: "Recently saved", sections: [] }];
const EMPTY: State = { saves: [], collections: DEFAULT_COLLECTIONS, hydrated: false };

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
const isSave = (s: unknown): s is Save =>
  !!s && typeof (s as Save).slug === "string" && typeof (s as Save).collectionId === "string";
const isCollection = (c: unknown): c is Collection =>
  !!c && typeof (c as Collection).id === "string" && typeof (c as Collection).name === "string";

function read(k = key()): State {
  try {
    const parsed = JSON.parse(localStorage.getItem(k) ?? "{}") as Record<string, unknown>;
    const saves = Array.isArray(parsed.saves) ? parsed.saves.filter(isSave) : [];
    const collections = Array.isArray(parsed.collections) ? parsed.collections.filter(isCollection) : [];
    return { saves, collections: collections.length ? collections : DEFAULT_COLLECTIONS, hydrated: true };
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
    localStorage.setItem(key(), JSON.stringify({ saves: state.saves, collections: state.collections }));
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
  !!o && typeof o === "object" && ["set", "move", "create"].includes((o as Op).type);

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

/** Returns the collection name it landed in, or null when it was removed. */
export function toggle(slug: string, collectionId = "recent"): string | null {
  if (isSaved(slug)) {
    commit({ ...state, saves: state.saves.filter((s) => s.slug !== slug) }, { type: "set", slug, saved: false });
    return null;
  }
  commit({ ...state, saves: [{ slug, collectionId, at: Date.now() }, ...state.saves] }, { type: "set", slug, saved: true, collectionId });
  return state.collections.find((c) => c.id === collectionId)?.name ?? "Recently saved";
}

export function move(slug: string, collectionId: string) {
  const rest = state.saves.filter((s) => s.slug !== slug);
  commit({ ...state, saves: [{ slug, collectionId, at: Date.now() }, ...rest] }, { type: "move", slug, collectionId });
}

export function create(name: string) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || `c${Date.now()}`;
  if (!state.collections.some((c) => c.id === id)) {
    commit({ ...state, collections: [...state.collections, { id, name, sections: [] }] }, { type: "create", id, name });
  }
  return id;
}

/* ------------------------------------------------------------- account */

export type ServerState = { saves: { slug: string; collectionId: string; at: number }[]; collections: { id: string; name: string }[] };

/** What this browser saved as a guest — sent once at sign-in to be merged into the account. */
export function guestState(): ServerState | null {
  const g = read(KEY);
  const collections = g.collections.filter((c) => c.id !== "recent").map(({ id, name }) => ({ id, name }));
  return g.saves.length || collections.length ? { saves: g.saves.map(({ slug, collectionId, at }) => ({ slug, collectionId, at })), collections } : null;
}

/** Signed in: paint from this user's cached copy, until `adopt` brings the server's. */
export function signIn(userId: string, remote: Remote) {
  load();
  account = { userId, remote };
  state = read();
  emit();
}

/** The account's state from the server; the guest copy has been merged into it, so it's cleared. */
export function adopt(server: ServerState) {
  write({
    saves: server.saves,
    collections: [...DEFAULT_COLLECTIONS, ...server.collections.map((c) => ({ ...c, sections: [] }))],
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
