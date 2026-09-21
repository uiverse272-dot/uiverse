# 03 — Page Specifications

What appears on each page, in order. Anything marked ⏳ is Phase 2+ and should be designed for but not built.

---

## 1. Home / Discover — `/`

The most important page. Target: **first image painted < 1.0s, no layout shift, first save possible within 3 seconds of load.**

**Above the fold (logged out):**
1. Navbar (see `04-navigation.md`).
2. Discovery header — compact, ~180px, not a marketing hero:
   - H1: *Discover interfaces worth building.*
   - Sub: *Websites, apps, components and patterns from products people actually ship.*
   - Large search field, rotating placeholder: `dark fintech dashboard` → `minimal SaaS pricing section` → `mobile onboarding flow`.
3. Chip rail (horizontally scrollable, sticky on scroll): `For You` `Trending` `New` `Web` `Mobile` `Components` `Dashboard` `SaaS` `E-commerce` `Portfolio` `Dark` `Minimal` `3D`.

**Logged in:** the header collapses to a single sticky search + chip row. The masonry starts ~90px from the top. Returning users should never scroll past a headline they have read 40 times.

**Feed:** masonry, 2 cols mobile / 3 tablet / 4–6 desktop by viewport, cards at natural aspect ratio, cursor-paginated infinite scroll with a "Load more" fallback after 5 auto-loads (accessibility + footer reachability).

**Card contents** — visual dominant, ≤2 lines of text:
- Image (aspect ratio known from DB, blurhash placeholder)
- On hover: `Save` (top-right, primary), `⋯` menu (Save to…, Similar, Copy link, Open source, Hide, Report), bottom-left source lockup (favicon + product name), bottom-right quiet badges (`</>` code available, `▶` has video, `↗` live)
- Below card, resting state: title (1 line, truncated) + source name. Category/tags are **not** on the card — they add noise and are visible on hover/detail.

**⏳ Interleaved rails** every ~40 cards, never above the fold: `Because you saved Linear` · `Trending with developers` · `More in Fintech` · `New this week`. Horizontal scroll, dismissible.

**States:** logged-out → Trending (curated, best-of). New user post-onboarding → seeded from chosen interests. No-content → never; always fall back to Trending.

---

## 2. Explore — `/explore`

A **directory, not a second feed.** Its job is converting a vague intent into a URL. Grid of visual category cards (4-image collage cover + label + count), grouped:

| Group | Entries |
|---|---|
| By type | Web, Mobile, Dashboard, E-commerce, Portfolio, Enterprise, Desktop app |
| By component | Hero, Navbar, Footer, Pricing, Cards, Forms, Sidebar, Table, Dashboard, Checkout, Login, Testimonials, Empty state, Onboarding |
| By industry | Fintech, Healthcare, SaaS, E-commerce, AI, Education, Real estate, Travel, Fashion, Food, Productivity, Crypto, Gaming |
| By style | Minimal, Editorial, Brutalist, Luxury, Corporate, Playful, Futuristic, Glassmorphism, Dark, Light, Retro, Neo-brutalist |
| By technology | React, Next.js, Tailwind, Vue, Svelte, Webflow, Framer, Shopify, SwiftUI, Flutter |
| By color | 12 color swatch tiles → `/color/[hex]` |
| By platform | Web, iOS, Android, iPad, Desktop, Watch |

Each tile links to a facet feed route. Counts are real (cached hourly); a tile with <20 items is hidden rather than shown empty.

---

## 3. Web — `/web` and `/web/[facet]`

Feed engine, `kind=screen` + `platform=web`.

Filter bar (sticky, below navbar): `Type` `Industry` `Style` `Color` `Technology` `Device` `Sort` + active-filter chips with individual ✕ and a "Clear all".

- Type: Landing page, SaaS, Corporate, E-commerce, Portfolio, Agency, Marketplace, Blog, Docs, Pricing page, Dashboard
- Device: Desktop / Tablet / Mobile — this **switches the rendered preview**, it does not just filter. Same screen, different capture.
- Sort: Trending · Newest · Most saved · Most viewed
- Color filter = swatch picker, matched against extracted dominant colors within a ΔE threshold, not exact hex.

Facet URLs (`/web/saas`, `/web/fintech`, `/web/dark`) render an H1 + a 2-line intro paragraph for SEO, then the same feed.

---

## 4. Apps — `/apps`

Same engine, `platform ∈ {ios, android, mobile-web, ipad}`.

