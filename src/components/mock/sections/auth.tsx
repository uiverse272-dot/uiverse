import { B, Btn, Circle, Col, Line, Row, T, pick } from "../primitives";
import type { SecProps } from "./props";

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
