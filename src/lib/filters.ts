/** Feed filters and the URL params that carry them — no catalogue here, so the browser can use it. */

export type Filters = {
  kind?: string;
  q?: string;
  category?: string;
  componentType?: string;
  industry?: string;
  style?: string;
  tech?: string;
  platform?: string;
  device?: string;
  code?: string;
  tier?: string;
  responsive?: string;
  threed?: string;
  /** text direction — only real captures are measured; procedural previews are all ltr */
  dir?: string;
  source?: string;
  sort?: string;
};

/** URL param → Filters key. Only two differ: `component` and `3d` read better in a URL. */
const KEYS: Record<string, keyof Filters> = {
  kind: "kind", q: "q", category: "category", component: "componentType", industry: "industry",
  style: "style", tech: "tech", platform: "platform", device: "device", code: "code", tier: "tier",
  responsive: "responsive", "3d": "threed", dir: "dir", source: "source", sort: "sort",
};

export const filterKey = (param: string) => KEYS[param];

export function filtersFromParams(sp: Record<string, string | string[] | undefined>): Filters {
  const f: Filters = {};
  for (const [param, key] of Object.entries(KEYS)) {
    const v = sp[param];
    f[key] = Array.isArray(v) ? v[0] : v;
  }
  return f;
}

/** One URL param (`component=hero`) as Filters (`{ componentType: "hero" }`), with no other keys. */
export const paramFilter = (param: string, value: string): Filters => ({ [KEYS[param]]: value });

/** What each browse feed contains. Pages and every link into them share these, so counts can't drift. */
export const SCOPES = {
  web: { path: "/web", base: { kind: "screen", platform: "web" } },
  apps: { path: "/apps", base: { kind: "screen", device: "mobile" } },
  components: { path: "/components", base: { kind: "component" } },
} satisfies Record<string, { path: string; base: Filters }>;
export type Scope = keyof typeof SCOPES;
