import type { NextConfig } from "next";

/* capture screenshots live in a bucket once deployed — see lib/captureSrc.ts */
const captures = process.env.NEXT_PUBLIC_CAPTURES_URL?.replace(/\/+$/, "");
const dev = process.env.NODE_ENV === "development";

/*
 * Content Security Policy, without nonces. A nonce has to be minted per request, which would make
 * every page dynamic; instead inline scripts are allowed. That covers the theme script in the root
 * layout (shell/Theme.tsx) and the ones Next injects to hydrate, at the cost of not blocking an
 * injected inline script — React's escaping is the defence against that.
 */
const csp = [
  "default-src 'self'",
  /* 'unsafe-eval' in development only: React uses eval there to rebuild server error stacks */
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  /* style={…} attributes are everywhere (and React sets some itself) */
  "style-src 'self' 'unsafe-inline'",
  /* next/image is served from /_next/image; the bucket is for anything loaded from it directly.
     data: and blob: as Next's guide allows, for image placeholders and the dev overlay */
  ["img-src 'self' data: blob:", captures && new URL(captures).origin].filter(Boolean).join(" "),
  /* next/font self-hosts every face under /_next/static */
  "font-src 'self'",
  /* Better Auth and server actions call this origin; Google/GitHub sign-in is a navigation, not a
     fetch. Dev adds the HMR websocket for browsers whose 'self' doesn't cover ws: */
  `connect-src 'self'${dev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* frame-ancestors above, for browsers that predate it */
  { key: "X-Frame-Options", value: "DENY" },
  /* nothing here uses device APIs; clipboard (copy buttons) is left alone */
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), display-capture=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()",
  },
];

/*
 * Uiverse Originals (public/craft/, lib/craft.ts): self-contained pages that run in a frame on the
 * detail page. Framed by this site only, sandboxed even when opened on their own, and allowed no
 * requests at all — everything a piece needs is inline.
 */
const craft = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'none'",
      "script-src 'unsafe-inline'",
      "style-src 'unsafe-inline'",
      "img-src data:",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'self'",
      "sandbox allow-scripts",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  /* the local embedded Postgres ships WebAssembly and data files that must load from node_modules as-is */
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    /*
     * Every image is already sized by the script that wrote it (capture cards and first screens,
     * originals' posters, finds), so nothing is re-encoded on request. That also keeps images up
     * on Vercel's Hobby plan, whose optimizer answers 402 for new images once its monthly
     * allowance is used.
     */
    unoptimized: true,
    ...(captures ? { remotePatterns: [new URL(`${captures}/captures/**`)] } : {}),
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: security },
      /* after the site-wide headers: the same keys, set later, win */
      { source: "/craft/:file", headers: craft },
      /* HSTS in production, never on localhost (a local `next start` would pin it to HTTPS).
         No includeSubDomains: other subdomains of a custom domain aren't ours to decide for */
      ...(dev
        ? []
        : [
            {
              source: "/:path*",
              missing: [{ type: "host" as const, value: "(?:localhost|127\\.0\\.0\\.1)" }],
              headers: [{ key: "Strict-Transport-Security", value: "max-age=63072000" }],
            },
          ]),
    ];
  },
};

export default nextConfig;
