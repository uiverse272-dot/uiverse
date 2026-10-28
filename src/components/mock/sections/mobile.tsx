import type { Item } from "@/lib/data";
import { B, Btn, Circle, Col, Grid, Line, Lines, Row, T, noise, pick } from "../primitives";
import type { SecProps } from "./props";
import { ChartPanel, DataTable } from "./dashboard";

export function StatusBar({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Row u={u} justify="space-between" style={{ padding: `${u(14)} ${u(v(24, 28, 24))} ${u(6)}` }}>
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

/** App destinations per mobile archetype — the tab bar on phones, the nav on bigger screens. */
export function appNav(item: Item) {
  return item.archetype === "mobile-finance"
    ? ["Home", "Cards", "Payments", "Insights", "Settings"]
    : ["Home", "Search", "Create", "Activity", "Profile"];
}

export function TabBar({ u, p, item, vp }: SecProps) {
  /* tablets keep the bar but give each destination a label */
  if (vp === "tablet") {
    return (
      <Row u={u} justify="space-around" style={{ marginTop: "auto", padding: `${u(12)} ${u(60)} ${u(22)}`, borderTop: `${u(1)} solid ${p.border}` }}>
        {appNav(item).map((n, i) => (
          <Col key={n} u={u} gap={7} align="center">
            <B u={u} w={22} h={22} r={6} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 1 : 0.22 }} />
            <T u={u} size={11} weight={i === 0 ? 600 : 450} color={i === 0 ? p.accent : p.muted}>
              {n}
            </T>
          </Col>
        ))}
      </Row>
    );
  }
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

/** Laptop: the tab bar becomes a labelled left nav. */
export function AppSideNav({ u, p, item }: SecProps) {
  return (
    <Col u={u} gap={4} style={{ width: u(240), borderRight: `${u(1)} solid ${p.border}`, padding: `${u(26)} ${u(18)}`, background: p.surface }}>
      <Row u={u} gap={10} style={{ marginBottom: u(28), paddingLeft: u(10) }}>
        <Circle u={u} s={26} bg={p.accent} />
        <T u={u} size={16} weight={600} color={p.text}>
          {item.source.name}
        </T>
      </Row>
      {appNav(item).map((n, i) => (
        <Row key={n} u={u} gap={12} style={{ padding: `${u(11)} ${u(12)}`, borderRadius: u(10), background: i === 0 ? p.raised : undefined }}>
          <B u={u} w={18} h={18} r={5} bg={i === 0 ? p.accent : p.text} style={{ opacity: i === 0 ? 1 : 0.25 }} />
          <T u={u} size={14} weight={i === 0 ? 600 : 450} color={i === 0 ? p.text : p.muted}>
            {n}
          </T>
        </Row>
      ))}
      <Row u={u} gap={10} style={{ marginTop: "auto", padding: `${u(14)} ${u(10)} 0`, borderTop: `${u(1)} solid ${p.border}` }}>
        <Circle u={u} s={30} bg={p.raised} />
        <Col u={u} gap={6}>
          <Line u={u} w={80} h={8} c={p.text} o={0.5} />
          <Line u={u} w={56} h={7} c={p.muted} o={0.35} />
        </Col>
      </Row>
    </Col>
  );
}

function BalanceCard({ u, p, vp }: SecProps) {
  const v = pick(vp);
  return (
    <B u={u} r={20} bg={p.accent} style={{ padding: u(v(28, 24, 20)), position: "relative", overflow: "hidden", minWidth: 0 }}>
      <div style={{ position: "absolute", right: u(-40), top: u(-40), width: u(v(240, 210, 180)), height: u(v(240, 210, 180)), borderRadius: "50%", background: "#ffffff1f" }} />
      <T u={u} size={12} weight={480} color={p.accentFg} style={{ opacity: 0.8 }}>
        Total balance
      </T>
      <T u={u} size={v(44, 40, 36)} weight={600} color={p.accentFg} style={{ marginTop: u(10) }}>
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
  );
}

function QuickActions({ u, p, vp }: SecProps) {
  const acts = ["Send", "Request", "Top up", "Split"].map((a) => (
    <Col key={a} u={u} gap={9} align="center">
      <Circle u={u} s={46} bg={p.raised} />
      <T u={u} size={11} weight={450} color={p.muted}>
        {a}
      </T>
    </Col>
  ));
  return vp === "mobile" ? (
    <Row u={u} justify="space-between" style={{ padding: `${u(22)} ${u(28)}` }}>
      {acts}
    </Row>
  ) : (
    <B u={u} r={20} border={p.border} bg={p.surface} style={{ padding: u(22), display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Grid u={u} cols={vp === "tablet" ? 2 : 4} gap={16} rowGap={20}>
        {acts}
      </Grid>
    </B>
  );
}

function TxnList({ u, p, n }: SecProps & { n: number }) {
  return (
    <div>
      <Row u={u} justify="space-between" style={{ paddingBottom: u(12) }}>
        <T u={u} size={14} weight={600} color={p.text}>
          Recent
        </T>
        <T u={u} size={12} weight={450} color={p.accent}>
          See all
        </T>
      </Row>
      <Col u={u} gap={16}>
        {Array.from({ length: n }).map((_, i) => (
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
    </div>
  );
}

function Greeting({ u, p, item, vp }: SecProps) {
  const v = pick(vp);
  return (
    <Col u={u} gap={7}>
      <T u={u} size={13} weight={430} color={p.muted}>
        Good morning
      </T>
      <T u={u} size={v(28, 24, 21)} weight={600} color={p.text}>
        {item.source.name}
      </T>
    </Col>
  );
}

export function MobileFinance(props: SecProps) {
  const { u, p, vp } = props;
  if (vp === "tablet") {
    return (
      <Col u={u} gap={24} style={{ padding: `${u(18)} ${u(32)} ${u(24)}` }}>
        <Row u={u} justify="space-between">
          <Greeting {...props} />
          <Circle u={u} s={44} bg={p.raised} />
        </Row>
        <Grid u={u} cols={2} gap={18}>
          <BalanceCard {...props} />
          <QuickActions {...props} />
        </Grid>
        <B u={u} r={16} border={p.border} bg={p.surface} style={{ padding: u(22) }}>
          <TxnList {...props} n={7} />
        </B>
      </Col>
    );
  }
  if (vp === "desktop") {
    return (
      <Col u={u} gap={24} grow style={{ padding: `${u(32)} ${u(40)}`, minWidth: 0 }}>
        <Row u={u} justify="space-between">
          <Greeting {...props} />
          <Row u={u} gap={12}>
            <Btn u={u} label="Send money" w={140} h={42} r={10} bg={p.accent} fg={p.accentFg} size={14} />
            <Circle u={u} s={42} bg={p.raised} />
          </Row>
        </Row>
        <Row u={u} gap={20} align="stretch">
          <div style={{ flex: 1.1, display: "flex", flexDirection: "column" }}>
            <BalanceCard {...props} />
          </div>
          <div style={{ flex: 1.4 }}>
            <QuickActions {...props} />
          </div>
          <div style={{ flex: 1.2, display: "flex" }}>
            <ChartPanel {...props} />
          </div>
        </Row>
        <DataTable {...props} />
      </Col>
    );
  }
  return (
    <>
      <Row u={u} justify="space-between" style={{ padding: `${u(14)} ${u(22)} ${u(18)}` }}>
        <Greeting {...props} />
        <Circle u={u} s={38} bg={p.raised} />
      </Row>
      <div style={{ margin: `0 ${u(20)}` }}>
        <BalanceCard {...props} />
      </div>
      <QuickActions {...props} />
      <div style={{ padding: `${u(4)} ${u(22)} 0` }}>
        <TxnList {...props} n={5} />
      </div>
    </>
  );
}

function Stories({ u, p, n }: SecProps & { n: number }) {
  return (
    <Row u={u} gap={12}>
      {Array.from({ length: n }).map((_, i) => (
        <Col key={i} u={u} gap={7} align="center">
          <Circle u={u} s={54} bg={p.raised} style={{ border: i < 3 ? `${u(2)} solid ${p.accent}` : undefined }} />
          <Line u={u} w={32} h={6} c={p.muted} o={0.35} />
        </Col>
      ))}
    </Row>
  );
}

function Post({ u, p, i, h }: SecProps & { i: number; h: number }) {
  return (
    <Col u={u} gap={11}>
      <Row u={u} gap={10}>
        <Circle u={u} s={32} bg={p.raised} />
        <Col u={u} gap={6} grow>
          <Line u={u} w={90} h={8} c={p.text} o={0.55} />
          <Line u={u} w={60} h={7} c={p.muted} o={0.3} />
        </Col>
      </Row>
      <B u={u} h={h} r={14} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${60 + i * 80}deg, ${p.chart[i % 4]}2a, transparent 70%)` }} />
      </B>
      <Row u={u} gap={16}>
        {[0, 1, 2].map((k) => (
          <B key={k} u={u} w={20} h={20} r={6} bg={p.text} style={{ opacity: 0.2 }} />
        ))}
      </Row>
      <Lines u={u} n={2} h={8} gap={8} c={p.muted} o={0.3} last={0.5} />
    </Col>
  );
}

export function MobileFeed(props: SecProps) {
  const { u, p, item, vp } = props;
  const header = (
    <Row u={u} justify="space-between">
      <T u={u} size={vp === "mobile" ? 22 : 26} weight={600} color={p.text}>
        {item.title}
      </T>
      <Row u={u} gap={10}>
        <Circle u={u} s={32} bg={p.raised} />
        <Circle u={u} s={32} bg={p.raised} />
      </Row>
    </Row>
  );
  if (vp === "tablet") {
    return (
      <Col u={u} gap={20} style={{ padding: `${u(16)} ${u(32)} ${u(24)}` }}>
        {header}
        <Stories {...props} n={11} />
        <Grid u={u} cols={2} gap={20} rowGap={26}>
          {[0, 1, 2, 3].map((i) => (
            <Post key={i} {...props} i={i} h={300} />
          ))}
        </Grid>
      </Col>
    );
  }
  if (vp === "desktop") {
    return (
      <Row u={u} gap={48} align="flex-start" justify="center" grow style={{ padding: `${u(32)} ${u(40)}`, minWidth: 0 }}>
        <Col u={u} gap={24} style={{ width: u(580) }}>
          {header}
          <Stories {...props} n={8} />
          {[0, 1].map((i) => (
            <Post key={i} {...props} i={i} h={420} />
          ))}
        </Col>
        <Col u={u} gap={18} style={{ width: u(300), paddingTop: u(56) }}>
          <T u={u} size={13} weight={600} color={p.muted}>
            Suggested for you
          </T>
          {Array.from({ length: 5 }).map((_, i) => (
            <Row key={i} u={u} gap={12}>
              <Circle u={u} s={36} bg={p.raised} />
              <Col u={u} gap={6} grow>
                <Line u={u} w={`${50 + noise(i, 43) * 30}%`} h={8} c={p.text} o={0.55} />
                <Line u={u} w="40%" h={7} c={p.muted} o={0.3} />
              </Col>
              <T u={u} size={12} weight={550} color={p.accent}>
                Follow
              </T>
            </Row>
          ))}
        </Col>
      </Row>
    );
  }
  return (
    <>
      <div style={{ padding: `${u(14)} ${u(22)} ${u(16)}` }}>{header}</div>
      <div style={{ padding: `0 ${u(22)} ${u(18)}` }}>
        <Stories {...props} n={6} />
      </div>
      <Col u={u} gap={18} style={{ padding: `0 ${u(22)}` }}>
        {[0, 1].map((i) => (
          <Post key={i} {...props} i={i} h={182} />
        ))}
      </Col>
    </>
  );
}

function OnboardingArt({ u, p, h, r }: SecProps & { h: number | string; r: number }) {
  return (
    <B u={u} h={h} style={{ position: "relative", overflow: "hidden", borderRadius: u(r), background: p.raised }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${u(340)} ${u(340)} at 50% 40%, ${p.accent}38, transparent 68%)` }} />
      <div style={{ position: "absolute", left: "26%", top: "28%", width: u(180), height: u(180), borderRadius: "50%", background: `${p.accent}30` }} />
      <div style={{ position: "absolute", left: "44%", top: "46%", width: u(120), height: u(120), borderRadius: u(28), background: `${p.chart[1]}38` }} />
    </B>
  );
}

function Dots({ u, p }: SecProps) {
  return (
    <Row u={u} gap={8}>
      {[0, 1, 2].map((i) => (
        <B key={i} u={u} w={i === 1 ? 22 : 8} h={8} r={999} bg={i === 1 ? p.accent : p.text} style={{ opacity: i === 1 ? 1 : 0.18 }} />
      ))}
    </Row>
  );
}

export function MobileOnboarding(props: SecProps) {
  const { u, p, item, vp } = props;
  if (vp === "desktop") {
    /* split screen: illustration left, the step's copy and actions right */
    return (
      <Row u={u} align="stretch" grow>
        <div style={{ flex: 1.1, display: "flex", flexDirection: "column", padding: u(24) }}>
          <OnboardingArt {...props} h="100%" r={24} />
        </div>
        <Col u={u} gap={22} justify="center" style={{ flex: 1, padding: `0 ${u(96)} 0 ${u(64)}` }}>
          <Dots {...props} />
          <T u={u} size={44} weight={600} color={p.text} style={{ lineHeight: 1.15 }}>
            {item.source.tagline}
          </T>
          <Lines u={u} n={2} w={420} h={10} gap={10} c={p.muted} o={0.35} last={0.7} />
          <Row u={u} gap={18} style={{ marginTop: u(14) }}>
            <Btn u={u} label="Get started" w={180} h={52} r={14} bg={p.accent} fg={p.accentFg} size={16} />
            <T u={u} size={13} weight={450} color={p.muted}>
              I already have an account
            </T>
          </Row>
        </Col>
      </Row>
    );
  }
  const tablet = vp === "tablet";
  return (
    <>
      <div style={{ margin: tablet ? `${u(24)} ${u(96)} 0` : `${u(10)} ${u(20)} 0` }}>
        <OnboardingArt {...props} h={tablet ? 560 : 420} r={tablet ? 28 : 24} />
      </div>
      <Col u={u} gap={16} align="center" style={{ padding: tablet ? `${u(56)} ${u(120)} 0` : `${u(44)} ${u(32)} 0` }}>
        <T u={u} size={tablet ? 40 : 30} weight={600} color={p.text} style={{ textAlign: "center", lineHeight: 1.2 }}>
          {item.source.tagline}
        </T>
        <Col u={u} gap={9} align="center" style={{ width: "88%" }}>
          <Line u={u} w="100%" h={9} c={p.muted} o={0.35} />
          <Line u={u} w="70%" h={9} c={p.muted} o={0.35} />
        </Col>
      </Col>
      <Row u={u} justify="center" style={{ marginTop: "auto", paddingBottom: u(24) }}>
        <Dots {...props} />
      </Row>
      <Col u={u} gap={14} align="center" style={{ padding: tablet ? `0 ${u(220)} ${u(48)}` : `0 ${u(24)} ${u(34)}` }}>
        <Btn u={u} label="Get started" w={0} h={54} r={14} bg={p.accent} fg={p.accentFg} size={16} />
        <T u={u} size={13} weight={450} color={p.muted}>
          I already have an account
        </T>
      </Col>
    </>
  );
}

function ProfileStats({ u, p, gap }: SecProps & { gap?: number }) {
  return (
    <>
      {[["128", "Sessions"], ["42h", "Time"], ["9", "Streak"]].map(([val, l]) => (
        <Col key={l} u={u} gap={7} align="center" style={gap ? { minWidth: u(gap) } : undefined}>
          <T u={u} size={20} weight={600} color={p.text}>
            {val}
          </T>
          <T u={u} size={11} weight={430} color={p.muted}>
            {l}
          </T>
        </Col>
      ))}
    </>
  );
}

function Segments({ u, p, w }: SecProps & { w?: number }) {
  return (
    <Row u={u} gap={4} style={{ background: p.raised, borderRadius: u(10), padding: u(4), width: w ? u(w) : undefined }}>
      {["Activity", "Saved", "Stats"].map((t, i) => (
        <B key={t} u={u} h={32} r={8} bg={i === 0 ? p.surface : undefined} grow style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <T u={u} size={12} weight={i === 0 ? 550 : 430} color={i === 0 ? p.text : p.muted}>
            {t}
          </T>
        </B>
      ))}
    </Row>
  );
}

function Tiles({ u, p, cols, n, h, gap }: SecProps & { cols: number; n: number; h: number; gap: number }) {
  return (
    <Grid u={u} cols={cols} gap={gap}>
      {Array.from({ length: n }).map((_, i) => (
        <B key={i} u={u} h={h} r={10} bg={p.raised} style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${30 + i * 40}deg, ${p.chart[i % 4]}26, transparent 70%)` }} />
        </B>
      ))}
    </Grid>
  );
}

export function MobileProfile(props: SecProps) {
  const { u, p, item, vp } = props;
  if (vp !== "mobile") {
    const desk = vp === "desktop";
    return (
      <Col u={u} gap={desk ? 28 : 24} grow style={{ padding: desk ? `${u(36)} ${u(48)}` : `${u(16)} ${u(32)} ${u(24)}`, minWidth: 0 }}>
        <Row u={u} gap={desk ? 36 : 24}>
          <Circle u={u} s={desk ? 132 : 104} bg={p.raised} />
          <Col u={u} gap={14} grow>
            <Row u={u} gap={16}>
              <T u={u} size={desk ? 26 : 22} weight={600} color={p.text}>
                {item.source.name}
              </T>
              <Btn u={u} label="Edit profile" w={116} h={34} r={9} border={p.border} fg={p.text} size={12} />
            </Row>
            <Line u={u} w={desk ? 260 : 220} h={9} c={p.muted} o={0.35} />
            <Row u={u} gap={desk ? 28 : 20} style={{ marginTop: u(6) }}>
              <ProfileStats {...props} gap={70} />
            </Row>
          </Col>
        </Row>
        <Segments {...props} w={desk ? 420 : 380} />
        <Tiles {...props} cols={desk ? 5 : 4} n={desk ? 10 : 12} h={desk ? 210 : 176} gap={desk ? 14 : 10} />
      </Col>
    );
  }
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
        <ProfileStats {...props} />
      </Row>
      <div style={{ margin: `0 ${u(22)}` }}>
        <Segments {...props} />
      </div>
      <div style={{ padding: `${u(18)} ${u(22)}` }}>
        <Tiles {...props} cols={3} n={9} h={98} gap={8} />
      </div>
    </>
  );
}
