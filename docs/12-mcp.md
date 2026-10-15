# 12 — MCP server

Uiverse is also a tool coding agents can call. `POST /api/mcp` is a remote MCP server
(Streamable HTTP, stateless, JSON responses) over the **real captures only** — an agent treats
what it gets as evidence, so it never sees the procedural catalogue.

## Connect

| Client | How |
|---|---|
| Claude Code (this repo) | `.mcp.json` is checked in — start `npm run dev`, approve `uiverse` when asked |
| Claude Code (anywhere) | `claude mcp add --transport http uiverse https://<host>/api/mcp` |
| Cursor | Settings → MCP → add server, type `http`, URL `https://<host>/api/mcp` |
| Claude.ai / Desktop | Settings → Connectors → add custom connector with the URL (needs a public host) |

## Tools

| Tool | Returns |
|---|---|
| `search_interfaces` | Real pages/components for a natural-language query plus filters (`direction: "rtl"`, industry, category, component, kind) |
| `get_interface_spec` | Measured colour roles, type scale, fonts, spacing, radius, container, section outline, responsive rules (Markdown) |
| `get_screenshot` | The capture as an image at 1440 / 834 / 390px — cropped to the component for component slugs |
| `get_implementation_prompt` | A build brief for Claude / ChatGPT / Cursor / Codex / v0 / Lovable / Bolt × Next.js / React / HTML / Vue / SwiftUI |
| `list_facets` | Counts by direction, industry, page type and component type |

Typical agent flow: `search_interfaces("arabic fintech hero")` → `get_screenshot` to look →
`get_interface_spec` for exact values → build.

## Boundaries

- Read-only and public: no auth, no sessions, CORS open.
- No brand copy leaves through the spec or prompt tools — headings are kept out, and every
  output says to reuse decisions, not names, logos or words. Screenshots are the capture itself,
  under the attribution policy (`docs/08` §4).
- `get_screenshot` reads `public/captures` when the file is there and otherwise fetches from
  `NEXT_PUBLIC_CAPTURES_URL`, so a deploy only needs the bucket (`npm run capture:upload`).
- Before a public deploy: rate-limit `/api/mcp`.
