import type { Palette } from "@/lib/palettes";
import type { Item } from "@/lib/data";
import { B, Btn, Burger, Circle, Col, Grid, Line, Lines, Row, T, noise, pick, type U, type Viewport } from "./primitives";

/**
 * Every section takes the viewport it is drawn at. The desktop values are the
 * original design; tablet and mobile follow the rules documented in
 * `responsiveRules` (src/lib/spec.ts) — keep the two in step.
 */
export type SecProps = { u: U; p: Palette; item: Item; vp: Viewport };

const NAV_LINKS = ["Product", "Solutions", "Docs", "Pricing"];

/* ---------------------------------------------------------------- nav */
export function Navbar({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(v(26, 22, 16))} ${u(v(64, 32, 20))}` }}>
      <Row u={u} gap={10}>
        <Circle u={u} s={22} bg={p.accent} />
        <T u={u} size={v(18, 18, 17)} weight={600} color={p.text}>
          {item.source.name}
        </T>
      </Row>
      {vp === "desktop" ? (
        <Row u={u} gap={34}>
          {NAV_LINKS.map((l) => (
            <T key={l} u={u} size={14} weight={450} color={p.muted}>
              {l}
            </T>
          ))}
        </Row>
      ) : null}
      <Row u={u} gap={16}>
        {vp !== "mobile" ? (
          <>
            <T u={u} size={14} weight={450} color={p.muted}>
              Sign in
            </T>
            <Btn u={u} label="Get started" w={124} h={38} r={8} bg={p.accent} fg={p.accentFg} size={14} />
          </>
        ) : null}
        {vp !== "desktop" ? <Burger u={u} c={p.text} /> : null}
      </Row>
    </Row>
  );
}

/* --------------------------------------------------------------- hero */
export function Hero({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  const words = item.source.tagline.split(" ");
  const mid = Math.ceil(words.length / 2);
  const ctas = [
    <Btn key="a" u={u} label="Start free" w={v(148, 148, 0)} h={50} r={10} bg={p.accent} fg={p.accentFg} size={16} />,
    <Btn key="b" u={u} label="Book a demo" w={v(148, 148, 0)} h={50} r={10} border={p.border} fg={p.text} size={16} />,
  ];
  return (
    <Col u={u} gap={0} align="center" style={{ padding: v(`${u(96)} ${u(64)} ${u(72)}`, `${u(72)} ${u(32)} ${u(56)}`, `${u(44)} ${u(20)} ${u(40)}`) }}>
      <B
        u={u}
        h={30}
        r={999}
        bg={p.raised}
        style={{ display: "flex", alignItems: "center", padding: `0 ${u(14)}`, marginBottom: u(v(28, 24, 20)) }}
      >
        <T u={u} size={12} weight={500} color={p.muted}>
          {item.industry.toUpperCase().replace("-", " ")} · NEW
        </T>
      </B>
      <T u={u} size={v(68, 52, 36)} weight={600} color={p.text} style={{ textAlign: "center", maxWidth: u(v(900, 700, 350)) }}>
        {words.slice(0, mid).join(" ")}
        {"\n"}
        {words.slice(mid).join(" ")}
      </T>
      <Col u={u} gap={9} align="center" style={{ marginTop: u(v(26, 22, 18)), width: v(u(520), u(460), "100%") }}>
        <Line u={u} w="86%" h={12} c={p.muted} o={0.4} />
        <Line u={u} w="62%" h={12} c={p.muted} o={0.4} />
      </Col>
      {vp === "mobile" ? (
        <Col u={u} gap={10} style={{ marginTop: u(28), width: "100%" }}>
          {ctas}
        </Col>
      ) : (
        <Row u={u} gap={12} style={{ marginTop: u(34) }}>
          {ctas}
        </Row>
      )}
      <AppPreview u={u} p={p} item={item} vp={vp} />
    </Col>
  );
}

function AppPreview({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const stats = vp === "mobile" ? [0, 1] : [0, 1, 2];
  return (
    <B
      u={u}
      w={v(1160, 770, 350)}
      h={v(620, 440, 300)}
      r={v(16, 14, 12)}
      bg={p.surface}
      border={p.border}
      style={{ marginTop: u(v(64, 48, 36)), overflow: "hidden", display: "flex" }}
    >
      {vp !== "mobile" ? (
        <Col u={u} gap={12} style={{ width: u(v(200, 160, 0)), padding: u(18), borderRight: `${u(1)} solid ${p.border}` }}>
          <Row u={u} gap={8}>
            <Circle u={u} s={16} bg={p.accent} />
            <Line u={u} w={64} h={8} c={p.text} o={0.5} />
          </Row>
          <div style={{ height: u(10) }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <Row key={i} u={u} gap={9}>
              <B u={u} w={14} h={14} r={4} bg={p.text} style={{ opacity: i === 1 ? 0.7 : 0.2 }} />
              <Line u={u} w={v(i === 1 ? 84 : 60 + i * 6, i === 1 ? 70 : 48 + i * 5, 0)} h={8} c={p.text} o={i === 1 ? 0.55 : 0.18} />
            </Row>
          ))}
        </Col>
      ) : null}
      <Col u={u} gap={v(14, 12, 10)} grow style={{ padding: u(v(20, 18, 14)), minWidth: 0 }}>
        <Row u={u} justify="space-between">
          <Line u={u} w={v(130, 110, 90)} h={12} c={p.text} o={0.6} />
          <Row u={u} gap={8}>
            <B u={u} w={v(78, 60, 44)} h={26} r={6} bg={p.raised} />
            <B u={u} w={26} h={26} r={6} bg={p.raised} />
          </Row>
        </Row>
        <Row u={u} gap={v(12, 10, 8)}>
          {stats.map((i) => (
            <B key={i} u={u} h={v(78, 70, 64)} r={10} bg={p.raised} grow style={{ padding: u(12) }}>
              <Line u={u} w={54} h={7} c={p.muted} o={0.5} />
              <T u={u} size={v(22, 20, 18)} weight={600} color={p.text} style={{ marginTop: u(10) }}>
                {["48.2k", "3.1%", "912"][i]}
              </T>
            </B>
          ))}
        </Row>
        <B u={u} r={10} bg={p.raised} grow style={{ padding: u(v(16, 14, 12)), display: "flex", alignItems: "flex-end", gap: u(v(6, 5, 4)) }}>
          {Array.from({ length: v(28, 22, 14) }).map((_, i) => (
            <B
              key={i}
              u={u}
              h={`${18 + noise(i, 3) * 72}%`}
              r={3}
              bg={i % 4 === 0 ? p.accent : p.text}
              grow
              style={{ opacity: i % 4 === 0 ? 0.9 : 0.16 }}
            />
          ))}
        </B>
      </Col>
    </B>
  );
}

/* --------------------------------------------------------- logo cloud */
export function LogoCloud({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const logos = vp === "mobile" ? [96, 118, 84, 100] : [96, 118, 84, 130, 100];
  return (
    <Col u={u} gap={v(24, 22, 20)} align="center" style={{ padding: v(`${u(40)} ${u(64)} ${u(80)}`, `${u(32)} ${u(32)} ${u(60)}`, `${u(28)} ${u(20)} ${u(44)}`) }}>
      <Line u={u} w={v(220, 200, 180)} h={9} c={p.muted} o={0.35} />
      <Row u={u} gap={v(56, 34, 22)} justify="center" wrap={vp === "mobile"} style={vp === "mobile" ? { rowGap: u(18) } : undefined}>
        {logos.map((w, i) => (
          <Row key={i} u={u} gap={8}>
            <Circle u={u} s={18} bg={p.text} style={{ opacity: 0.22 }} />
            <Line u={u} w={v(w, w * 0.8, w * 0.7)} h={13} c={p.text} o={0.22} r={4} />
          </Row>
        ))}
      </Row>
    </Col>
  );
}

/* ------------------------------------------------------- feature grid */
export function FeatureGrid({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const cards = [0, 1, 2].map((i) => (
    <B
      key={i}
      u={u}
      h={v(258, 240, undefined)}
      r={14}
      bg={p.surface}
      border={p.border}
      grow={vp === "desktop"}
      style={{ padding: u(v(26, 24, 22)), gridColumn: vp === "tablet" && i === 2 ? "span 2" : undefined }}
    >
      <B u={u} w={42} h={42} r={11} bg={p.accent} style={{ opacity: 0.16 }} />
      <T u={u} size={19} weight={560} color={p.text} style={{ marginTop: u(22) }}>
        {["Connected data", "Live collaboration", "Audit everything"][i]}
      </T>
      <div style={{ height: u(14) }} />
      <Lines u={u} n={3} h={9} gap={9} c={p.muted} o={0.34} last={0.7} />
      <Row u={u} gap={7} style={{ marginTop: u(26) }}>
        <Line u={u} w={70} h={9} c={p.accent} o={0.9} />
      </Row>
    </B>
  ));
  return (
    <Col u={u} gap={v(40, 34, 28)} align="center" style={{ padding: v(`${u(40)} ${u(64)} ${u(90)}`, `${u(32)} ${u(32)} ${u(70)}`, `${u(28)} ${u(20)} ${u(52)}`) }}>
      <Col u={u} gap={14} align="center">
        <T u={u} size={v(40, 34, 26)} weight={600} color={p.text} style={{ textAlign: "center" }}>
          Everything in one place
        </T>
        <Line u={u} w={v(420, 380, 280)} h={11} c={p.muted} o={0.4} />
      </Col>
      {vp === "desktop" ? (
        <Row u={u} gap={24} style={{ width: "100%" }}>
          {cards}
        </Row>
      ) : (
        <Grid u={u} cols={v(3, 2, 1)} gap={v(24, 18, 14)} style={{ width: "100%" }}>
          {cards}
        </Grid>
      )}
    </Col>
  );
}

/* --------------------------------------------------------- stats band */
export function StatsBand({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const stats: [string, string][] = [
    ["99.98%", "Uptime"],
    ["2.4M", "Events / day"],
    ["140ms", "p95 latency"],
    ["38", "Integrations"],
  ];
  const cells = stats.map(([val, l]) => (
    <Col key={l} u={u} gap={10} align="center">
      <T u={u} size={v(42, 34, 30)} weight={600} color={p.text}>
        {val}
      </T>
      <T u={u} size={13} weight={450} color={p.muted}>
        {l}
      </T>
    </Col>
  ));
  const rule = `${u(1)} solid ${p.border}`;
  return vp === "mobile" ? (
    <Grid u={u} cols={2} gap={16} rowGap={30} style={{ padding: `${u(36)} ${u(20)}`, borderTop: rule, borderBottom: rule }}>
      {cells}
    </Grid>
  ) : (
    <Row u={u} justify="space-between" style={{ padding: `${u(v(56, 44, 0))} ${u(v(120, 48, 0))}`, borderTop: rule, borderBottom: rule }}>
      {cells}
    </Row>
  );
}

/* -------------------------------------------------------- testimonial */
export function Testimonial({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={v(30, 26, 22)} align="center" style={{ padding: v(`${u(90)} ${u(220)}`, `${u(72)} ${u(72)}`, `${u(48)} ${u(22)}`) }}>
      <T u={u} size={v(30, 26, 20)} weight={450} color={p.text} style={{ textAlign: "center", lineHeight: 1.45 }}>
        “We replaced four tools with {item.source.name} in a fortnight and nobody asked for the old ones back.”
      </T>
      <Row u={u} gap={12}>
        <Circle u={u} s={40} bg={p.raised} />
        <Col u={u} gap={7} justify="center">
          <Line u={u} w={92} h={9} c={p.text} o={0.6} />
          <Line u={u} w={130} h={8} c={p.muted} o={0.4} />
        </Col>
      </Row>
    </Col>
  );
}

/* ----------------------------------------------------------- cta band */
export function CtaBand({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <div style={{ padding: v(`${u(20)} ${u(64)} ${u(80)}`, `${u(16)} ${u(32)} ${u(64)}`, `${u(12)} ${u(16)} ${u(44)}`) }}>
      <Col
        u={u}
        gap={v(24, 22, 18)}
        align="center"
        style={{ background: p.raised, borderRadius: u(v(20, 18, 16)), padding: `${u(v(64, 56, 40))} ${u(v(0, 32, 20))}` }}
      >
        <T u={u} size={v(38, 32, 24)} weight={600} color={p.text} style={{ textAlign: "center" }}>
          Start building today
        </T>
        <Line u={u} w={v(340, 320, 240)} h={11} c={p.muted} o={0.4} />
        <Btn u={u} label="Create an account" w={196} h={50} r={10} bg={p.accent} fg={p.accentFg} size={16} />
      </Col>
    </div>
  );
}

/* ------------------------------------------------------------- footer */
export function Footer({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  const brand = (
    <Col u={u} gap={14}>
      <Row u={u} gap={10}>
        <Circle u={u} s={20} bg={p.accent} />
        <T u={u} size={16} weight={600} color={p.text}>
          {item.source.name}
        </T>
      </Row>
      <Line u={u} w={180} h={9} c={p.muted} o={0.3} />
    </Col>
  );
  const cols = [0, 1, 2, 3].map((c) => (
    <Col key={c} u={u} gap={13} style={{ width: vp === "mobile" ? undefined : u(130) }}>
      <Line u={u} w={64} h={9} c={p.text} o={0.55} />
      {Array.from({ length: 4 }).map((_, i) => (
        <Line key={i} u={u} w={78 - i * 8 + c * 5} h={8} c={p.muted} o={0.28} />
      ))}
    </Col>
  ));
  return (
    <div style={{ borderTop: `${u(1)} solid ${p.border}`, padding: v(`${u(54)} ${u(64)}`, `${u(44)} ${u(32)}`, `${u(36)} ${u(20)}`) }}>
      {vp === "desktop" ? (
        <Row u={u} justify="space-between" align="flex-start">
          {brand}
          {cols}
        </Row>
      ) : (
        <Col u={u} gap={v(0, 36, 30)}>
          {brand}
          {vp === "tablet" ? (
            <Row u={u} justify="space-between" align="flex-start">
              {cols}
            </Row>
          ) : (
            <Grid u={u} cols={2} gap={20} rowGap={28}>
              {cols}
            </Grid>
          )}
        </Col>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- dashboard */
const DASH_NAV = ["Overview", "Reports", "Customers", "Transactions", "Automations", "Team", "Settings"];

export function Sidebar({ u, p, item, vp }: SecProps) {
  /* tablet collapses to an icon rail; phones use TopBar's menu + TabBar instead */
  if (vp === "tablet") {
    return (
      <Col u={u} gap={6} align="center" style={{ width: u(72), background: p.surface, borderRight: `${u(1)} solid ${p.border}`, padding: `${u(18)} 0` }}>
        <Circle u={u} s={24} bg={p.accent} style={{ marginBottom: u(20) }} />
        {DASH_NAV.map((n, i) => (
          <B key={n} u={u} w={40} h={40} r={9} bg={i === 1 ? p.raised : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <B u={u} w={16} h={16} r={4} bg={p.text} style={{ opacity: i === 1 ? 0.75 : 0.25 }} />
          </B>
        ))}
        <Circle u={u} s={30} bg={p.raised} style={{ marginTop: "auto" }} />
      </Col>
    );
  }
  return (
    <Col u={u} gap={0} style={{ width: u(vp === "mobile" ? 290 : 248), background: p.surface, borderRight: `${u(1)} solid ${p.border}`, padding: u(18) }}>
      <Row u={u} gap={10} style={{ marginBottom: u(26) }}>
        <Circle u={u} s={22} bg={p.accent} />
        <T u={u} size={15} weight={600} color={p.text}>
          {item.source.name}
        </T>
      </Row>
      <Col u={u} gap={4} grow>
        {DASH_NAV.map((n, i) => (
          <Row
            key={n}
            u={u}
            gap={10}
            style={{
              padding: `${u(9)} ${u(10)}`,
              borderRadius: u(7),
              background: i === 1 ? p.raised : undefined,
            }}
          >
            <B u={u} w={15} h={15} r={4} bg={p.text} style={{ opacity: i === 1 ? 0.75 : 0.25 }} />
            <T u={u} size={13} weight={i === 1 ? 550 : 430} color={i === 1 ? p.text : p.muted}>
              {n}
            </T>
          </Row>
        ))}
      </Col>
      <Row u={u} gap={10} style={{ paddingTop: u(14), borderTop: `${u(1)} solid ${p.border}` }}>
        <Circle u={u} s={26} bg={p.raised} />
        <Col u={u} gap={6}>
          <Line u={u} w={70} h={8} c={p.text} o={0.5} />
          <Line u={u} w={48} h={7} c={p.muted} o={0.35} />
        </Col>
      </Row>
    </Col>
  );
}

export function StatCards({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const cards: [string, string, string][] = [
    ["Net revenue", "£184,220", "+12.4%"],
    ["Active users", "9,318", "+4.1%"],
    ["Conversion", "3.42%", "-0.3%"],
    ["Avg. order", "£62.10", "+2.8%"],
  ];
  const tiles = cards.map(([label, value, delta], i) => (
    <B key={label} u={u} h={v(104, 100, 96)} r={12} bg={p.surface} border={p.border} grow={vp !== "mobile"} style={{ padding: u(v(16, 14, 13)), minWidth: 0 }}>
      <T u={u} size={12} weight={450} color={p.muted}>
        {label}
      </T>
      <T u={u} size={v(26, 22, 20)} weight={600} color={p.text} style={{ marginTop: u(12) }}>
        {value}
      </T>
      <B
        u={u}
        h={20}
        r={999}
        bg={i === 2 ? p.chart[3] : p.chart[1]}
        style={{ opacity: 0.16, marginTop: u(10), width: "fit-content", padding: `0 ${u(9)}`, display: "flex", alignItems: "center" }}
      >
        <T u={u} size={11} weight={550} color={i === 2 ? p.chart[3] : p.chart[1]}>
          {delta}
        </T>
      </B>
    </B>
  ));
  return vp === "mobile" ? (
    <Grid u={u} cols={2} gap={10} style={{ width: "100%" }}>
      {tiles}
    </Grid>
  ) : (
    <Row u={u} gap={v(14, 12, 0)} style={{ width: "100%" }}>
      {tiles}
    </Row>
  );
}

export function ChartPanel({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <B u={u} r={12} bg={p.surface} border={p.border} grow style={{ padding: u(v(18, 16, 14)), display: "flex", flexDirection: "column" }}>
      <Row u={u} justify="space-between">
        <Col u={u} gap={8}>
          <T u={u} size={14} weight={550} color={p.text}>
            Revenue
          </T>
          <Line u={u} w={110} h={8} c={p.muted} o={0.35} />
        </Col>
        <Row u={u} gap={6}>
          {["7d", "30d", "90d"].map((t, i) => (
            <B key={t} u={u} h={24} r={6} bg={i === 1 ? p.raised : undefined} style={{ padding: `0 ${u(10)}`, display: "flex", alignItems: "center" }}>
              <T u={u} size={11} weight={500} color={i === 1 ? p.text : p.muted}>
                {t}
              </T>
            </B>
          ))}
        </Row>
      </Row>
      <Row u={u} gap={v(5, 5, 4)} align="flex-end" grow style={{ marginTop: u(20) }}>
        {Array.from({ length: v(34, 28, 16) }).map((_, i) => (
          <Col key={i} u={u} gap={0} grow justify="flex-end" style={{ height: "100%" }}>
            <B u={u} h={`${12 + noise(i, 7) * 62}%`} r={3} bg={p.accent} style={{ opacity: 0.85 }} />
            <B u={u} h={`${6 + noise(i, 11) * 22}%`} r={3} bg={p.text} style={{ opacity: 0.14, marginTop: u(3) }} />
          </Col>
        ))}
      </Row>
    </B>
  );
}

export function ActivityList({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <B u={u} w={v<number | string>(340, "100%", "100%")} r={12} bg={p.surface} border={p.border} style={{ padding: u(v(18, 16, 14)) }}>
      <T u={u} size={14} weight={550} color={p.text}>
        Recent activity
      </T>
      <Col u={u} gap={16} style={{ marginTop: u(18) }}>
        {Array.from({ length: v(6, 4, 4) }).map((_, i) => (
          <Row key={i} u={u} gap={11}>
            <Circle u={u} s={28} bg={p.raised} />
            <Col u={u} gap={7} grow>
              <Line u={u} w={`${58 + noise(i, 2) * 30}%`} h={8} c={p.text} o={0.5} />
              <Line u={u} w={`${32 + noise(i, 5) * 22}%`} h={7} c={p.muted} o={0.3} />
            </Col>
            <Line u={u} w={36} h={8} c={p.muted} o={0.3} />
          </Row>
        ))}
      </Col>
    </B>
  );
}

export function DataTable({ u, p, vp }: SecProps) {
  const v = pick(vp);
  /* tablet drops the least useful column; phones turn each row into a stacked item */
  const cols = vp === "tablet" ? [3, 2, 1.4, 1.2] : [3, 2, 2, 1.4, 1.2];
  const rows = v(6, 6, 5);
  return (
    <B u={u} r={12} bg={p.surface} border={p.border} style={{ padding: u(v(18, 16, 14)), width: "100%" }}>
      <Row u={u} justify="space-between" style={{ marginBottom: u(16) }}>
        <T u={u} size={14} weight={550} color={p.text}>
          Transactions
        </T>
        <Row u={u} gap={8}>
          {vp !== "mobile" ? <B u={u} w={v(150, 130, 0)} h={28} r={7} bg={p.raised} /> : null}
          <B u={u} w={v(90, 80, 70)} h={28} r={7} bg={p.raised} />
        </Row>
      </Row>
      {vp === "mobile" ? (
        Array.from({ length: rows }).map((_, r) => (
          <Row key={r} u={u} gap={11} style={{ padding: `${u(12)} 0`, borderTop: `${u(1)} solid ${p.border}` }}>
            <Circle u={u} s={30} bg={p.raised} />
            <Col u={u} gap={7} grow>
              <Line u={u} w={`${50 + noise(r, 4) * 34}%`} h={9} c={p.text} o={0.5} />
              <Line u={u} w="44%" h={8} c={p.muted} o={0.3} />
            </Col>
            <Col u={u} gap={7} align="flex-end">
              <Line u={u} w={52} h={9} c={p.text} o={0.5} />
              <B u={u} h={16} r={999} bg={p.chart[r % 3]} style={{ width: u(44), opacity: 0.18 }} />
            </Col>
          </Row>
        ))
      ) : (
        <>
          <Row u={u} gap={16} style={{ paddingBottom: u(11), borderBottom: `${u(1)} solid ${p.border}` }}>
            {cols.map((c, i) => (
              <div key={i} style={{ flex: c }}>
                <Line u={u} w="52%" h={8} c={p.muted} o={0.45} />
              </div>
            ))}
          </Row>
          {Array.from({ length: rows }).map((_, r) => (
            <Row key={r} u={u} gap={16} style={{ padding: `${u(13)} 0`, borderBottom: r < rows - 1 ? `${u(1)} solid ${p.border}` : undefined }}>
              <Row u={u} gap={10} style={{ flex: cols[0] }}>
                <Circle u={u} s={22} bg={p.raised} />
                <Line u={u} w={`${50 + noise(r, 4) * 34}%`} h={9} c={p.text} o={0.5} />
              </Row>
              <div style={{ flex: cols[1] }}>
                <Line u={u} w="70%" h={9} c={p.muted} o={0.3} />
              </div>
              {vp === "desktop" ? (
                <div style={{ flex: cols[2] }}>
                  <Line u={u} w="58%" h={9} c={p.muted} o={0.3} />
                </div>
              ) : null}
              <div style={{ flex: cols[cols.length - 2] }}>
                <B u={u} h={20} r={999} bg={p.chart[r % 3]} style={{ width: u(64), opacity: 0.18 }} />
              </div>
              <div style={{ flex: cols[cols.length - 1], display: "flex", justifyContent: "flex-end" }}>
                <Line u={u} w={52} h={9} c={p.text} o={0.5} />
              </div>
            </Row>
          ))}
        </>
      )}
    </B>
  );
}

export function TopBar({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Row u={u} justify="space-between" style={{ height: u(v(62, 58, 56)), padding: `0 ${u(v(22, 20, 16))}`, borderBottom: `${u(1)} solid ${p.border}`, flexShrink: 0 }}>
      <Row u={u} gap={14}>
        {vp === "mobile" ? <Burger u={u} c={p.text} s={20} /> : null}
        <T u={u} size={16} weight={600} color={p.text}>
          Overview
        </T>
      </Row>
      <Row u={u} gap={v(12, 10, 10)}>
        {vp !== "mobile" ? (
          <B u={u} w={v(232, 180, 0)} h={32} r={8} bg={p.raised} style={{ display: "flex", alignItems: "center", padding: `0 ${u(11)}` }}>
            <Line u={u} w={92} h={8} c={p.muted} o={0.4} />
          </B>
        ) : null}
        <B u={u} w={32} h={32} r={8} bg={p.raised} />
        <Circle u={u} s={32} bg={p.raised} />
      </Row>
    </Row>
  );
}

/* ------------------------------------------------------------ pricing */
export function PricingTiers({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const tiers: [string, string, number][] = [
    ["Free", "£0", 4],
    ["Pro", "£18", 6],
    ["Team", "£42", 7],
  ];
  const cards = tiers.map(([name, price, feats], i) => (
    <B
      key={name}
      u={u}
      r={16}
      bg={i === 1 ? p.surface : undefined}
      border={i === 1 ? p.accent : p.border}
      grow={vp !== "mobile"}
      style={{ padding: u(v(28, 20, 22)), maxWidth: vp === "mobile" ? undefined : u(340), minWidth: 0 }}
    >
      <Row u={u} justify="space-between">
        <T u={u} size={16} weight={600} color={p.text}>
          {name}
        </T>
        {i === 1 ? (
          <B u={u} h={22} r={999} bg={p.accent} style={{ padding: `0 ${u(10)}`, display: "flex", alignItems: "center" }}>
            <T u={u} size={11} weight={600} color={p.accentFg}>
              Popular
            </T>
          </B>
        ) : null}
      </Row>
      <Row u={u} gap={6} align="flex-end" style={{ marginTop: u(20) }}>
        <T u={u} size={v(44, 36, 38)} weight={600} color={p.text}>
          {price}
        </T>
        <T u={u} size={13} weight={430} color={p.muted} style={{ paddingBottom: u(8) }}>
          /month
        </T>
      </Row>
      <Btn
        u={u}
        label={i === 0 ? "Start free" : "Choose plan"}
        w={0}
        h={42}
        r={9}
        bg={i === 1 ? p.accent : undefined}
        border={i === 1 ? undefined : p.border}
        fg={i === 1 ? p.accentFg : p.text}
        size={14}
      />
      <Col u={u} gap={13} style={{ marginTop: u(24) }}>
        {/* phones show the headline features only — the full list is a tap away */}
        {Array.from({ length: vp === "mobile" ? Math.min(feats, 4) : feats }).map((_, f) => (
          <Row key={f} u={u} gap={10}>
            <Circle u={u} s={15} bg={p.accent} style={{ opacity: 0.2 }} />
            <Line u={u} w={`${52 + noise(f, i + 1) * 36}%`} h={8} c={p.text} o={0.4} />
          </Row>
        ))}
      </Col>
    </B>
  ));
  return vp === "mobile" ? (
    <Col u={u} gap={14} style={{ padding: `0 ${u(20)}` }}>
      {cards}
    </Col>
  ) : (
    <Row u={u} gap={v(20, 14, 0)} align="stretch" justify="center" style={{ padding: `0 ${u(v(120, 32, 0))}` }}>
      {cards}
    </Row>
  );
}

export function BillingToggle({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Row u={u} justify="center" style={{ padding: `${u(10)} 0 ${u(v(44, 36, 28))}` }}>
      <Row u={u} gap={4} style={{ background: p.raised, borderRadius: u(999), padding: u(4) }}>
        {["Monthly", "Annual"].map((t, i) => (
          <B key={t} u={u} h={34} r={999} bg={i === 1 ? p.surface : undefined} style={{ padding: `0 ${u(20)}`, display: "flex", alignItems: "center" }}>
            <T u={u} size={13} weight={i === 1 ? 550 : 430} color={i === 1 ? p.text : p.muted}>
              {t}
            </T>
          </B>
        ))}
      </Row>
    </Row>
  );
}

export function SectionHeader({ u, p, vp, title, sub }: SecProps & { title?: string; sub?: string }) {
  const v = pick(vp);
  return (
    <Col u={u} gap={16} align="center" style={{ padding: v(`${u(80)} ${u(64)} ${u(30)}`, `${u(64)} ${u(32)} ${u(26)}`, `${u(44)} ${u(20)} ${u(20)}`) }}>
      <T u={u} size={v(48, 40, 30)} weight={600} color={p.text} style={{ textAlign: "center" }}>
        {title ?? "Simple, honest pricing"}
      </T>
      <Line u={u} w={v(sub ? 300 : 420, 380, 280)} h={11} c={p.muted} o={0.4} />
    </Col>
  );
}

export function Faq({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={0} style={{ padding: v(`${u(70)} ${u(300)}`, `${u(56)} ${u(64)}`, `${u(40)} ${u(20)}`) }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Row key={i} u={u} justify="space-between" style={{ padding: `${u(22)} 0`, borderBottom: `${u(1)} solid ${p.border}` }}>
          <Line u={u} w={`${40 + noise(i, 9) * 30}%`} h={11} c={p.text} o={0.6} />
          <B u={u} w={13} h={13} r={2} bg={p.muted} style={{ opacity: 0.4 }} />
        </Row>
      ))}
    </Col>
  );
}

/* --------------------------------------------------------- ecommerce */
export function ShopNav({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  const name = (
    <T u={u} size={v(19, 18, 16)} weight={600} color={p.text} track={0.02}>
      {item.source.name.toUpperCase()}
    </T>
  );
  if (vp === "mobile") {
    return (
      <Row u={u} justify="space-between" style={{ padding: `${u(16)} ${u(20)}`, borderBottom: `${u(1)} solid ${p.border}` }}>
        <Burger u={u} c={p.text} />
        {name}
        <Row u={u} gap={12}>
          <Circle u={u} s={26} bg={p.raised} />
          <Circle u={u} s={26} bg={p.raised} />
        </Row>
      </Row>
    );
  }
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(22)} ${u(v(56, 32, 0))}`, borderBottom: `${u(1)} solid ${p.border}` }}>
      <Row u={u} gap={30}>
        {vp === "tablet" ? <Burger u={u} c={p.text} /> : null}
        {name}
        {vp === "desktop" ? (
          <Row u={u} gap={22}>
            {["New in", "Collections", "Archive", "Journal"].map((l) => (
              <T key={l} u={u} size={13} weight={450} color={p.muted}>
                {l}
              </T>
            ))}
          </Row>
        ) : null}
      </Row>
      <Row u={u} gap={14}>
        <B u={u} w={v(200, 180, 0)} h={32} r={999} bg={p.raised} style={{ display: "flex", alignItems: "center", padding: `0 ${u(14)}` }}>
          <Line u={u} w={66} h={7} c={p.muted} o={0.45} />
        </B>
        <Circle u={u} s={30} bg={p.raised} />
        <Circle u={u} s={30} bg={p.raised} />
      </Row>
    </Row>
  );
}

