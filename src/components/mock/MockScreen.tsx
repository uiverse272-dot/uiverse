"use client";

/*
 * A client boundary on purpose. From a server page, a preview's whole element tree would be
 * serialised into the RSC payload as well as the HTML — ~2.6 MB on /creators. As a client
 * component only the item's props travel; the HTML is still server-rendered.
 */
import type { ComponentType, CSSProperties } from "react";
import { ARCHETYPES, type Archetype, type Item } from "@/lib/data";
import { mkU, pick, Col, Row, B, VIEWPORTS, type U, type Viewport } from "./primitives";
import * as S from "./sections";

/**
 * Procedurally rendered interface previews.
 *
 * Everything is drawn in `cqw` units against a container query, so a preview is
 * resolution-independent and its geometry is known before paint — which is what
 * lets the masonry lay out with zero shift. No external images, no real brands.
 *
 * Every design can be drawn at three viewports (laptop, tablet, mobile). Units
 * are design pixels at that viewport's width, and each section reflows for it —
 * nothing is simply scaled down. Without `viewport` a design renders at its
 * native device, which is what feed cards show.
 */

type Props = { item: Item; u: U; vp: Viewport; fill: CSSProperties };

/*
 * Page types that are a straight run of full-width sections, each with its height in design px
 * at the native viewport (measured on /dev-measure). The heights let a cropped preview skip
 * every section that starts below the crop — an Explore tile of a landing page shows the nav and
 * hero, so drawing the other six sections is pure DOM weight.
 */
const SCROLLING: Partial<Record<Archetype, [ComponentType<S.SecProps>, number][]>> = {
  "saas-landing": [
    [S.Navbar, 90], [S.Hero, 1211], [S.LogoCloud, 171], [S.FeatureGrid, 499],
    [S.StatsBand, 188], [S.Testimonial, 337], [S.CtaBand, 381], [S.Footer, 202],
  ],
  pricing: [[S.Navbar, 90], [S.SectionHeader, 193], [S.BillingToggle, 96], [S.PricingTiers, 397], [S.Faq, 372], [S.Footer, 202]],
  ecommerce: [[S.ShopNav, 77], [S.CampaignHero, 520], [S.CategoryRow, 90], [S.ProductGrid, 844], [S.CtaBand, 381], [S.Footer, 202]],
  portfolio: [[S.MinimalNav, 81], [S.TypeStatement, 448], [S.WorkGrid, 970], [S.IndexList, 405], [S.Footer, 202]],
  editorial: [[S.Masthead, 167], [S.LeadStory, 824], [S.ArticleIndex, 453], [S.Footer, 202]],
  agency: [[S.AgencyHero, 880], [S.ServicesList, 592], [S.WorkGrid, 970], [S.CtaBand, 381]],
};

/**
 * How many sections of a scrolling page reach into a frame `visible` design px tall. One extra is
 * kept as a margin, since a long title can wrap and push the sections below it down a little.
 */
function sectionsShown(archetype: Archetype, visible: number) {
  const sections = SCROLLING[archetype] ?? [];
  let top = 0;
  let n = 0;
  while (n < sections.length && top < visible) top += sections[n++][1];
  return Math.min(n + 1, sections.length);
}