Categories: Finance, Productivity, Social, Health, Shopping, Travel, Education, Media, Crypto, AI, Dating, Fitness.
Extra filters: Platform, App category, Screen type (Onboarding, Feed, Profile, Settings, Paywall, Empty state, Checkout, Permissions).

Cards render at phone aspect ratio → the masonry naturally becomes a more uniform grid here. That is correct and expected.

**Flows** (⏳ Phase 2, but the data model supports it now): a flow card shows a stacked-screens cover and a count. `/source/[slug]/flow/[flowSlug]` is a horizontal filmstrip viewer with ←/→ keys. Flows are the single strongest reason a product person subscribes.

---

## 5. Components — `/components`

The section that makes this a tool rather than a gallery. Populated automatically from Blocks (crops of real screens) plus creator submissions.

Categories (left rail on desktop, chip row on mobile):

| Group | Items |
|---|---|
| Navigation | Navbar, Sidebar, Breadcrumb, Tabs, Pagination, Command menu |
| Content | Cards, Tables, Lists, Stats, Charts, Timeline, Media |
| Marketing | Hero, Pricing, Testimonials, Logo cloud, CTA, FAQ, Features, Footer, Blog index |
| Forms | Inputs, Login, Signup, Checkout, Search, Filters, Settings, Upload |
| Interaction | Modal, Dropdown, Tooltip, Notification, Accordion, Drawer, Toast, Empty state |

Filters: Framework · Style · Dark/Light · Free/Premium · Responsive · Code available.

Card: tight crop of the component (not the whole page), name, framework badge when known, `</>` badge when code exists, Save.

---

## 6. Component detail — `/component/[slug]`

Two-column: preview left (≈65%), sticky rail right.

**Preview panel:** live-ish rendering in a resizable frame with `Desktop / Tablet / Mobile` toggle and a `Light / Dark` toggle when both captures exist. Falls back to a static image when the component came from a screenshot crop.

**Sticky rail:** title · source/creator lockup · Save (primary) · Share · tags (`Hero` `SaaS` `Dark` `React` `Tailwind`) · Find similar · Open source site.

**Body tabs:**
1. **Code** — tabs React / HTML / CSS / Tailwind / Next.js, copy button per tab, dependency list. *Only shown when the code is first-party, licensed, or an explicitly labelled AI re-implementation. See `07-search-and-ai.md` §5.*
2. **Design details** — extracted: color roles (bg/surface/text/accent/border), font families + size/weight pairs, border radius, spacing rhythm, shadow values, breakpoint behaviour. Each value is one-click copyable as CSS variable or Tailwind token.
3. **In the wild** — every Screen that contains this component type, across sources. *The unique query. Prominent.*
4. **Similar components** · **More from this source**

**Actions rail (sticky bottom on mobile):** Save · Copy code · Generate prompt ⏳ · Add to layout ⏳

---

## 7. Individual design page — `/screen/[slug]`

Immersive. When opened from a feed it is an overlay (see `02-routes.md` §4).

**Main column:**
- Full screenshot at native width, click to zoom, scrollable for long pages
- Thumbnail strip: additional screens/states from the same capture
- `Desktop / Tablet / Mobile` toggle → swaps capture, preserves scroll ratio
- Video/interaction recording if present

**Sticky right rail:** title · source lockup (logo, name, "Visit site ↗") · creator credit · `Save` (primary) · Share · `Open live site` · captured date + "View older captures" ⏳ · tags · category · industry · style · technologies detected.

**Body tabs:**

| Tab | Contents |
|---|---|
| **Overview** | Short editorial note (auto-drafted, human-approved), what this screen does well, key patterns used |
| **Breakdown** ★ | Section-by-section outline of the page with each block labelled and linked to `/component/…`; the derived **layout strip** (Navbar → Hero → Logos → Features → Testimonials → Pricing → CTA → Footer); extracted palette with roles; type scale; spacing scale; radius; grid/column structure |
| **Responsive** | Desktop/tablet/mobile side by side + documented pattern notes (nav → hamburger, 4col → 2col → 1col, what collapses, what hides) |
| **Code** | Only if available/licensed |
| **Similar** | Visually similar screens (embedding), same-industry screens, related screens from the same flow |

Bottom rails: **Components used** · **Related screens** · **More from this source** · **Similar designs**.

