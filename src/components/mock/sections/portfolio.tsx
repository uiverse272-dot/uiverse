import { B, Col, Line, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";

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