export function CampaignHero({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  const glow = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(${u(700)} ${u(500)} at 78% 40%, ${p.accent}22, transparent 70%)`,
      }}
    />
  );
  if (vp === "mobile") {
    /* image first, copy below — the product shot is the hook on a phone */
    return (
      <Col u={u} gap={0} style={{ background: p.raised }}>
        <B u={u} h={300} bg={p.surface} style={{ position: "relative", overflow: "hidden" }}>
          {glow}
        </B>
        <Col u={u} gap={18} style={{ padding: `${u(28)} ${u(20)} ${u(32)}` }}>
          <T u={u} size={32} weight={600} color={p.text}>
            {item.source.tagline}
          </T>
          <Lines u={u} n={2} h={10} gap={10} c={p.muted} o={0.4} />
          <Btn u={u} label="Shop the collection" w={0} h={48} r={999} bg={p.accent} fg={p.accentFg} size={15} />
        </Col>
      </Col>
    );
  }
  return (
    <B u={u} h={v(520, 460, 0)} bg={p.raised} style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", padding: `0 ${u(v(80, 40, 0))}` }}>
      {glow}
      <Col u={u} gap={22} style={{ position: "relative", maxWidth: u(v(560, 400, 0)) }}>
        <T u={u} size={v(56, 44, 0)} weight={600} color={p.text}>
          {item.source.tagline}
        </T>
        <Lines u={u} n={2} w={v(420, 340, 0)} h={10} gap={10} c={p.muted} o={0.4} />
        <Btn u={u} label="Shop the collection" w={220} h={48} r={999} bg={p.accent} fg={p.accentFg} size={15} />
      </Col>
      <B u={u} w={v(420, 300, 0)} h={v(400, 340, 0)} r={16} bg={p.surface} style={{ position: "absolute", right: u(v(80, 40, 0)), opacity: 0.9 }} />
    </B>
  );
}

export function CategoryRow({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Row u={u} gap={10} style={{ padding: v(`${u(28)} ${u(56)}`, `${u(24)} ${u(32)}`, `${u(18)} ${u(20)}`), overflow: "hidden" }}>
      {["All", "Outerwear", "Knitwear", "Trousers", "Accessories", "Archive"].map((c, i) => (
        <B key={c} u={u} h={34} r={999} bg={i === 0 ? p.accent : undefined} border={i === 0 ? undefined : p.border} style={{ padding: `0 ${u(16)}`, display: "flex", alignItems: "center" }}>
          <T u={u} size={13} weight={480} color={i === 0 ? p.accentFg : p.muted} style={{ whiteSpace: "nowrap" }}>
            {c}
          </T>
        </B>
      ))}
    </Row>
  );
}

export function ProductGrid({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const cols = v(4, 3, 2);
  const gap = v(18, 16, 12);
  return (
    <Row u={u} gap={gap} wrap style={{ padding: v(`${u(10)} ${u(56)} ${u(70)}`, `${u(8)} ${u(32)} ${u(56)}`, `${u(6)} ${u(20)} ${u(40)}`), rowGap: u(v(18, 24, 22)) }}>
      {Array.from({ length: v(8, 6, 6) }).map((_, i) => (
        <Col key={i} u={u} gap={12} style={{ width: `calc(${100 / cols}% - ${u((gap * (cols - 1)) / cols)})` }}>
          <B u={u} h={v(330, 290, 210)} r={10} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${140 + i * 24}deg, ${p.chart[i % 4]}1f, transparent 60%)` }} />
          </B>
          <Line u={u} w={`${52 + noise(i, 13) * 32}%`} h={10} c={p.text} o={0.6} />
          <Line u={u} w={54} h={9} c={p.muted} o={0.4} />
        </Col>
      ))}
    </Row>
  );
}

