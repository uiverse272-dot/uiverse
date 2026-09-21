# 09 — Scope & Roadmap

## 1. What the MVP has to prove

> Does someone come back on day 3 without being reminded?

Everything that doesn't serve that question is Phase 2 or later. The brief's Phase 1 list is close to right; it is missing the content pipeline (which is the real blocker) and includes a few things that can't work yet.

## 2. Phase 1 — MVP (target 10–12 weeks)

**Foundation**
1. Design tokens, primitives, app shell, light/dark
2. Auth (email + Google + GitHub), onboarding with interest picker
3. Postgres schema (`06-data-model.md`), media pipeline with mandatory dimensions

**Content (in parallel from week 1 — not after the UI)**
4. Capture pipeline: crawl → render 3 viewports → dedupe → store
5. Extraction: colors, fonts, type scale, spacing, tech detection
6. DOM-based block segmentation + component classification
7. Admin moderation queue (keyboard-driven)
8. **Seed target: 3,000 screens / 300 sources / ~15,000 derived components before public launch**

**Product**
9. Feed engine: masonry, cursor pagination, URL-state filters, zero CLS
10. Home (Trending + For You), Web, Apps, Components, Explore
11. Search: dictionary parse + full-text + facets + parse chips
12. Screen detail with **Breakdown tab** (the differentiator — MVP, not later)
13. Component detail with "In the wild"
14. Overlay routing (intercepting routes) with feed state preservation
15. Save (one click, default board) + Collections + sections + drag reorder + notes
16. Profiles (user = creator), source pages
17. Upload by URL and by file, with AI-suggested metadata
18. "More like this" (uses the embeddings already computed for search)
19. Full responsive: desktop / tablet / mobile, bottom nav, sheets
20. Legal pages, attribution, takedown form

**Explicitly NOT in MVP:** payments, teams, layouts, palettes as a section, 3D as a section, follow, notifications, comments, likes, prompt generator, commissions.

Pricing page can exist as a "Pro coming soon — join the list" page. Do not build billing before there is a reason to upgrade.

## 3. Phase 2 (post-launch, ~weeks 13–24)

Ordered by value per unit of effort:

1. **AI auto-tagging in the admin queue** — unlocks 10× content throughput. Do this first.
2. **Prompt generator** — the first genuinely paid-for feature; possible only because Breakdown exists.
3. **Billing + Pro** — gate depth, never discovery.
4. **Palettes** as a browsable section, extracted from existing screens (content already exists by now).
5. **Layouts** gallery, derived from block order. Free content, no new ingest.
6. **Flows** — ordered screen sequences. The strongest retention feature for product designers.
7. Follow (users, sources, tags) + a real Following feed + notifications.
8. Personalized For You re-ranking from save history.
9. Code snippets from creator submissions (licensed only).
10. Vision-based segmentation fallback for DOM-hostile sites.

## 4. Phase 3 (months 7–12)

- Layout builder (drag-drop planning canvas)
- Team workspaces, projects, roles, shared collections
- Visual search (upload → find similar)
- Aesthetic analysis (moodboard → UI recommendations)
- Component recommendations per layout section
- Capture timelines ("how this product's UI evolved")
- 3D section, once there's enough motion/WebGL content to justify a tab
- Public API / Figma plugin / VS Code extension
- **Commissions & marketplace — only if creator supply exists by then**

## 5. Cut list, with reasons

| Cut / deferred | Why |
|---|---|
| **Commissions (§16 of brief)** | A two-sided money marketplace is a second company. It needs creator supply, buyer trust, escrow, disputes and support. Building it at MVP splits focus and adds a "freelance marketplace" smell to a discovery product. Revisit when >1,000 active creators. |
| **Likes, separate from Saves** | Two engagement signals that mean almost the same thing. Saves are stronger (intent to reuse) and are the only signal Pinterest keeps. Two buttons on a card also breaks the "visual dominant, minimal chrome" rule. Drop Like. |
| **Public comments** | High moderation cost, low discovery value, and they turn a calm reference tool into a social feed. Replaced by **private notes on saves** and **team notes in projects** — the actual job people do ("why did I save this"). |
| **Notifications centre at MVP** | With no follow graph and no comments, it would only ever show "your upload was approved". Ship as an email. |
| **Templates tab on profiles** | Contradicts the positioning. |
| **Separate Collections browse page** | Nothing to browse until there are boards. Folded into Explore later. |
| **"Copy code" on scraped designs** | Legal boundary. See `07-search-and-ai.md` §5.1. |
| **Layout Builder as a distinct area** | It's the editor half of Layouts. |
| **Creators index at MVP** | Early content is source-derived; there are barely any creators to index. Source pages carry the weight instead. |
| **Per-type admin managers** | One content table with a kind filter. |
| **3D / Palettes as launch nav items** | They'd launch nearly empty, which makes the whole product look thin. They become sections when the data supports them — both are derived from screens that Phase 1 already captures. |

## 6. Success metrics per phase

| Phase | Primary metric | Guardrails |
|---|---|---|
| 1 | D7 retention of signed-up users ≥ 25%; saves per active user per week ≥ 5 | LCP < 1.5s, CLS < 0.02, feed p95 < 300ms |
| 2 | Free→Pro conversion ≥ 2.5%; prompt generator used by ≥ 20% of Pro | Support load per 1k users flat |
| 3 | Team seats; weekly active workspaces | Moderation SLA < 24h |

## 7. Sequencing warning

The two things most likely to be built too late are **the content pipeline** and **the Breakdown tab**. Both are unglamorous next to a masonry feed, and both are the entire reason the product isn't a Dribbble clone. If schedule pressure arrives, cut Apps or Explore polish — not these.
