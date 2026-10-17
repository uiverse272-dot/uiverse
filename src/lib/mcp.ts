import { DICTS } from "@/i18n/dict";
import { cropShot } from "./shots";
import { ITEMS, type Item } from "./data";
import { searchItems, applyFilters } from "./query";
import { buildPrompt, DEFAULT_OPTIONS, STACKS, TOOLS, type StackId, type ToolId } from "./prompt";
import { colorRoles, fontsPlain, layoutSpec, responsiveRulesPlain, sections, spacingScale, typeScale } from "./spec";
import { name, CATEGORIES, COMPONENT_TYPES, INDUSTRIES } from "./taxonomy";
import type { Viewport } from "./captures";

/**
 * The Uiverse index as MCP tools, so a coding agent (Claude, Cursor, Codex…) can look up real
 * interfaces mid-task: search, read a measured spec, see the screenshot, get a build prompt.
 *
 * Only real captures are exposed. The procedural catalogue is fine for browsing the prototype,
 * but an agent treats what it gets as evidence, so it must only ever get measured data.
 */

const REAL = () => ITEMS.filter((i) => i.capture);

type Json = Record<string, unknown>;
export type ToolResult = { content: Json[]; isError?: boolean; structuredContent?: Json };

const text = (t: string, structuredContent?: Json): ToolResult => ({ content: [{ type: "text", text: t }], structuredContent });
const fail = (t: string): ToolResult => ({ content: [{ type: "text", text: t }], isError: true });

const COMPONENT_SLUGS = COMPONENT_TYPES.map((c) => c.slug);

