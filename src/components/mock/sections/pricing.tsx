import { B, Btn, Circle, Col, Line, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";

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
