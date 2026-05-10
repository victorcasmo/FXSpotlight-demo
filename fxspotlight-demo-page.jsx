import { useState, useEffect, useRef } from "react";

const GUMROAD = "https://spotlightfx.gumroad.com/l/hrlfi";

const modules = [
  {
    id: "risk",
    code: "01",
    name: "Risk & Lot Size Calculator",
    tag: "POSITION SIZING",
    color: "#C8A84B",
    desc: "Professional-grade position sizing across 26 instruments. Your risk is calculated, not guessed.",
    demo: () => <RiskDemo />,
  },
  {
    id: "prop",
    code: "02",
    name: "Prop Firm Rule Protection",
    tag: "RULE ENFORCEMENT",
    color: "#E05C5C",
    desc: "Real-time monitoring of daily loss limits, drawdown caps, and position rules. Alerts before you breach.",
    demo: () => <PropDemo />,
  },
  {
    id: "checklist",
    code: "03",
    name: "Pre-Trade Checklist",
    tag: "DECISION GATE",
    color: "#5C9EE0",
    desc: "A systematic checklist that runs before every trade. If your setup doesn't pass, you don't enter.",
    demo: () => <ChecklistDemo />,
  },
  {
    id: "discipline",
    code: "04",
    name: "Discipline Tracker",
    tag: "PSYCHOLOGY",
    color: "#7E5CE0",
    desc: "Track emotional state, plan adherence, and decision quality. See exactly where your process breaks.",
    demo: () => <DisciplineDemo />,
  },
];

function RiskDemo() {
  const [balance, setBalance] = useState(10000);
  const [risk, setRisk] = useState(1);
  const [sl, setSl] = useState(20);
  const lotSize = ((balance * (risk / 100)) / (sl * 10)).toFixed(2);
  const riskAmount = (balance * (risk / 100)).toFixed(2);

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { label: "ACCOUNT BALANCE ($)", value: balance, set: setBalance, min: 1000, max: 100000, step: 1000 },
          { label: "RISK %", value: risk, set: setRisk, min: 0.1, max: 5, step: 0.1 },
          { label: "STOP LOSS (PIPS)", value: sl, set: setSl, min: 5, max: 100, step: 1 },
        ].map(f => (
          <div key={f.label} style={{ gridColumn: f.label === "STOP LOSS (PIPS)" ? "1 / -1" : "auto" }}>
            <div style={{ fontSize: "8px", color: "#555", letterSpacing: "2px", marginBottom: 6 }}>{f.label}</div>
            <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
              onChange={e => f.set(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#C8A84B" }} />
            <div style={{ fontSize: "12px", color: "#C8A84B", marginTop: 4 }}>{f.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#0a0a0a", border: "1px solid #C8A84B33", padding: "14px", borderRadius: "2px", textAlign: "center" }}>
          <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: 6 }}>LOT SIZE</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#C8A84B" }}>{lotSize}</div>
        </div>
        <div style={{ background: "#0a0a0a", border: "1px solid #E05C5C33", padding: "14px", borderRadius: "2px", textAlign: "center" }}>
          <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: 6 }}>RISK AMOUNT</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#E05C5C" }}>${riskAmount}</div>
        </div>
      </div>
    </div>
  );
}

