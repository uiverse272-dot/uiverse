/**
 * Free plan: 3 generated prompts a month.
 *
 * This is the one place the pricing principle from docs/18 shows up in code —
 * output is metered, discovery never is. Browsing, saving and the Breakdown tab
 * have no counter anywhere near them.
 *
 * A credit buys one prompt, not one copy: the prompt's key (item + tool, stack and
 * sections) is remembered, so copying it again — edited or not — is free, and stays
 * free after the limit is reached.
 */
const KEY = "uiv.prompts.v1";
export const FREE_LIMIT = 3;

type Ledger = { month: string; used: number; keys: string[] };

const period = () => new Date().toISOString().slice(0, 7);

function read(): Ledger {
  const empty = { month: period(), used: 0, keys: [] };
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Ledger>;
    if (p.month !== period()) return empty;
    return { month: p.month, used: Number(p.used) || 0, keys: Array.isArray(p.keys) ? p.keys : [] };
  } catch {
    return empty;
  }
}

export const readUsed = () => read().used;

export const isCharged = (key: string) => read().keys.includes(key);

/** Charges a credit for `key` unless it was already paid for; returns the month's total. */
export function consume(key: string): number {
  const l = read();
  if (l.keys.includes(key)) return l.used;
  const next: Ledger = { ...l, used: l.used + 1, keys: [...l.keys, key] };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next.used;
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
