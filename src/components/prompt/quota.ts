/**
 * Free plan: 3 generated prompts a month.
 *
 * This is the one place the pricing principle from docs/18 shows up in code —
 * output is metered, discovery never is. Browsing, saving and the Breakdown tab
 * have no counter anywhere near them.
 */
const KEY = "uiv.prompts.v1";
export const FREE_LIMIT = 3;

const period = () => new Date().toISOString().slice(0, 7);

export function readUsed(): number {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 0;
    const p = JSON.parse(raw) as { month?: string; used?: number };
    return p.month === period() ? (p.used ?? 0) : 0;
  } catch {
    return 0;
  }
}

export function consume(): number {
  const next = readUsed() + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify({ month: period(), used: next }));
  } catch {}
  return next;
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
