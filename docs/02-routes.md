# 02 — Route Structure

Assumes Next.js App Router. The patterns (route groups, intercepting routes, parallel slots) are the reason for choosing it; if the framework changes, §4 must be re-solved.

## 1. Namespace rules

The root namespace is scarce. Rules, decided once:

- **Root-level slugs are reserved for taxonomy only** (`/web`, `/apps`, `/components`, `/layouts`, `/palettes`, `/3d`, `/explore`, `/search`, `/creators`, `/pricing`, …).
- **Profiles live under `/u/[handle]`.** Do not put usernames at the root — it permanently blocks every future taxonomy word and creates an impersonation surface.
- Vanity `/@handle` URLs are served by a `next.config` rewrite `/@:handle → /u/:handle`. **Do not create an `app/@handle` folder** — a leading `@` in the App Router declares a parallel-route slot, not a literal segment.
- Content detail slugs are **singular and namespaced**: `/screen/…`, `/component/…`, `/source/…`. Singular reads better in a URL and keeps the plural free for the feed.
- Every content slug is `[id-prefix]-[title-slug]` (e.g. `/screen/k3f9-revolut-analytics`) so titles can change without breaking links, and 301 is never needed.
- Reserved handles: all root taxonomy words, `admin`, `api`, `settings`, `dashboard`, `www`, `help`, `support`, `about`, `login`, `signup`, plus a profanity list.

## 2. Route table

| Route | Rendering | Cache | Auth | Notes |
|---|---|---|---|---|
| `/` | RSC shell + client feed | Shell static, feed per-user | Optional | Logged-out = Trending; logged-in = For You |
| `/explore` | Static | ISR 1h | – | Directory of visual category cards |
| `/explore/[dimension]` | Static | ISR 1h | – | `type`,`components`,`industries`,`styles`,`tech`,`colors` |
| `/web`, `/apps`, `/components`, `/layouts`, `/palettes`, `/3d` | RSC + client feed | ISR 10m for first page | – | Feed engine with preset filter |
| `/web/[facet]`, `/apps/[facet]`, `/components/[category]` | RSC | ISR 1h, SSG top ~200 | – | **Primary SEO surface.** Generated from taxonomy. |
| `/search` | Client-driven | No cache | – | `?q=&kind=&industry=&style=&color=&tech=&sort=` |
| `/screen/[slug]` | RSC | ISR 1h | – | Also renders inside an overlay |
| `/component/[slug]` | RSC | ISR 1h | – | |
| `/source/[slug]` | RSC | ISR 1h | – | Tabs are `?tab=` not sub-routes (keeps overlay simple) |
| `/source/[slug]/flow/[flowSlug]` | RSC | ISR 1h | – | Full-screen flow viewer |
| `/layouts/[slug]` | RSC | ISR 1h | – | |
| `/palettes/[slug]` | RSC | ISR 1d | – | |
| `/tag/[slug]`, `/color/[hex]` | RSC | ISR 6h | – | SEO long tail; `[hex]` validated 6-char |
| `/u/[handle]` | RSC | ISR 5m | – | `?tab=uploads|collections|layouts|palettes|about` |
| `/u/[handle]/[collectionSlug]` | RSC | Private → dynamic | Conditional | 404 if private and not a member |
| `/creators` | RSC | ISR 1h | – | |
| `/pricing`, `/about`, `/legal/*` | Static | – | – | |
| `/saved` | Dynamic | No cache | Required | |
| `/dashboard/*` | Dynamic | No cache | Required | |
| `/upload` | Dynamic | – | Required | Usually an overlay; this is the deep-link fallback |
| `/layouts/new`, `/layouts/[slug]/edit` | Client-heavy | – | Required | Builder canvas |
| `/settings/*` | Dynamic | – | Required | |
| `/w/[workspace]/**` | Dynamic | – | Member | 404 (not 403) for non-members |
| `/login`, `/signup`, `/onboarding` | Static/dynamic | – | Anon | |
| `/admin/**` | Dynamic | – | Role `admin`/`moderator` | `noindex`, separate layout, no app chrome |