/* --------------------------------------------------------- portfolio */
export function MinimalNav({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Row u={u} justify="space-between" style={{ padding: v(`${u(32)} ${u(56)}`, `${u(28)} ${u(32)}`, `${u(20)} ${u(20)}`) }}>
      <T u={u} size={15} weight={550} color={p.text}>
        {item.source.name}
      </T>
      {vp === "mobile" ? (
        <T u={u} size={13} weight={500} color={p.text}>
          Menu
        </T>
      ) : (
        <Row u={u} gap={26}>
          {["Work", "Studio", "Contact"].map((l) => (
            <T key={l} u={u} size={13} weight={450} color={p.muted}>
              {l}
            </T>
          ))}
        </Row>
      )}
    </Row>
  );
}

export function TypeStatement({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={0} style={{ padding: v(`${u(90)} ${u(56)} ${u(80)}`, `${u(72)} ${u(32)} ${u(60)}`, `${u(44)} ${u(20)} ${u(40)}`) }}>
      <T u={u} size={v(96, 64, 38)} weight={500} color={p.text} style={{ lineHeight: 1.04, maxWidth: u(v(1100, 740, 350)) }}>
        {item.source.about}
      </T>
      <Row u={u} gap={14} style={{ marginTop: u(v(48, 40, 30)) }}>
        <B u={u} h={30} r={999} border={p.border} style={{ padding: `0 ${u(14)}`, display: "flex", alignItems: "center" }}>
          <T u={u} size={12} weight={450} color={p.muted}>
            Selected work — 2026
          </T>
        </B>
      </Row>
    </Col>
  );
}

