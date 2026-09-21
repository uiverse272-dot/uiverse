/**
 * Saves live in a tiny external store rather than in an effect-driven provider.
 *
 * Reading persisted state during a render is not possible (the server has no
 * localStorage), and writing it back with setState inside an effect causes a
 * cascading re-render. useSyncExternalStore is the sanctioned shape: the server
 * snapshot is empty, the client snapshot is read once on first subscribe.
 */

export type Collection = { id: string; name: string; sections: string[] };
export type Save = { slug: string; collectionId: string; at: number; note?: string };
export type State = { saves: Save[]; collections: Collection[]; hydrated: boolean };

const KEY = "uiv.saves.v1";
const DEFAULT_COLLECTIONS: Collection[] = [{ id: "recent", name: "Recently saved", sections: [] }];
const EMPTY: State = { saves: [], collections: DEFAULT_COLLECTIONS, hydrated: false };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      state = {
        saves: parsed.saves ?? [],
        collections: parsed.collections?.length ? parsed.collections : DEFAULT_COLLECTIONS,
        hydrated: true,
      };
      return;
    }
  } catch {
    /* private mode or blocked storage — the app works, it just won't persist */
  }
  state = { ...EMPTY, hydrated: true };
}

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify({ saves: state.saves, collections: state.collections }));
  } catch {}
  listeners.forEach((l) => l());
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
    commit({ ...state, saves: state.saves.filter((s) => s.slug !== slug) });
    return null;
  }
  commit({ ...state, saves: [{ slug, collectionId, at: Date.now() }, ...state.saves] });
  return state.collections.find((c) => c.id === collectionId)?.name ?? "Recently saved";
}

export function move(slug: string, collectionId: string) {
  const rest = state.saves.filter((s) => s.slug !== slug);
  commit({ ...state, saves: [{ slug, collectionId, at: Date.now() }, ...rest] });
}

export function create(name: string) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || `c${Date.now()}`;
  if (!state.collections.some((c) => c.id === id)) {
    commit({ ...state, collections: [...state.collections, { id, name, sections: [] }] });
  }
  return id;
}
