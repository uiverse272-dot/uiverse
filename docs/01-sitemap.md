# 01 — Sitemap & Page Hierarchy

## 1. The four surfaces

The brief lists 22 "main areas". They are not 22 products. They are **four surfaces**, and recognising this is what keeps the build from becoming 22 bespoke pages.

| Surface | What it is | Pages that are instances of it |
|---|---|---|
| **A. Feed** | Filtered, sorted, infinite grid of items + facet bar | Home, Explore results, Web, Apps, Components, Layouts, Palettes, 3D, Search, Tag pages, Collection contents, Creator tabs |
| **B. Detail** | Hero media + sticky meta rail + tabbed body + related rails | Screen, Component, Layout, Palette, Collection, Source, Creator |
| **C. Workspace** | Private, authenticated, task-oriented | Dashboard, Saved, Collection editor, Layout builder, Upload, Team workspace, Settings |
| **D. System** | Everything else | Auth, Pricing, Legal, Admin, Errors |

**One Feed engine** (query → facets → masonry → cursor pagination) and **one Detail shell** cover ~80% of the public site. Each page is a *configuration*: a preset filter, a card renderer, a set of body tabs.

---

## 2. Sitemap

```
PUBLIC
│
├── / ........................................ Home / Discover  [Feed]
│     For You · Trending · Following · Recent
│
├── /explore ................................. Explore hub  [Directory, not a feed]
│     ├── /explore/type
│     ├── /explore/components
│     ├── /explore/industries
│     ├── /explore/styles
│     ├── /explore/tech
│     └── /explore/colors
│
├── /web ..................................... Websites  [Feed]
│     └── /web/[facet] ........................ /web/saas, /web/landing-page …
│
├── /apps .................................... Mobile & app UI  [Feed]
│     └── /apps/[facet] ....................... /apps/ios, /apps/fintech …
│
├── /components .............................. Components  [Feed]
│     └── /components/[category] .............. /components/hero, /components/pricing …
│
├── /layouts ................................. Layout gallery  [Feed]
│     └── /layouts/[slug] ..................... Layout detail  [Detail]
│
├── /palettes ................................ Palettes  [Feed]        (More menu)
│     └── /palettes/[slug] .................... Palette detail  [Detail]
│
├── /3d ...................................... 3D & motion  [Feed]     (More menu)
│
├── /creators ................................ Creator index  [Feed]   (More menu)
│
├── /search?q= ............................... Search results  [Feed]
│
├── /screen/[slug] ........................... Individual design page  [Detail]
│     tabs: Overview · Breakdown · Responsive · Code · Similar
│
├── /component/[slug] ........................ Component page  [Detail]
│     tabs: Preview · Code · Design details · In the wild · Similar
│
├── /source/[slug] ........................... The product/site itself  [Detail + Feed]
│     tabs: Screens · Flows · Components · Palette · About
│     └── /source/[slug]/flow/[flowSlug] ...... Flow viewer
│
├── /u/[handle] .............................. Profile (user & creator are one)  [Detail + Feed]
│     tabs: Uploads · Collections · Layouts · Palettes · About
│     ├── /u/[handle]/collections
│     └── /u/[handle]/[collectionSlug] ........ Collection page  [Detail + Feed]
│           └── ?section=hero ................. Section within a collection
│
├── /tag/[slug] .............................. Tag landing  [Feed] (SEO)
├── /color/[hex] ............................. Color landing  [Feed] (SEO)
│
├── /pricing
├── /about  /changelog  /submit-a-site
└── /legal/{terms,privacy,attribution,takedown}

AUTHENTICATED (workspace)
│
├── /saved ................................... Everything you saved  [Feed]
│     └── redirects to /u/[me]/collections for board view
├── /dashboard ............................... Overview
│     ├── /dashboard/uploads  ├── /dashboard/drafts
│     ├── /dashboard/layouts  ├── /dashboard/palettes
│     ├── /dashboard/following
│     └── /dashboard/analytics ............... (creators only)
├── /upload .................................. Submit flow (modal-first)
├── /layouts/new ............................. Layout builder
├── /layouts/[slug]/edit ..................... Layout builder
├── /settings
│     ├── /settings/profile   /settings/account
│     ├── /settings/notifications
│     ├── /settings/billing   /settings/teams
│     └── /settings/danger
└── /w/[workspace] ........................... Team workspace home
      ├── /w/[workspace]/p/[project] ......... Project
      │     tabs: Inspiration · Layout · Components · Palette · Notes
      ├── /w/[workspace]/library ............. Team library
      ├── /w/[workspace]/members
      └── /w/[workspace]/settings

AUTH
├── /login  /signup  /forgot-password  /reset-password
├── /verify-email  /onboarding
└── /auth/callback/[provider]

ADMIN  (role-gated, noindex)
└── /admin
      ├── /admin/queue ....................... Moderation queue (the default view)
      ├── /admin/content ..................... One manager for ALL item kinds
      ├── /admin/sources ..................... Ingested products/sites
      ├── /admin/taxonomy ..................... Categories, tags, industries, styles, tech
      ├── /admin/users  /admin/reports
      ├── /admin/featured ..................... Featured + trending curation
      ├── /admin/billing  /admin/analytics
      └── /admin/jobs ......................... Ingest/screenshot/embedding job health
```

---

## 3. Page hierarchy (depth discipline)

Rule: **nothing valuable sits more than 3 clicks from Home.**

```
L0   /                      Home
L1   /web /apps /components /explore /search /saved
L2   /web/saas   /components/hero   /u/linear   /u/me/dark-ui
L3   /screen/... /component/... /layouts/...   (usually opened as an overlay from L0–L2)
```

Detail pages are L3 by URL but **L1 by interaction**, because they open as an overlay on top of the feed (see `02-routes.md` §4). The user never leaves the feed to inspect something. This is the single most important interaction decision in the product.

---

## 4. Pages deliberately NOT built (and why)

| Requested | Decision | Reason |
|---|---|---|
| Separate "Collections" top-level browse page | Folded into `/explore` + profile tabs | A global index of other people's boards has near-zero value until there are boards. Revisit at ~10k users. |
| "Layout Builder" as its own area | It is `/layouts/new` + `/layouts/[slug]/edit` | Gallery and editor are one feature, not two areas. |
| Commissions / "Request a Design" | Deferred out of MVP entirely | Different business (two-sided marketplace with money). Needs creator supply that won't exist for 12 months. See `09-roadmap.md` §4. |
| "Templates" tab on creator profile | Dropped | Directly contradicts "not a template marketplace first". |
| Notifications centre | Deferred to Phase 2 | With no follow graph and no comments, it has nothing to show. |
| Separate admin managers per content type | One `/admin/content` with a kind filter | Same table, same actions. |
| Public comments | Deferred; replaced by private notes in collections | Are.na's model. Comments invite moderation cost with little discovery value. |
