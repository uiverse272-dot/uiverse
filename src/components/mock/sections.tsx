import type { Palette } from "@/lib/palettes";
import type { Item } from "@/lib/data";
import { B, Btn, Circle, Col, Line, Lines, Row, T, noise, type U } from "./primitives";

export type SecProps = { u: U; p: Palette; item: Item };

const NAV_LINKS = ["Product", "Solutions", "Docs", "Pricing"];

/* ---------------------------------------------------------------- nav */
export function Navbar({ u, p, item }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(26)} ${u(64)}` }}>
      <Row u={u} gap={10}>
        <Circle u={u} s={22} bg={p.accent} />
        <T u={u} size={18} weight={600} color={p.text}>
          {item.source.name}
        </T>
      </Row>
      <Row u={u} gap={34}>
        {NAV_LINKS.map((l) => (
          <T key={l} u={u} size={14} weight={450} color={p.muted}>
            {l}
          </T>
        ))}
      </Row>
      <Row u={u} gap={16}>
        <T u={u} size={14} weight={450} color={p.muted}>
          Sign in
        </T>
        <Btn u={u} label="Get started" w={124} h={38} r={8} bg={p.accent} fg={p.accentFg} size={14} />
      </Row>
    </Row>
  );
}

/* --------------------------------------------------------------- hero */
export function Hero({ u, p, item }: SecProps) {
  const words = item.source.tagline.split(" ");
  const mid = Math.ceil(words.length / 2);
  return (
    <Col u={u} gap={0} align="center" style={{ padding: `${u(96)} ${u(64)} ${u(72)}` }}>
      <B
        u={u}
        h={30}
        r={999}
        bg={p.raised}
        style={{ display: "flex", alignItems: "center", padding: `0 ${u(14)}`, marginBottom: u(28) }}
      >
        <T u={u} size={12} weight={500} color={p.muted}>
          {item.industry.toUpperCase().replace("-", " ")} · NEW
        </T>
      </B>
      <T u={u} size={68} weight={600} color={p.text} style={{ textAlign: "center", maxWidth: u(900) }}>
        {words.slice(0, mid).join(" ")}
        {"\n"}
        {words.slice(mid).join(" ")}
      </T>
      <Col u={u} gap={9} align="center" style={{ marginTop: u(26), width: u(520) }}>
        <Line u={u} w="86%" h={12} c={p.muted} o={0.4} />
        <Line u={u} w="62%" h={12} c={p.muted} o={0.4} />
      </Col>
      <Row u={u} gap={12} style={{ marginTop: u(34) }}>
        <Btn u={u} label="Start free" w={148} h={50} r={10} bg={p.accent} fg={p.accentFg} size={16} />
        <Btn u={u} label="Book a demo" w={148} h={50} r={10} border={p.border} fg={p.text} size={16} />
      </Row>
      <AppPreview u={u} p={p} item={item} />
    </Col>
  );
}

function AppPreview({ u, p }: SecProps) {
  return (
    <B
      u={u}
      w={1160}
      h={620}
      r={16}
      bg={p.surface}
      border={p.border}
      style={{ marginTop: u(64), overflow: "hidden", display: "flex" }}
    >
      <Col u={u} gap={12} style={{ width: u(200), padding: u(18), borderRight: `${u(1)} solid ${p.border}` }}>
        <Row u={u} gap={8}>
          <Circle u={u} s={16} bg={p.accent} />
          <Line u={u} w={64} h={8} c={p.text} o={0.5} />
        </Row>
        <div style={{ height: u(10) }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Row key={i} u={u} gap={9}>
            <B u={u} w={14} h={14} r={4} bg={p.text} style={{ opacity: i === 1 ? 0.7 : 0.2 }} />
            <Line u={u} w={i === 1 ? 84 : 60 + i * 6} h={8} c={p.text} o={i === 1 ? 0.55 : 0.18} />
          </Row>
        ))}
      </Col>
      <Col u={u} gap={14} grow style={{ padding: u(20) }}>
        <Row u={u} justify="space-between">
          <Line u={u} w={130} h={12} c={p.text} o={0.6} />
          <Row u={u} gap={8}>
            <B u={u} w={78} h={26} r={6} bg={p.raised} />
            <B u={u} w={26} h={26} r={6} bg={p.raised} />
          </Row>
        </Row>
        <Row u={u} gap={12}>
          {[0, 1, 2].map((i) => (
            <B key={i} u={u} h={78} r={10} bg={p.raised} grow style={{ padding: u(12) }}>
              <Line u={u} w={54} h={7} c={p.muted} o={0.5} />
              <T u={u} size={22} weight={600} color={p.text} style={{ marginTop: u(10) }}>
                {["48.2k", "3.1%", "912"][i]}
              </T>
            </B>
          ))}
        </Row>
        <B u={u} r={10} bg={p.raised} grow style={{ padding: u(16), display: "flex", alignItems: "flex-end", gap: u(6) }}>
          {Array.from({ length: 28 }).map((_, i) => (
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
export function LogoCloud({ u, p }: SecProps) {
  return (
    <Col u={u} gap={24} align="center" style={{ padding: `${u(40)} ${u(64)} ${u(80)}` }}>
      <Line u={u} w={220} h={9} c={p.muted} o={0.35} />
      <Row u={u} gap={56} justify="center">
        {[96, 118, 84, 130, 100].map((w, i) => (
          <Row key={i} u={u} gap={8}>
            <Circle u={u} s={18} bg={p.text} style={{ opacity: 0.22 }} />
            <Line u={u} w={w} h={13} c={p.text} o={0.22} r={4} />
          </Row>
        ))}
      </Row>
    </Col>
  );
}

/* ------------------------------------------------------- feature grid */
export function FeatureGrid({ u, p }: SecProps) {
  return (
    <Col u={u} gap={40} align="center" style={{ padding: `${u(40)} ${u(64)} ${u(90)}` }}>
      <Col u={u} gap={14} align="center">
        <T u={u} size={40} weight={600} color={p.text}>
          Everything in one place
        </T>
        <Line u={u} w={420} h={11} c={p.muted} o={0.4} />
      </Col>
      <Row u={u} gap={24} style={{ width: "100%" }}>
        {[0, 1, 2].map((i) => (
          <B key={i} u={u} h={258} r={14} bg={p.surface} border={p.border} grow style={{ padding: u(26) }}>
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
        ))}
      </Row>
    </Col>
  );
}

/* --------------------------------------------------------- stats band */
export function StatsBand({ u, p }: SecProps) {
  const stats: [string, string][] = [
    ["99.98%", "Uptime"],
    ["2.4M", "Events / day"],
    ["140ms", "p95 latency"],
    ["38", "Integrations"],
  ];
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(56)} ${u(120)}`, borderTop: `${u(1)} solid ${p.border}`, borderBottom: `${u(1)} solid ${p.border}` }}>
      {stats.map(([v, l]) => (
        <Col key={l} u={u} gap={10} align="center">
          <T u={u} size={42} weight={600} color={p.text}>
            {v}
          </T>
          <T u={u} size={13} weight={450} color={p.muted}>
            {l}
          </T>
        </Col>
      ))}
    </Row>
  );
}

