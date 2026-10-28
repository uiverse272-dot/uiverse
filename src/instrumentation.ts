/**
 * Runs once as each server starts. In production it says, in the deploy's log, which settings are
 * missing — so a launch with accounts silently off is a line in the log, not a support ticket.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  const { checkConfig, missing } = await import("./lib/config");
  const gaps = missing(checkConfig());
  if (!gaps.length) return;
  console.warn(
    `[config] ${gaps.length} required setting${gaps.length === 1 ? "" : "s"} missing — see /api/health:\n` +
      gaps.map((c) => `  ✗ ${c.label}: ${c.fix}`).join("\n"),
  );
}
