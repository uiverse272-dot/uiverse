# 13 — Launch: production setup

Everything the code needs is built. What's left is creating three accounts and pasting their keys
into Vercel. About an hour, most of it waiting for DNS. The steps are in order: each one needs the
one before.

You need: the uiverse.tech domain (access to its DNS records), and accounts on Supabase, Resend and
Vercel (all have free tiers that cover launch).

## 1. Database — Supabase

1. Create a project at supabase.com. Pick the region closest to your users. Save the database
   password it shows you — you need it in the connection strings below.
2. Open **Connect** (top of the project page) and copy two connection strings:
   - **Transaction pooler** (port **6543**) — this is `DATABASE_URL` for Vercel. Serverless functions
     open many short connections, and the pooler is what absorbs them.
   - **Session pooler** or **Direct connection** (port **5432**) — for running migrations from your
     machine only. Never give this one to Vercel.

   Put your password in place of `[YOUR-PASSWORD]`. If the password has `@`, `#`, `/` or `:` in it,
   URL-encode those characters (or reset the password to letters and digits).
3. Create the tables, from this repo:

   ```bash
   DATABASE_URL="<the session or direct string>" npm run db:migrate
   ```

   It prints `migrations applied successfully`. Run it again after every deploy that adds a file to
   `drizzle/` — today there are three (accounts, boards, and a clean-up).

## 2. Email — Resend

Email carries the sign-in links and, if you choose, takedown requests.

1. At resend.com → **Domains** → add `uiverse.tech`.
2. Resend lists DNS records (a TXT for SPF, a TXT for DKIM, an MX for bounces). Add each one at the
   domain's DNS provider exactly as shown, then press **Verify** in Resend. It can take from minutes
   to a few hours.
3. **API Keys** → create one with **Sending access** for that domain. Copy it now; it's shown once.

Until the domain is verified, Resend refuses to send from it, and sign-in emails fail.

## 3. The auth secret

```bash
openssl rand -base64 32
```

One value, used only in Vercel. Changing it later signs everyone out.

## 4. Vercel

1. Import the GitHub repository as a new project (framework: Next.js, settings as detected).
2. **Settings → Environment Variables**, for the **Production** environment:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the transaction-pooler string from step 1 (port 6543) |
   | `BETTER_AUTH_SECRET` | the value from step 3 |
   | `RESEND_API_KEY` | the key from step 2 |
   | `AUTH_EMAIL_FROM` | `Uiverse <hello@uiverse.tech>` — any address on the verified domain |
   | `TAKEDOWN_EMAIL_TO` | `info@uiverse.tech` — where takedown requests should land |
   | `TAKEDOWN_EMAIL_FROM` | `Uiverse <takedown@uiverse.tech>` |
   | `NEXT_PUBLIC_SITE_URL` | `https://uiverse.tech` |

   `TAKEDOWN_WEBHOOK_URL` can replace the two takedown email settings (Slack, Zapier, your own
   endpoint), or go alongside them.
3. **Settings → Domains** → add `uiverse.tech` and follow its DNS instructions.
4. Deploy (or redeploy, if it built before the variables were set: `NEXT_PUBLIC_SITE_URL` is read
   at build time).

### Optional: Google and GitHub sign-in

Each provider needs an OAuth app with this callback URL, then both of its keys in Vercel:

- Google (console.cloud.google.com → APIs & Services → Credentials → OAuth client ID, type Web):
  `https://uiverse.tech/api/auth/callback/google` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- GitHub (github.com → Settings → Developer settings → OAuth Apps):
  `https://uiverse.tech/api/auth/callback/github` → `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

The buttons appear on /sign-in once both keys of a pair are set.

## 5. Check it

Before deploying — pull Vercel's settings and check them (names are checked, values never printed):

```bash
npx vercel env pull .env.production     # .env* files are git-ignored
npm run check:env -- .env.production
```

After deploying:

1. Open `https://uiverse.tech/api/health`. It should say `"status": "ready"` with
   `"migrations": { "applied": 3, "expected": 3 }`. Anything missing is listed with what to do. The
   page answers 503 until everything required is in place, so it also works as an uptime check.
2. If something's off, the deploy's **Logs** start with a `[config]` line naming each missing setting.
3. Then by hand: sign in with an email link, save a design, put it on a board, add a note, and open
   the site signed in on a second device — the board and note should be there.
4. Send a test takedown from `/legal/takedown` and check it arrives.

## What the code does without each setting

| Missing | Effect in production |
|---|---|
| `DATABASE_URL` | Accounts off: no sign-in, saves and boards stay in each browser |
| `BETTER_AUTH_SECRET` | Accounts off |
| Resend and both OAuth pairs | Nobody can sign in |
| A takedown inbox | The takedown form refuses requests, so none are lost |
| `NEXT_PUBLIC_SITE_URL` | The Vercel production domain is used for links and share cards |
| `NEXT_PUBLIC_CAPTURES_URL` | Screenshots are served from the deploy (fine for now; see README) |