export const TOOL_DEFS = [
  {
    name: "search_interfaces",
    title: "Search real interfaces",
    description:
      "Search Uiverse's index of real, live-captured web interfaces and the components cropped from them. " +
      "Accepts natural language ('arabic fintech hero', 'dark saas pricing') plus optional filters. " +
      "Every result was rendered and measured from a live site — colours, type, spacing and layout are real values. " +
      "Use direction='rtl' for Arabic/right-to-left interfaces. Returns slugs to pass to get_interface_spec, get_screenshot or get_implementation_prompt.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text, e.g. 'arabic fintech hero' or 'footer'." },
        direction: { type: "string", enum: ["rtl", "ltr"], description: "Text direction of the interface." },
        kind: { type: "string", enum: ["screen", "component"], description: "Whole pages or single components." },
        component: { type: "string", enum: COMPONENT_SLUGS, description: "Component type (implies kind=component)." },
        industry: { type: "string", enum: INDUSTRIES.map((i) => i.slug) },
        category: { type: "string", enum: CATEGORIES.map((c) => c.slug) },
        limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_interface_spec",
    title: "Get a measured design spec",
    description:
      "The measured design spec of one interface or component: colour roles (hex), type scale, font families, spacing scale and base unit, " +
      "radius, container width, ordered section outline and how each section changes between 1440px, 834px and 390px. " +
      "Use it as reference values when building something in the same style.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "A slug from search_interfaces." } },
      required: ["slug"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_screenshot",
    title: "See an interface",
    description:
      "The screenshot of an interface or component as an image, at laptop (1440px), tablet (834px) or mobile (390px) width. " +
      "For a component it is cropped to that component. Long pages are cut at max_height CSS pixels from the top.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        viewport: { type: "string", enum: ["desktop", "tablet", "mobile"], default: "desktop" },
        max_height: { type: "integer", minimum: 400, maximum: 6000, default: 2400 },
      },
      required: ["slug"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_implementation_prompt",
    title: "Get an implementation prompt",
    description:
      "A ready-to-use build prompt for this interface's structure and style, written from its measured spec for the given tool and stack. " +
      "It never contains the source brand's name or copy. For right-to-left sources it includes RTL-first build rules.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        tool: { type: "string", enum: TOOLS.map((t) => t.id), default: "claude" },
        stack: { type: "string", enum: STACKS.map((s) => s.id), default: "nextjs" },
      },
      required: ["slug"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_facets",
    title: "What's in the index",
    description: "Counts of indexed interfaces by direction, industry, page type and component type — useful before searching.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
] as const;

/* ------------------------------------------------------------------ */

const pageUrl = (i: Item, origin: string) => `${origin}/${i.kind === "component" ? "component" : "screen"}/${i.slug}`;
const find = (slug: unknown) => (typeof slug === "string" ? REAL().find((i) => i.slug === slug) : undefined);
const missing = (slug: unknown) =>
  fail(`No interface with slug "${String(slug)}". Use search_interfaces to find slugs — only real captures are indexed.`);

function summary(i: Item, origin: string) {
  return {
    slug: i.slug,
    kind: i.kind,
    title: i.title,
    component: i.componentType,
    source: i.source.name,
    domain: i.source.domain,
    industry: i.industry,
    category: i.category,
    direction: i.capture!.dir,
    accent: i.palette.accent,
    background: i.palette.bg,
    fonts: i.capture!.fonts,
    uiverse: pageUrl(i, origin),
    live: i.capture!.url,
  };
}

function search(args: Json, origin: string): ToolResult {
  const limit = Math.min(Math.max(Number(args.limit ?? 10), 1), 50);
  const kind = args.component ? "component" : (args.kind as string | undefined);
  const extra = {
    kind,
    componentType: args.component as string | undefined,
    industry: args.industry as string | undefined,
    category: args.category as string | undefined,
    dir: args.direction as string | undefined,
  };
  const q = typeof args.query === "string" ? args.query : "";
  const { results, terms } = q ? searchItems(q, extra) : { results: applyFilters(ITEMS, extra), terms: [] };
  const real = results.filter((i) => i.capture);
  const items = real.slice(0, limit).map((i) => summary(i, origin));
  const read = terms.length ? ` (read as: ${terms.map((t) => `${DICTS.en.search.dimensions[t.param]} = ${t.label}`).join(", ")})` : "";
  const head = `${real.length} match${real.length === 1 ? "" : "es"}${read}; showing ${items.length}.`;
  return text(`${head}\n\n${JSON.stringify(items, null, 2)}`, { total: real.length, results: items });
}

function spec(args: Json, origin: string): ToolResult {
  const i = find(args.slug);
  if (!i) return missing(args.slug);
  const cap = i.capture!;
  const layout = layoutSpec(i);
  const space = spacingScale(i);
  const f = fontsPlain(i);
  const md = [
    `# ${i.source.name} — ${i.title}${i.kind === "component" ? " (component)" : ""}`,
    "",
    `Captured ${cap.capturedAt.slice(0, 10)} from ${cap.url} · ${cap.dir === "rtl" ? "right-to-left" : "left-to-right"}${cap.lang ? ` (${cap.lang})` : ""} · ${name(INDUSTRIES, i.industry)} · ${name(CATEGORIES, i.category)}`,
    `Uiverse: ${pageUrl(i, origin)}`,
    "",
    "## Colour roles",
    "",
    "| Role | Token | Hex |",
    "| --- | --- | --- |",
    ...colorRoles(i).map((r) => `| ${r.label} | --${r.token} | ${r.value} |`),
    "",
    "## Typography",
    "",
    f
      ? `Headings: ${f.heading}. Body: ${f.body}.${f.branded ? " A brand's own typeface is licensed to it alone — substitute a freely licensed face with similar proportions." : ""}`
      : "",
    "",
    "| Step | Size | Weight | Used for |",
    "| --- | --- | --- | --- |",
    ...typeScale(i).map((t) => `| ${t.name} | ${t.size}px | ${t.weight} | ${t.use} |`),
    `Body: ${layout.body}`,
    "",
    "## Space and layout",
    "",
    `- Base unit: ${space.base}px; most-used values: ${space.values.join(", ")}`,
    `- Radius: ${layout.radius}`,
    `- Container: ${layout.container}; ${layout.columns}`,
    "",
    "## Sections, top to bottom",
    "",
    ...sections(i).map((s) => `${s.index}. ${s.label} (${s.type}) — ${s.note}`),
    "",
    "## Responsive (1440 → 834 → 390px, measured)",
    "",
    ...responsiveRulesPlain(i).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "_Reference values from a real product. Reuse the decisions, not the brand: no logos, names or copy._",
  ].filter((l, n, a) => !(l === "" && a[n - 1] === ""));
  return text(md.join("\n"));
}

async function screenshot(args: Json): Promise<ToolResult> {
  const i = find(args.slug);
  if (!i) return missing(args.slug);
  const asked = (["desktop", "tablet", "mobile"].includes(args.viewport as string) ? args.viewport : "desktop") as Viewport;
  const maxH = Math.min(Math.max(Number(args.max_height ?? 2400), 400), 6000);
  /* a component that couldn't be matched at the asked width is shown at laptop width, and says so */
  const own = i.kind === "component" ? i.capture!.crops?.[asked] : undefined;
  const vp: Viewport = i.kind === "component" && !own ? "desktop" : asked;
  const crop = i.kind === "component" ? (own ?? i.crop) : undefined;
  const note = vp !== asked ? ` This component couldn't be matched at ${asked} width, so this is the laptop crop.` : "";

  const shot = i.capture!.shots[vp];
  const { jpeg, h, cut } = await cropShot(shot, crop, { maxH, width: Math.min(shot.css, 1200), quality: 72 });

  return {
    content: [
      { type: "image", data: jpeg.toString("base64"), mimeType: "image/jpeg" },
      {
        type: "text",
        text: `${i.source.name} — ${i.title}, ${vp} (${shot.css}px wide), ${Math.round(h)}px tall${cut ? " (cut at max_height)" : ""}.${note}`,
      },
    ],
  };
}

function prompt(args: Json): ToolResult {
  const i = find(args.slug);
  if (!i) return missing(args.slug);
  const tool = (TOOLS.some((t) => t.id === args.tool) ? args.tool : "claude") as ToolId;
  const stack = (STACKS.some((s) => s.id === args.stack) ? args.stack : "nextjs") as StackId;
  return text(buildPrompt(i, { ...DEFAULT_OPTIONS, tool, stack }));
}

function facets(): ToolResult {
  const real = REAL();
  const count = (key: (i: Item) => string | undefined, list = real) => {
    const m: Record<string, number> = {};
    for (const i of list) {
      const k = key(i);
      if (k) m[k] = (m[k] ?? 0) + 1;
    }
    return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]));
  };
  const screens = real.filter((i) => i.kind === "screen");
  const out = {
    screens: screens.length,
    components: real.length - screens.length,
    sources: new Set(real.map((i) => i.source.slug)).size,
    direction: count((i) => i.capture!.dir, screens),
    industry: count((i) => i.industry, screens),
    category: count((i) => i.category, screens),
    component: count((i) => i.componentType),
  };
  return text(JSON.stringify(out, null, 2), out);
}

export async function callTool(toolName: string, args: Json, origin: string): Promise<ToolResult> {
  switch (toolName) {
    case "search_interfaces":
      return search(args, origin);
    case "get_interface_spec":
      return spec(args, origin);
    case "get_screenshot":
      return screenshot(args);
    case "get_implementation_prompt":
      return prompt(args);
    case "list_facets":
      return facets();
    default:
      return fail(`Unknown tool "${toolName}".`);
  }
}
