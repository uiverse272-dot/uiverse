# 10 — Review of the Brief: Duplications, Gaps, Flow Improvements

Requested in §30 items 9 and 10. Organised as: structural duplications → things that shouldn't exist → things missing → flow improvements.

## 1. Duplications found (and how they're resolved)

| # | Duplication in the brief | Resolution |
|---|---|---|
| 1.1 | Home, Explore, Web, Apps, Components, Layouts, Palettes, 3D, Search, Collection contents, Creator tabs are described as 11 pages — all are a filtered grid | **One Feed engine** with preset filters + a card renderer (`05-component-library.md` §3) |
| 1.2 | Design page and Component page specified separately with ~80% identical structure | **One Detail shell**, different tabs and rail contents |
| 1.3 | "Layouts" (§11) and "Layout Builder" (§12) as separate areas | One feature: gallery + detail + editor |
| 1.4 | Design, Component, Layout, Palette as four content types with four upload flows | **One `item` table** + kind-specific detail tables; components/layouts/palettes are *derived* from screens (`00` §4) |
| 1.5 | "User" and "Creator Profile" as separate entities with separate pages | One identity; `creator_profile` is an optional 1:1 extension |
| 1.6 | "Collections" and "Team collections" / "Shared collections" as three things | One `collection` with a polymorphic owner (user or workspace) + collaborators |
| 1.7 | Team workspace described with its own projects, collections, layouts, library — a parallel object tree | A workspace is an **owner scope**, not a new object model. `/w/*` introduces zero new entities |
| 1.8 | Explore's "Browse by Component" vs the Components page | Explore is a **directory** that links into Components facet routes; it is not a second feed |
| 1.9 | Admin listed with separate managers for Designs, Components, Collections, Uploads | One `/admin/content` with a kind filter; one moderation queue |
| 1.10 | Taxonomy repeated across Explore, Web, Apps, Components, Search with overlapping vocabularies | One taxonomy service, one filter vocabulary, one URL grammar, reused everywhere |
| 1.11 | "Colors" on the design page, "Extract palette" AI action, and the Palettes section | One extraction pipeline; the AI action and the Palettes section both read `item_color` |
| 1.12 | "Save" (§8 actions), "Save to collection" (§7 actions), "Save/pin" (MVP list) | One save model; one button; collection choice is post-hoc |
| 1.13 | Likes and Saves as separate signals | Drop Like (see §2.3) |

Net effect: ~22 "areas" collapse into **4 layout archetypes, 1 content model and 1 taxonomy**.

## 2. Things in the brief that shouldn't be built (yet or at all)

### 2.1 "Copy code" / "View code" on third-party designs
The brief puts code tabs on scraped designs. Screenshots with attribution are defensible; redistributing a company's markup and CSS is copying a copyrighted work. Replaced with: code only for first-party, licensed, or clearly-badged AI re-implementations. Enforced in the schema. This is the one item in the brief that could generate a legal letter rather than a design debate.

### 2.2 Design Commissions (§16)
A two-sided marketplace with money, trust, disputes and support. It is a second company wearing the first one's navbar. It also changes what the product *feels* like — a discovery tool with a "hire me" layer starts reading as a freelance board. Deferred to Phase 3, conditional on creator supply.

### 2.3 Likes alongside Saves
Two near-identical signals. Saves carry real intent and drive both ranking and the organise step; likes add a second button to a card that is supposed to be visually dominant and nearly text-free. Pinterest ships without likes for exactly this reason. Recommend removing.

### 2.4 Public comments
Moderation cost with little discovery value, and tonally wrong for a calm reference tool. The real underlying job is *"why did I save this"* — served better by private notes on saves and shared notes in team projects.

### 2.5 3D and Palettes as launch nav items
Both would ship nearly empty, which makes the whole product look thin at exactly the moment first impressions are formed. Both are derived from Phase 1 captures anyway — they promote themselves into the nav once they have depth.

## 3. Gaps in the brief (added to this architecture)

