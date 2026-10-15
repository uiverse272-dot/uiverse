import { and, like, sql } from "drizzle-orm";
import type { Db } from ".";
import { verification } from "./schema";

/**
 * Forget an address's unused sign-in links — after its account is deleted, a link still in an
 * inbox would otherwise sign it straight back up. Links are stored by Better Auth's magic-link
 * plugin as identifier "magic-link:<token>", value {"type":"magic-link","email":…}. LIKE's
 * wildcards (_ and %) are escaped, so one address can never match another's.
 */
export async function deleteMagicLinks(db: Db, email: string) {
  const quoted = JSON.stringify(email.toLowerCase()).replace(/[\\%_]/g, "\\$&");
  await db
    .delete(verification)
    .where(and(like(verification.identifier, "magic-link:%"), sql`lower(${verification.value}) like ${`%"email":${quoted}%`}`));
}
