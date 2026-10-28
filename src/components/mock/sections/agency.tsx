import { B, Btn, Burger, Circle, Col, Line, Row, T, pick } from "../primitives";
import type { SecProps } from "./props";

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
