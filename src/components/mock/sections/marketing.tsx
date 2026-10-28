import { B, Btn, Burger, Circle, Col, Grid, Line, Lines, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";

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