export function WorkGrid({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const one = vp === "mobile";
  return (
    <Row u={u} gap={v(20, 16, 0)} wrap style={{ padding: v(`0 ${u(56)} ${u(60)}`, `0 ${u(32)} ${u(48)}`, `0 ${u(20)} ${u(36)}`), rowGap: u(v(20, 24, 28)) }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Col key={i} u={u} gap={14} style={{ width: one ? "100%" : `calc(50% - ${u(v(10, 8, 0))})` }}>
          <B u={u} h={v(420, 300, 280)} r={12} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${40 + i * 60}deg, ${p.chart[i % 4]}26, transparent 65%)` }} />
          </B>
          <Row u={u} justify="space-between">
            <Line u={u} w={`${40 + noise(i, 17) * 30}%`} h={11} c={p.text} o={0.6} />
            <Line u={u} w={60} h={9} c={p.muted} o={0.35} />
          </Row>
        </Col>
      ))}
    </Row>
  );
}

export function IndexList({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={0} style={{ padding: v(`${u(20)} ${u(56)} ${u(70)}`, `${u(16)} ${u(32)} ${u(56)}`, `${u(12)} ${u(20)} ${u(40)}`) }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Row key={i} u={u} justify="space-between" style={{ padding: `${u(v(24, 22, 18))} 0`, borderTop: `${u(1)} solid ${p.border}` }}>
          <Row u={u} gap={v(28, 24, 16)}>
            <T u={u} size={12} weight={450} color={p.muted}>
              0{i + 1}
            </T>
            <Line u={u} w={(140 + noise(i, 19) * 200) * v(1, 0.9, 0.6)} h={12} c={p.text} o={0.6} />
          </Row>
          <Line u={u} w={70} h={9} c={p.muted} o={0.3} />
        </Row>
      ))}
    </Col>
  );
}

/* ---------------------------------------------------------- checkout */
export function CheckoutForm({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={v(26, 24, 22)} style={{ flex: 1.35, padding: v(`${u(48)} ${u(56)}`, `${u(36)} ${u(32)}`, `${u(24)} ${u(20)} ${u(32)}`), minWidth: 0 }}>
      <T u={u} size={22} weight={600} color={p.text}>
        Checkout
      </T>
      {[
        ["Contact", 1],
        ["Delivery", 3],
        ["Payment", 2],
      ].map(([label, n]) => (
        <Col key={label as string} u={u} gap={12}>
          <T u={u} size={13} weight={550} color={p.text}>
            {label as string}
          </T>
          {Array.from({ length: n as number }).map((_, i) => (
            <B key={i} u={u} h={46} r={9} border={p.border} style={{ display: "flex", alignItems: "center", padding: `0 ${u(14)}` }}>
              <Line u={u} w={`${22 + noise(i, 23) * 24}%`} h={8} c={p.muted} o={0.4} />
            </B>
          ))}
        </Col>
      ))}
      <Col u={u} gap={10}>
        {["Standard — free", "Express — £6.00"].map((s, i) => (
          <Row key={s} u={u} gap={12} style={{ border: `${u(1)} solid ${i === 0 ? p.accent : p.border}`, borderRadius: u(9), padding: u(14) }}>
            <Circle u={u} s={16} bg={i === 0 ? p.accent : p.raised} />
            <T u={u} size={13} weight={450} color={p.text}>
              {s}
            </T>
          </Row>
        ))}
      </Col>
      <Btn u={u} label="Pay £128.00" w={0} h={50} r={10} bg={p.accent} fg={p.accentFg} size={15} />
    </Col>
  );
}

export function OrderSummary({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={18} style={{ flex: 1, background: p.surface, borderLeft: `${u(1)} solid ${p.border}`, padding: `${u(v(48, 36, 24))} ${u(v(48, 28, 20))}`, minWidth: 0 }}>
      <T u={u} size={14} weight={550} color={p.text}>
        Order summary
      </T>
      {Array.from({ length: 3 }).map((_, i) => (
        <Row key={i} u={u} gap={14}>
          <B u={u} w={v(64, 56, 52)} h={v(78, 68, 64)} r={8} bg={p.raised} />
          <Col u={u} gap={8} grow>
            <Line u={u} w={`${50 + noise(i, 29) * 30}%`} h={9} c={p.text} o={0.55} />
            <Line u={u} w={70} h={8} c={p.muted} o={0.35} />
          </Col>
          <Line u={u} w={48} h={9} c={p.text} o={0.5} />
        </Row>
      ))}
      <div style={{ height: u(6) }} />
      {["Subtotal", "Delivery", "VAT"].map((l) => (
        <Row key={l} u={u} justify="space-between">
          <T u={u} size={12} weight={430} color={p.muted}>
            {l}
          </T>
          <Line u={u} w={44} h={8} c={p.muted} o={0.4} />
        </Row>
      ))}
      <Row u={u} justify="space-between" style={{ paddingTop: u(16), borderTop: `${u(1)} solid ${p.border}` }}>
        <T u={u} size={15} weight={600} color={p.text}>
          Total
        </T>
        <T u={u} size={15} weight={600} color={p.text}>
          £128.00
        </T>
      </Row>
    </Col>
  );
}

/** Phones fold the order summary into a disclosure bar above the form. */
export function OrderSummaryBar({ u, p }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(16)} ${u(20)}`, background: p.surface, borderBottom: `${u(1)} solid ${p.border}` }}>
      <Row u={u} gap={10}>
        <B u={u} w={18} h={18} r={5} bg={p.accent} style={{ opacity: 0.25 }} />
        <T u={u} size={13} weight={500} color={p.accent}>
          Show order summary
        </T>
      </Row>
      <T u={u} size={15} weight={600} color={p.text}>
        £128.00
      </T>
    </Row>
  );
}

