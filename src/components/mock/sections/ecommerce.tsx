import { B, Btn, Burger, Circle, Col, Line, Lines, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";

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
