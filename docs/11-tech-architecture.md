# 11 — Development Architecture

Proposed after the product structure, as required. Optimised for a small team shipping a content-heavy, image-heavy, SEO-dependent product.

## 1. Stack

| Layer | Choice | Why this one |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Intercepting routes make the overlay pattern possible; RSC keeps the feed's first page server-rendered for SEO; ISR fits a mostly-read catalog |
| Styling | **Tailwind + CSS variables** for tokens | Tokens in CSS vars so themes switch without a re-render |
| Primitives | **Radix UI**, styled in-house | Accessibility for popovers/dialogs/menus without adopting someone's visual language |
| DnD | **dnd-kit** | One drag system for collections and the layout builder |
| Data (client) | **TanStack Query** | Infinite queries, cache restoration on back-nav |
| DB | **Postgres 16 + pgvector** (Neon or Supabase) | Relational taxonomy + vector search in one place; no second datastore until it's needed |
| ORM | **Drizzle** | SQL-shaped; feed queries need real control over indexes and keyset pagination |
| Cache/queue state | **Redis** (Upstash) | Feed pages, facet counts, rate limits, session-adjacent data |
| Object storage | **Cloudflare R2** | No egress fees — decisive for an image-heavy product |
| Images | **Cloudflare Images / imgproxy** | On-demand AVIF/WebP derivatives, signed URLs |
| Jobs | **Inngest** (or Trigger.dev) | Durable multi-step workflows with retries — exactly the shape of the capture pipeline |
| Capture | **Playwright + Chromium** on a container host (Fly.io / Railway) | Needs real browsers; not a serverless workload |
| Auth | **Auth.js** (or Clerk if speed matters more than control) | Email + Google + GitHub + Apple |
| Payments | **Stripe** (Phase 2) | Subscriptions, per-seat for Team |
| Search | **Postgres FTS + pgvector at MVP; Typesense when >100k items** | Don't run a second search cluster for 3k documents |
| Email | Resend | |
| Analytics | PostHog (product) + server-side page events | |
| Errors | Sentry | |
| Hosting | Vercel (app) + Fly.io (workers, capture) | |

**Deliberately avoided at MVP:** a separate search cluster, a CMS, a GraphQL layer, microservices, a monorepo with more than two packages, and any ML infrastructure beyond hosted embedding + vision API calls.

## 2. Repository shape

```
/
├── app/                      routes (see 02-routes.md §3)
├── components/
│   ├── ui/            primitives
│   ├── feed/          feed engine + cards
│   ├── detail/        detail shell
│   ├── breakdown/     the differentiating cluster
│   ├── save/          save + collections
│   ├── builder/       layout builder (Phase 3)
│   └── shell/         navbar, bottom nav, ⌘K
├── lib/
│   ├── db/            drizzle schema + migrations + queries
│   ├── feed/          query builder, ranking, cursors
│   ├── search/        parser, retrieval, fusion
│   ├── taxonomy/      terms, synonyms, URL grammar
│   ├── media/         upload, derivatives, blurhash
│   ├── auth/  billing/  analytics/
│   └── ai/            prompts, embeddings, tagging
├── workers/                  separate deploy
│   ├── capture/       playwright render
│   ├── extract/       colors, type, spacing, tech
│   ├── segment/       DOM + vision block detection
│   └── enrich/        embeddings, auto-tagging
├── packages/shared/          types shared between app and workers
└── docs/                     this folder
```

Two deploy targets, one repo. Workers are separated because they need real browsers, long timeouts and different scaling — not because of architectural purity.

## 3. Performance budget (enforced in CI)

| Metric | Budget |
|---|---|
| LCP (home, cold, mobile 4G) | < 1.8s |
| CLS | < 0.02 — **the masonry requirement** |
| INP | < 200ms |
| Feed API p95 | < 300ms |
| Search p95 | < 400ms |
| JS shipped on `/` | < 180KB gzipped |
| Images | AVIF with WebP fallback, srcset at 320/480/720/1080, lazy below fold, blurhash placeholder |