/* -------------------------------------------------------------- auth */
export function AuthCard({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col
      u={u}
      gap={0}
      align="center"
      justify={vp === "mobile" ? "flex-start" : "center"}
      style={{ flex: 1, padding: v(u(60), u(60), `${u(56)} ${u(24)} ${u(32)}`) }}
    >
      <Col u={u} gap={0} style={{ width: v(u(380), u(420), "100%") }}>
        <Circle u={u} s={34} bg={p.accent} />
        <T u={u} size={v(28, 28, 26)} weight={600} color={p.text} style={{ marginTop: u(26) }}>
          Sign in to {item.source.name}
        </T>
        <Line u={u} w={230} h={9} c={p.muted} o={0.4} r={4} />
        <Col u={u} gap={12} style={{ marginTop: u(30) }}>
          {["Email", "Password"].map((f) => (
            <Col key={f} u={u} gap={8}>
              <T u={u} size={12} weight={500} color={p.muted}>
                {f}
              </T>
              <B u={u} h={46} r={9} border={p.border} />
            </Col>
          ))}
        </Col>
        <div style={{ height: u(20) }} />
        <Btn u={u} label="Continue" w={0} h={48} r={9} bg={p.accent} fg={p.accentFg} size={15} />
        <Row u={u} gap={12} align="center" style={{ marginTop: u(22) }}>
          <B u={u} h={1} bg={p.border} grow />
          <T u={u} size={11} weight={430} color={p.muted}>
            or
          </T>
          <B u={u} h={1} bg={p.border} grow />
        </Row>
        <Col u={u} gap={10} style={{ marginTop: u(20) }}>
          {["Continue with Google", "Continue with GitHub"].map((s) => (
            <Btn key={s} u={u} label={s} w={0} h={44} r={9} border={p.border} fg={p.text} size={13} />
          ))}
        </Col>
      </Col>
    </Col>
  );
}

export function AuthArt({ u, p }: SecProps) {
  return (
    <div style={{ flex: 1, background: p.raised, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${u(600)} ${u(600)} at 30% 30%, ${p.accent}30, transparent 65%)` }} />
      <div style={{ position: "absolute", left: "18%", top: "26%", width: u(300), height: u(300), borderRadius: "50%", border: `${u(1)} solid ${p.accent}44` }} />
      <div style={{ position: "absolute", left: "34%", top: "42%", width: u(220), height: u(220), borderRadius: "50%", background: `${p.accent}22` }} />
      <Col u={u} gap={16} style={{ position: "absolute", left: u(64), bottom: u(64), right: u(64) }}>
        <T u={u} size={26} weight={450} color={p.text} style={{ lineHeight: 1.4 }}>
          “The only tool our finance and product teams both open every morning.”
        </T>
        <Line u={u} w={160} h={9} c={p.muted} o={0.4} />
      </Col>
    </div>
  );
}

/* --------------------------------------------------------- editorial */
export function Masthead({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  const links = ["Latest", "Culture", "Technology", "Interviews", "Archive"].slice(0, v(5, 5, 4));
  return (
    <Col u={u} gap={0} align="center" style={{ padding: v(`${u(40)} ${u(56)} ${u(22)}`, `${u(32)} ${u(32)} ${u(20)}`, `${u(22)} ${u(20)} ${u(16)}`), borderBottom: `${u(1)} solid ${p.border}` }}>
      <T u={u} size={v(54, 44, 32)} weight={500} color={p.text} track={-0.01}>
        {item.source.name}
      </T>
      <Row u={u} gap={v(30, 24, 18)} style={{ marginTop: u(v(26, 22, 16)) }}>
        {links.map((l, i) => (
          <T key={l} u={u} size={13} weight={i === 0 ? 550 : 430} color={i === 0 ? p.text : p.muted}>
            {l}
          </T>
        ))}
      </Row>
    </Col>
  );
}

export function LeadStory({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={v(26, 22, 18)} style={{ padding: v(`${u(50)} ${u(56)}`, `${u(36)} ${u(32)}`, `${u(20)} ${u(20)} ${u(28)}`) }}>
      <B u={u} h={v(520, 380, 220)} r={6} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${p.chart[0]}22, ${p.chart[2]}14 60%, transparent)` }} />
      </B>
      <Col u={u} gap={v(18, 16, 14)} style={{ maxWidth: u(v(900, 720, 350)) }}>
        <T u={u} size={12} weight={550} color={p.accent} track={0.06}>
          FEATURE
        </T>
        <T u={u} size={v(46, 36, 26)} weight={500} color={p.text} style={{ lineHeight: 1.12 }}>
          {item.source.tagline}
        </T>
        <Lines u={u} n={2} h={11} gap={11} c={p.muted} o={0.4} last={0.7} />
        <Row u={u} gap={10}>
          <Circle u={u} s={26} bg={p.raised} />
          <Line u={u} w={110} h={8} c={p.muted} o={0.4} />
        </Row>
      </Col>
    </Col>
  );
}

const ARTICLE_TAGS = ["CULTURE", "TECHNOLOGY", "INTERVIEW", "DESIGN"];

