import { ARCHETYPES, type Item } from "@/lib/data";
import { mkU, Col, Row, B, type U } from "./primitives";
import * as S from "./sections";

/**
 * Procedurally rendered interface previews.
 *
 * Everything is drawn in `cqw` units against a container query, so a preview is
 * resolution-independent and its geometry is known before paint — which is what
 * lets the masonry lay out with zero shift. No external images, no real brands.
 */

function Desktop({ item, u }: { item: Item; u: U }) {
  const p = item.palette;
  const props = { u, p, item };

  switch (item.archetype) {
    case "saas-landing":
      return (
        <>
          <S.Navbar {...props} />
          <S.Hero {...props} />
          <S.LogoCloud {...props} />
          <S.FeatureGrid {...props} />
          <S.StatsBand {...props} />
          <S.Testimonial {...props} />
          <S.CtaBand {...props} />
          <S.Footer {...props} />
        </>
      );
    case "dashboard":
      return (
        <Row u={u} align="stretch" style={{ height: "100%" }}>
          <S.Sidebar {...props} />
          <Col u={u} grow style={{ minWidth: 0 }}>
            <S.TopBar {...props} />
            <Col u={u} gap={14} grow style={{ padding: u(20), minHeight: 0 }}>
              <S.StatCards {...props} />
              <Row u={u} gap={14} align="stretch" style={{ height: u(300) }}>
                <S.ChartPanel {...props} />
                <S.ActivityList {...props} />
              </Row>
              <S.DataTable {...props} />
            </Col>
          </Col>
        </Row>
      );
    case "pricing":
      return (
        <>
          <S.Navbar {...props} />
          <S.SectionHeader {...props} />
          <S.BillingToggle {...props} />
          <S.PricingTiers {...props} />
          <S.Faq {...props} />
          <S.Footer {...props} />
        </>
      );
    case "ecommerce":
      return (
        <>
          <S.ShopNav {...props} />
          <S.CampaignHero {...props} />
          <S.CategoryRow {...props} />
          <S.ProductGrid {...props} />
          <S.CtaBand {...props} />
          <S.Footer {...props} />
        </>
      );
    case "portfolio":
      return (
        <>
          <S.MinimalNav {...props} />
          <S.TypeStatement {...props} />
          <S.WorkGrid {...props} />
          <S.IndexList {...props} />
          <S.Footer {...props} />
        </>
      );
    case "checkout":
      return (
        <Col u={u} style={{ height: "100%" }}>
          <Row u={u} justify="center" style={{ padding: `${u(24)} 0`, borderBottom: `${u(1)} solid ${p.border}` }}>
            <Row u={u} gap={10}>
              <B u={u} w={20} h={20} r={999} bg={p.accent} />
            </Row>
          </Row>
          <Row u={u} align="stretch" grow style={{ minHeight: 0 }}>
            <S.CheckoutForm {...props} />
            <S.OrderSummary {...props} />
          </Row>
        </Col>
      );
    case "auth":
      return (
        <Row u={u} align="stretch" style={{ height: "100%" }}>
          <S.AuthCard {...props} />
          <S.AuthArt {...props} />
        </Row>
      );
    case "editorial":
      return (
        <>
          <S.Masthead {...props} />
          <S.LeadStory {...props} />
          <S.ArticleIndex {...props} />
          <S.Footer {...props} />
        </>
      );
    case "docs":
      return (
        <Row u={u} align="stretch" style={{ height: "100%" }}>
          <S.DocsSidebar {...props} />
          <S.DocsBody {...props} />
          <S.DocsToc {...props} />
        </Row>
      );
    case "agency":
      return (
        <>
          <S.AgencyHero {...props} />
          <S.ServicesList {...props} />
          <S.WorkGrid {...props} />
          <S.CtaBand {...props} />
        </>
      );
    default:
      return null;
  }
}

