# 08 — Content Pipeline

The brief has no answer for where content comes from. This is the highest-risk unsolved problem in the plan: a Pinterest with 300 items has no reason to exist, and user submissions do not arrive before users do. Treat ingestion as a **core engineering workstream in Phase 1**, equal in weight to the feed.

## 1. Four supply channels, in priority order

| # | Channel | Volume | Quality | Build cost |
|---|---|---|---|---|
| 1 | **Automated capture of a curated source list** | High | High | Medium |
| 2 | Editorial/manual curation | Low | Highest | Low (but human time) |
| 3 | User submission by URL | Medium | Mixed | Low |
| 4 | Creator uploads of original work | Low early | Mixed | Low |

Launch needs ~3,000 screens across ~300 sources. Channel 1 is the only way to get there; channels 3–4 sustain it after launch.

## 2. The capture pipeline

```
source list (curated domains)
   │
   ├─▶ crawl: resolve key pages (home, pricing, features, blog, login, dashboard if public)
   │
   ├─▶ render: headless Chromium, 3 viewports (1440 / 834 / 390)
   │        · block cookie banners & chat widgets (rule list + heuristics)
   │        · wait for fonts + network idle + lazy images
   │        · capture: viewport shot, full-page shot, scroll video (optional)
   │        · capture DOM snapshot + computed styles
   │
   ├─▶ dedupe: perceptual hash vs existing captures; skip if unchanged
   │
   ├─▶ segment: derive blocks
   │        · DOM-first: top-level children of <main>/<body>, section/header/footer landmarks
   │        · classify each block → component_type (hero, pricing, testimonials…)
   │        · vision fallback where the DOM is a soup of divs
   │
   ├─▶ extract: colors (k-means in OKLCH + role inference), fonts (computed styles),
   │            type scale, spacing rhythm, radii, shadows, breakpoints, tech stack
   │
   ├─▶ enrich: AI-proposed category, industry, style, tags; embeddings (text + image)
   │
   └─▶ queue: admin review → publish
```

**The DOM snapshot is the unfair advantage.** Competitors who only store pixels have to infer everything with vision. Reading computed styles gives exact fonts, exact colors, exact spacing and exact breakpoints. It is also what makes the Breakdown tab accurate rather than approximate — and accuracy is the whole reason a developer trusts the product.

Storage note: keep computed-style *extractions*, not full DOM dumps, beyond a short retention window. Extractions are facts about the page; a stored copy of the markup is a copy of the work.

## 3. Freshness

- Re-capture tier-1 sources monthly, tier-2 quarterly.
- Only create a new `capture` when the perceptual hash moved beyond a threshold.
- Keep history — "how Stripe's pricing page changed over 3 years" is a genuinely rare artifact and a recurring traffic driver. This is why `capture` is date-stamped rather than screens being overwritten.

## 4. Rights, attribution, opt-out

Non-negotiable from day one:
- Every screen shows the source name, logo and a link to the live site. Attribution is never behind a hover.
- `/legal/attribution` states the model plainly and `/legal/takedown` gives a one-form opt-out with a stated SLA.
- `source.opt_out = true` removes every item from that domain platform-wide, including from search and caches. One flag, one effect.
- No downloadable original assets, no re-hosted fonts, no code redistribution (see `07-search-and-ai.md` §5.1).
- Respect `robots.txt` and rate-limit politely. Identify the crawler with a UA string that links to an explanation page.

## 5. Quality bar

Reject at ingest, not after publish: partial renders, cookie-banner overlays, missing webfonts, sub-1200px width captures, login walls, 404/parked pages, and anything with a perceptual hash within threshold of an existing item. A feed where every fifth card is broken reads as a dead product regardless of how good the other four are.

## 6. Seeding taxonomy

Before ingest runs, the taxonomy must exist and be fixed: ~12 categories, ~15 industries, ~12 styles, ~30 component types, ~20 technologies. Tags stay free-form but `alias_of_id` is used aggressively from day one. Retro-fitting taxonomy onto 30,000 items is a month of work; defining it first costs a day.
