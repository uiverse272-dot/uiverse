# Uiverse (working name — see docs/00 §6)

A visual index of how real interfaces are actually built. Browse it like Pinterest, use it like a reference manual, leave with something you can implement.

**Status: architecture defined, no code written.** Read `docs/` before building anything.

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


## Running it

```bash
npm install
npm run dev     # http://localhost:3000
```

## What's actually built

A working prototype of the **discovery half** — the Feed engine, the Detail shell and the Breakdown
tab, which are the three things the architecture stands or falls on.

| Route | State |
|---|---|
| `/` | Home feed, chip rail, mixed kinds, infinite scroll |
| `/explore` | Taxonomy directory with live counts |
| `/web`, `/apps`, `/components` | Feed engine + facet routes (`/web/saas/dark`) and URL-state filters |
| `/screen/[slug]`, `/component/[slug]` | Detail shell: Overview · **Breakdown** · Responsive · Code · Similar |
| `/source/[slug]` | One product's whole system: screens, components, inferred palette |
| `/search` | Dictionary-first NL parsing with the interpretation shown as removable chips |
| Prompt generator | On any screen or component: 7 target tools x 5 stacks, built from the Breakdown data |
| `/saved` | One-click saves, collections, `Move to…` toast |
| `/layouts`, `/palettes`, `/3d`, `/creators` | Derived-content sections |
| `/upload`, `/pricing`, `/legal/attribution` | Flow and policy surfaces |
| `/dev-measure` | Dev tool — re-derives archetype heights (see the file header) |

Stubbed on purpose: auth, billing, teams, the layout builder, visual search, and the capture
pipeline. Those are Phase 2–3 in [09-roadmap.md](docs/09-roadmap.md).

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
saving and the Breakdown have no counter near them.

## Notes on the prototype

- **Previews are procedurally rendered**, not screenshots. Each one is drawn from a palette and an
  archetype in `cqw` units against a container query — so there are no image files, no external
  requests, nothing impersonating a real company, and the geometry is known before paint.
- **Every brand is invented.** Ledgerly, Northwind, Cormorant and the rest do not exist.
- **Aspect ratios come from the data**, never from measuring the DOM. That is what makes the masonry
  lay out with zero shift, and why `/dev-measure` exists.
- **Saves persist in `localStorage`** via an external store read with `useSyncExternalStore`, so the
  server snapshot is empty and there is no hydration mismatch.
- Procedural values use an integer hash, not `Math.sin` — trig is not bit-identical between the Node
  server and the browser, which silently breaks hydration.

## The five decisions everything else follows from

1. **Content is decomposed, not just displayed.** Source → Capture → Screen → Block. Components are crops of real screens; layouts and palettes are derived from them. One ingest produces all four content types.
2. **Four surfaces, not 22 pages.** One Feed engine, one Detail shell, a workspace set and a system set.
3. **The Breakdown tab is the product.** "Understand" is where a Pinterest clone becomes a developer tool — and it is MVP, not polish.
4. **Detail opens over the feed.** Intercepting routes; the feed never unmounts; the URL is still real.
5. **Gate depth, never discovery.** Free users browse and save forever; Pro pays for output.
