import { B, Burger, Col, Line, Lines, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";

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
