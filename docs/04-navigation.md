# 04 — Navigation

Principle: **the navbar exposes 5 destinations, not 22.** Everything else is reachable through search, Explore, and context.

## 1. Desktop navbar (≥1024px)

Single row, 56px, hairline bottom border, background `--bg` with 88% opacity + blur on scroll. Full width (not max-width constrained) — the feed uses the full viewport, so the nav must too.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◼ Logo   Explore  Web  Apps  Components  Layouts   [ 🔍 Search… ⌘K ]   ⋯      │
│                                                    …  Upload  ⬒  🔔  ◯        │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Zone | Contents |
|---|---|
| Left | Logo (→ `/`), then 5 text links: Explore · Web · Apps · Components · Layouts |
| Centre | Search field, `min(520px, 40vw)`, grows to 640px on focus. `⌘K` hint chip inside. |
| Right | `More ▾` (Palettes, 3D, Creators, Pricing, Changelog) · `Upload` (secondary button) · Saved (bookmark icon → `/saved`) · Notifications ⏳ · Avatar menu |

Logged out, right side is: `More ▾` · `Log in` (text) · `Sign up` (solid button). No upload, no saved.

Avatar menu: Profile · Dashboard · My collections · My layouts · Upgrade to Pro · Settings · Theme (System/Light/Dark) · Log out. Team switcher appears above Profile when the user belongs to a workspace.

**Active state:** 2px underline on the active section only, no background pills.

**Scroll behaviour:** navbar stays; the filter bar below it sticks under it. Both together never exceed 104px. On scroll-down past 600px the navbar shrinks to 48px and the discovery header is gone — maximum content, minimum chrome.

## 2. Secondary bar (context bar)

Appears directly under the navbar on feed routes only.

- `/` → chip rail (For You, Trending, New, categories)
- `/web`, `/apps`, `/components` → filter controls + active filter chips + sort + column-density toggle
- `/search` → result-kind tabs + filters
- `/u/[handle]`, `/source/[slug]` → tab row
- Detail pages → nothing (the rail carries the actions)

Filter controls are **dropdown popovers**, not a left sidebar. A persistent sidebar steals 240px from the grid, which costs a whole column on a 1440px screen. One exception: `/components`, where a category rail genuinely aids scanning — and even there it collapses below 1280px.

## 3. Search (`⌘K` / `/`)

The search field opens a full-width dropdown with:
- Recent searches (local)
- Suggestions as you type, grouped: `Suggestions · Components · Sources · Collections · Creators`
- Visual thumbnails on source/component rows
- Footer hints: `↵ search` · `⇥ filter` · `⌘K` toggles
- `Enter` on free text → `/search?q=…` with the NL parse applied

`/` focuses search from anywhere (except inputs). `Esc` closes.

## 4. Mobile (<768px)

Not a shrunken desktop.

**Top bar (48px):** logo mark only + search field (expands to full width on tap) + avatar. It scrolls away on scroll-down, returns on scroll-up.

**Bottom navigation (56px, safe-area padded), 5 items:**

```
   🏠            🧭            🔍           ⬒            ◯
  Home        Explore       Search       Saved       Profile
```

**Change from the brief:** the brief put `Upload` in the bottom bar. Upload is a rare action (<2% of sessions) and Search is the most frequent — swapping them costs nothing and improves the common path. Upload lives in the Profile tab and as a `+` in the Saved/Collections screen. If uploads become a strategic priority later, promote it then, with data.

**Mobile specifics:**
- 2-column masonry, 8px gutter, edge-to-edge (no page padding on the grid itself)
- Tap card → **full-screen detail sheet** that slides up; swipe down to dismiss, swipe left/right to move between feed items
- Save button always visible on the card (no hover on touch) — bottom-right corner, 40px hit target
- Filters open as a bottom sheet with an `Apply (23)` button showing the result count before commit
- Collections: horizontal section chips, long-press to drag-reorder
- No hover-dependent affordance anywhere in the product

**Tablet (768–1023px):** 3 columns, top navbar (no bottom bar), filters as popovers. Bottom nav disappears at 768px.

## 5. Footer

Only on `(marketing)` routes and at the natural end of non-infinite pages. **Never under an infinite feed** — it is unreachable and its presence makes the page's scroll height lie to the browser.

Columns: Explore (Web, Apps, Components, Layouts, Palettes, 3D) · Product (Pricing, Changelog, Submit a site, API ⏳) · Company (About, Blog, Contact) · Legal (Terms, Privacy, Attribution policy, Takedown).

## 6. Keyboard map (desktop)

| Key | Action |
|---|---|
| `/` or `⌘K` | Search |
| `J` / `K` or `←` / `→` | Previous / next item (feed and overlay) |
| `S` | Save focused item |
| `⇧S` | Save to… (collection picker) |
| `Esc` | Close overlay / clear focus |
| `F` | Toggle filters |
| `1–5` | Switch tab on a detail page |
| `?` | Shortcut cheatsheet |

Full keyboard operability is table stakes for the developer half of the audience and is a cheap, visible signal that the product was built by people who use tools like Linear.