export function ArticleIndex({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const rule = `${u(1)} solid ${p.border}`;
  if (vp === "mobile") {
    /* phones: thumbnail-left list rows, the standard news pattern */
    return (
      <Col u={u} gap={0} style={{ padding: `${u(4)} ${u(20)} ${u(44)}`, borderTop: rule }}>
        {ARTICLE_TAGS.slice(0, 3).map((tag) => (
          <Row key={tag} u={u} gap={14} align="flex-start" style={{ padding: `${u(18)} 0`, borderBottom: rule }}>
            <B u={u} w={112} h={84} r={6} bg={p.raised} />
            <Col u={u} gap={9} grow>
              <T u={u} size={10.5} weight={550} color={p.muted} track={0.06}>
                {tag}
              </T>
              <Lines u={u} n={2} h={11} gap={8} c={p.text} o={0.55} last={0.6} />
              <Line u={u} w="50%" h={8} c={p.muted} o={0.3} />
            </Col>
          </Row>
        ))}
      </Col>
    );
  }
  const cards = ARTICLE_TAGS.slice(0, v(3, 4, 0)).map((tag) => (
    <Col key={tag} u={u} gap={14} grow style={{ paddingTop: u(30) }}>
      <B u={u} h={v(220, 200, 0)} r={6} bg={p.raised} />
      <T u={u} size={11} weight={550} color={p.muted} track={0.06}>
        {tag}
      </T>
      <Lines u={u} n={2} h={12} gap={9} c={p.text} o={0.55} last={0.55} />
      <Lines u={u} n={2} h={8} gap={8} c={p.muted} o={0.3} last={0.8} />
    </Col>
  ));
  return vp === "tablet" ? (
    <Grid u={u} cols={2} gap={20} rowGap={10} style={{ padding: `${u(10)} ${u(32)} ${u(56)}`, borderTop: rule }}>
      {cards}
    </Grid>
  ) : (
    <Row u={u} gap={24} align="stretch" style={{ padding: `${u(20)} ${u(56)} ${u(70)}`, borderTop: rule }}>
      {cards}
    </Row>
  );
}

/* -------------------------------------------------------------- docs */
export function DocsSidebar({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const tree: [string, string[]][] = [
    ["Getting started", ["Introduction", "Installation", "Quickstart"]],
    ["Core concepts", ["Projects", "Environments", "Secrets"]],
    ["Reference", ["CLI", "REST API", "Webhooks"]],
  ];
  return (
    <Col u={u} gap={v(26, 22, 22)} style={{ width: u(v(268, 220, 290)), borderRight: `${u(1)} solid ${p.border}`, padding: u(v(26, 20, 22)), background: vp === "mobile" ? p.bg : undefined }}>
      <B u={u} h={32} r={8} bg={p.raised} style={{ display: "flex", alignItems: "center", padding: `0 ${u(11)}` }}>
        <Line u={u} w={80} h={8} c={p.muted} o={0.4} />
      </B>
      {tree.map(([group, items], gi) => (
        <Col key={group} u={u} gap={10}>
          <T u={u} size={12} weight={600} color={p.text}>
            {group}
          </T>
          {items.map((it, i) => (
            <div
              key={it}
              style={{
                padding: `${u(6)} ${u(9)}`,
                marginLeft: u(-9),
                borderRadius: u(6),
                background: gi === 1 && i === 1 ? p.raised : undefined,
              }}
            >
              <T u={u} size={12.5} weight={gi === 1 && i === 1 ? 550 : 430} color={gi === 1 && i === 1 ? p.text : p.muted}>
                {it}
              </T>
            </div>
          ))}
        </Col>
      ))}
    </Col>
  );
}

/** Phones: the docs tree hides behind a menu button, search stays one tap away. */
export function DocsMobileBar({ u, p, item }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(16)} ${u(20)}`, borderBottom: `${u(1)} solid ${p.border}` }}>
      <Row u={u} gap={14}>
        <Burger u={u} c={p.text} s={20} />
        <T u={u} size={15} weight={600} color={p.text}>
          {item.source.name} Docs
        </T>
      </Row>
      <B u={u} w={32} h={32} r={8} bg={p.raised} />
    </Row>
  );
}

export function DocsBody({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={v(20, 18, 16)} grow style={{ padding: v(`${u(40)} ${u(48)}`, `${u(32)} ${u(32)}`, `${u(22)} ${u(20)} ${u(32)}`), minWidth: 0 }}>
      <Row u={u} gap={8}>
        <T u={u} size={12} weight={430} color={p.muted}>
          Core concepts
        </T>
        <T u={u} size={12} weight={430} color={p.muted} style={{ opacity: 0.5 }}>
          /
        </T>
        <T u={u} size={12} weight={500} color={p.text}>
          Environments
        </T>
      </Row>
      <T u={u} size={v(36, 32, 28)} weight={600} color={p.text}>
        Environments
      </T>
      {vp === "mobile" ? (
        <Row u={u} justify="space-between" style={{ border: `${u(1)} solid ${p.border}`, borderRadius: u(8), padding: `${u(10)} ${u(12)}` }}>
          <T u={u} size={12} weight={500} color={p.text}>
            On this page
          </T>
          <B u={u} w={10} h={10} r={2} bg={p.muted} style={{ opacity: 0.4 }} />
        </Row>
      ) : null}
      <Lines u={u} n={3} h={10} gap={11} c={p.muted} o={0.35} last={0.65} />
      <B u={u} r={10} bg={p.dark ? "#000" : "#0E1116"} style={{ padding: u(v(18, 18, 14)), overflow: "hidden" }}>
        <Col u={u} gap={9}>
          {[
            [["#7DD3FC", 60], ["#E5E7EB", 120]],
            [["#C084FC", 40], ["#FDE68A", 90], ["#E5E7EB", 50]],
            [["#7DD3FC", 80], ["#34D399", 140]],
            [["#6B7280", 180]],
          ].map((row, i) => (
            <Row key={i} u={u} gap={8} style={{ paddingLeft: u(i === 3 ? 0 : i * 6) }}>
              {(row as [string, number][]).map(([c, w], j) => (
                <B key={j} u={u} w={w} h={8} r={3} bg={c} style={{ opacity: 0.85 }} />
              ))}
            </Row>
          ))}
        </Col>
      </B>
      <Lines u={u} n={2} h={10} gap={11} c={p.muted} o={0.35} last={0.5} />
      <B u={u} r={10} border={p.accent} style={{ padding: u(16), background: `${p.accent}12` }}>
        <Lines u={u} n={2} h={8} gap={9} c={p.text} o={0.4} last={0.6} />
      </B>
    </Col>
  );
}

export function DocsToc({ u, p }: SecProps) {
  return (
    <Col u={u} gap={13} style={{ width: u(220), padding: `${u(44)} ${u(26)}` }}>
      <T u={u} size={11} weight={600} color={p.muted} track={0.06}>
        ON THIS PAGE
      </T>
      {[0, 1, 2, 3, 4].map((i) => (
        <Line key={i} u={u} w={`${50 + noise(i, 31) * 40}%`} h={8} c={i === 1 ? p.accent : p.muted} o={i === 1 ? 0.9 : 0.3} />
      ))}
    </Col>
  );
}

/* ------------------------------------------------------------ agency */
export function AgencyHero({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  const side = u(v(56, 32, 20));
  return (
    <B u={u} h={v(880, 720, 600)} bg={p.raised} style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${p.chart[0]}2e, ${p.chart[1]}1a 45%, transparent 75%)` }} />
      <div style={{ position: "absolute", right: "-8%", top: "-12%", width: u(v(760, 560, 380)), height: u(v(760, 560, 380)), borderRadius: "50%", background: `${p.accent}18` }} />
      <Row u={u} justify="space-between" style={{ position: "relative", padding: `${u(v(30, 26, 18))} ${side}` }}>
        <T u={u} size={17} weight={600} color={p.text}>
          {item.source.name}
        </T>
        {vp === "mobile" ? (
          <Burger u={u} c={p.text} />
        ) : (
          <Row u={u} gap={26}>
            {["Work", "Services", "About", "Contact"].map((l) => (
              <T key={l} u={u} size={13} weight={450} color={p.text} style={{ opacity: 0.7 }}>
                {l}
              </T>
            ))}
          </Row>
        )}
      </Row>
      <Col u={u} gap={v(24, 22, 20)} style={{ position: "relative", marginTop: "auto", padding: `0 ${side} ${u(v(60, 48, 36))}` }}>
        <T u={u} size={v(108, 72, 46)} weight={500} color={p.text} style={{ lineHeight: 0.98, maxWidth: u(v(1000, 700, 350)) }}>
          {item.source.tagline}
        </T>
        {vp === "mobile" ? (
          <Col u={u} gap={14}>
            <Btn u={u} label="View work" w={0} h={50} r={999} bg={p.accent} fg={p.accentFg} size={15} />
            <Line u={u} w={200} h={9} c={p.muted} o={0.45} />
          </Col>
        ) : (
          <Row u={u} gap={16}>
            <Btn u={u} label="View work" w={150} h={50} r={999} bg={p.accent} fg={p.accentFg} size={15} />
            <Line u={u} w={220} h={9} c={p.muted} o={0.45} />
          </Row>
        )}
      </Col>
    </B>
  );
}

export function ServicesList({ u, p, vp }: SecProps) {
  const v = pick(vp);
  const svc = ["Brand identity", "Digital product", "Art direction", "Motion"];
  return (
    <Col u={u} gap={0} style={{ padding: v(`${u(70)} ${u(56)}`, `${u(56)} ${u(32)}`, `${u(36)} ${u(20)}`) }}>
      {svc.map((s, i) => (
        <Row key={s} u={u} justify="space-between" style={{ padding: `${u(v(34, 28, 22))} 0`, borderTop: `${u(1)} solid ${p.border}` }}>
          <Row u={u} gap={v(36, 28, 16)}>
            <T u={u} size={13} weight={450} color={p.muted}>
              0{i + 1}
            </T>
            <T u={u} size={v(38, 30, 22)} weight={500} color={p.text}>
              {s}
            </T>
          </Row>
          <Circle u={u} s={v(38, 34, 28)} bg={p.raised} />
        </Row>
      ))}
    </Col>
  );
}