How CLS is actually achieved: `media.width`/`height` are mandatory at insert; `item.aspect_ratio` is denormalized; the masonry computes the entire layout from numbers **before any image request is made**. No measurement, no reflow, no exceptions.

## 4. Feed query pattern

```sql
SELECT i.* FROM item i
WHERE i.status = 'published' AND i.deleted_at IS NULL
  AND i.kind = $1
  AND EXISTS (SELECT 1 FROM item_taxonomy t
              WHERE t.item_id = i.id AND t.dimension='industry' AND t.term_id = $2)
  AND (i.rank_score, i.id) < ($cursor_score, $cursor_id)   -- keyset
ORDER BY i.rank_score DESC, i.id DESC
LIMIT 40;
```
Keyset pagination only. `rank_score` is materialized by a job (every 15 min), not computed per request. Facet counts come from a separate cached aggregate, refreshed hourly, never from a `COUNT(*)` on the hot path.

## 5. Caching layers

1. CDN — static assets, images, ISR pages
2. ISR — facet pages, detail pages, explore (see the route table)
3. Redis — feed page 1 per filter combination (60s), facet counts (1h), search parses (permanent), taxonomy (1h)
4. TanStack Query — client cache + scroll restoration snapshot per route+query
5. Postgres — materialized `rank_score`, rolled-up daily stats

## 6. Security & abuse

- Row-level authorization in the query layer, not in components. Private collections and workspace content return **404, not 403** (a 403 confirms the resource exists).
- Direct-to-R2 uploads via presigned URLs; MIME sniffing and dimension validation server-side; strip EXIF.
- Rate limits per IP and per user on: search, upload, save, AI actions, report.
- CSP with no `unsafe-inline`; user-provided URLs never rendered in an iframe without sandboxing.
- Admin actions are soft-delete + audited. Impersonation is logged and banner-visible.
- Crawler identifies itself, respects robots.txt and rate limits per domain.

## 7. Testing

| Level | Scope |
|---|---|
| Unit (Vitest) | Query parser, ranking, cursors, taxonomy resolution, color math |
| Integration | Feed queries against a seeded DB, save/collection mutations, auth boundaries |
| E2E (Playwright) | Browse → save → collection; search → filter → detail overlay → back; upload → moderate → publish |
| Visual regression | Card variants, masonry at 5 breakpoints, light + dark |
| Perf | Lighthouse CI on `/`, `/web`, `/screen/[slug]`, failing the build on budget breach |
| A11y | axe on every route archetype; full keyboard pass on feed + overlay |

## 8. Build order (dependency-correct)

```
1  Tokens, primitives, shell, theming
2  DB schema + migrations + seed script
3  Media pipeline (upload, derivatives, blurhash, dimensions)
4  ── fork ──────────────────────────────────────────────
   A. Capture worker → extraction → segmentation → admin queue
   B. Feed engine (masonry, cursor, URL filters) with seeded data
5  Auth + onboarding
6  Detail shell + overlay routing
7  Breakdown tab  ← do not defer this
8  Save + collections
9  Search (dictionary parse → FTS → facets)
10 Profiles + source pages
11 Upload flow
12 Embeddings + "more like this"
13 Responsive pass, a11y pass, perf pass
14 Legal, attribution, takedown, SEO (sitemaps, structured data)
```

Step 4 forks deliberately: the content pipeline and the feed are the two long poles and they are independent until seeded data exists. Building the feed first against fake data and the pipeline afterwards is the most common way this kind of product ships six months late with 400 items in it.

## 9. Open decisions to make before step 1

1. **Product name** (uiverse.io collision — `00` §6).
2. **Auth.js vs Clerk** — control vs ~2 weeks of saved effort.
3. **Supabase vs Neon + separate services** — Supabase bundles auth/storage/DB and would compress steps 2, 3 and 5; the cost is coupling.
4. **Initial source list** — which 300 products get captured first. This is a curation decision, and it defines the product's taste more than any design choice in this document.
5. **Whether flows are in Phase 1** — they are the strongest retention feature and the capture pipeline can produce them almost for free at ingest time, but they add real UI scope.
