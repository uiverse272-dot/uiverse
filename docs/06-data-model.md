# 06 — Data Model

Postgres. IDs are ULIDs (sortable, safe in URLs). Every table has `created_at`, `updated_at`, and `deleted_at` (soft delete).

## 1. The central decision: one `item` table

Everything browsable — screens, components, layouts, palettes, 3D pieces — shares a **common discovery contract**: it has a preview image with known dimensions, a title, a creator, taxonomy, and metrics. Modelling them as five tables means five feed queries, five search indexes, five save tables and five card pipelines.

**Class-table inheritance:** one `item` row for the shared contract + one `*_detail` row for kind-specific fields.

```
                    ┌──────────┐
                    │  source  │  a real product/site (or "original" for uploads)
                    └────┬─────┘
                         │ 1:N
                    ┌────▼─────┐
                    │ capture  │  a dated snapshot
                    └────┬─────┘
                         │ 1:N
     ┌───────────────────┼───────────────────┐
     │                   │                   │
┌────▼────┐        ┌─────▼────┐         ┌────▼───┐
│  flow   │◄──────►│  screen  │────────►│ block  │  (crop of a screen)
└─────────┘  M:N   └──────────┘   1:N   └────────┘
                         │                   │
                         └────► item ◄───────┘
                                 ▲
              ┌──────────────────┼──────────────────┐
         layout_detail      palette_detail     component_detail
```

`screen` and `block` each own an `item` row (`item.kind = 'screen' | 'component'`). Layouts and palettes own an `item` row too (`kind='layout'|'palette'`) so they appear in the same feeds, searches and collections with zero extra code.

## 2. Core tables

### `item` — the discovery contract
| Column | Type | Notes |
|---|---|---|
| `id` | ulid PK | |
| `kind` | enum | `screen`, `component`, `layout`, `palette`, `three_d` |
| `slug` | text unique | `{id-prefix}-{title-slug}` |
| `title` | text | |
| `description` | text null | |
| `preview_media_id` | fk media | |
| `aspect_ratio` | numeric | **denormalized; the masonry needs it before any image loads** |
| `dominant_color` | text | hex, for placeholder + color search |
| `owner_user_id` | fk user null | who submitted it |
| `credited_creator_id` | fk creator null | who made it (may differ) |
| `source_id` | fk source null | |
| `platform` | enum | `web`,`ios`,`android`,`mobile_web`,`ipad`,`desktop` |
| `device` | enum | `desktop`,`tablet`,`mobile` |
| `is_responsive` | bool | |
| `has_code` | bool | |
| `code_license` | enum null | see §7 |
| `tier` | enum | `free`,`premium` |
| `status` | enum | `draft`,`pending`,`published`,`rejected`,`hidden` |
| `visibility` | enum | `public`,`unlisted` |
| `save_count` / `view_count` / `like_count` | int | counter caches, rebuilt nightly |
| `rank_score` | numeric | materialized trending score |
| `embedding` | vector(768) | text+image joint embedding, pgvector |
| `phash` | bigint | perceptual hash, duplicate detection |
| `published_at` | timestamptz | |

Indexes: `(kind, status, rank_score desc, id desc)` · `(kind, status, published_at desc, id desc)` · GIN on the taxonomy join · `ivfflat` on `embedding` · btree `phash`.

### `source` — a real product or site
`id`, `slug`, `name`, `domain`, `logo_media_id`, `description`, `industry_id`, `tech[]`, `url`, `is_original` (true for user-original work), `opt_out` (bool — honours takedown requests platform-wide), `first_seen_at`, `last_captured_at`.

### `capture` — a dated snapshot of a source
`id`, `source_id`, `captured_at`, `viewport` (`desktop|tablet|mobile`), `capture_method` (`crawler|manual|upload`), `page_url`, `dom_snapshot_ref` (null for uploads), `status`.

### `screen` (1:1 with an `item` of kind `screen`)
`id`, `item_id`, `capture_id`, `page_type` (landing, pricing, dashboard, checkout, onboarding, settings, empty_state…), `page_url`, `full_height_media_id`, `scroll_video_media_id`, `desktop_item_id` / `tablet_item_id` / `mobile_item_id` (self-referencing responsive siblings), `type_scale` jsonb, `spacing_scale` jsonb, `grid_info` jsonb, `notes_md`.

### `block` (1:1 with an `item` of kind `component`)
`id`, `item_id`, `screen_id`, `component_type_id`, `order_index` (position down the page — **this is what makes layouts derivable**), `crop` (x,y,w,h), `bbox_source` (`dom|vision|manual`), `dom_selector`, `confidence`.

### `flow`
`id`, `source_id`, `name`, `slug`, `description`, `platform`. Join `flow_screen(flow_id, screen_id, step_index)`.

### `layout_detail`
`id`, `item_id`, `page_type`, `derived_from_screen_id` null, `is_user_created` bool. Sections in `layout_section(id, layout_id, order_index, component_type_id, label, notes, linked_item_id, responsive_intent)`.

### `palette_detail`
`id`, `item_id`, `extracted_from_item_id` null. Colors in `palette_color(id, palette_id, order_index, hex, oklch, role)` where role ∈ `bg,surface,text,text_muted,accent,accent_fg,border,success,warning,danger`.

### `media`
`id`, `storage_key`, `mime`, `width`, `height`, `bytes`, `blurhash`, `dominant_color`, `variants` jsonb (generated sizes), `duration_ms` null.
**Width and height are mandatory at insert.** No media row exists without dimensions; this is what guarantees zero layout shift.

## 3. Taxonomy

