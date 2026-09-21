# 05 — Reusable Components & Design Tokens

Building the Feed engine and the Detail shell as real abstractions is what makes 22 "areas" cost roughly the effort of 6.

## 1. Design tokens

```css
:root {
  /* neutrals — the entire UI palette */
  --bg:        #FFFFFF;
  --bg-subtle: #FAFAFA;
  --surface:   #FFFFFF;
  --border:    #EBEBEB;     /* hairline, used at 1px everywhere */
  --border-strong: #DCDCDC;
  --text:      #0A0A0A;
  --text-2:    #6B6B6B;     /* secondary */
  --text-3:    #9B9B9B;     /* tertiary / meta */
  --accent:    #0A0A0A;     /* yes: near-black. Content supplies color. */
  --accent-fg: #FFFFFF;
  --focus:     #2563EB;     /* only for focus rings */
  --danger:    #DC2626;

  --r-sm: 6px; --r-md: 8px; --r-lg: 12px;   /* cap at 12 */
  --sp: 4px;                                 /* 4/8/12/16/24/32/48/64 */
  --shadow-1: 0 1px 2px rgb(0 0 0 / .04);
  --shadow-pop: 0 8px 28px rgb(0 0 0 / .10);  /* popovers/overlays only */

  --dur: 140ms; --ease: cubic-bezier(.2,0,0,1);
}
:root:not([data-theme="light"]) { @media (prefers-color-scheme: dark) { … } }
:root[data-theme="dark"] {
  --bg: #0B0B0C; --bg-subtle: #111113; --surface: #131315;
  --border: #232326; --border-strong: #2E2E33;
  --text: #F5F5F5; --text-2: #A1A1A6; --text-3: #6E6E76;
  --accent: #F5F5F5; --accent-fg: #0B0B0C;
}
```

**Type:** one sans (Inter / Geist / system stack) + one mono for code/hex values.
Sizes: `11 / 12 / 13 / 15 / 18 / 24 / 32`. Weights: `400 / 500 / 600`. Tight tracking (−0.011em) on ≥24px only.

**Hard rules:** no gradient in the app shell. No shadow on cards at rest. No more than one solid-filled button per view. Icon stroke 1.5px, 16/20px sizes only.

## 2. Primitives (`components/ui/`)

`Button` (solid / outline / ghost / quiet, 3 sizes) · `IconButton` · `Input` · `Textarea` · `Select` · `Checkbox` · `Switch` · `RadioGroup` · `Chip` (filter / tag / removable / toggle) · `Badge` · `Avatar` · `AvatarStack` · `Tooltip` · `Popover` · `DropdownMenu` · `Dialog` · `Sheet` (bottom on mobile, right on desktop) · `Tabs` · `Separator` · `Skeleton` · `Toast` · `Spinner` · `ScrollArea` · `ContextMenu` · `Kbd` · `EmptyState` · `Pagination`.

Built on Radix primitives; styled in the project's own vocabulary, not a copied theme.

## 3. Feed engine (`components/feed/`)

The single most reused unit in the product.

```tsx
<Feed
  query={{ kind, platform, category, industry, style, color, tech,
           device, responsive, hasCode, tier, sourceId, collectionId, q }}
  sort="trending" | "new" | "saved" | "views" | "manual"
  layout="masonry" | "grid" | "list"
  card={ScreenCard | ComponentCard | LayoutCard | PaletteCard | CreatorCard}
  columns={{ base:2, md:3, lg:4, xl:5, '2xl':6 }}
  interleave={[…rails]}        // optional
  editable={false}             // enables drag-reorder in collections
  emptyState={<…/>}
/>
```

