/**
 * What production needs from the environment, checked in one place: `npm run check:env` prints it,
 * the server logs it on start (instrumentation.ts), and /api/health reports it. Names only — a
 * value is never echoed, so the report is safe to show.
 *
 *   required  without it a part of the site is off in production (accounts, sign-in, takedowns)
 *   advised   works without it, but not as intended (a guessed origin, screenshots from the deploy)
 */
export type Check = {
  id: string;
  label: string;
  level: "required" | "advised";
  ok: boolean;
  /** what to do about it, when not ok */
  fix?: string;
};

type Env = Record<string, string | undefined>;

const set = (env: Env, k: string) => !!env[k]?.trim();
const both = (env: Env, a: string, b: string) => set(env, a) && set(env, b);
const half = (env: Env, a: string, b: string) => set(env, a) !== set(env, b);
const email = /^(?:[^<>]+<)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;

/** Supabase's transaction pooler listens on 6543; the app opens many short connections, so it wants that one */
function pooled(url: string) {
  try {
    const u = new URL(url);
    /* direct: db.<ref>.supabase.co:5432; pooler: <region>.pooler.supabase.com:6543 (5432 there is session mode) */
    return !/\.supabase\.(co|com)$/.test(u.hostname) || u.port === "6543";
  } catch {
    return false;
  }
}

export function checkConfig(env: Env = process.env): Check[] {
  const db = env.DATABASE_URL?.trim() ?? "";
  const secret = env.BETTER_AUTH_SECRET?.trim() ?? "";
  const resend = set(env, "RESEND_API_KEY");
  const authFrom = env.AUTH_EMAIL_FROM?.trim() ?? "";
  const emailSignIn = resend && !!authFrom;
  const google = both(env, "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");
  const github = both(env, "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET");
  const origin = env.NEXT_PUBLIC_SITE_URL?.trim() || env.BETTER_AUTH_URL?.trim() || "";
  const takedownMail = resend && both(env, "TAKEDOWN_EMAIL_TO", "TAKEDOWN_EMAIL_FROM");

  return [
    {
      id: "database",
      label: "Database (DATABASE_URL)",
      level: "required",
      ok: /^postgres(ql)?:\/\//.test(db),
      fix: db
        ? "DATABASE_URL must be a postgres:// connection string"
        : "Set DATABASE_URL to the Supabase transaction-pooler connection string — without it accounts and saved boards are off",
    },
    {
      id: "database-pooler",
      label: "Database uses the transaction pooler",
      level: "advised",
      ok: !db || pooled(db),
      fix: "On Vercel use Supabase's transaction pooler (port 6543) for DATABASE_URL; keep the direct or session URL for `npm run db:migrate`",
    },
    {
      id: "auth-secret",
      label: "Auth secret (BETTER_AUTH_SECRET)",
      level: "required",
      ok: secret.length >= 32,
      fix: secret
        ? "BETTER_AUTH_SECRET is too short — make one with `openssl rand -base64 32`"
        : "Set BETTER_AUTH_SECRET (`openssl rand -base64 32`) — without it accounts are off",
    },
    {
      id: "sign-in",
      label: "A way to sign in (email, Google or GitHub)",
      level: "required",
      ok: emailSignIn || google || github,
      fix: "Set RESEND_API_KEY and AUTH_EMAIL_FROM for email links, or a Google / GitHub client ID and secret — with none, nobody can sign in",
    },
    {
      id: "auth-email-from",
      label: "Sign-in sender address (AUTH_EMAIL_FROM)",
      level: "required",
      ok: !authFrom || email.test(authFrom),
      fix: 'AUTH_EMAIL_FROM must be an address on your verified Resend domain, e.g. "Uiverse <hello@uiverse.tech>"',
    },
    {
      id: "oauth-pairs",
      label: "OAuth keys come in pairs",
      level: "required",
      ok: !half(env, "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET") && !half(env, "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"),
      fix: "A client ID without its secret (or the reverse) leaves that button off — set both or neither",
    },
    {
      id: "takedown",
      label: "Takedown inbox (webhook or email)",
      level: "required",
      ok: set(env, "TAKEDOWN_WEBHOOK_URL") || takedownMail,
      fix: "Set TAKEDOWN_WEBHOOK_URL, or RESEND_API_KEY with TAKEDOWN_EMAIL_TO and TAKEDOWN_EMAIL_FROM — without one the takedown form refuses requests",
    },
    {
      id: "site-url",
      label: "Site address (NEXT_PUBLIC_SITE_URL)",
      level: "advised",
      ok: /^https:\/\/[^/]+$/.test(origin.replace(/\/+$/, "")) || (!origin && set(env, "VERCEL_PROJECT_PRODUCTION_URL")),
      fix: origin
        ? "NEXT_PUBLIC_SITE_URL should be the https:// origin with no path, e.g. https://uiverse.tech"
        : "Set NEXT_PUBLIC_SITE_URL to the public https:// address — sign-in links, share cards and the sitemap use it",
    },
    {
      id: "captures-url",
      label: "Screenshots from a bucket (NEXT_PUBLIC_CAPTURES_URL)",
      level: "advised",
      ok: set(env, "NEXT_PUBLIC_CAPTURES_URL"),
      fix: "Optional for now: screenshots are served from the deploy. Point this at the R2 bucket once there are many more",
    },
  ];
}

/** The required checks that fail — what stops part of the site working in production. */
export const missing = (checks: Check[]) => checks.filter((c) => c.level === "required" && !c.ok);