**AI actions** (⏳ but designed now, grouped in one popover so they don't clutter): Generate implementation prompt · Find similar · Analyze design · Extract palette.

---

## 8. Source page — `/source/[slug]`

Not in the original brief. Added because it is where "understand how interfaces are built" actually pays off: seeing one product's entire system.

Header: logo, name, one-line description, industry, live link, tech stack, follow ⏳.
Tabs: **Screens** (feed) · **Flows** ⏳ · **Components** (everything cropped from this source) · **Palette & type** (the product's whole design system as inferred) · **Timeline** ⏳ (how the product's UI changed across captures — a genuinely rare and shareable artifact).

---

## 9. Search results — `/search`

- Query echo with **parsed interpretation shown as removable chips**: typing `dark fintech dashboard` yields `Style: Dark ✕` `Industry: Fintech ✕` `Type: Dashboard ✕`. Users can see and correct the machine's reading — this is what makes NL search trustworthy instead of magic-and-wrong.
- Tabs with counts: `All · Web · Apps · Components · Layouts · Palettes · Creators`
- Full filter bar, same as feeds
- Results in masonry
- Right rail (desktop): **Related searches**, **Refine by** facet counts
- Empty state: nearest-match suggestions + 3 example queries + "browse Explore instead"
- Recent searches and suggested searches in the typeahead dropdown, grouped `Suggestions / Components / Sources / Collections`

---

## 10. Collections — `/u/[handle]/[collectionSlug]`

Pinterest boards with structure.

Header: cover (auto 4-image collage, overridable) · name · description · item count · privacy badge · collaborator avatars · `Save all`/`Follow` ⏳ · `⋯` (Edit, Duplicate, Share, Export ⏳, Delete).

Sections: a chip row of user-defined sections (`All · Hero · Navigation · Pricing · Dashboard · Mobile`). `?section=hero` is a real URL.

Grid: masonry with drag handles when the viewer can edit. Drag to reorder; drag onto a section chip to move. Each item can carry a **private note** ("use this spacing", "client liked this") — shown as a small note icon, expanded on hover. Notes are the Are.na-derived feature that makes collections worth returning to.

Collections index (`/u/[handle]/collections`): grid of board covers, plus `Recently saved` (the default unsorted bucket) and a `+ New collection` tile.

---

## 11. Layouts — `/layouts`, `/layouts/[slug]`, `/layouts/new`

**Gallery:** cards render the layout as a stacked wireframe strip, not a screenshot. Filter by page type (SaaS homepage, Portfolio, E-commerce home, Product page, Dashboard, Landing page, Pricing, Docs).

**Detail:** the section sequence rendered vertically; each section shows its name, a representative thumbnail, and "12 components available →". Actions: Save · Duplicate to my layouts · Open in builder · Export as Markdown outline.

**Builder** (`/layouts/new`): three panes.
- Left: section palette, grouped, searchable, drag source
- Centre: vertical canvas of section blocks, drag to reorder, click to select, duplicate/delete inline
- Right: properties of the selected section — name, notes, linked component, linked saved designs, responsive intent

It is a **visual planning tool**, not a website builder. It outputs a plan (and later, a prompt), never HTML. Saying this explicitly in the UI ("Plan the structure. Build it anywhere.") is what stops users expecting Webflow.

---

## 12. Palettes — `/palettes`, `/palettes/[slug]`

Grid of palette cards (5 stacked color bands + name + source link).
Detail: large swatches with HEX/RGB/HSL/OKLCH, contrast pairs matrix with WCAG pass/fail, copy as CSS variables / Tailwind config / JSON, "Designs using this palette", suggested role assignment (bg / surface / text / accent / border).
Create: from scratch, or **extract from any design in one click** (the main acquisition path).

---

## 13. 3D — `/3d`

Feed filtered to `has3d`. Subfilters: Spline · Three.js · WebGL · Blender · Rive · Interactive · Static. Cards autoplay a short looping capture on hover (muted, ≤3s, `prefers-reduced-motion` respected). Detail page adds: the tool used, whether the scene is embeddable, performance notes (bundle weight, mobile behaviour) — developers ask this before anything else.

---

## 14. Creators — `/creators`, `/u/[handle]`

Index: Featured · Trending · Designers · Developers · Studios; card = avatar, name, role, 3-image work strip, follow ⏳.

Profile header: avatar · name · @handle · role · bio · location · links · Follow ⏳ · `Available for work` badge ⏳.
Tabs: Uploads · Collections (public only) · Layouts · Palettes · About.
**User and Creator are the same object** — a creator is a user with `is_creator = true` and a filled profile. No separate entity, no separate page.

---

## 15. Upload / Submit — `/upload`

Modal-first, one screen with progressive disclosure, not a 8-step wizard. Steps collapse as they complete.

1. **Drop zone** — image, video, or **paste a URL and we capture it for you** (the highest-conversion path; most submissions are "this site is nice", not a file).
2. Title (auto-suggested from page `<title>` / OCR)
3. Kind: Website · App · Component · Layout · 3D
4. Source URL + attribution (who made it — required; "I made this" toggle)
5. Technology (auto-detected from the page when a URL was given)
6. Optional code + license selector
7. **AI-suggested metadata** — category, industry, style, components present, colors, tags — presented as *pre-filled removable chips*, never as a black box. User edits, then publishes.
8. Publish → goes to moderation queue → user sees "Submitted, usually reviewed within 24h" and a link to `/dashboard/drafts`.

---

## 16. Dashboard — `/dashboard`

Left rail: Overview · Uploads · Drafts · Saved · Collections · Layouts · Palettes · Following · Analytics · Settings.
Overview: 4 stat tiles (saves received, views, followers, uploads) + recent activity + "continue where you left off" (last collection, last layout).
Analytics (creators): views/saves over time, top uploads, referrers, save-through rate. Keep it to one page; this is not an analytics product.

---

## 17. Team workspace — `/w/[workspace]`

Home: projects grid + recent team activity + shared collections.
**Project** (`/w/[ws]/p/[project]`) tabs: Inspiration (a collection scoped to the project) · Layout · Components · Palette · Notes.
Members: invite by email/link, role per member.
Roles: Owner (billing, delete) · Admin (members, settings) · Editor (create/edit content) · Viewer (read + comment).
Team library: components and palettes the team has standardised on.

A project is a **container of the same objects**, not new object types. Nothing in `/w/*` introduces a new entity — it introduces an owner scope.

---

## 18. Pricing — `/pricing`

Three plans, monthly/annual toggle, no countdown timers, no fake scarcity.

| | **Free** | **Pro** | **Team** |
|---|---|---|---|
| Browse everything | ✓ | ✓ | ✓ |
| Save | Unlimited | Unlimited | Unlimited |
| Collections | 5 public | Unlimited, public + private | Unlimited |
| Filters | Core (type, category, industry) | All (color, tech, responsive, code) | All |
| Breakdown tab | Colors + type | Full (spacing, grid, responsive notes) | Full |
| Flows / full screen sets | First 3 screens | Full | Full |
| AI prompt generation | 3/month | Unlimited | Unlimited |
| Palette tools | Browse + copy hex | Extract, export, Tailwind config | + team palettes |
| Layout builder | 1 layout | Unlimited | Unlimited |
| Team workspaces | – | – | ✓ |
| Shared collections + roles | – | – | ✓ |

**Gating rule:** gate *depth and output*, never *discovery*. A free user must be able to browse forever and save everything — that is the loop that makes the product worth paying for later. Paywalling the feed kills the flywheel and the SEO.

---

## 19. Authentication

`/signup`: email + password, Google, GitHub (developers), Apple. Then `/onboarding`:
1. Role: Designer · Developer · Founder · Student · Agency
2. Pick ≥5 interests from a visual grid (industries + styles + types)
3. Optional: follow 3 suggested sources
4. Straight into `/` with a seeded For You feed

Step 2 is not optional-feeling fluff — without it, personalization has no cold-start signal and the "For You" tab is indistinguishable from Trending for weeks.

---

## 20. Settings — `/settings/*`

Profile (avatar, name, handle, bio, links, role, available-for-work) · Account (email, password, connected accounts, delete) · Notifications · Billing (plan, invoices, cancel — one click, no retention maze) · Teams · Danger zone (export my data, delete account).

---

## 21. Admin — `/admin`

Default view is **the queue**, because 95% of admin time is moderation.

- **Queue:** pending uploads in a two-up review layout, keyboard-driven (`A` approve, `R` reject with reason, `E` edit metadata, `D` mark duplicate, `F` feature). Duplicate candidates surfaced automatically via perceptual hash.
- **Content:** one table for all kinds, filter by kind/status/source/date, bulk actions, inline metadata edit.
- **Sources:** ingested products — re-capture, freeze, blacklist, handle opt-out requests.
- **Taxonomy:** categories, tags, industries, styles, technologies; **merge tag** and **alias tag** are the two operations that matter (tag sprawl is the failure mode of every content platform).
- **Users:** search, role, suspend, ban, impersonate (audit-logged).
- **Reports:** DMCA/takedown/abuse with a required resolution note and an SLA timer.
- **Featured & trending:** pin, schedule, boost/demote weights.
- **Billing, analytics, jobs.**

Every destructive admin action is soft-delete + audit log. No hard deletes from the UI.
