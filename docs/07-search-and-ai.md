# 07 — Search & AI

## 1. Why search is the product, not a feature

Pinterest works because browsing is effortless. This platform has a second mode: someone arrives with a *specific* intent — "I need a pricing section for a dark fintech SaaS" — and the entire value is whether they get there in one query. Feed browsing creates habit; search creates dependence.

## 2. Query pipeline

```
raw query
   │
   ├─▶ 1. Normalise + spell-correct
   │
   ├─▶ 2. PARSE  →  structured filters + residual free text
   │        "dark fintech dashboard"
   │        → { style: dark, industry: fintech, page_type: dashboard }, residual: ""
   │
   ├─▶ 3. RETRIEVE  (union, then fuse)
   │        a) structured filter query on item_taxonomy          → high precision
   │        b) full-text search on title/description/tags/source → lexical recall
   │        c) vector kNN on item.embedding                      → semantic recall
   │
   ├─▶ 4. FUSE (reciprocal rank fusion) + boost by quality/recency/saves
   │
   └─▶ 5. RETURN results + facet counts + the parse, shown as editable chips
```

**Parse first, vectors second.** Parsing is deterministic, cheap, cacheable, explainable and directly reusable as URL state. Vector search is the fallback that catches "purple AI landing page with 3D hero", not the primary path.

### The parser
Two stages:
1. **Dictionary match** against the taxonomy (styles, industries, component types, technologies, colors, platforms) with synonyms and plurals. Handles ~80% of real queries at zero cost and zero latency.
2. **LLM fallback** for anything left over, returning strict JSON constrained to the known vocabulary. Cached by normalized query string — the long tail is long, but the head repeats constantly.

### Showing the parse (non-negotiable UX)
```
  Searching:  [Style: Dark ✕]  [Industry: Fintech ✕]  [Type: Dashboard ✕]
              "dashboard" also searched as text
```
NL search fails in every product that hides its interpretation, because when it's wrong the user has no repair path. Chips give them one, and each edit is a free labelled training pair.

## 3. Filters

Shared vocabulary across every feed and search: `kind` · `platform` · `device` · `category / page type` · `component type` · `industry` · `style` · `technology` · `color` · `responsive` · `code available` · `free/premium` · `has video` · `source` · `date added` · `sort`.

- Every filter emits a URL param; every URL param reconstructs the filter bar.
- Facet counts are computed alongside results and **disabled options with 0 results are hidden**, not greyed — a filter that leads nowhere is noise.
- Color matching uses OKLCH distance against `item_color`, weighted by coverage, not exact hex equality.

## 4. Ranking

```
score = 0.35·quality      (curation score, source authority, resolution)
      + 0.25·engagement   (log(saves) with time decay)
      + 0.20·relevance    (fusion score; 1.0 when browsing)
      + 0.10·freshness    (exp decay over 90d)
      + 0.10·diversity    (penalty for consecutive items from one source)
```
Diversity matters more than it looks: without it, one well-captured product floods an entire scroll. Cap at 2 consecutive and ~4 per 40-item window.

Personalization (Phase 2) adds a term from the user's saved taxonomy distribution and follow graph — applied as a re-rank over the top ~300, never as a filter. A personalized feed that never shows anything new is how discovery products die.

## 5. AI features — and the code-licensing boundary

### 5.1 The boundary, stated once
Screenshots of public sites, with attribution and a link, are the industry-standard model. **Redistributing a company's HTML/CSS is not the same thing** — it is copying a copyrightable work, and no attribution line fixes it.

Therefore:
- Code tabs appear **only** for `first_party` (creator submitted their own), `licensed` (explicit permission/open license), or `ai_reimplementation` (generated from the visual, clearly badged *"AI re-implementation — not the original source code"*).
- "Copy code" and "View source" on a scraped third-party screen are **removed from the spec**.
- "Open live site" replaces them — it sends traffic to the source, which is also what keeps site owners friendly.
- Enforced in the schema (`code_snippet.source_kind` has no `scraped` value), not just in the UI.

### 5.2 AI Search (Phase 2)
Covered by §2. The only user-visible "AI" is that odd phrasings work and the chips explain why.

### 5.3 Prompt Generator (Phase 2) — the highest-leverage AI feature
From any screen, component or layout:
1. Target tool: Claude · ChatGPT · Cursor · Codex · v0 · Lovable · Bolt
2. Stack: React · Next.js · Tailwind · HTML/CSS · Vue · SwiftUI
3. Options: include color tokens · include type scale · include responsive notes · include component breakdown · semantic HTML/a11y requirements

Output is a **structured spec, not a description of a picture**: layout sections in order, extracted design tokens, spacing rhythm, breakpoint behaviour, component inventory, accessibility requirements. Editable before copy. Copy / open-in-tool / save to collection.

This works precisely because of the Breakdown data. A competitor without decomposition can only send the model an image.

### 5.4 Visual Search (Phase 3)
Upload a screenshot or moodboard → image embedding → kNN. Also "more like this" from any card, which is the same call with an existing embedding and costs nothing extra. Ship "more like this" in Phase 2 — it's free and it's the most-used discovery action in Pinterest.

### 5.5 Aesthetic Analysis (Phase 3)
Upload a photo, interior, product shot or brand identity → extract palette, mood, contrast character, type direction → recommend matching UI. A strong acquisition/marketing surface (people share the output), but it is a leaf feature: it must not be built before the core breakdown pipeline works.

### 5.6 AI auto-tagging (Phase 2, internal)
The highest-ROI AI in the product and it is invisible: vision model proposes category, industry, style, component types, colors, tech; a human confirms in the admin queue at ~5 seconds per item instead of ~90. This is the difference between 500 items and 50,000.

## 6. Cost and latency discipline

| Path | Budget |
|---|---|
| Dictionary parse | <5ms, in-process |
| LLM parse (cache miss) | <400ms, cached forever by query string |
| Retrieval + fusion | <120ms p95 |
| Typeahead | <60ms, prefix index only, never an LLM |

Never call a model on the typeahead path. Never call a model on feed load. The only synchronous model calls in the whole product are the parse fallback and the explicit AI actions the user clicks.
