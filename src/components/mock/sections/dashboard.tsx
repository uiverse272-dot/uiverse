import { B, Burger, Circle, Col, Grid, Line, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";

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