Five dimensions, five tables, **one shared join** (polymorphic by dimension rather than five join tables):

`category`, `industry`, `style`, `technology`, `component_type` — each: `id`, `slug`, `name`, `description`, `cover_media_id`, `parent_id` null, `item_count` (cached), `is_featured`.

`item_taxonomy(item_id, dimension, term_id, confidence, assigned_by)` where `assigned_by ∈ {ai, user, admin}`. Keeping AI-assigned terms distinguishable from human-confirmed ones is what allows retro-fixing a bad model without destroying curated data.

`tag(id, slug, name, alias_of_id null, item_count)` + `item_tag(item_id, tag_id)`. `alias_of_id` makes the admin "merge tags" action non-destructive and reversible.

`item_color(item_id, hex, oklch, coverage_pct, role)` — populated by extraction; color search runs against this with an OKLCH distance threshold.

## 4. People

### `user`
`id`, `email`, `email_verified_at`, `handle` unique, `name`, `avatar_media_id`, `bio`, `location`, `role` (`user|moderator|admin`), `plan` (`free|pro|team`), `interests` jsonb (onboarding seed), `onboarded_at`, `last_active_at`.

### `creator_profile` (1:1 optional with user)
`user_id` PK, `headline`, `kind` (`designer|developer|studio`), `links` jsonb, `available_for_work` bool, `hourly_rate_range`, `services` jsonb, `verified_at`.
**User and Creator are one identity.** A separate creator entity creates two profile pages, two follow targets and a permanent merge problem.

### `follow`
`(follower_user_id, target_type, target_id)` where `target_type ∈ {user, source, tag, collection}`. One table for all follow types; the For You feed reads it as a single query.

## 5. Saving & organising

### `collection`
`id`, `owner_type` (`user|workspace`), `owner_id`, `slug`, `name`, `description`, `cover_media_id` null, `visibility` (`private|unlisted|public`), `is_default` (the "Recently saved" bucket), `item_count`, `position`.

**`owner_type` is what makes team collections free.** No separate `team_collection` table.

### `collection_section`
`id`, `collection_id`, `name`, `order_index`.

### `save` — the pin
`id`, `user_id`, `item_id`, `collection_id`, `section_id` null, `note` text null, `order_index`, `created_at`.
Unique on `(user_id, item_id, collection_id)` — same item can live in several boards, but not twice in one.

### `collaborator`
`(collection_id, user_id, role)` where role ∈ `editor|viewer`.

## 6. Teams

`workspace(id, slug, name, logo_media_id, plan, seats, owner_user_id)`
`workspace_member(workspace_id, user_id, role)` — `owner|admin|editor|viewer`
`project(id, workspace_id, name, slug, description, status, collection_id, layout_id, palette_id)` — a project **points at** existing objects; it does not copy them.
`project_note(id, project_id, author_id, body_md)`

## 7. Code & licensing

`code_snippet(id, item_id, language, framework, source_kind, license, body, dependencies jsonb, created_by)`

`source_kind ∈ { first_party, licensed, ai_reimplementation, community }` and `license ∈ { mit, apache2, cc0, proprietary, unknown }`.

**Rule enforced in the data layer, not just the UI:** a snippet whose `source_kind` is `scraped` cannot exist — there is no such enum value. Code is only ever shown when it was contributed under a license or generated as a clearly-labelled re-implementation. This is a legal boundary, so it lives in the schema.

## 8. Signals, moderation, billing

`item_view(item_id, user_id null, session_id, referrer, created_at)` — partitioned monthly, rolled up nightly into `item_stats_daily`.
`like(user_id, item_id)` — **see `10-ux-critique.md` §2.3; recommended to drop for MVP.** Table listed for completeness only.
`report(id, reporter_user_id null, target_type, target_id, reason, details, status, resolution_note, resolved_by, sla_due_at)`
`takedown_request(id, source_domain, requester_email, scope, status, actioned_at)` — separate from reports because it has legal SLA and affects a whole `source`.
`moderation_event(id, item_id, actor_id, action, reason, before jsonb, after jsonb)` — full audit.
`subscription(id, subject_type(user|workspace), subject_id, plan, status, provider_customer_id, provider_subscription_id, current_period_end, cancel_at)`
`feature_usage(subject_id, feature, period, count)` — enforces free-tier limits (3 AI prompts/month etc.).
`commission_request(…)` ⏳ — Phase 3; schema deferred until the feature is committed.

## 9. Relationship summary

| Relationship | Cardinality |
|---|---|
| source → capture → screen → block | 1:N:N:N |
| screen ↔ flow | M:N via `flow_screen` |
| screen ↔ item, block ↔ item | 1:1 |
| item ↔ taxonomy term | M:N via `item_taxonomy` |
| item ↔ tag | M:N |
| user ↔ item (save) | M:N through `collection` |
| collection → section → save | 1:N:N |
| collection owner | polymorphic: user or workspace |
| user ↔ creator_profile | 1:0..1 |
| user ↔ workspace | M:N with role |
| project → collection/layout/palette | references, not ownership |
| item → code_snippet | 1:N (one per framework) |
| screen → screen (responsive siblings) | self-referencing 1:1 per device |

## 10. Derived data policy

Anything that can be recomputed is marked as such and never hand-edited without setting an override flag: `rank_score`, `item_count` on taxonomy, `save_count`, `aspect_ratio`, `dominant_color`, `embedding`, `phash`, layout derived from block order, palette extracted from screen. Every derived field carries the job version that produced it, so a model change can be rolled forward selectively instead of requiring a full re-ingest.