## 3. Directory layout

```
app/
├── (marketing)/                     no app chrome, own footer
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   └── legal/[doc]/page.tsx
│
├── (app)/                           navbar + filter bar + bottom nav
│   ├── layout.tsx
│   ├── @modal/
│   │   ├── default.tsx
│   │   ├── (.)screen/[slug]/page.tsx        ← intercepted overlay
│   │   ├── (.)component/[slug]/page.tsx
│   │   └── (.)upload/page.tsx
│   ├── page.tsx                             /
│   ├── explore/…
│   ├── web/[[...facet]]/page.tsx
│   ├── apps/[[...facet]]/page.tsx
│   ├── components/[[...category]]/page.tsx
│   ├── layouts/{page,[slug],new}/…
│   ├── palettes/…  3d/…  creators/…
│   ├── search/page.tsx
│   ├── screen/[slug]/page.tsx               ← full page (deep link / refresh)
│   ├── component/[slug]/page.tsx
│   ├── source/[slug]/…
│   ├── tag/[slug]/page.tsx  color/[hex]/page.tsx
│   └── u/[handle]/{page.tsx,[collectionSlug]/page.tsx}
│
├── (workspace)/                     condensed chrome, no infinite feed
│   ├── saved/  dashboard/  settings/  w/[workspace]/
│
├── (auth)/                          centred card layout, no chrome
│   ├── login/ signup/ onboarding/ forgot-password/
│
├── admin/                           own shell entirely
└── api/                             route handlers (see 11-tech-architecture)
```

`[[...facet]]` optional catch-all means `/web` and `/web/saas/dark` are the same component with a parsed filter. One page file, unlimited SEO facet URLs.

## 4. The overlay pattern (most important routing decision)

Clicking a card in the feed **must not unmount the feed**. Scroll position, loaded pages and momentum are the product.

- Intercepting route `@modal/(.)screen/[slug]` renders the detail inside a sheet over the feed.
- The URL changes to `/screen/[slug]`, so it is shareable, back-button-correct and SEO-indexable.
- A cold hit on `/screen/[slug]` renders the standalone full page (same component, different frame).
- `Esc` / backdrop click → `router.back()` → feed restored, untouched.
- `J`/`K` (or ←/→) inside the overlay steps through the feed's items without closing it.

The same applies to `/upload` and to opening a collection item.

**Constraint this places on the detail component:** it must be layout-agnostic — no `100vh` assumptions, no page-level scroll listeners, no fixed elements positioned against the viewport.

## 5. URL as application state

All feed state is in the URL; nothing meaningful lives only in React state:

```
/web?industry=fintech&style=dark&color=%23111827&tech=react&sort=trending&cols=5
/search?q=dark+fintech+dashboard&kind=screen&code=true
```

Consequences: shareable filtered views, working back button, server-rendered first page, and analytics that can read intent straight off the path. Filter changes use `history.replaceState` (no history spam); navigation changes use `push`.

## 6. API surface

REST route handlers under `/api` for anything a client component calls; server actions for mutations inside forms.

```
GET  /api/feed?cursor=&kind=&filters…      cursor-paginated items
GET  /api/search?q=&…                       parsed query + results + facet counts
GET  /api/suggest?q=                        typeahead
POST /api/saves            { itemId, collectionId? }     idempotent
DEL  /api/saves/:itemId
GET  /api/collections      POST /api/collections
PATCH /api/collections/:id/items            reorder / move section
POST /api/uploads/sign                      direct-to-storage presign
POST /api/uploads                           create draft item
POST /api/ai/parse-query   /api/ai/prompt   /api/ai/analyze
GET  /api/items/:id/similar
POST /api/reports
```

Cursor pagination only (`(rank, id)` keyset). Offset pagination duplicates and drops cards in an infinite masonry feed as items are inserted — it is not an option here.
