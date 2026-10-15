import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/**
 * The database, or null when accounts are off.
 *
 *   DATABASE_URL set          Postgres (Supabase: the transaction-pooler URL — hence prepare: false)
 *   unset, outside production an embedded Postgres (PGlite) in .data.nosync/pglite, migrated on first use,
 *                              so accounts work locally with nothing to sign up for
 *   unset, in production       null — accounts are off rather than silently keeping users in a
 *                              file on one server. UIV_LOCAL_DB=1 opts in (tests, a single box).
 *
 * Kept on globalThis so dev reloads don't open a second connection or a second PGlite on the
 * same directory.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const g = globalThis as unknown as { __uivDb?: Promise<Db | null> };

export function getDb(): Promise<Db | null> {
  return (g.__uivDb ??= open());
}

async function open(): Promise<Db | null> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const [{ drizzle }, { default: postgres }] = await Promise.all([import("drizzle-orm/postgres-js"), import("postgres")]);
    return drizzle(postgres(url, { prepare: false, max: 5 }), { schema }) as unknown as Db;
  }
  if (process.env.NODE_ENV === "production" && process.env.UIV_LOCAL_DB !== "1") return null;
  /* .nosync: iCloud skips the folder — synced, it duplicated and offloaded the database's own files */
  return openLocal(path.join(process.cwd(), ".data.nosync", "pglite"));
}

/** An embedded database with the migrations applied — a directory, or in memory when `dir` is omitted (tests). */
export async function openLocal(dir?: string): Promise<Db> {
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);
  /* PGlite makes its own directory but not the parents (.data.nosync on a fresh checkout) */
  if (dir) await mkdir(dir, { recursive: true });
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return db as unknown as Db;
}