/* ------------------------------------------------------------ mobile */
export function StatusBar({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(14)} ${u(v(24, 28, 24))} ${u(6)}` }}>
      <T u={u} size={13} weight={600} color={p.text}>
        9:41
      </T>
      <Row u={u} gap={5}>
        <B u={u} w={16} h={9} r={2} bg={p.text} style={{ opacity: 0.8 }} />
        <B u={u} w={13} h={9} r={2} bg={p.text} style={{ opacity: 0.8 }} />
        <B u={u} w={22} h={10} r={3} bg={p.text} style={{ opacity: 0.8 }} />
      </Row>
    </Row>
  );
}

/** App destinations per mobile archetype — the tab bar on phones, the nav on bigger screens. */
export function appNav(item: Item) {
  return item.archetype === "mobile-finance"
    ? ["Home", "Cards", "Payments", "Insights", "Settings"]
    : ["Home", "Search", "Create", "Activity", "Profile"];
}

export function TabBar({ u, p, item, vp }: SecProps) {
  /* tablets keep the bar but give each destination a label */
  if (vp === "tablet") {
    return (
      <Row u={u} justify="space-around" style={{ marginTop: "auto", padding: `${u(12)} ${u(60)} ${u(22)}`, borderTop: `${u(1)} solid ${p.border}` }}>
        {appNav(item).map((n, i) => (
          <Col key={n} u={u} gap={7} align="center">
            <B u={u} w={22} h={22} r={6} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 1 : 0.22 }} />
            <T u={u} size={11} weight={i === 0 ? 600 : 450} color={i === 0 ? p.accent : p.muted}>
              {n}
            </T>
          </Col>
        ))}
      </Row>
    );
  }
  return (
    <Row u={u} justify="space-between" style={{ marginTop: "auto", padding: `${u(12)} ${u(26)} ${u(26)}`, borderTop: `${u(1)} solid ${p.border}` }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Col key={i} u={u} gap={6} align="center">
          <B u={u} w={20} h={20} r={6} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 1 : 0.22 }} />
          <B u={u} w={22} h={4} r={2} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 0.8 : 0.16 }} />
        </Col>
      ))}
    </Row>
  );
}

/** Laptop: the tab bar becomes a labelled left nav. */
export function AppSideNav({ u, p, item }: SecProps) {
  return (
    <Col u={u} gap={4} style={{ width: u(240), borderRight: `${u(1)} solid ${p.border}`, padding: `${u(26)} ${u(18)}`, background: p.surface }}>
      <Row u={u} gap={10} style={{ marginBottom: u(28), paddingLeft: u(10) }}>
        <Circle u={u} s={26} bg={p.accent} />
        <T u={u} size={16} weight={600} color={p.text}>
          {item.source.name}
        </T>
      </Row>
      {appNav(item).map((n, i) => (
        <Row key={n} u={u} gap={12} style={{ padding: `${u(11)} ${u(12)}`, borderRadius: u(10), background: i === 0 ? p.raised : undefined }}>
          <B u={u} w={18} h={18} r={5} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 1 : 0.25 }} />
          <T u={u} size={14} weight={i === 0 ? 600 : 450} color={i === 0 ? p.text : p.muted}>
            {n}
          </T>
        </Row>
      ))}
      <Row u={u} gap={10} style={{ marginTop: "auto", padding: `${u(14)} ${u(10)} 0`, borderTop: `${u(1)} solid ${p.border}` }}>
        <Circle u={u} s={30} bg={p.raised} />
        <Col u={u} gap={6}>
          <Line u={u} w={80} h={8} c={p.text} o={0.5} />
          <Line u={u} w={56} h={7} c={p.muted} o={0.35} />
        </Col>
      </Row>
    </Col>
  );
}

function BalanceCard({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <B u={u} r={20} bg={p.accent} style={{ padding: u(v(28, 24, 20)), position: "relative", overflow: "hidden", minWidth: 0 }}>
      <div style={{ position: "absolute", right: u(-40), top: u(-40), width: u(v(240, 210, 180)), height: u(v(240, 210, 180)), borderRadius: "50%", background: "#ffffff1f" }} />
      <T u={u} size={12} weight={480} color={p.accentFg} style={{ opacity: 0.8 }}>
        Total balance
      </T>
      <T u={u} size={v(44, 40, 36)} weight={600} color={p.accentFg} style={{ marginTop: u(10) }}>
        £12,480.20
      </T>
      <Row u={u} gap={8} style={{ marginTop: u(18) }}>
        <B u={u} h={26} r={999} style={{ background: "#ffffff26", padding: `0 ${u(12)}`, display: "flex", alignItems: "center" }}>
          <T u={u} size={11} weight={550} color={p.accentFg}>
            +2.4% this month
          </T>
        </B>
      </Row>
    </B>
  );
}

function QuickActions({ u, p, vp }: SecProps) {
  const acts = ["Send", "Request", "Top up", "Split"].map((a) => (
    <Col key={a} u={u} gap={9} align="center">
      <Circle u={u} s={46} bg={p.raised} />
      <T u={u} size={11} weight={450} color={p.muted}>
        {a}
      </T>
    </Col>
  ));
  return vp === "mobile" ? (
    <Row u={u} justify="space-between" style={{ padding: `${u(22)} ${u(28)}` }}>
      {acts}
    </Row>
  ) : (
    <B u={u} r={20} border={p.border} bg={p.surface} style={{ padding: u(22), display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Grid u={u} cols={vp === "tablet" ? 2 : 4} gap={16} rowGap={20}>
        {acts}
      </Grid>
    </B>
  );
}

function TxnList({ u, p, n }: SecProps & { n: number }) {
  return (
    <div>
      <Row u={u} justify="space-between" style={{ paddingBottom: u(12) }}>
        <T u={u} size={14} weight={600} color={p.text}>
          Recent
        </T>
        <T u={u} size={12} weight={450} color={p.accent}>
          See all
        </T>
      </Row>
      <Col u={u} gap={16}>
        {Array.from({ length: n }).map((_, i) => (
          <Row key={i} u={u} gap={12}>
            <Circle u={u} s={38} bg={p.raised} />
            <Col u={u} gap={7} grow>
              <Line u={u} w={`${45 + noise(i, 37) * 30}%`} h={9} c={p.text} o={0.6} />
              <Line u={u} w={`${28 + noise(i, 41) * 18}%`} h={8} c={p.muted} o={0.35} />
            </Col>
            <Line u={u} w={46} h={9} c={p.text} o={0.55} />
          </Row>
        ))}
      </Col>
    </div>
  );
}

function Greeting({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={7}>
      <T u={u} size={13} weight={430} color={p.muted}>
        Good morning
      </T>
      <T u={u} size={v(28, 24, 21)} weight={600} color={p.text}>
        {item.source.name}
      </T>
    </Col>
  );
}

export function MobileFinance(props: SecProps) {
  const { u, p, vp } = props;
  if (vp === "tablet") {
    return (
      <Col u={u} gap={24} style={{ padding: `${u(18)} ${u(32)} ${u(24)}` }}>
        <Row u={u} justify="space-between">
          <Greeting {...props} />
          <Circle u={u} s={44} bg={p.raised} />
        </Row>
        <Grid u={u} cols={2} gap={18}>
          <BalanceCard {...props} />
          <QuickActions {...props} />
        </Grid>
        <B u={u} r={16} border={p.border} bg={p.surface} style={{ padding: u(22) }}>
          <TxnList {...props} n={7} />
        </B>
      </Col>
    );
  }
  if (vp === "desktop") {
    return (
      <Col u={u} gap={24} grow style={{ padding: `${u(32)} ${u(40)}`, minWidth: 0 }}>
        <Row u={u} justify="space-between">
          <Greeting {...props} />
          <Row u={u} gap={12}>
            <Btn u={u} label="Send money" w={140} h={42} r={10} bg={p.accent} fg={p.accentFg} size={14} />
            <Circle u={u} s={42} bg={p.raised} />
          </Row>
        </Row>
        <Row u={u} gap={20} align="stretch">
          <div style={{ flex: 1.1, display: "flex", flexDirection: "column" }}>
            <BalanceCard {...props} />
          </div>
          <div style={{ flex: 1.4 }}>
            <QuickActions {...props} />
          </div>
          <div style={{ flex: 1.2, display: "flex" }}>
            <ChartPanel {...props} />
          </div>
        </Row>
        <DataTable {...props} />
      </Col>
    );
  }
  return (
    <>
      <Row u={u} justify="space-between" style={{ padding: `${u(14)} ${u(22)} ${u(18)}` }}>
        <Greeting {...props} />
        <Circle u={u} s={38} bg={p.raised} />
      </Row>
      <div style={{ margin: `0 ${u(20)}` }}>
        <BalanceCard {...props} />
      </div>
      <QuickActions {...props} />
      <div style={{ padding: `${u(4)} ${u(22)} 0` }}>
        <TxnList {...props} n={5} />
      </div>
    </>
  );
}

function Stories({ u, p, n }: SecProps & { n: number }) {
  return (
    <Row u={u} gap={12}>
      {Array.from({ length: n }).map((_, i) => (
        <Col key={i} u={u} gap={7} align="center">
          <Circle u={u} s={54} bg={p.raised} style={{ border: i < 3 ? `${u(2)} solid ${p.accent}` : undefined }} />
          <Line u={u} w={32} h={6} c={p.muted} o={0.35} />
        </Col>
      ))}
    </Row>
  );
}

function Post({ u, p, i, h }: SecProps & { i: number; h: number }) {
  return (
    <Col u={u} gap={11}>
      <Row u={u} gap={10}>
        <Circle u={u} s={32} bg={p.raised} />
        <Col u={u} gap={6} grow>
          <Line u={u} w={90} h={8} c={p.text} o={0.55} />
          <Line u={u} w={60} h={7} c={p.muted} o={0.3} />
        </Col>
      </Row>
      <B u={u} h={h} r={14} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${60 + i * 80}deg, ${p.chart[i % 4]}2a, transparent 70%)` }} />
      </B>
      <Row u={u} gap={16}>
        {[0, 1, 2].map((k) => (
          <B key={k} u={u} w={20} h={20} r={6} bg={p.text} style={{ opacity: 0.2 }} />
        ))}
      </Row>
      <Lines u={u} n={2} h={8} gap={8} c={p.muted} o={0.3} last={0.5} />
    </Col>
  );
}