Sub-parts:
- `MasonryGrid` — column-balancing by shortest-column placement, **using aspect ratio from the DB, not measured DOM**. Items are absolutely positioned with computed transforms; `content-visibility: auto` plus windowing beyond ~400 items.
- `FeedItem` wrapper — focus management, keyboard targets, intersection tracking for view counts.
- `useInfiniteFeed` — keyset cursor, prefetch at 1.5 viewports, dedupe by id, restores scroll + loaded pages on back navigation (a `sessionStorage` snapshot keyed by route+query).
- `FilterBar` / `FilterPopover` / `ActiveFilters` / `SortMenu` / `DensityToggle` — all reading and writing the URL.
- `CardSkeleton` — randomized heights from the same aspect distribution as real data, so the skeleton doesn't reflow into the content.

### Card variants
| Card | Shows |
|---|---|
| `ScreenCard` | preview, hover actions, source lockup, badges |
| `ComponentCard` | tight crop, component type, framework badge, `</>` |
| `LayoutCard` | wireframe strip, section count, page type |
| `PaletteCard` | 5 color bands, name, source |
| `CollectionCard` | 4-image collage cover, name, count, privacy |
| `CreatorCard` | avatar, name, role, 3-work strip |
| `SourceCard` | logo, name, industry, screen count |
| `CategoryCard` | collage cover + label + count (Explore) |

All cards share `<CardShell>`: aspect-ratio box, blurhash background, image fade-in, hover overlay slot, focus ring, save affordance.

## 4. Detail shell (`components/detail/`)

```tsx
<DetailShell
  media={<MediaViewer …/>}
  rail={<MetaRail …/>}
  tabs={[{id,label,content}]}
  rails={[<RelatedRail …/>, …]}
  presentation="page" | "overlay"
/>
```
- `MediaViewer` — zoom, pan, long-page scroll, device switcher, light/dark switcher, video, thumbnail strip
- `MetaRail` — title, source lockup, SaveButton, ShareMenu, external link, tag list, metadata table
- `DeviceSwitcher` · `ThemeSwitcher` · `TabBar` · `RelatedRail` (horizontal scroller) · `AttributionBlock`

## 5. Save & collections (`components/save/`)

- `SaveButton` — **one click saves to the default board, with no dialog.** Optimistic, instant, then a toast: *Saved to Recently saved · Move to…* The `Move to…` path is where the collection picker appears. Forcing a board choice on every save is the single biggest drop-off in Pinterest-style products.
- `CollectionPicker` — searchable list, recent boards first, inline "create new"
- `SaveToast` · `CollectionCard` · `SectionChips` · `DraggableGrid` (dnd-kit) · `NoteEditor`

## 6. Breakdown (`components/breakdown/`)

The differentiating cluster. `SectionOutline` · `LayoutStrip` · `PaletteStrip` (with role labels + contrast pairs) · `TypeScaleTable` · `SpacingScale` · `RadiusShadowTable` · `ResponsiveComparison` · `CopyValue` (any token → CSS var / Tailwind / raw).

## 7. Layout builder (`components/builder/`)

`SectionPalette` · `BuilderCanvas` · `SectionBlock` · `PropertiesPanel` · `useBuilderState` (command-pattern undo/redo). Built on dnd-kit, same as collections drag — one drag system, not two.

## 8. Shell & system

`AppNavbar` · `MobileTopBar` · `BottomNav` · `MoreMenu` · `UserMenu` · `TeamSwitcher` · `SearchCommand` (⌘K) · `AuthGate` · `UpgradePrompt` (inline and quiet, never a modal over the feed) · `ThemeProvider` · `ToastProvider` · `AnalyticsProvider` · `ErrorBoundary` · `KeyboardShortcuts`.

## 9. Anti-patterns (enforce in review)

- ✗ Cards inside cards. ✗ A border and a shadow on the same element.
- ✗ Any modal that interrupts browsing (upgrade prompts are inline).
- ✗ Skeletons that don't match final dimensions.
- ✗ Hover-only actions with no touch equivalent.
- ✗ New one-off page layouts — if a page needs a layout that isn't Feed, Detail, Form or Table, that is a design review, not a code decision.
