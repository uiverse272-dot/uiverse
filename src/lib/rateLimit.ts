/**
 * A budget per key (a client IP) per window. Kept in memory, so it's per server instance — on
 * serverless that stops one client draining a warm function, not a distributed flood; that
 * needs a shared store or the platform's firewall in front.
 */
export function rateLimiter(budget: number, windowMs: number) {
  const spent = new Map<string, { used: number; reset: number }>();
  /** null when allowed, otherwise the seconds until the budget refills */
  return (key: string, cost = 1): number | null => {
    const now = Date.now();
    if (spent.size > 10_000) for (const [k, v] of spent) if (v.reset <= now) spent.delete(k);
    let e = spent.get(key);
    if (!e || e.reset <= now) spent.set(key, (e = { used: 0, reset: now + windowMs }));
    if (e.used + cost > budget) return Math.ceil((e.reset - now) / 1000);
    e.used += cost;
    return null;
  };
}

/* the platform's proxy sets x-forwarded-for; self-hosted without one, it's whatever the client sends */
export const clientIp = (h: Headers) => h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
