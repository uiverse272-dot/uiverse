import { B, Circle, Col, Grid, Line, Lines, Row, T, pick } from "../primitives";
import type { SecProps } from "./props";

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
