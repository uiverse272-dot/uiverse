import { GOALS, GUIDE_INDUSTRIES, type Goal } from "./goals";

const STATUSES = ["welcome", "active", "finished", "off"] as const;
export type State = { status: (typeof STATUSES)[number]; step: number; goal?: Goal };

/**
 * The guide's saved state, checked. Storage outlives the code — steps come and go, the shape
 * changes, people edit it by hand — and trusting it once blanked every page. Only the guide
 * writes this key, and only after the welcome was answered, so a value that's there but can't
 * be read turns the guide off rather than greeting them again (?tour=1 still reopens it). A
 * step that no longer exists restarts the tour; a goal we don't know is dropped.
 */
export function parseState(raw: string | null, steps: number): State | null {
  if (!raw) return null;
  const off: State = { status: "off", step: 0 };
  let v: Record<string, unknown>;
  try {
    v = JSON.parse(raw);
  } catch {
    return off;
  }
  if (!v || typeof v !== "object" || !STATUSES.includes(v.status as State["status"])) return off;
  const step = Number.isInteger(v.step) && (v.step as number) >= 0 && (v.step as number) < steps ? (v.step as number) : 0;
  return { status: v.status as State["status"], step, goal: parseGoal(v.goal) };
}

function parseGoal(g: unknown): Goal | undefined {
  if (!g || typeof g !== "object") return undefined;
  const { id, industry, rtl } = g as Record<string, unknown>;
  if (typeof id !== "string" || !GOALS.some((x) => x.id === id)) return undefined;
  const known = typeof industry === "string" && (GUIDE_INDUSTRIES as readonly string[]).includes(industry);
  return { id, industry: known ? industry : undefined, rtl: rtl === true };
}