function Page({ item, u, vp, fill, upTo = Infinity }: Props & { upTo?: number }) {
  const p = item.palette;
  const props = { u, p, item, vp };
  const v = pick(vp);

  const scrolling = SCROLLING[item.archetype];
  if (scrolling) {
    return scrolling.slice(0, upTo).map(([Section], i) => <Section key={i} {...props} />);
  }

  switch (item.archetype) {
    case "dashboard":
      if (vp === "mobile") {
        /* sidebar → menu button + bottom tab bar; panels stack */
        return (
          <Col u={u} style={fill}>
            <S.TopBar {...props} />
            <Col u={u} gap={14} grow style={{ padding: u(16) }}>
              <S.StatCards {...props} />
              <Col u={u} style={{ height: u(230) }}>
                <S.ChartPanel {...props} />
              </Col>
              <S.ActivityList {...props} />
              <S.DataTable {...props} />
            </Col>
            <S.TabBar {...props} />
          </Col>
        );
      }
      return (
        <Row u={u} align="stretch" style={fill}>
          <S.Sidebar {...props} />
          <Col u={u} grow style={{ minWidth: 0 }}>
            <S.TopBar {...props} />
            <Col u={u} gap={v(14, 16, 0)} grow style={{ padding: u(20), minHeight: 0 }}>
              <S.StatCards {...props} />
              {vp === "desktop" ? (
                <Row u={u} gap={14} align="stretch" style={{ height: u(300) }}>
                  <S.ChartPanel {...props} />
                  <S.ActivityList {...props} />
                </Row>
              ) : (
                <>
                  <Col u={u} style={{ height: u(280) }}>
                    <S.ChartPanel {...props} />
                  </Col>
                  <S.ActivityList {...props} />
                </>
              )}
              <S.DataTable {...props} />
            </Col>
          </Col>
        </Row>
      );
    case "checkout":
      return (
        <Col u={u} style={fill}>
          <Row u={u} justify="center" style={{ padding: `${u(v(24, 22, 18))} 0`, borderBottom: `${u(1)} solid ${p.border}` }}>
            <Row u={u} gap={10}>
              <B u={u} w={20} h={20} r={999} bg={p.accent} />
            </Row>
          </Row>
          {vp === "mobile" ? (
            <>
              <S.OrderSummaryBar {...props} />
              <S.CheckoutForm {...props} />
            </>
          ) : (
            <Row u={u} align="stretch" grow style={{ minHeight: 0 }}>
              <S.CheckoutForm {...props} />
              <S.OrderSummary {...props} />
            </Row>
          )}
        </Col>
      );
    case "auth":
      /* the art panel is a laptop luxury; smaller screens get the form alone */
      return (
        <Row u={u} align="stretch" style={fill}>
          <S.AuthCard {...props} />
          {vp === "desktop" ? <S.AuthArt {...props} /> : null}
        </Row>
      );
    case "docs":
      if (vp === "mobile") {
        return (
          <Col u={u} style={fill}>
            <S.DocsMobileBar {...props} />
            <S.DocsBody {...props} />
          </Col>
        );
      }
      return (
        <Row u={u} align="stretch" style={fill}>
          <S.DocsSidebar {...props} />
          <S.DocsBody {...props} />
          {vp === "desktop" ? <S.DocsToc {...props} /> : null}
        </Row>
      );
    default:
      return <App item={item} u={u} vp={vp} fill={fill} />;
  }
}

/** Native mobile apps. Tablet keeps the status and tab bars; laptop becomes a web app. */
function App({ item, u, vp, fill }: Props) {
  const p = item.palette;
  const props = { u, p, item, vp };
  const body = (
    <>
      {item.archetype === "mobile-finance" ? <S.MobileFinance {...props} /> : null}
      {item.archetype === "mobile-feed" ? <S.MobileFeed {...props} /> : null}
      {item.archetype === "mobile-onboarding" ? <S.MobileOnboarding {...props} /> : null}
      {item.archetype === "mobile-profile" ? <S.MobileProfile {...props} /> : null}
    </>
  );
  const tabs = item.archetype !== "mobile-onboarding";

  if (vp === "desktop") {
    return (
      <Row u={u} align="stretch" style={fill}>
        {tabs ? <S.AppSideNav {...props} /> : null}
        {body}
      </Row>
    );
  }
  return (
    <Col u={u} style={fill}>
      <S.StatusBar {...props} />
      {body}
      {tabs ? <S.TabBar {...props} /> : null}
    </Col>
  );
}

/* component types that fill their frame rather than sitting at natural height */
const FILLS = new Set(["login", "checkout", "sidebar", "charts", "list"]);