function Mobile({ item, u }: { item: Item; u: U }) {
  const p = item.palette;
  const props = { u, p, item };
  return (
    <Col u={u} style={{ height: "100%" }}>
      <S.StatusBar {...props} />
      {item.archetype === "mobile-finance" ? <S.MobileFinance {...props} /> : null}
      {item.archetype === "mobile-feed" ? <S.MobileFeed {...props} /> : null}
      {item.archetype === "mobile-onboarding" ? <S.MobileOnboarding {...props} /> : null}
      {item.archetype === "mobile-profile" ? <S.MobileProfile {...props} /> : null}
      {item.archetype !== "mobile-onboarding" ? <S.TabBar {...props} /> : null}
    </Col>
  );
}

/** A single component block, rendered on its own — this is what `kind: "component"` shows. */
function BlockOnly({ item, u }: { item: Item; u: U }) {
  const p = item.palette;
  const props = { u, p, item };
  const pad = { padding: `${u(28)} 0` };

  switch (item.componentType) {
    case "navbar":
      return <div style={{ paddingTop: u(6) }}>{item.device === "mobile" ? <S.StatusBar {...props} /> : <S.Navbar {...props} />}</div>;
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
      return <div style={{ padding: u(28) }}><S.DataTable {...props} /></div>;
    case "stats":
      return <div style={{ padding: u(28) }}><S.StatCards {...props} /></div>;
    case "testimonials":
      return <S.Testimonial {...props} />;
    case "cta":
      return <div style={{ paddingTop: u(20) }}><S.CtaBand {...props} /></div>;
    case "footer":
      return <div style={{ paddingTop: u(10) }}><S.Footer {...props} /></div>;
    case "login":
      return (
        <Row u={u} align="stretch" style={{ height: "100%" }}>
          <S.AuthCard {...props} />
        </Row>
      );
    case "checkout":
      return (
        <Row u={u} align="stretch" style={{ height: "100%" }}>
          <S.CheckoutForm {...props} />
        </Row>
      );
    case "sidebar":
      return (
        <Row u={u} align="stretch" style={{ height: "100%" }}>
          <S.Sidebar {...props} />
          <div style={{ flex: 1, background: p.bg }} />
        </Row>
      );
    case "charts":
      return <div style={{ padding: u(28), height: "100%", display: "flex" }}><S.ChartPanel {...props} /></div>;
    case "filters":
      return <div style={{ paddingTop: u(18) }}><S.CategoryRow {...props} /></div>;
    case "cards":
      return item.device === "mobile" ? (
        <Col u={u} style={{ height: "100%" }}>
          <S.MobileFeed {...props} />
        </Col>
      ) : (
        <div style={{ transform: "scale(0.96)", transformOrigin: "top center" }}>
          <S.FeatureGrid {...props} />
        </div>
      );
    case "list":
      return <div style={{ padding: u(28), height: "100%" }}><S.ActivityList {...props} /></div>;
    default:
      return <div style={{ padding: u(28) }}><S.StatCards {...props} /></div>;
  }
}

export function MockScreen({ item, full = false, measure = false }: { item: Item; full?: boolean; measure?: boolean }) {
  const arch = ARCHETYPES[item.archetype];
  const isComponent = item.kind === "component";
  /* components render at their own design width so the block fills the frame */
  const W = isComponent && item.device === "desktop" ? 1440 : arch.w;
  const u = mkU(W);
  const p = item.palette;

  return (
    <div
      style={{
        containerType: "inline-size",
        width: "100%",
        aspectRatio: measure ? undefined : full ? `${arch.w} / ${arch.h}` : String(item.aspect),
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
          position: measure ? "static" : "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {isComponent ? (
          <div style={{ margin: "auto 0", width: "100%" }}>
            <BlockOnly item={item} u={u} />
          </div>
        ) : item.device === "mobile" ? (
          <Mobile item={item} u={u} />
        ) : (
          <Desktop item={item} u={u} />
        )}
      </div>
    </div>
  );
}