/* -------------------------------------------------------- testimonial */
export function Testimonial({ u, p, item }: SecProps) {
  return (
    <Col u={u} gap={30} align="center" style={{ padding: `${u(90)} ${u(220)}` }}>
      <T u={u} size={30} weight={450} color={p.text} style={{ textAlign: "center", lineHeight: 1.45 }}>
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
export function CtaBand({ u, p }: SecProps) {
  return (
    <div style={{ padding: `${u(20)} ${u(64)} ${u(80)}` }}>
      <Col u={u} gap={24} align="center" style={{ background: p.raised, borderRadius: u(20), padding: `${u(64)} 0` }}>
        <T u={u} size={38} weight={600} color={p.text}>
          Start building today
        </T>
        <Line u={u} w={340} h={11} c={p.muted} o={0.4} />
        <Btn u={u} label="Create an account" w={196} h={50} r={10} bg={p.accent} fg={p.accentFg} size={16} />
      </Col>
    </div>
  );
}

/* ------------------------------------------------------------- footer */
export function Footer({ u, p, item }: SecProps) {
  return (
    <div style={{ borderTop: `${u(1)} solid ${p.border}`, padding: `${u(54)} ${u(64)}` }}>
      <Row u={u} justify="space-between" align="flex-start">
        <Col u={u} gap={14}>
          <Row u={u} gap={10}>
            <Circle u={u} s={20} bg={p.accent} />
            <T u={u} size={16} weight={600} color={p.text}>
              {item.source.name}
            </T>
          </Row>
          <Line u={u} w={180} h={9} c={p.muted} o={0.3} />
        </Col>
        {[0, 1, 2, 3].map((c) => (
          <Col key={c} u={u} gap={13} style={{ width: u(130) }}>
            <Line u={u} w={64} h={9} c={p.text} o={0.55} />
            {Array.from({ length: 4 }).map((_, i) => (
              <Line key={i} u={u} w={78 - i * 8 + c * 5} h={8} c={p.muted} o={0.28} />
            ))}
          </Col>
        ))}
      </Row>
    </div>
  );
}

/* ---------------------------------------------------------- dashboard */
export function Sidebar({ u, p, item }: SecProps) {
  const nav = ["Overview", "Reports", "Customers", "Transactions", "Automations", "Team", "Settings"];
  return (
    <Col u={u} gap={0} style={{ width: u(248), background: p.surface, borderRight: `${u(1)} solid ${p.border}`, padding: u(18), height: "100%" }}>
      <Row u={u} gap={10} style={{ marginBottom: u(26) }}>
        <Circle u={u} s={22} bg={p.accent} />
        <T u={u} size={15} weight={600} color={p.text}>
          {item.source.name}
        </T>
      </Row>
      <Col u={u} gap={4} grow>
        {nav.map((n, i) => (
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

export function StatCards({ u, p }: SecProps) {
  const cards: [string, string, string][] = [
    ["Net revenue", "£184,220", "+12.4%"],
    ["Active users", "9,318", "+4.1%"],
    ["Conversion", "3.42%", "-0.3%"],
    ["Avg. order", "£62.10", "+2.8%"],
  ];
  return (
    <Row u={u} gap={14} style={{ width: "100%" }}>
      {cards.map(([label, value, delta], i) => (
        <B key={label} u={u} h={104} r={12} bg={p.surface} border={p.border} grow style={{ padding: u(16) }}>
          <T u={u} size={12} weight={450} color={p.muted}>
            {label}
          </T>
          <T u={u} size={26} weight={600} color={p.text} style={{ marginTop: u(12) }}>
            {value}
          </T>
          <B
            u={u}
            h={20}
            r={999}
            bg={i === 2 ? p.chart[3] : p.chart[1]}
            style={{ opacity: 0.16, marginTop: u(10), width: "fit-content", padding: `0 ${u(9)}`, display: "flex", alignItems: "center" }}
          >
            <T u={u} size={11} weight={550} color={i === 2 ? p.chart[3] : p.chart[1]} >
              {delta}
            </T>
          </B>
        </B>
      ))}
    </Row>
  );
}

export function ChartPanel({ u, p }: SecProps) {
  return (
    <B u={u} r={12} bg={p.surface} border={p.border} grow style={{ padding: u(18), display: "flex", flexDirection: "column" }}>
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
      <Row u={u} gap={5} align="flex-end" grow style={{ marginTop: u(20) }}>
        {Array.from({ length: 34 }).map((_, i) => (
          <Col key={i} u={u} gap={0} grow justify="flex-end" style={{ height: "100%" }}>
            <B u={u} h={`${12 + noise(i, 7) * 62}%`} r={3} bg={p.accent} style={{ opacity: 0.85 }} />
            <B u={u} h={`${6 + noise(i, 11) * 22}%`} r={3} bg={p.text} style={{ opacity: 0.14, marginTop: u(3) }} />
          </Col>
        ))}
      </Row>
    </B>
  );
}

export function ActivityList({ u, p }: SecProps) {
  return (
    <B u={u} w={340} r={12} bg={p.surface} border={p.border} style={{ padding: u(18) }}>
      <T u={u} size={14} weight={550} color={p.text}>
        Recent activity
      </T>
      <Col u={u} gap={16} style={{ marginTop: u(18) }}>
        {Array.from({ length: 6 }).map((_, i) => (
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

export function DataTable({ u, p }: SecProps) {
  const cols = [3, 2, 2, 1.4, 1.2];
  return (
    <B u={u} r={12} bg={p.surface} border={p.border} style={{ padding: u(18), width: "100%" }}>
      <Row u={u} justify="space-between" style={{ marginBottom: u(16) }}>
        <T u={u} size={14} weight={550} color={p.text}>
          Transactions
        </T>
        <Row u={u} gap={8}>
          <B u={u} w={150} h={28} r={7} bg={p.raised} />
          <B u={u} w={90} h={28} r={7} bg={p.raised} />
        </Row>
      </Row>
      <Row u={u} gap={16} style={{ paddingBottom: u(11), borderBottom: `${u(1)} solid ${p.border}` }}>
        {cols.map((c, i) => (
          <div key={i} style={{ flex: c }}>
            <Line u={u} w="52%" h={8} c={p.muted} o={0.45} />
          </div>
        ))}
      </Row>
      {Array.from({ length: 6 }).map((_, r) => (
        <Row key={r} u={u} gap={16} style={{ padding: `${u(13)} 0`, borderBottom: r < 5 ? `${u(1)} solid ${p.border}` : undefined }}>
          <Row u={u} gap={10} style={{ flex: cols[0] }}>
            <Circle u={u} s={22} bg={p.raised} />
            <Line u={u} w={`${50 + noise(r, 4) * 34}%`} h={9} c={p.text} o={0.5} />
          </Row>
          <div style={{ flex: cols[1] }}>
            <Line u={u} w="70%" h={9} c={p.muted} o={0.3} />
          </div>
          <div style={{ flex: cols[2] }}>
            <Line u={u} w="58%" h={9} c={p.muted} o={0.3} />
          </div>
          <div style={{ flex: cols[3] }}>
            <B u={u} h={20} r={999} bg={p.chart[r % 3]} style={{ width: u(64), opacity: 0.18 }} />
          </div>
          <div style={{ flex: cols[4], display: "flex", justifyContent: "flex-end" }}>
            <Line u={u} w={52} h={9} c={p.text} o={0.5} />
          </div>
        </Row>
      ))}
    </B>
  );
}

export function TopBar({ u, p }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ height: u(62), padding: `0 ${u(22)}`, borderBottom: `${u(1)} solid ${p.border}`, flexShrink: 0 }}>
      <T u={u} size={16} weight={600} color={p.text}>
        Overview
      </T>
      <Row u={u} gap={12}>
        <B u={u} w={232} h={32} r={8} bg={p.raised} style={{ display: "flex", alignItems: "center", padding: `0 ${u(11)}` }}>
          <Line u={u} w={92} h={8} c={p.muted} o={0.4} />
        </B>
        <B u={u} w={32} h={32} r={8} bg={p.raised} />
        <Circle u={u} s={32} bg={p.raised} />
      </Row>
    </Row>
  );
}

/* ------------------------------------------------------------ pricing */
export function PricingTiers({ u, p }: SecProps) {
  const tiers: [string, string, number][] = [
    ["Free", "£0", 4],
    ["Pro", "£18", 6],
    ["Team", "£42", 7],
  ];
  return (
    <Row u={u} gap={20} align="stretch" justify="center" style={{ padding: `0 ${u(120)}` }}>
      {tiers.map(([name, price, feats], i) => (
        <B
          key={name}
          u={u}
          r={16}
          bg={i === 1 ? p.surface : undefined}
          border={i === 1 ? p.accent : p.border}
          grow
          style={{ padding: u(28), maxWidth: u(340) }}
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
            <T u={u} size={44} weight={600} color={p.text}>
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
            {Array.from({ length: feats }).map((_, f) => (
              <Row key={f} u={u} gap={10}>
                <Circle u={u} s={15} bg={p.accent} style={{ opacity: 0.2 }} />
                <Line u={u} w={`${52 + noise(f, i + 1) * 36}%`} h={8} c={p.text} o={0.4} />
              </Row>
            ))}
          </Col>
        </B>
      ))}
    </Row>
  );
}

export function BillingToggle({ u, p }: SecProps) {
  return (
    <Row u={u} justify="center" style={{ padding: `${u(10)} 0 ${u(44)}` }}>
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

export function SectionHeader({ u, p, title, sub }: SecProps & { title?: string; sub?: string }) {
  return (
    <Col u={u} gap={16} align="center" style={{ padding: `${u(80)} ${u(64)} ${u(30)}` }}>
      <T u={u} size={48} weight={600} color={p.text}>
        {title ?? "Simple, honest pricing"}
      </T>
      <Line u={u} w={sub ? 300 : 420} h={11} c={p.muted} o={0.4} />
    </Col>
  );
}

export function Faq({ u, p }: SecProps) {
  return (
    <Col u={u} gap={0} style={{ padding: `${u(70)} ${u(300)}` }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Row key={i} u={u} justify="space-between" style={{ padding: `${u(22)} 0`, borderBottom: `${u(1)} solid ${p.border}` }}>
          <Line u={u} w={`${40 + noise(i, 9) * 30}%`} h={11} c={p.text} o={0.6} />
          <B u={u} w={13} h={13} r={2} bg={p.muted} style={{ opacity: 0.4 }} />
        </Row>
      ))}
    </Col>
  );
}

/* --------------------------------------------------------- ecommerce */
export function ShopNav({ u, p, item }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(22)} ${u(56)}`, borderBottom: `${u(1)} solid ${p.border}` }}>
      <Row u={u} gap={30}>
        <T u={u} size={19} weight={600} color={p.text} track={0.02}>
          {item.source.name.toUpperCase()}
        </T>
        <Row u={u} gap={22}>
          {["New in", "Collections", "Archive", "Journal"].map((l) => (
            <T key={l} u={u} size={13} weight={450} color={p.muted}>
              {l}
            </T>
          ))}
        </Row>
      </Row>
      <Row u={u} gap={14}>
        <B u={u} w={200} h={32} r={999} bg={p.raised} style={{ display: "flex", alignItems: "center", padding: `0 ${u(14)}` }}>
          <Line u={u} w={66} h={7} c={p.muted} o={0.45} />
        </B>
        <Circle u={u} s={30} bg={p.raised} />
        <Circle u={u} s={30} bg={p.raised} />
      </Row>
    </Row>
  );
}

export function CampaignHero({ u, p, item }: SecProps) {
  return (
    <B u={u} h={520} bg={p.raised} style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", padding: `0 ${u(80)}` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(${u(700)} ${u(500)} at 78% 40%, ${p.accent}22, transparent 70%)`,
        }}
      />
      <Col u={u} gap={22} style={{ position: "relative", maxWidth: u(560) }}>
        <T u={u} size={56} weight={600} color={p.text}>
          {item.source.tagline}
        </T>
        <Lines u={u} n={2} w={420} h={10} gap={10} c={p.muted} o={0.4} />
        <Btn u={u} label="Shop the collection" w={220} h={48} r={999} bg={p.accent} fg={p.accentFg} size={15} />
      </Col>
      <B u={u} w={420} h={400} r={16} bg={p.surface} style={{ position: "absolute", right: u(80), opacity: 0.9 }} />
    </B>
  );
}

export function CategoryRow({ u, p }: SecProps) {
  return (
    <Row u={u} gap={10} style={{ padding: `${u(28)} ${u(56)}` }}>
      {["All", "Outerwear", "Knitwear", "Trousers", "Accessories", "Archive"].map((c, i) => (
        <B key={c} u={u} h={34} r={999} bg={i === 0 ? p.accent : undefined} border={i === 0 ? undefined : p.border} style={{ padding: `0 ${u(16)}`, display: "flex", alignItems: "center" }}>
          <T u={u} size={13} weight={480} color={i === 0 ? p.accentFg : p.muted}>
            {c}
          </T>
        </B>
      ))}
    </Row>
  );
}

export function ProductGrid({ u, p }: SecProps) {
  return (
    <Row u={u} gap={18} wrap style={{ padding: `${u(10)} ${u(56)} ${u(70)}` }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Col key={i} u={u} gap={12} style={{ width: `calc(25% - ${u(14)})` }}>
          <B u={u} h={330} r={10} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${140 + i * 24}deg, ${p.chart[i % 4]}1f, transparent 60%)` }} />
          </B>
          <Line u={u} w={`${52 + noise(i, 13) * 32}%`} h={10} c={p.text} o={0.6} />
          <Line u={u} w={54} h={9} c={p.muted} o={0.4} />
        </Col>
      ))}
    </Row>
  );
}

/* --------------------------------------------------------- portfolio */
export function MinimalNav({ u, p, item }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(32)} ${u(56)}` }}>
      <T u={u} size={15} weight={550} color={p.text}>
        {item.source.name}
      </T>
      <Row u={u} gap={26}>
        {["Work", "Studio", "Contact"].map((l) => (
          <T key={l} u={u} size={13} weight={450} color={p.muted}>
            {l}
          </T>
        ))}
      </Row>
    </Row>
  );
}

export function TypeStatement({ u, p, item }: SecProps) {
  return (
    <Col u={u} gap={0} style={{ padding: `${u(90)} ${u(56)} ${u(80)}` }}>
      <T u={u} size={96} weight={500} color={p.text} style={{ lineHeight: 1.04, maxWidth: u(1100) }}>
        {item.source.about}
      </T>
      <Row u={u} gap={14} style={{ marginTop: u(48) }}>
        <B u={u} h={30} r={999} border={p.border} style={{ padding: `0 ${u(14)}`, display: "flex", alignItems: "center" }}>
          <T u={u} size={12} weight={450} color={p.muted}>
            Selected work — 2026
          </T>
        </B>
      </Row>
    </Col>
  );
}

export function WorkGrid({ u, p }: SecProps) {
  return (
    <Row u={u} gap={20} wrap style={{ padding: `0 ${u(56)} ${u(60)}` }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Col key={i} u={u} gap={14} style={{ width: `calc(50% - ${u(10)})` }}>
          <B u={u} h={420} r={12} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
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

export function IndexList({ u, p }: SecProps) {
  return (
    <Col u={u} gap={0} style={{ padding: `${u(20)} ${u(56)} ${u(70)}` }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Row key={i} u={u} justify="space-between" style={{ padding: `${u(24)} 0`, borderTop: `${u(1)} solid ${p.border}` }}>
          <Row u={u} gap={28}>
            <T u={u} size={12} weight={450} color={p.muted}>
              0{i + 1}
            </T>
            <Line u={u} w={`${140 + noise(i, 19) * 200}px`} h={12} c={p.text} o={0.6} />
          </Row>
          <Line u={u} w={70} h={9} c={p.muted} o={0.3} />
        </Row>
      ))}
    </Col>
  );
}

/* ---------------------------------------------------------- checkout */
export function CheckoutForm({ u, p }: SecProps) {
  return (
    <Col u={u} gap={26} style={{ flex: 1.35, padding: `${u(48)} ${u(56)}` }}>
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

export function OrderSummary({ u, p }: SecProps) {
  return (
    <Col u={u} gap={18} style={{ flex: 1, background: p.surface, borderLeft: `${u(1)} solid ${p.border}`, padding: `${u(48)} ${u(48)}` }}>
      <T u={u} size={14} weight={550} color={p.text}>
        Order summary
      </T>
      {Array.from({ length: 3 }).map((_, i) => (
        <Row key={i} u={u} gap={14}>
          <B u={u} w={64} h={78} r={8} bg={p.raised} />
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

/* -------------------------------------------------------------- auth */
export function AuthCard({ u, p, item }: SecProps) {
  return (
    <Col u={u} gap={0} align="center" justify="center" style={{ flex: 1, padding: u(60) }}>
      <Col u={u} gap={0} style={{ width: u(380) }}>
        <Circle u={u} s={34} bg={p.accent} />
        <T u={u} size={28} weight={600} color={p.text} style={{ marginTop: u(26) }}>
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

/* --------------------------------------------------------- editorial */
export function Masthead({ u, p, item }: SecProps) {
  return (
    <Col u={u} gap={0} align="center" style={{ padding: `${u(40)} ${u(56)} ${u(22)}`, borderBottom: `${u(1)} solid ${p.border}` }}>
      <T u={u} size={54} weight={500} color={p.text} track={-0.01}>
        {item.source.name}
      </T>
      <Row u={u} gap={30} style={{ marginTop: u(26) }}>
        {["Latest", "Culture", "Technology", "Interviews", "Archive"].map((l, i) => (
          <T key={l} u={u} size={13} weight={i === 0 ? 550 : 430} color={i === 0 ? p.text : p.muted}>
            {l}
          </T>
        ))}
      </Row>
    </Col>
  );
}

export function LeadStory({ u, p, item }: SecProps) {
  return (
    <Col u={u} gap={26} style={{ padding: `${u(50)} ${u(56)}` }}>
      <B u={u} h={520} r={6} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${p.chart[0]}22, ${p.chart[2]}14 60%, transparent)` }} />
      </B>
      <Col u={u} gap={18} style={{ maxWidth: u(900) }}>
        <T u={u} size={12} weight={550} color={p.accent} track={0.06}>
          FEATURE
        </T>
        <T u={u} size={46} weight={500} color={p.text} style={{ lineHeight: 1.12 }}>
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

export function ArticleIndex({ u, p }: SecProps) {
  return (
    <Row u={u} gap={24} align="stretch" style={{ padding: `${u(20)} ${u(56)} ${u(70)}`, borderTop: `${u(1)} solid ${p.border}` }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Col key={i} u={u} gap={14} grow style={{ paddingTop: u(30) }}>
          <B u={u} h={220} r={6} bg={p.raised} />
          <T u={u} size={11} weight={550} color={p.muted} track={0.06}>
            {["CULTURE", "TECHNOLOGY", "INTERVIEW"][i]}
          </T>
          <Lines u={u} n={2} h={12} gap={9} c={p.text} o={0.55} last={0.55} />
          <Lines u={u} n={2} h={8} gap={8} c={p.muted} o={0.3} last={0.8} />
        </Col>
      ))}
    </Row>
  );
}

/* -------------------------------------------------------------- docs */
export function DocsSidebar({ u, p }: SecProps) {
  const tree: [string, string[]][] = [
    ["Getting started", ["Introduction", "Installation", "Quickstart"]],
    ["Core concepts", ["Projects", "Environments", "Secrets"]],
    ["Reference", ["CLI", "REST API", "Webhooks"]],
  ];
  return (
    <Col u={u} gap={26} style={{ width: u(268), borderRight: `${u(1)} solid ${p.border}`, padding: u(26), height: "100%" }}>
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

export function DocsBody({ u, p }: SecProps) {
  return (
    <Col u={u} gap={20} grow style={{ padding: `${u(40)} ${u(48)}` }}>
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
      <T u={u} size={36} weight={600} color={p.text}>
        Environments
      </T>
      <Lines u={u} n={3} h={10} gap={11} c={p.muted} o={0.35} last={0.65} />
      <B u={u} r={10} bg={p.dark ? "#000" : "#0E1116"} style={{ padding: u(18) }}>
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

/* ------------------------------------------------------------ agency */
export function AgencyHero({ u, p, item }: SecProps) {
  return (
    <B u={u} h={880} bg={p.raised} style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${p.chart[0]}2e, ${p.chart[1]}1a 45%, transparent 75%)` }} />
      <div style={{ position: "absolute", right: "-8%", top: "-12%", width: u(760), height: u(760), borderRadius: "50%", background: `${p.accent}18` }} />
      <Row u={u} justify="space-between" style={{ position: "relative", padding: `${u(30)} ${u(56)}` }}>
        <T u={u} size={17} weight={600} color={p.text}>
          {item.source.name}
        </T>
        <Row u={u} gap={26}>
          {["Work", "Services", "About", "Contact"].map((l) => (
            <T key={l} u={u} size={13} weight={450} color={p.text} style={{ opacity: 0.7 }}>
              {l}
            </T>
          ))}
        </Row>
      </Row>
      <Col u={u} gap={24} style={{ position: "relative", marginTop: "auto", padding: `0 ${u(56)} ${u(60)}` }}>
        <T u={u} size={108} weight={500} color={p.text} style={{ lineHeight: 0.98, maxWidth: u(1000) }}>
          {item.source.tagline}
        </T>
        <Row u={u} gap={16}>
          <Btn u={u} label="View work" w={150} h={50} r={999} bg={p.accent} fg={p.accentFg} size={15} />
          <Line u={u} w={220} h={9} c={p.muted} o={0.45} />
        </Row>
      </Col>
    </B>
  );
}

export function ServicesList({ u, p }: SecProps) {
  const svc = ["Brand identity", "Digital product", "Art direction", "Motion"];
  return (
    <Col u={u} gap={0} style={{ padding: `${u(70)} ${u(56)}` }}>
      {svc.map((s, i) => (
        <Row key={s} u={u} justify="space-between" style={{ padding: `${u(34)} 0`, borderTop: `${u(1)} solid ${p.border}` }}>
          <Row u={u} gap={36}>
            <T u={u} size={13} weight={450} color={p.muted}>
              0{i + 1}
            </T>
            <T u={u} size={38} weight={500} color={p.text}>
              {s}
            </T>
          </Row>
          <Circle u={u} s={38} bg={p.raised} />
        </Row>
      ))}
    </Col>
  );
}

/* ------------------------------------------------------------ mobile */
export function StatusBar({ u, p }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(14)} ${u(24)} ${u(6)}` }}>
      <T u={u} size={13} weight={600} color={p.text}>
        9:41
      </T>
      <Row u={u} gap={5}>
        <B u={u} w={16} h={9} r={2} bg={p.text} style={{ opacity: 0.8 }} />
        <B u={u} w={13} h={9} r={2} bg={p.text} style={{ opacity: 0.8 }} />
        <B u={u} w={22} h={10} r={3} bg={p.text} style={{ opacity: 0.8 }} />
      </Row>
    </Row>
  );
}

export function TabBar({ u, p }: SecProps) {
  return (
    <Row u={u} justify="space-between" style={{ marginTop: "auto", padding: `${u(12)} ${u(26)} ${u(26)}`, borderTop: `${u(1)} solid ${p.border}` }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Col key={i} u={u} gap={6} align="center">
          <B u={u} w={20} h={20} r={6} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 1 : 0.22 }} />
          <B u={u} w={22} h={4} r={2} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 0.8 : 0.16 }} />
        </Col>
      ))}
    </Row>
  );
}

export function MobileFinance({ u, p, item }: SecProps) {
  return (
    <>
      <Row u={u} justify="space-between" style={{ padding: `${u(14)} ${u(22)} ${u(18)}` }}>
        <Col u={u} gap={7}>
          <T u={u} size={13} weight={430} color={p.muted}>
            Good morning
          </T>
          <T u={u} size={21} weight={600} color={p.text}>
            {item.source.name}
          </T>
        </Col>
        <Circle u={u} s={38} bg={p.raised} />
      </Row>
      <B u={u} r={20} bg={p.accent} style={{ margin: `0 ${u(20)}`, padding: u(20), position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: u(-40), top: u(-40), width: u(180), height: u(180), borderRadius: "50%", background: "#ffffff1f" }} />
        <T u={u} size={12} weight={480} color={p.accentFg} style={{ opacity: 0.8 }}>
          Total balance
        </T>
        <T u={u} size={36} weight={600} color={p.accentFg} style={{ marginTop: u(10) }}>
          £12,480.20
        </T>
        <Row u={u} gap={8} style={{ marginTop: u(18) }}>
          <B u={u} h={26} r={999} style={{ background: "#ffffff26", padding: `0 ${u(12)}`, display: "flex", alignItems: "center" }}>
            <T u={u} size={11} weight={550} color={p.accentFg}>
              +2.4% this month
            </T>
          </B>
        </Row>
      </B>
      <Row u={u} justify="space-between" style={{ padding: `${u(22)} ${u(28)}` }}>
        {["Send", "Request", "Top up", "Split"].map((a) => (
          <Col key={a} u={u} gap={9} align="center">
            <Circle u={u} s={46} bg={p.raised} />
            <T u={u} size={11} weight={450} color={p.muted}>
              {a}
            </T>
          </Col>
        ))}
      </Row>
      <Row u={u} justify="space-between" style={{ padding: `${u(4)} ${u(22)} ${u(12)}` }}>
        <T u={u} size={14} weight={600} color={p.text}>
          Recent
        </T>
        <T u={u} size={12} weight={450} color={p.accent}>
          See all
        </T>
      </Row>
      <Col u={u} gap={16} style={{ padding: `0 ${u(22)}` }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Row key={i} u={u} gap={12}>
            <Circle u={u} s={38} bg={p.raised} />
            <Col u={u} gap={7} grow>
              <Line u={u} w={`${45 + noise(i, 37) * 30}%`} h={9} c={p.text} o={0.6} />
              <Line u={u} w={`${28 + noise(i, 41) * 18}%`} h={8} c={p.muted} o={0.35} />
            </Col>
            <Line u={u} w={46} h={9} c={p.text} o={0.55} />
          </Row>
        ))}
      </Col>
    </>
  );
}

export function MobileFeed({ u, p, item }: SecProps) {
  return (
    <>
      <Row u={u} justify="space-between" style={{ padding: `${u(14)} ${u(22)} ${u(16)}` }}>
        <T u={u} size={22} weight={600} color={p.text}>
          {item.title}
        </T>
        <Row u={u} gap={10}>
          <Circle u={u} s={32} bg={p.raised} />
          <Circle u={u} s={32} bg={p.raised} />
        </Row>
      </Row>
      <Row u={u} gap={12} style={{ padding: `0 ${u(22)} ${u(18)}` }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Col key={i} u={u} gap={7} align="center">
            <Circle u={u} s={54} bg={p.raised} style={{ border: i < 3 ? `${u(2)} solid ${p.accent}` : undefined }} />
            <Line u={u} w={32} h={6} c={p.muted} o={0.35} />
          </Col>
        ))}
      </Row>
      <Col u={u} gap={18} style={{ padding: `0 ${u(22)}` }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Col key={i} u={u} gap={11}>
            <Row u={u} gap={10}>
              <Circle u={u} s={32} bg={p.raised} />
              <Col u={u} gap={6} grow>
                <Line u={u} w={90} h={8} c={p.text} o={0.55} />
                <Line u={u} w={60} h={7} c={p.muted} o={0.3} />
              </Col>
            </Row>
            <B u={u} h={182} r={14} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${60 + i * 80}deg, ${p.chart[i % 4]}2a, transparent 70%)` }} />
            </B>
            <Row u={u} gap={16}>
              {[0, 1, 2].map((k) => (
                <B key={k} u={u} w={20} h={20} r={6} bg={p.text} style={{ opacity: 0.2 }} />
              ))}
            </Row>
            <Lines u={u} n={2} h={8} gap={8} c={p.muted} o={0.3} last={0.5} />
          </Col>
        ))}
      </Col>
    </>
  );
}

export function MobileOnboarding({ u, p, item }: SecProps) {
  return (
    <>
      <B u={u} h={420} style={{ position: "relative", overflow: "hidden", margin: `${u(10)} ${u(20)} 0`, borderRadius: u(24), background: p.raised }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${u(340)} ${u(340)} at 50% 40%, ${p.accent}38, transparent 68%)` }} />
        <div style={{ position: "absolute", left: "26%", top: "28%", width: u(180), height: u(180), borderRadius: "50%", background: `${p.accent}30` }} />
        <div style={{ position: "absolute", left: "44%", top: "46%", width: u(120), height: u(120), borderRadius: u(28), background: `${p.chart[1]}38` }} />
      </B>
      <Col u={u} gap={16} align="center" style={{ padding: `${u(44)} ${u(32)} 0` }}>
        <T u={u} size={30} weight={600} color={p.text} style={{ textAlign: "center", lineHeight: 1.2 }}>
          {item.source.tagline}
        </T>
        <Col u={u} gap={9} align="center" style={{ width: "88%" }}>
          <Line u={u} w="100%" h={9} c={p.muted} o={0.35} />
          <Line u={u} w="70%" h={9} c={p.muted} o={0.35} />
        </Col>
      </Col>
      <Row u={u} gap={8} justify="center" style={{ marginTop: "auto", paddingBottom: u(24) }}>
        {[0, 1, 2].map((i) => (
          <B key={i} u={u} w={i === 1 ? 22 : 8} h={8} r={999} bg={i === 1 ? p.accent : p.text} style={{ opacity: i === 1 ? 1 : 0.18 }} />
        ))}
      </Row>
      <Col u={u} gap={14} align="center" style={{ padding: `0 ${u(24)} ${u(34)}` }}>
        <Btn u={u} label="Get started" w={0} h={54} r={14} bg={p.accent} fg={p.accentFg} size={16} />
        <T u={u} size={13} weight={450} color={p.muted}>
          I already have an account
        </T>
      </Col>
    </>
  );
}

export function MobileProfile({ u, p, item }: SecProps) {
  return (
    <>
      <Row u={u} justify="space-between" style={{ padding: `${u(12)} ${u(22)} ${u(20)}` }}>
        <T u={u} size={17} weight={600} color={p.text}>
          {item.source.name}
        </T>
        <Circle u={u} s={30} bg={p.raised} />
      </Row>
      <Col u={u} gap={14} align="center">
        <Circle u={u} s={84} bg={p.raised} />
        <Col u={u} gap={8} align="center">
          <Line u={u} w={120} h={11} c={p.text} o={0.6} />
          <Line u={u} w={86} h={8} c={p.muted} o={0.35} />
        </Col>
      </Col>
      <Row u={u} justify="space-around" style={{ padding: `${u(24)} ${u(30)}` }}>
        {[["128", "Sessions"], ["42h", "Time"], ["9", "Streak"]].map(([v, l]) => (
          <Col key={l} u={u} gap={7} align="center">
            <T u={u} size={20} weight={600} color={p.text}>
              {v}
            </T>
            <T u={u} size={11} weight={430} color={p.muted}>
              {l}
            </T>
          </Col>
        ))}
      </Row>
      <Row u={u} gap={4} style={{ margin: `0 ${u(22)}`, background: p.raised, borderRadius: u(10), padding: u(4) }}>
        {["Activity", "Saved", "Stats"].map((t, i) => (
          <B key={t} u={u} h={32} r={8} bg={i === 0 ? p.surface : undefined} grow style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <T u={u} size={12} weight={i === 0 ? 550 : 430} color={i === 0 ? p.text : p.muted}>
              {t}
            </T>
          </B>
        ))}
      </Row>
      <Row u={u} gap={8} wrap style={{ padding: `${u(18)} ${u(22)}` }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <B key={i} u={u} h={98} r={10} bg={p.raised} style={{ width: `calc(33.333% - ${u(6)})`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${30 + i * 40}deg, ${p.chart[i % 4]}26, transparent 70%)` }} />
          </B>
        ))}
      </Row>
    </>
  );
}