| Gap | Added as |
|---|---|
| **No content acquisition plan.** The largest risk in the whole plan | `08-content-pipeline.md`, made a Phase 1 workstream |
| **"Understand" had no page** despite being a step in the core journey | The **Breakdown tab** (`03-page-specs.md` §7) — the single most differentiating screen |
| No **Source page** — nowhere to see one product's whole system | `/source/[slug]` with Screens, Flows, Components, Palette, Timeline |
| No **Flow** concept — the reason people pay for Mobbin | `flow` entity in the model now, UI in Phase 2 |
| No rights / attribution / takedown policy | `08` §4, `/legal/*`, `source.opt_out` |
| No zero-CLS strategy, though masonry lives or dies on it | Mandatory media dimensions + DB-stored aspect ratio |
| No statement of how browsing survives opening an item | Overlay routing (`02-routes.md` §4) |
| No cold-start signal for "For You" | Onboarding interest picker |
| No duplicate detection | Perceptual hash at ingest + in the admin queue |
| No tag-sprawl control | `tag.alias_of_id` + admin merge from day one |
| Name collision with the existing `uiverse.io` | `00-product-definition.md` §6 |

## 4. Flow improvements

### 4.1 Saving must never interrupt browsing
The brief implies a save-to-collection choice. Requiring a board decision on every save adds a modal to the most frequent action in the product; it is the classic conversion killer in Pinterest-style apps.

**Recommended:** click Save → saved to *Recently saved*, instantly, optimistically. A toast offers *Move to…*. Organising is a separate, later, batch activity (which is also how people actually organise). Long-press / `⇧S` gives power users direct board choice.

### 4.2 Opening an item must not destroy the feed
Full-page navigation loses scroll position, loaded pages and momentum. Detail opens as an overlay over a live feed, with a real URL, working back button, and `J`/`K` to step through items without closing. Deep links still render a full page. This is a ~3-day routing investment that changes session length more than any other decision in the document.

### 4.3 Search must show its interpretation
NL search that silently guesses wrong leaves the user with no repair path. Parsed filters render as removable chips (`07` §2). Every correction is also a free labelled training pair.

### 4.4 Onboarding must seed personalization
Without an interest picker, "For You" equals "Trending" for weeks and the tab teaches users it's meaningless. Five picks, one screen, ~15 seconds.

### 4.5 Give the first session an outcome
A user who browses and leaves has had a nice time; one who leaves holding something comes back. Nudge exactly once, late in the first session: *"Save 5 and we'll build you a starter collection"* → auto-groups their saves by detected category. One nudge, dismissible forever.

### 4.6 Collapse the upload wizard
The brief's 8 steps are ~6 more screens than most submissions justify. Paste a URL → auto-capture, auto-detect tech, auto-suggest metadata → user confirms → publish. One screen, progressive disclosure. The URL path should be the default and the file upload the alternative, not the reverse.

### 4.7 Filters must not steal a column
A persistent 240px sidebar costs one full masonry column on a 1440px screen. Filters are popovers on desktop, a bottom sheet on mobile with a result count on the Apply button (`Apply (23)`), so nobody commits to an empty result.

### 4.8 Swap Upload and Search in the mobile bottom bar
Upload is <2% of sessions; Search is the most frequent action. `Home · Explore · Search · Saved · Profile`. Upload lives in Profile and as a `+` in Collections.

### 4.9 Make "Similar" a primary action
It's the highest-engagement action in every visual discovery product, and the embeddings already exist for search. It costs nothing and belongs on the card hover, the detail rail, and the ⌘K menu — not in an overflow menu.

### 4.10 Monetization must stay out of the feed
No interstitials, no blurred cards, no modal upgrade prompts over browsing. Upgrade prompts are inline, at the exact moment of limitation ("Private collections are a Pro feature" on the privacy toggle). Gate depth and output; never gate discovery — discovery is also the SEO engine and the acquisition loop.

### 4.11 Close the loop from Build back to Save
After generating a prompt or a layout, offer *"Save this to a collection"* / *"Add to project"*. The journey as written ends at Build; making it return to Organize is what turns a one-off visit into a workflow.