function PropDemo() {
  const [drawdown, setDrawdown] = useState(3.2);
  const maxDD = 10;
  const daily = 2.1;
  const maxDaily = 5;
  const pct = (drawdown / maxDD) * 100;
  const dailyPct = (daily / maxDaily) * 100;
  const status = drawdown > 8 ? "DANGER" : drawdown > 5 ? "WARNING" : "SAFE";
  const statusColor = drawdown > 8 ? "#E05C5C" : drawdown > 5 ? "#C8A84B" : "#5CE0B8";

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px" }}>ACCOUNT STATUS</div>
        <div style={{ fontSize: "10px", color: statusColor, border: `1px solid ${statusColor}44`, padding: "2px 10px", borderRadius: "2px", letterSpacing: "2px" }}>{status}</div>
      </div>
      {[
        { label: "MAX DRAWDOWN", current: drawdown, max: maxDD, color: statusColor },
        { label: "DAILY LOSS", current: daily, max: maxDaily, color: "#5C9EE0" },
      ].map(item => (
        <div key={item.label} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px" }}>{item.label}</div>
            <div style={{ fontSize: "11px", color: item.color }}>{item.current}% / {item.max}%</div>
          </div>
          <div style={{ height: "6px", background: "#111", borderRadius: "3px" }}>
            <div style={{ height: "100%", width: `${(item.current / item.max) * 100}%`, background: item.color, borderRadius: "3px", transition: "width 0.4s" }} />
          </div>
        </div>
      ))}
      <input type="range" min={0} max={10} step={0.1} value={drawdown}
        onChange={e => setDrawdown(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#E05C5C", marginTop: 8 }} />
      <div style={{ fontSize: "9px", color: "#333", letterSpacing: "2px", marginTop: 4 }}>DRAG TO SIMULATE DRAWDOWN</div>
    </div>
  );
}

function ChecklistDemo() {
  const items = [
    "Setup aligns with higher timeframe bias",
    "Risk defined before entry",
    "Stop loss placed at structural level",
    "Risk/reward minimum 1:2",
    "No major news in next 2 hours",
    "Daily loss limit not at risk",
  ];
  const [checked, setChecked] = useState({});
  const toggle = i => setChecked(p => ({ ...p, [i]: !p[i] }));
  const passed = Object.values(checked).filter(Boolean).length;
  const canTrade = passed === items.length;

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => toggle(i)} style={{
            display: "flex", gap: 10, alignItems: "center",
            padding: "10px 12px", background: checked[i] ? "#0a0a0a" : "#080808",
            border: `1px solid ${checked[i] ? "#5C9EE033" : "#151515"}`,
            borderRadius: "2px", cursor: "pointer", transition: "all 0.15s",
          }}>
            <div style={{
              width: 14, height: 14, border: `1px solid ${checked[i] ? "#5C9EE0" : "#333"}`,
              borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center",
              background: checked[i] ? "#5C9EE0" : "transparent", flexShrink: 0,
            }}>
              {checked[i] && <span style={{ color: "#000", fontSize: "8px", fontWeight: "bold" }}>✓</span>}
            </div>
            <div style={{ fontSize: "11px", color: checked[i] ? "#888" : "#555", textDecoration: checked[i] ? "line-through" : "none" }}>{item}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "12px", textAlign: "center",
        background: canTrade ? "#0a0a0a" : "#080808",
        border: `1px solid ${canTrade ? "#5CE0B8" : "#E05C5C"}44`,
        borderRadius: "2px",
      }}>
        <div style={{ fontSize: "11px", color: canTrade ? "#5CE0B8" : "#E05C5C", letterSpacing: "2px", fontWeight: "bold" }}>
          {canTrade ? "✓ CLEARED TO TRADE" : `${passed}/${items.length} — HOLD YOUR ENTRY`}
        </div>
      </div>
    </div>
  );
}