/** A single component block, rendered on its own — this is what `kind: "component"` shows. */
function BlockOnly({ item, u, vp, fill }: Props) {
  const p = item.palette;
  const props = { u, p, item, vp };
  const v = pick(vp);
  const gut = u(v(28, 24, 16));
  const pad = { padding: `${gut} 0` };
  const phoneApp = item.device === "mobile" && vp === "mobile";

  switch (item.componentType) {
    case "navbar":
      return <div style={{ paddingTop: u(6) }}>{phoneApp ? <S.StatusBar {...props} /> : <S.Navbar {...props} />}</div>;
    case "hero":
      return (
        <div style={{ transform: "scale(0.94)", transformOrigin: "top center" }}>
          <S.Hero {...props} />
        </div>
      );
    case "pricing":
      return (
        <div style={pad}>
          <S.BillingToggle {...props} />
          <S.PricingTiers {...props} />
        </div>
      );
    case "table":
      return <div style={{ padding: gut }}><S.DataTable {...props} /></div>;
    case "stats":
      return <div style={{ padding: gut }}><S.StatCards {...props} /></div>;
    case "testimonials":
      return <S.Testimonial {...props} />;
    case "cta":
      return <div style={{ paddingTop: u(20) }}><S.CtaBand {...props} /></div>;
    case "footer":
      return <div style={{ paddingTop: u(10) }}><S.Footer {...props} /></div>;
    case "login":
      return (
        <Row u={u} align="stretch" style={fill}>
          <S.AuthCard {...props} />
        </Row>
      );
    case "checkout":
      return (
        <Row u={u} align="stretch" style={fill}>
          <S.CheckoutForm {...props} />
        </Row>
      );
    case "sidebar":
      /* on a phone the sidebar is a drawer over the dimmed page */
      return (
        <Row u={u} align="stretch" style={fill}>
          <S.Sidebar {...props} />
          <div style={{ flex: 1, background: vp === "mobile" ? `${p.text}33` : p.bg }} />
        </Row>
      );
    case "charts":
      return <div style={{ padding: gut, display: "flex", ...fill }}><S.ChartPanel {...props} /></div>;
    case "filters":
      return <div style={{ paddingTop: u(18) }}><S.CategoryRow {...props} /></div>;
    case "cards":
      return item.device === "mobile" ? (
        <Col u={u} style={fill}>
          <S.MobileFeed {...props} />
        </Col>
      ) : (
        <div style={{ transform: "scale(0.96)", transformOrigin: "top center" }}>
          <S.FeatureGrid {...props} />
        </div>
      );
    case "list":
      return (
        <Row u={u} justify="center" align="flex-start" style={{ padding: gut, ...fill }}>
          <S.ActivityList {...props} />
        </Row>
      );
    default:
      return <div style={{ padding: gut }}><S.StatCards {...props} /></div>;
  }
}

export function MockScreen({
  item,
  full = false,
  measure = false,
  viewport,
}: {
  item: Item;
  full?: boolean;
  measure?: boolean;
  /** Draw at this device and let the height follow the content (min. one screen). */
  viewport?: Viewport;
}) {
  const arch = ARCHETYPES[item.archetype];
  const isComponent = item.kind === "component";
  const native: Viewport = item.device === "mobile" ? "mobile" : "desktop";
  const vp = viewport ?? native;
  const W = VIEWPORTS[vp].w;
  const u = mkU(W);
  const p = item.palette;
  const flow = measure || !!viewport;

  /*
   * App-style layouts (dashboard, docs, mobile apps…) fill the frame. In a fixed
   * frame that's height: 100%; when the height follows content it has to be
   * flex-grow, or they'd collapse to their content.
   */
  const fill: CSSProperties = viewport ? { flexGrow: 1 } : { height: "100%" };
  /* the frame's height in design px — everything below it is cropped */
  const visibleH = W / (full ? arch.w / arch.h : item.aspect);
  let minHeight: string | undefined;
  if (viewport) {
    if (!isComponent) minHeight = u(VIEWPORTS[vp].h);
    else if (vp === native) minHeight = u(W / item.aspect);
    else if (FILLS.has(item.componentType ?? "")) minHeight = u(pick(vp)(700, 760, 700));
  }

  return (
    <div
      style={{
        containerType: "inline-size",
        width: "100%",
        aspectRatio: flow ? undefined : full ? `${arch.w} / ${arch.h}` : String(item.aspect),
        background: p.bg,
        color: p.text,
        overflow: "hidden",
        position: "relative",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        className="mock-flow"
        style={{
          position: flow ? "static" : "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight,
        }}
      >
        {isComponent ? (
          <div style={{ margin: "auto 0", width: "100%", ...(FILLS.has(item.componentType ?? "") ? { flexGrow: 1, display: "flex", flexDirection: "column" } : null) }}>
            <BlockOnly item={item} u={u} vp={vp} fill={fill} />
          </div>
        ) : (
          <Page item={item} u={u} vp={vp} fill={fill} upTo={flow ? Infinity : sectionsShown(item.archetype, visibleH)} />
        )}
      </div>
    </div>
  );
}
