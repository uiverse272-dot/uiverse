import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { headers } from "next/headers";
import { getDb, type Db } from "./db";
import { deleteMagicLinks } from "./db/magicLinks";
import * as schema from "./db/schema";
import { SITE_URL } from "./site";

/**
 * Accounts (Better Auth): email magic link, plus Google and GitHub when their keys are set.
 * Users, sessions and saves live in our own Postgres (lib/db).
 *
 *   BETTER_AUTH_SECRET     required in production — without it accounts stay off
 *   BETTER_AUTH_URL        the public origin, if it differs from NEXT_PUBLIC_SITE_URL
 *   GOOGLE_CLIENT_ID / _SECRET, GITHUB_CLIENT_ID / _SECRET   show those buttons
 *   RESEND_API_KEY + AUTH_EMAIL_FROM   send sign-in links. Without them, outside production (or with
 *                                      AUTH_LOG_LINKS=1, for tests only) the link is printed to the
 *                                      server log instead; in production email sign-in is off.
 */

const env = process.env;
const prod = env.NODE_ENV === "production";

export const providers = () => ({
  google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  email: !!(env.RESEND_API_KEY && env.AUTH_EMAIL_FROM) || logLinks(),
});
const logLinks = () => !prod || env.AUTH_LOG_LINKS === "1";

async function sendMagicLink({ email, url }: { email: string; url: string }) {
  if (env.RESEND_API_KEY && env.AUTH_EMAIL_FROM) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.AUTH_EMAIL_FROM,
        to: email,
        subject: "Sign in to Uiverse · تسجيل الدخول إلى Uiverse",
        text: `Sign in to Uiverse:\n${url}\n\nThis link works once and expires in 5 minutes. If you didn't ask for it, ignore this email.\n\n—\n\nللدخول إلى Uiverse:\n${url}\n\nيعمل هذا الرابط مرة واحدة وتنتهي صلاحيته خلال 5 دقائق. إن لم تطلبه فتجاهل هذه الرسالة.`,
      }),
    });
    if (!res.ok) throw new Error(`sign-in email failed (${res.status})`);
    return;
  }
  if (!logLinks()) throw new Error("no email provider configured");
  console.log(`\n[auth] sign-in link for ${email}:\n${url}\n`);
}

function create(db: Db) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    baseURL: env.BETTER_AUTH_URL ?? SITE_URL,
    /* a fixed secret is fine for local data; production refuses to start accounts without its own */
    secret: env.BETTER_AUTH_SECRET ?? "uiverse-local-development-secret-not-for-production",
    socialProviders: {
      ...(providers().google ? { google: { clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! } } : {}),
      ...(providers().github ? { github: { clientId: env.GITHUB_CLIENT_ID!, clientSecret: env.GITHUB_CLIENT_SECRET! } } : {}),
    },
    /*
     * Deleting an account removes the user row; sessions, linked logins, collections and saves go
     * with it (foreign keys, on delete cascade). With no password to re-enter, Better Auth instead
     * requires a session younger than freshAge — an hour, so a stale or stolen session can't do it.
     */
    user: {
      deleteUser: {
        enabled: true,
        /* an unused sign-in link would otherwise sign the deleted address straight back up */
        afterDelete: (u) => deleteMagicLinks(db, u.email),
      },
    },
    session: { freshAge: 60 * 60 },
    /* nextCookies last: it lets server actions set the session cookie */
    plugins: [magicLink({ sendMagicLink }), nextCookies()],
  });
}

export type Auth = ReturnType<typeof create>;

const g = globalThis as unknown as { __uivAuth?: Promise<Auth | null> };

/** The auth instance, or null when accounts are off (no database, or no secret in production). */
export function getAuth(): Promise<Auth | null> {
  return (g.__uivAuth ??= (async () => {
    if (prod && !env.BETTER_AUTH_SECRET) {
      console.error("[auth] BETTER_AUTH_SECRET is not set — accounts are off");
      return null;
    }
    const db = await getDb();
    return db ? create(db) : null;
  })());
}

/** The signed-in user for this request, or null. */
export async function currentUser() {
  const auth = await getAuth();
  if (!auth) return null;
  const s = await auth.api.getSession({ headers: await headers() });
  return s?.user ?? null;
}
