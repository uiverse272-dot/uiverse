# 00 — Product Definition

> Status: architecture draft, pre-implementation. Nothing in `docs/` is code.

## 1. One-line positioning

**A visual index of how real interfaces are actually built** — you browse it like Pinterest, you use it like a reference manual, and you leave with something you can implement.

Not a portfolio gallery (Dribbble). Not a template store (Themeforest). Not a component registry (shadcn). The unit of value is a **real, shipped interface, broken down into its parts**.

## 2. What makes it not a Dribbble clone

Dribbble indexes *aspirations* posted by designers. This platform indexes *evidence* from shipped products, and decomposes it.

| Dribbble / template marketplaces | This platform |
|---|---|
| Content = a person's portfolio shot | Content = a screen from a product that real users use |
| Flat image, no structure | Screen is decomposed into sections, colors, type scale, spacing |
| You admire it | You copy the decision, then implement it |
| Creator-centric | Source-product-centric, creator credited |
| Buy the file | Understand the pattern, generate the code |

The decomposition is the moat. See §4.

## 3. Core journey → where it lives

| Step | Surface | The one thing that must work |
|---|---|---|
| Discover | `/` masonry feed | Endless, fast, visually dense, no chrome |
| Explore | `/explore` + facet routes | Getting from a vague intent to a narrow set in ≤2 clicks |
| Save | Save button everywhere | One click, zero modal, undoable |
| Organize | Collections + sections | Feels like moving physical cards |
| Understand | **Breakdown tab** on every screen | Sections, colors, type, spacing, responsive behaviour |
| Build | Prompt generator / code / layout plan | Leave with an artifact, not a feeling |
| Collaborate | Workspaces | Shared collection + notes, nothing heavier |

**Gap in the original brief:** "Understand" had no page. It was implied by scattered fields on the design page. It is now an explicit, named surface (the Breakdown tab) and it is the single most differentiating screen in the product. Treat it as MVP, not polish.

## 4. The structural idea everything else hangs off

The brief treats **Design**, **Component**, **Layout** and **Palette** as four separate content types that users upload separately. That is four cold-start problems, four moderation queues, four taxonomies, and four half-empty sections.

Model them as **one hierarchy, derived from one ingest**:

```
Source            a real product or site          Linear, Revolut, Stripe
 └─ Capture       a dated snapshot of it          Revolut, captured 2026-03
     └─ Flow      an ordered run of screens       "Onboarding", "Checkout"
     └─ Screen    one page/state                  "Pricing", "Dashboard — empty state"
         └─ Block a crop of a screen              the hero, the pricing table, the nav
```

Then:

- **A "Design"** = a Screen.
- **A "Component"** = a Block. Components are *crops of real screens*, not separate uploads.
- **A "Layout"** = the ordered list of Block types on a Screen. It is derived, not authored.
- **A "Palette"** = colors extracted from a Screen. Derived.
- **"Components used on this design"** = the Screen's Blocks. Free.
- **"Where is this component used in the wild?"** = reverse lookup from Block → Screen → Source. This query is the product. Nobody else answers it well.

**Consequences:**
1. One ingested screen yields ~6 components, 1 layout and 1 palette. Content volume problem largely solved.
2. Components section is populated on day one instead of being an empty library.
3. Every component has real-world provenance, which is exactly what a developer wants and what a template marketplace can't offer.
4. One entity to moderate, one search index, one card component, one save model.

Users can still upload standalone components and palettes (a creator's original work) — those are a Source of kind `original` with a single Screen. Same pipeline, no second system.

## 5. Design principles (binding, not aspirational)

- The UI is a **frame**, not a participant. Neutral greys, one accent, content supplies all color.
- **Borders over shadows.** 1px hairlines at low contrast. No elevation stacks.
- **Radius scale caps at 12px** for cards, 8px for controls. No pill-shaped everything.
- **Type carries the hierarchy**, not boxes. One sans family, 4 sizes, 3 weights.
- **Density is a feature.** A 27" screen shows 6 columns and ~30 cards without scrolling.
- **Motion ≤150ms**, only on hover/press/enter. No scroll-triggered marketing animation anywhere in the app shell.
- Chrome fades on scroll; content never moves. Every image has known dimensions before it loads — **zero layout shift is a hard requirement**, not a nice-to-have.

Reference points: Pinterest's feed mechanics, Mobbin's decomposition, Are.na's calm, Linear's typography and keyboard-first feel, Cosmos' full-bleed confidence.

## 6. Named risks to resolve before build

1. **Name collision.** `uiverse.io` exists (open-source CSS component library, significant SEO footprint). Using "Uiverse" will cost search traffic and invites a trademark letter. Decide the name before buying a domain or writing a landing page.
2. **Rights to screenshots.** Indexing screenshots of third-party products with attribution is the established model (Mobbin, Land-book, Godly). It is defensible; it is not risk-free. Required from day one: visible attribution + link to source, a public takedown/opt-out route, no full-resolution asset redistribution, no re-hosting of their fonts/images as downloadable files.
3. **"Copy code" on third-party designs is a different legal question than screenshots.** Scraping and redistributing another company's markup/CSS is copying a copyrighted work. See `07-search-and-ai.md` §5 for the rule the product must follow.
4. **Cold start.** A Pinterest with 200 items is dead. Content strategy is an engineering workstream, not a marketing task. See `08-content-pipeline.md`.

## 7. Document map

| File | Answers |
|---|---|
| `01-sitemap.md` | Complete sitemap + page hierarchy |
| `02-routes.md` | URL/route table, rendering strategy, namespace rules |
| `03-page-specs.md` | What is on every page |
| `04-navigation.md` | Desktop + mobile navigation |
| `05-component-library.md` | Reusable UI components + design tokens |
| `06-data-model.md` | Entities, fields, relationships |
| `07-search-and-ai.md` | Search, filters, AI features |
| `08-content-pipeline.md` | How the platform gets content |
| `09-roadmap.md` | MVP vs later, and the cut list |
| `10-ux-critique.md` | Duplications found, flow improvements |
| `11-tech-architecture.md` | Stack, infrastructure, delivery plan |