export function MobileFeed(props: SecProps) {
  const { u, p, item, vp } = props;
  const header = (
    <Row u={u} justify="space-between">
      <T u={u} size={vp === "mobile" ? 22 : 26} weight={600} color={p.text}>
        {item.title}
      </T>
      <Row u={u} gap={10}>
        <Circle u={u} s={32} bg={p.raised} />
        <Circle u={u} s={32} bg={p.raised} />
      </Row>
    </Row>
  );
  if (vp === "tablet") {
    return (
      <Col u={u} gap={20} style={{ padding: `${u(16)} ${u(32)} ${u(24)}` }}>
        {header}
        <Stories {...props} n={11} />
        <Grid u={u} cols={2} gap={20} rowGap={26}>
          {[0, 1, 2, 3].map((i) => (
            <Post key={i} {...props} i={i} h={300} />
          ))}
        </Grid>
      </Col>
    );
  }
  if (vp === "desktop") {
    return (
      <Row u={u} gap={48} align="flex-start" justify="center" grow style={{ padding: `${u(32)} ${u(40)}`, minWidth: 0 }}>
        <Col u={u} gap={24} style={{ width: u(580) }}>
          {header}
          <Stories {...props} n={8} />
          {[0, 1].map((i) => (
            <Post key={i} {...props} i={i} h={420} />
          ))}
        </Col>
        <Col u={u} gap={18} style={{ width: u(300), paddingTop: u(56) }}>
          <T u={u} size={13} weight={600} color={p.muted}>
            Suggested for you
          </T>
          {Array.from({ length: 5 }).map((_, i) => (
            <Row key={i} u={u} gap={12}>
              <Circle u={u} s={36} bg={p.raised} />
              <Col u={u} gap={6} grow>
                <Line u={u} w={`${50 + noise(i, 43) * 30}%`} h={8} c={p.text} o={0.55} />
                <Line u={u} w="40%" h={7} c={p.muted} o={0.3} />
              </Col>
              <T u={u} size={12} weight={550} color={p.accent}>
                Follow
              </T>
            </Row>
          ))}
        </Col>
      </Row>
    );
  }
  return (
    <>
      <div style={{ padding: `${u(14)} ${u(22)} ${u(16)}` }}>{header}</div>
      <div style={{ padding: `0 ${u(22)} ${u(18)}` }}>
        <Stories {...props} n={6} />
      </div>
      <Col u={u} gap={18} style={{ padding: `0 ${u(22)}` }}>
        {[0, 1].map((i) => (
          <Post key={i} {...props} i={i} h={182} />
        ))}
      </Col>
    </>
  );
}

function OnboardingArt({ u, p, h, r }: SecProps & { h: number | string; r: number }) {
  return (
    <B u={u} h={h} style={{ position: "relative", overflow: "hidden", borderRadius: u(r), background: p.raised }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${u(340)} ${u(340)} at 50% 40%, ${p.accent}38, transparent 68%)` }} />
      <div style={{ position: "absolute", left: "26%", top: "28%", width: u(180), height: u(180), borderRadius: "50%", background: `${p.accent}30` }} />
      <div style={{ position: "absolute", left: "44%", top: "46%", width: u(120), height: u(120), borderRadius: u(28), background: `${p.chart[1]}38` }} />
    </B>
  );
}

function Dots({ u, p }: SecProps) {
  return (
    <Row u={u} gap={8}>
      {[0, 1, 2].map((i) => (
        <B key={i} u={u} w={i === 1 ? 22 : 8} h={8} r={999} bg={i === 1 ? p.accent : p.text} style={{ opacity: i === 1 ? 1 : 0.18 }} />
      ))}
    </Row>
  );
}

export function MobileOnboarding(props: SecProps) {
  const { u, p, item, vp } = props;
  if (vp === "desktop") {
    /* split screen: illustration left, the step's copy and actions right */
    return (
      <Row u={u} align="stretch" grow>
        <div style={{ flex: 1.1, display: "flex", flexDirection: "column", padding: u(24) }}>
          <OnboardingArt {...props} h="100%" r={24} />
        </div>
        <Col u={u} gap={22} justify="center" style={{ flex: 1, padding: `0 ${u(96)} 0 ${u(64)}` }}>
          <Dots {...props} />
          <T u={u} size={44} weight={600} color={p.text} style={{ lineHeight: 1.15 }}>
            {item.source.tagline}
          </T>
          <Lines u={u} n={2} w={420} h={10} gap={10} c={p.muted} o={0.35} last={0.7} />
          <Row u={u} gap={18} style={{ marginTop: u(14) }}>
            <Btn u={u} label="Get started" w={180} h={52} r={14} bg={p.accent} fg={p.accentFg} size={16} />
            <T u={u} size={13} weight={450} color={p.muted}>
              I already have an account
            </T>
          </Row>
        </Col>
      </Row>
    );
  }
  const tablet = vp === "tablet";
  return (
    <>
      <div style={{ margin: tablet ? `${u(24)} ${u(96)} 0` : `${u(10)} ${u(20)} 0` }}>
        <OnboardingArt {...props} h={tablet ? 560 : 420} r={tablet ? 28 : 24} />
      </div>
      <Col u={u} gap={16} align="center" style={{ padding: tablet ? `${u(56)} ${u(120)} 0` : `${u(44)} ${u(32)} 0` }}>
        <T u={u} size={tablet ? 40 : 30} weight={600} color={p.text} style={{ textAlign: "center", lineHeight: 1.2 }}>
          {item.source.tagline}
        </T>
        <Col u={u} gap={9} align="center" style={{ width: "88%" }}>
          <Line u={u} w="100%" h={9} c={p.muted} o={0.35} />
          <Line u={u} w="70%" h={9} c={p.muted} o={0.35} />
        </Col>
      </Col>
      <Row u={u} justify="center" style={{ marginTop: "auto", paddingBottom: u(24) }}>
        <Dots {...props} />
      </Row>
      <Col u={u} gap={14} align="center" style={{ padding: tablet ? `0 ${u(220)} ${u(48)}` : `0 ${u(24)} ${u(34)}` }}>
        <Btn u={u} label="Get started" w={0} h={54} r={14} bg={p.accent} fg={p.accentFg} size={16} />
        <T u={u} size={13} weight={450} color={p.muted}>
          I already have an account
        </T>
      </Col>
    </>
  );
}

function ProfileStats({ u, p, gap }: SecProps & { gap?: number }) {
  return (
    <>
      {[["128", "Sessions"], ["42h", "Time"], ["9", "Streak"]].map(([val, l]) => (
        <Col key={l} u={u} gap={7} align="center" style={gap ? { minWidth: u(gap) } : undefined}>
          <T u={u} size={20} weight={600} color={p.text}>
            {val}
          </T>
          <T u={u} size={11} weight={430} color={p.muted}>
            {l}
          </T>
        </Col>
      ))}
    </>
  );
}

function Segments({ u, p, w }: SecProps & { w?: number }) {
  return (
    <Row u={u} gap={4} style={{ background: p.raised, borderRadius: u(10), padding: u(4), width: w ? u(w) : undefined }}>
      {["Activity", "Saved", "Stats"].map((t, i) => (
        <B key={t} u={u} h={32} r={8} bg={i === 0 ? p.surface : undefined} grow style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <T u={u} size={12} weight={i === 0 ? 550 : 430} color={i === 0 ? p.text : p.muted}>
            {t}
          </T>
        </B>
      ))}
    </Row>
  );
}

function Tiles({ u, p, cols, n, h, gap }: SecProps & { cols: number; n: number; h: number; gap: number }) {
  return (
    <Grid u={u} cols={cols} gap={gap}>
      {Array.from({ length: n }).map((_, i) => (
        <B key={i} u={u} h={h} r={10} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${30 + i * 40}deg, ${p.chart[i % 4]}26, transparent 70%)` }} />
        </B>
      ))}
    </Grid>
  );
}

export function MobileProfile(props: SecProps) {
  const { u, p, item, vp } = props;
  if (vp !== "mobile") {
    const desk = vp === "desktop";
    return (
      <Col u={u} gap={desk ? 28 : 24} grow style={{ padding: desk ? `${u(36)} ${u(48)}` : `${u(16)} ${u(32)} ${u(24)}`, minWidth: 0 }}>
        <Row u={u} gap={desk ? 36 : 24}>
          <Circle u={u} s={desk ? 132 : 104} bg={p.raised} />
          <Col u={u} gap={14} grow>
            <Row u={u} gap={16}>
              <T u={u} size={desk ? 26 : 22} weight={600} color={p.text}>
                {item.source.name}
              </T>
              <Btn u={u} label="Edit profile" w={116} h={34} r={9} border={p.border} fg={p.text} size={12} />
            </Row>
            <Line u={u} w={desk ? 260 : 220} h={9} c={p.muted} o={0.35} />
            <Row u={u} gap={desk ? 28 : 20} style={{ marginTop: u(6) }}>
              <ProfileStats {...props} gap={70} />
            </Row>
          </Col>
        </Row>
        <Segments {...props} w={desk ? 420 : 380} />
        <Tiles {...props} cols={desk ? 5 : 4} n={desk ? 10 : 12} h={desk ? 210 : 176} gap={desk ? 14 : 10} />
      </Col>
    );
  }
  return (
    <>
      <Row u={u} justify="space-between" style={{ padding: `${u(12)} ${u(22)} ${u(20)}` }}>
        <T u={u} size={17} weight={600} color={p.text}>
          {item.source.name}
        </T>
        <Circle u={u} s={30} bg={p.raised} />
      </Row>
      <Col u={u} gap={14} align="center">
        <Circle u={u} s={84} bg={p.raised} />
        <Col u={u} gap={8} align="center">
          <Line u={u} w={120} h={11} c={p.text} o={0.6} />
          <Line u={u} w={86} h={8} c={p.muted} o={0.35} />
        </Col>
      </Col>
      <Row u={u} justify="space-around" style={{ padding: `${u(24)} ${u(30)}` }}>
        <ProfileStats {...props} />
      </Row>
      <div style={{ margin: `0 ${u(22)}` }}>
        <Segments {...props} />
      </div>
      <div style={{ padding: `${u(18)} ${u(22)}` }}>
        <Tiles {...props} cols={3} n={9} h={98} gap={8} />
      </div>
    </>
  );
}