function DisciplineDemo() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const scores = [8, 6, 9, 4, 7, 8, 0];
  const color = s => s >= 8 ? "#5CE0B8" : s >= 6 ? "#C8A84B" : s >= 4 ? "#5C9EE0" : s === 0 ? "#222" : "#E05C5C";

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: 4 }}>WEEKLY DISCIPLINE SCORE</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#C8A84B" }}>7.0<span style={{ fontSize: "12px", color: "#333" }}>/10</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: 4 }}>STREAK</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#5CE0B8" }}>4<span style={{ fontSize: "12px", color: "#333" }}> days</span></div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80, marginBottom: 8 }}>
        {days.map((day, i) => (
          <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: "8px", color: color(scores[i]) }}>{scores[i] || "—"}</div>
            <div style={{
              width: "100%", background: color(scores[i]),
              height: `${Math.max(4, (scores[i] / 10) * 56)}px`,
              borderRadius: "2px", transition: "height 0.4s",
            }} />
            <div style={{ fontSize: "7px", color: "#333", letterSpacing: "1px" }}>{day}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
        {[
          { label: "FOLLOWED PLAN", value: "5/6", color: "#5CE0B8" },
          { label: "REVENGE TRADES", value: "0", color: "#5CE0B8" },
          { label: "EMOTIONAL ENTRIES", value: "1", color: "#C8A84B" },
        ].map(m => (
          <div key={m.label} style={{ background: "#0a0a0a", border: "1px solid #151515", padding: "10px", borderRadius: "2px", textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: m.color, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: "7px", color: "#444", letterSpacing: "1px" }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function AnimatedSection({ children, delay = 0 }) {
  const ref = useRef();
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>{children}</div>
  );
}

export default function FXSpotlightDemo() {
  const [activeModule, setActiveModule] = useState("risk");
  const [slots] = useState(23);
  const active = modules.find(m => m.id === activeModule);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060606",
      color: "#fff",
      fontFamily: "'Courier New', monospace",
      overflowX: "hidden",
    }}>
      {/* Noise texture overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      {/* Hero */}
      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", textAlign: "center",
        padding: "60px 32px",
        borderBottom: "1px solid #111",
      }}>
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.3,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
          <div style={{
            display: "inline-block",
            fontSize: "9px", letterSpacing: "6px", color: "#C8A84B",
            border: "1px solid #C8A84B33", padding: "6px 20px", borderRadius: "2px",
            marginBottom: 32,
          }}>
            FOUNDER ACCESS — {slots} SLOTS REMAINING
          </div>

          <div style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: "bold", lineHeight: 1.1,
            letterSpacing: "-1px", marginBottom: 24,
          }}>
            FXSPOTLIGHT
          </div>

          <div style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#666", lineHeight: 1.8, marginBottom: 16,
            letterSpacing: "1px",
          }}>
            The Decision Enforcement System
          </div>

          <div style={{
            width: 40, height: 1, background: "#C8A84B",
            margin: "0 auto 24px",
          }} />

          <div style={{
            fontSize: "13px", color: "#555", lineHeight: 2,
            maxWidth: 500, margin: "0 auto 48px",
          }}>
            You already know what to do.<br />
            FXSpotlight makes sure you actually do it.
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={GUMROAD} target="_blank" rel="noopener noreferrer" style={{
              background: "#C8A84B", color: "#000",
              padding: "16px 40px", borderRadius: "2px",
              fontSize: "11px", letterSpacing: "3px", fontWeight: "bold",
              textDecoration: "none", fontFamily: "'Courier New', monospace",
              transition: "opacity 0.2s",
            }}>
              GET FOUNDER ACCESS — $49
            </a>
            <a href="#modules" style={{
              background: "transparent", color: "#555",
              padding: "16px 32px", borderRadius: "2px",
              fontSize: "11px", letterSpacing: "3px",
              textDecoration: "none", border: "1px solid #222",
              fontFamily: "'Courier New', monospace",
            }}>
              SEE THE PLATFORM ↓
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        position: "relative", zIndex: 1,
        borderBottom: "1px solid #111",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {[
          { value: "6", label: "MODULES" },
          { value: "26", label: "INSTRUMENTS" },
          { value: "$49", label: "LIFETIME ACCESS" },
          { value: `${slots}`, label: "SLOTS LEFT" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "24px 20px", textAlign: "center",
            borderRight: i < 3 ? "1px solid #111" : "none",
          }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#C8A84B", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "#444", letterSpacing: "3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* The Problem */}
      <div style={{ position: "relative", zIndex: 1, padding: "80px 32px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <AnimatedSection>
          <div style={{ fontSize: "9px", color: "#E05C5C", letterSpacing: "4px", marginBottom: 24 }}>THE PROBLEM</div>
          <div style={{ fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.6, color: "#888", marginBottom: 16 }}>
            Most traders don't fail because their strategy is wrong.
          </div>
          <div style={{ fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.6, color: "#fff", fontWeight: "bold" }}>
            They fail because nothing stopped them from breaking their own rules under pressure.
          </div>
        </AnimatedSection>
      </div>

      {/* Modules */}
      <div id="modules" style={{ position: "relative", zIndex: 1, padding: "0 32px 80px", maxWidth: 1000, margin: "0 auto" }}>
        <AnimatedSection>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "4px", textAlign: "center", marginBottom: 40 }}>
            THE PLATFORM — 6 MODULES
          </div>
        </AnimatedSection>

        {/* Module tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 }}>
          {modules.map(m => (
            <button key={m.id} onClick={() => setActiveModule(m.id)} style={{
              background: activeModule === m.id ? "#0e0e0e" : "#080808",
              border: `1px solid ${activeModule === m.id ? m.color + "44" : "#111"}`,
              borderLeft: `3px solid ${activeModule === m.id ? m.color : "#1a1a1a"}`,
              color: activeModule === m.id ? "#fff" : "#444",
              padding: "14px 16px", borderRadius: "2px",
              cursor: "pointer", textAlign: "left",
              fontFamily: "'Courier New', monospace",
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: "8px", color: activeModule === m.id ? m.color : "#333", letterSpacing: "2px", marginBottom: 6 }}>
                {m.code} — {m.tag}
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>{m.name}</div>
            </button>
          ))}
        </div>

        {/* Active module demo */}
        <AnimatedSection key={activeModule}>
          <div style={{
            background: "#0a0a0a",
            border: `1px solid ${active.color}22`,
            borderTop: `3px solid ${active.color}`,
            borderRadius: "2px", padding: "28px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: "9px", color: active.color, letterSpacing: "3px", marginBottom: 8 }}>
                  {active.code} — {active.tag}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: 8 }}>{active.name}</div>
                <div style={{ fontSize: "11px", color: "#555", lineHeight: 1.6, maxWidth: 400 }}>{active.desc}</div>
              </div>
              <div style={{
                fontSize: "9px", color: active.color,
                border: `1px solid ${active.color}33`,
                padding: "4px 12px", borderRadius: "2px", letterSpacing: "2px",
                flexShrink: 0,
              }}>LIVE DEMO</div>
            </div>
            <div style={{ borderTop: "1px solid #151515", paddingTop: 20 }}>
              {active.demo()}
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* What you get */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "#080808", borderTop: "1px solid #111", borderBottom: "1px solid #111",
        padding: "80px 32px",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ fontSize: "9px", color: "#444", letterSpacing: "4px", textAlign: "center", marginBottom: 40 }}>
              FOUNDER ACCESS INCLUDES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { text: "Lifetime access to all 6 platform modules", color: "#5CE0B8" },
                { text: "All future features and updates at no extra cost", color: "#5CE0B8" },
                { text: "Direct input on the product roadmap", color: "#5CE0B8" },
                { text: "Founding member status and community badge", color: "#5CE0B8" },
                { text: "Locked at $49 — forever. Never $29/mo.", color: "#C8A84B" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "center",
                  padding: "16px 20px", background: "#0a0a0a",
                  border: "1px solid #111", borderLeft: `3px solid ${item.color}`,
                  borderRadius: "2px",
                }}>
                  <div style={{ color: item.color, fontSize: "12px", flexShrink: 0 }}>✦</div>
                  <div style={{ fontSize: "13px", color: "#888" }}>{item.text}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "80px 32px", textAlign: "center",
      }}>
        <AnimatedSection>
          <div style={{ fontSize: "9px", color: "#C8A84B", letterSpacing: "4px", marginBottom: 24 }}>
            {slots} FOUNDER SLOTS REMAINING
          </div>
          <div style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: "bold", marginBottom: 16, lineHeight: 1.2 }}>
            Process Over Profits.<br />Every Time.
          </div>
          <div style={{ fontSize: "13px", color: "#555", marginBottom: 40, lineHeight: 2 }}>
            After the founding round closes, FXSpotlight moves to $29/month.<br />
            The $49 lifetime deal disappears permanently.
          </div>
          <a href={GUMROAD} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block",
            background: "#C8A84B", color: "#000",
            padding: "20px 60px", borderRadius: "2px",
            fontSize: "12px", letterSpacing: "4px", fontWeight: "bold",
            textDecoration: "none", fontFamily: "'Courier New', monospace",
          }}>
            SECURE FOUNDER ACCESS — $49
          </a>
          <div style={{ fontSize: "10px", color: "#333", marginTop: 16, letterSpacing: "2px" }}>
            ONE TIME PAYMENT. LIFETIME ACCESS. NO RENEWALS.
          </div>
        </AnimatedSection>
      </div>

      {/* Footer */}
      <div style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid #111", padding: "24px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#333" }}>FXSPOTLIGHT</div>
        <div style={{ fontSize: "9px", color: "#222", letterSpacing: "2px" }}>DECISION ENFORCEMENT FOR SERIOUS TRADERS</div>
      </div>
    </div>
  );
}
