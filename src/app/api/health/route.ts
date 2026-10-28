import { sql } from "drizzle-orm";
import journal from "../../../../drizzle/meta/_journal.json";
import { checkConfig, missing } from "@/lib/config";
import { getDb } from "@/lib/db";

/**
 * Is production set up? Open /api/health after a deploy: the configuration checks (names only, never
 * values), whether the database answers, and whether every migration in drizzle/ has been applied.
 * 200 when all of it is in place, 503 when something required is missing — usable as an uptime check.
 */
export async function GET() {
  const checks = checkConfig();
  const database = await probe();
  const ready = !missing(checks).length && database.reachable && database.migrated;
  return Response.json(
    { status: ready ? "ready" : "not ready", database, checks: checks.map(({ id, label, level, ok, fix }) => ({ id, label, level, ok, ...(ok ? {} : { fix }) })) },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

async function probe() {
  const expected = journal.entries.length;
  const db = await getDb().catch(() => null);
  if (!db) return { reachable: false, migrated: false, migrations: { applied: 0, expected } };
  try {
    /* drizzle-kit and the embedded database both record applied migrations here */
    const rows = await db.execute<{ n: number }>(
      sql`select count(*)::int as n from drizzle.__drizzle_migrations`,
    );
    const applied = Number((Array.isArray(rows) ? rows[0] : (rows as { rows: { n: number }[] }).rows[0])?.n ?? 0);
    return { reachable: true, migrated: applied >= expected, migrations: { applied, expected } };
  } catch (e) {
    /* Drizzle wraps every failure as "Failed query: <sql>", so the driver's error is the cause — read its code, not the message */
    const code = String(((e as { cause?: { code?: unknown } }).cause ?? (e as { code?: unknown }))?.code ?? "");
    /* reachable but never migrated: the schema or table doesn't exist yet */
    const reachable = code === "42P01" || code === "3F000";
    return { reachable, migrated: false, migrations: { applied: 0, expected }, ...(reachable ? {} : { problem: problem(code) }) };
  }
}

/** Why the database didn't answer, from the Postgres error code — never the URL or the driver's message */
function problem(code: string) {
  if (code === "28P01" || code === "28000") return "The database rejected the password in DATABASE_URL — check it has no [ ] left from the placeholder";
  if (code === "XX000") return "The pooler doesn't know this project — check the user (postgres.<project ref>) and host in DATABASE_URL";
  if (code === "3D000") return "The database named in DATABASE_URL doesn't exist — it should end in /postgres";
  return "Couldn't connect with DATABASE_URL — check the host and port (Supabase's transaction pooler, 6543)";
}
