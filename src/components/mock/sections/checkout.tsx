import { B, Btn, Circle, Col, Line, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";

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
