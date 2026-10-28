# Uiverse (working name — see docs/00 §6)

A visual index of how real interfaces are actually built. Browse it like Pinterest, use it like a reference manual, leave with something you can implement.

**Status: working prototype of the discovery half** — see [What's actually built](#whats-actually-built).
The architecture lives in `docs/`; read it before building anything new.

| Doc | Answers |
|---|---|
| [00 — Product definition](docs/00-product-definition.md) | Positioning, the structural idea, design principles, risks |
| [01 — Sitemap](docs/01-sitemap.md) | Complete sitemap + page hierarchy + what's not built |
| [02 — Routes](docs/02-routes.md) | URL grammar, route table, the overlay pattern, API surface |
| [03 — Page specs](docs/03-page-specs.md) | What appears on every page |
| [04 — Navigation](docs/04-navigation.md) | Desktop navbar, mobile bottom nav, keyboard map |
| [05 — Component library](docs/05-component-library.md) | Design tokens + the reusable component set |
| [06 — Data model](docs/06-data-model.md) | Entities, fields, relationships |
| [07 — Search & AI](docs/07-search-and-ai.md) | Query pipeline, ranking, AI features, code-licensing boundary |
| [08 — Content pipeline](docs/08-content-pipeline.md) | Where the content comes from |
| [09 — Roadmap](docs/09-roadmap.md) | MVP vs Phase 2/3, and the cut list |
| [10 — Review of the brief](docs/10-ux-critique.md) | Duplications, gaps, flow improvements |
| [11 — Tech architecture](docs/11-tech-architecture.md) | Stack, performance budget, build order |
| [12 — MCP server](docs/12-mcp.md) | The agent-facing API over the real captures |
| [13 — Launch](docs/13-launch.md) | Production setup: Supabase, Resend, Vercel, and how to check it |


## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # vitest: search parser, prompt generator, MCP spec, i18n
npm run build && npm run e2e   # browser suites on the build: pages, headers, sign-in, saves, deletion
```

CI (`.github/workflows/ci.yml`) runs types, lint, tests, the build and the browser suites on every push and pull request.

To capture a live page into the index (needs `npx playwright install chromium` once):

```bash
npm run capture -- https://example.com/pricing --industry saas
npm run capture -- --batch seeds/rtl-gulf.json --concurrency 3
npm run capture -- --rederive     # re-derive every record from stored measurements
npm run capture:cards             # feed-card stills (runs after each capture; --all rewrites them)
npm run capture:upload            # sync public/captures to the bucket (--dry-run, --prune)
npm run capture -- --opt-out example.com --ref TD-…   # honour a takedown request
```

Screenshots are served from `public/captures` until `NEXT_PUBLIC_CAPTURES_URL` points at an
S3-compatible bucket (R2, S3, B2, MinIO) — then the app and the MCP server read them from there.
Copy `.env.example` to `.env.local` for the variables.

## What's actually built

A working prototype of the **discovery half** — the Feed engine, the Detail shell and the Breakdown
tab, which are the three things the architecture stands or falls on — plus a first cut of the
capture pipeline and an MCP server over what it captured.

| Route | State |
|---|---|
| `/` | Home feed, chip rail, mixed kinds, infinite scroll |
| `/explore` | Taxonomy directory with live counts |
| `/web`, `/apps`, `/components` | Feed engine + facet routes (`/web/saas/dark`) and URL-state filters |
| `/screen/[slug]`, `/component/[slug]` | Detail shell: Overview · **Breakdown** · Responsive · Code · Similar |
| `/source/[slug]` | One product's whole system: screens, components, inferred palette |
| `/search` | Dictionary-first NL parsing with the interpretation shown as removable chips |
| Prompt generator | On any screen, component, layout or palette: 7 target tools x 5 stacks, built from the Breakdown data |
| `/sketch` | Draw a page as boxes; each becomes a section (type guessed from position, editable), then the same prompt generator (`lib/sketch.ts`) |
| `/similar` | Visual search: drop or paste a screenshot, its colours and device are read in the browser and matched against every screen (`lib/look.ts`) |
| `/saved` | One-click saves; boards, one per project, as cover tiles; an `Add to board` toast |
| `/saved/[board]` | One board (or `all` / `unsorted`): rename, describe, delete; a note on each design; remove from board |
| `/layouts`, `/palettes`, `/3d` | Derived-content sections |
| `/upload`, `/pricing`, `/legal/attribution` | Flow and policy surfaces |
| `/legal/takedown` | Opt-out form → webhook / email with a reference; `--opt-out` removes the domain everywhere and blocks recapture (`src/content/optout.json`) |
| Guide | First-visit coach: pick a goal, industry and RTL, land on a feed with results, then walk open → Breakdown → Prompt → save |
| `POST /api/mcp` | Stateless MCP server over the real captures — search, spec, screenshot, prompt, facets ([docs/12](docs/12-mcp.md)) |
| `/ar/…` | The whole interface in Arabic, right-to-left — see [Languages](#languages) |
| SEO | `sitemap.xml` and `robots.txt` over the real captures, share cards per screen and component (`lib/og.tsx`); procedural items are `noindex` |
| `/dev-measure` | Dev tool, `next dev` only — re-derives archetype and section heights (see the file header) |

Stubbed on purpose: billing, teams and the layout builder. Visual search is colour-and-device only, no image embeddings. Those are Phase 2–3
in [09-roadmap.md](docs/09-roadmap.md).

### Real captures

`npm run capture` (`scripts/capture/`, Playwright + sharp) renders a live page at 1440 / 834 / 390px,
measures it — colour roles, type scale, fonts, spacing, radius, container, block bounds, responsive
rules — writes the screenshots to `public/captures/<slug>/` and upserts the record into
`src/content/captures.json`. `lib/captures.ts` turns each record into a catalogue item, so a capture
shows up in the feed, detail view and Breakdown with its measured values; components are crops of the
page from the measured block bounds. 26 captures so far, 22 of them Arabic / RTL
(`seeds/rtl-gulf.json`). Raw measurements go to `.captures-raw/` (ignored) so `--rederive` can
re-run the derivation without re-crawling.

### The prompt generator

The **Prompt** button on any detail page produces a structured implementation spec — section order
with a note on how each block actually looks, colour tokens in the syntax of the chosen stack, the
type scale, the spacing and responsive rules, and accessibility requirements. It is templated, not
model-generated: there is no API call, and the same input always gives the same output.

It works because the capture was decomposed first. `lib/spec.ts` is the single derivation of a
screen's design facts; the Breakdown tab and the prompt generator both read from it, so the prompt
can never drift from what the Breakdown shows. A competitor without that decomposition can only hand
a model an image.

Free plan is metered at 3 prompts a month — the one place in the app where output is gated. Browsing,
saving and the Breakdown have no counter near them. A credit buys a prompt, not a copy: re-copying or
editing a prompt you already generated is free (`components/prompt/quota.ts`).

## Languages

English keeps its unprefixed URLs (`/web/fintech`); Arabic lives under `/ar` (`/ar/web/fintech`), right-to-left.

- **Routing.** Every route sits under `app/[lang]`. `src/proxy.ts` rewrites an unprefixed URL to `/en/…`
  invisibly, and sends someone who picked Arabic (the `uiv.lang` cookie the language switch sets) to
  the `/ar` version of an unprefixed link. Crawlers carry no cookie, so they get the URL they asked for.
  Server components read the language with `getI18n()` (`next/root-params`); client components with
  `useI18n()`. Use `Link`, `useLocalRouter` and `useLocalPath` from `@/i18n/client`, never
  `next/link` / `useRouter` / `usePathname` directly — they keep you in your language, and the last one
  strips the locale so prerendered pages hydrate the same on server and client.
- **Strings.** `src/i18n/dict/en.ts` is the shape; `ar.ts` must match it key for key, so an untranslated
  string fails the build. Counts go through `plural()` (all six Arabic forms); digits stay Latin.
  Taxonomy names sit beside each term (`ar:` in `lib/taxonomy.ts`); screen titles, block labels and the
  Breakdown's design facts are in `src/i18n/content.ts`, falling back to English when missing.
- **Direction.** Layout uses logical utilities (`ms-`, `pe-`, `start-`, `border-e`, `text-start`) so it
  mirrors. Previews and captures stay left-to-right — they're pictures of designs. Reflow rules render
  through `<Flow>`, which isolates each step so "48px → 36px" reads in order inside Arabic text.
- **Search** understands Arabic on either language's pages: normalized spelling (hamza forms, ة, ى,
  diacritics, a leading «ال»), Arabic taxonomy names and synonyms («لوحة تحكم داكنة» → Dashboard + Dark).
- **What stays English:** generated prompts (coding tools follow English best — the dialog says so),
  invented brands' descriptions, and share-card text (the card font has no Arabic glyphs yet).
- The Arabic is machine-drafted Modern Standard Arabic. **Have a native speaker review `ar.ts` and
  `content.ts` before launch.**

## Accounts

Sign in with an email link, or Google / GitHub once their keys are set (`/sign-in`). Better Auth
keeps users, sessions and saves in our own Postgres through Drizzle (`src/lib/db`, migrations in
`drizzle/`); production uses Supabase as plain Postgres via `DATABASE_URL`.

- **Locally there's nothing to set up.** Without `DATABASE_URL`, an embedded Postgres (PGlite) in
  `.data.nosync/pglite` is created and migrated on first use, and sign-in links print to the server log.
- **Saves.** A guest's saves stay in the browser. Signing in merges them into the account once
  (`importSaves`), then the account is the source of truth: changes apply instantly and go to the
  server as idempotent "saved / not saved" writes (`components/save/actions.ts`), and a refused one
  re-syncs. A per-user copy paints the next visit; signing out removes every account copy.
- **Boards.** A save is a design kept; a pin puts it on a board, and one design can be on many
  boards (`pin` table). A design on no board is "unsorted". Deleting a board keeps its designs
  saved; unsaving a design takes it off every board. Each saved design can carry one note.
- **Production setup:** step by step in [docs/13](docs/13-launch.md). `npm run check:env` checks a
  settings file, the server logs any missing setting on start (`src/instrumentation.ts`), and
  `/api/health` reports configuration, database and migrations. Missing the database or the secret
  turns accounts off rather than guessing. See `.env.example`.
- **Deleting an account** (`/u/me`) takes a typed confirmation and a sign-in from the last hour
  (`session.freshAge`); older sessions are sent to sign in again. The user row goes, and with it
  sessions, linked logins, collections and saves (foreign keys cascade) plus any unused sign-in
  links for the address (`lib/db/magicLinks.ts`), so a link still in an inbox can't recreate it.
- Every database connection runs in UTC: the timestamp columns carry no zone.
- `npm run db:generate` after changing `src/lib/db/schema.ts`.

## Notes on the prototype

- **Two kinds of content.** Real captures are screenshots of live pages, under the attribution policy
  (`docs/08` §4). Everything else is **procedurally rendered** from a palette and an archetype in
  `cqw` units against a container query — no image files, no external requests — and every brand in
  it is invented (Ledgerly, Northwind, Cormorant and the rest do not exist). The MCP server only ever
  serves the real captures, so an agent never treats a procedural preview as evidence.
- **Aspect ratios come from the data**, never from measuring the DOM. That is what makes the masonry
  lay out with zero shift, and why `/dev-measure` exists. The server can't see the viewport, so pages
  guess the column count from the user agent (`feed/ssrColumns.ts`) — phones render 2 columns from the
  first byte instead of reflowing from 5.
- **Cropped previews draw only what shows.** Scrolling page types carry measured per-section heights
  (`SCROLLING` in `mock/MockScreen.tsx`), so a thumbnail skips sections below its crop. Re-measure on
  `/dev-measure` after changing a section's height.
- **Saves persist in `localStorage`** via an external store read with `useSyncExternalStore`, so the
  server snapshot is empty and there is no hydration mismatch. Stored data is validated on read and
  synced across tabs through the `storage` event.
- Procedural values use an integer hash, not `Math.sin` — trig is not bit-identical between the Node
  server and the browser, which silently breaks hydration.

## The five decisions everything else follows from

1. **Content is decomposed, not just displayed.** Source → Capture → Screen → Block. Components are crops of real screens; layouts and palettes are derived from them. One ingest produces all four content types.
2. **Four surfaces, not 22 pages.** One Feed engine, one Detail shell, a workspace set and a system set.
3. **The Breakdown tab is the product.** "Understand" is where a Pinterest clone becomes a developer tool — and it is MVP, not polish.
4. **Detail opens over the feed.** Intercepting routes; the feed never unmounts; the URL is still real.
5. **Gate depth, never discovery.** Free users browse and save forever; Pro pays for output.
