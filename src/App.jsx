import { useState, useEffect, useRef } from "react";

const GUMROAD = "https://spotlightfx.gumroad.com/l/hrlfi";
const DISCORD = "https://discord.gg/dwtMZzUVQ";
const TELEGRAM = "https://t.me/+zDVEEgdi4900Yjc8";

// ── Font Loader ───────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Syne:wght@700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

// ── Scroll reveal ─────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(); const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current); return () => o.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(28px)", transition: `opacity .65s ease ${delay}s, transform .65s ease ${delay}s` }}>
      {children}
    </div>
  );
}

// ── Glass card ────────────────────────────────────────────────
const Glass = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    ...style,
  }}>{children}</div>
);

// ── Risk Calculator ───────────────────────────────────────────
function RiskCalc() {
  const [bal, setBal] = useState(10000);
  const [risk, setRisk] = useState(1);
  const [sl, setSl] = useState(20);
  const lot = ((bal * risk / 100) / (sl * 10)).toFixed(2);
  const riskAmt = (bal * risk / 100).toFixed(2);
  const profit = (parseFloat(riskAmt) * 3).toFixed(2);

  return (
    <div>
      <div style={{ display: "grid", gap: 20, marginBottom: 24 }}>
        {[
          { label: "ACCOUNT BALANCE", display: `$${bal.toLocaleString()}`, min: 1000, max: 100000, step: 1000, val: bal, set: setBal, color: "#fff" },
          { label: "RISK %", display: `${risk}%`, min: 0.1, max: 5, step: 0.1, val: risk, set: setRisk, color: "#f87171" },
          { label: "STOP LOSS (PIPS)", display: `${sl} pips`, min: 5, max: 100, step: 1, val: sl, set: setSl, color: "#60a5fa" },
        ].map(f => (
          <div key={f.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "3px" }}>{f.label}</span>
              <span style={{ fontSize: 13, color: f.color, fontWeight: 500 }}>{f.display}</span>
            </div>
            <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
              onChange={e => f.set(Number(e.target.value))}
              style={{ width: "100%", accentColor: f.color }} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { label: "LOT SIZE", val: lot, color: "#fff" },
          { label: "RISK AMOUNT", val: `$${riskAmt}`, color: "#f87171" },
          { label: "3:1 TARGET", val: `$${profit}`, color: "#4ade80" },
        ].map(m => (
          <Glass key={m.label} style={{ padding: "20px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: m.color, marginBottom: 6 }}>{m.val}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "2px" }}>{m.label}</div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// ── Prop Rule Checker ─────────────────────────────────────────
function PropChecker() {
  const [acct, setAcct] = useState(100000);
  const [dd, setDd] = useState(3.8);
  const [daily, setDaily] = useState(1.9);
  const maxDd = 10; const maxDaily = 5;
  const status = dd > 8 || daily > 4.5 ? "DANGER" : dd > 6 || daily > 3.5 ? "WARNING" : "SAFE";
  const sc = { SAFE: "#4ade80", WARNING: "#facc15", DANGER: "#f87171" }[status];
  const safeLot = Math.max(0, ((acct * (maxDaily - daily) / 100) / 20 / 10)).toFixed(2);
  const ddRemaining = (maxDd - dd).toFixed(1);
  const dailyRemaining = (maxDaily - daily).toFixed(1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "3px", marginBottom: 4 }}>MONITORING ACCOUNT</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800 }}>${acct.toLocaleString()}</div>
        </div>
        <div style={{ padding: "8px 20px", borderRadius: 20, background: `${sc}12`, border: `1px solid ${sc}44`, fontSize: 10, color: sc, letterSpacing: "3px", fontWeight: 600 }}>
          {status}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", marginBottom: 8 }}>ACCOUNT SIZE</div>
        <input type="range" min={10000} max={200000} step={10000} value={acct}
          onChange={e => setAcct(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#fff", marginBottom: 4 }} />
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>${acct.toLocaleString()}</div>
      </div>

      {[
        { label: "MAX DRAWDOWN", cur: dd, max: maxDd, set: setDd, remaining: ddRemaining, color: sc },
        { label: "DAILY LOSS LIMIT", cur: daily, max: maxDaily, set: setDaily, remaining: dailyRemaining, color: "#60a5fa" },
      ].map(r => (
        <div key={r.label} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px" }}>{r.label}</span>
            <span style={{ fontSize: 11, color: r.color }}>{r.cur.toFixed(1)}% / {r.max}% <span style={{ color: "rgba(255,255,255,0.2)" }}>({r.remaining}% left)</span></span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${(r.cur / r.max) * 100}%`, background: r.color, borderRadius: 3, transition: "width 0.4s" }} />
          </div>
          <input type="range" min={0} max={r.max} step={0.1} value={r.cur}
            onChange={e => r.set(Number(e.target.value))}
            style={{ width: "100%", accentColor: r.color }} />
        </div>
      ))}

      <Glass style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", marginBottom: 4 }}>SAFE LOT SIZE NOW</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Based on remaining daily limit</div>
        </div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#4ade80" }}>{safeLot}</div>
      </Glass>
    </div>
  );
}

// ── Checklist ─────────────────────────────────────────────────
function Checklist() {
  const items = [
    "Setup aligns with higher timeframe bias",
    "Stop loss placed at a valid structural level",
    "Risk/reward ratio minimum 1:2",
    "Risk percentage defined before entry",
    "No high-impact news in next 2 hours",
    "Not trading from emotion or revenge",
    "Daily loss limit not at risk",
    "Entry confirmed — not anticipated",
    "Position size calculated correctly",
    "Exit plan defined before entry",
  ];
  const [checked, setChecked] = useState({});
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / items.length) * 100);
  const clear = done === items.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px" }}>{done}/{items.length} COMPLETE</div>
        <div style={{ fontSize: 10, color: clear ? "#4ade80" : "rgba(255,255,255,0.2)", letterSpacing: "2px" }}>
          {clear ? "✓ CLEARED" : pct >= 70 ? "ALMOST THERE" : "HOLD YOUR ENTRY"}
        </div>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: clear ? "#4ade80" : pct >= 70 ? "#facc15" : "#fff", borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => setChecked(p => ({ ...p, [i]: !p[i] }))} style={{
            display: "flex", gap: 12, alignItems: "center", padding: "12px 16px",
            background: checked[i] ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${checked[i] ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)"}`,
            borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
          }}>
            <div style={{
              width: 16, height: 16,
              border: `1.5px solid ${checked[i] ? "#4ade80" : "rgba(255,255,255,0.15)"}`,
              borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
              background: checked[i] ? "#4ade80" : "transparent", flexShrink: 0, transition: "all 0.15s",
            }}>
              {checked[i] && <span style={{ color: "#000", fontSize: 9, fontWeight: "bold" }}>✓</span>}
            </div>
            <span style={{ fontSize: 12, color: checked[i] ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)", textDecoration: checked[i] ? "line-through" : "none", transition: "all 0.15s" }}>
              {item}
            </span>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px", textAlign: "center", background: clear ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)", border: `1px solid ${clear ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: clear ? "#4ade80" : "#f87171", letterSpacing: "3px", fontWeight: 600 }}>
          {clear ? "✓ CLEARED TO TRADE" : "⊘ COMPLETE CHECKLIST BEFORE ENTERING"}
        </div>
      </div>
    </div>
  );
}

// ── AI Trade Auditor ──────────────────────────────────────────
function AIAuditor() {
  const mono = "'DM Mono','Courier New',monospace";
  const [form, setForm] = useState({
    instrument: "EURUSD", direction: "Long",
    entry: "", sl: "", tp: "", reason: "",
    emotion: 3, checklist: "Yes",
  });
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const calcRR = () => {
    const e = parseFloat(form.entry), s = parseFloat(form.sl), t = parseFloat(form.tp);
    if (!e || !s || !t) return null;
    return (Math.abs(t - e) / Math.abs(e - s)).toFixed(2);
  };
  const rr = calcRR();

  const audit = async () => {
    if (!form.entry || !form.sl || !form.tp || !form.reason.trim()) {
      setError("Please fill in all required fields."); return;
    }
    setError(""); setStep("loading");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Audit failed."); setStep("form"); return; }
      setResult(data.audit); setStep("result");
    } catch (e) {
      setError("Connection failed. Please try again."); setStep("form");
    }
  };

  const reset = () => { setStep("form"); setResult(null); setError(""); setForm(f => ({ ...f, entry: "", sl: "", tp: "", reason: "" })); };

  const vColor = v => ({ ENTER: "#4ade80", WAIT: "#facc15", ABORT: "#f87171" }[v] || "#fff");
  const gColor = g => ({ A: "#4ade80", B: "#86efac", C: "#facc15", D: "#fb923c", F: "#f87171" }[g] || "#fff");

  const inp = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#fff", padding: "12px 16px", fontSize: 12,
    fontFamily: mono, outline: "none", width: "100%", boxSizing: "border-box",
  };

  if (step === "loading") return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ width: 48, height: 48, border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #fff", borderRadius: "50%", margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Auditing Decision</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 2 }}>
        Analysing process quality...<br />
        Evaluating risk/reward...<br />
        Generating institutional verdict...
      </div>
    </div>
  );

  if (step === "result" && result) return (
    <div>
      {/* Demo Mode Banner */}
      {result.demo && (
        <div style={{ textAlign: "center", marginBottom: 20, padding: "12px 16px", background: "rgba(251, 146, 60, 0.1)", border: "1px solid rgba(251, 146, 60, 0.3)", borderRadius: 8, fontSize: 11, color: "rgba(255, 140, 0, 0.8)" }}>
          Demo Mode: Add GEMINI_API_KEY for live AI auditor
        </div>
      )}
      {/* Verdict */}
      <div style={{ textAlign: "center", marginBottom: 20, padding: "32px 20px", background: `${vColor(result.verdict)}08`, border: `1px solid ${vColor(result.verdict)}22`, borderRadius: 16 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 12 }}>AI VERDICT</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 56, fontWeight: 900, color: vColor(result.verdict), lineHeight: 1, marginBottom: 12 }}>{result.verdict}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>"{result.verdict_reason}"</div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "SCORE", val: `${result.score}/10`, color: result.score >= 7 ? "#4ade80" : result.score >= 5 ? "#facc15" : "#f87171" },
          { label: "GRADE", val: result.process_grade, color: gColor(result.process_grade) },
          { label: "R:R", val: result.rr_display, color: "#60a5fa" },
          { label: "EMOTIONAL", val: result.emotional_fitness, color: { FIT: "#4ade80", CAUTION: "#facc15", UNFIT: "#f87171" }[result.emotional_fitness] },
        ].map(m => (
          <Glass key={m.label} style={{ padding: "14px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: m.val.length > 5 ? 12 : 18, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.val}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>{m.label}</div>
          </Glass>
        ))}
      </div>

      {/* Strengths + Risks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <Glass style={{ padding: "20px" }}>
          <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: "2px", marginBottom: 12 }}>STRENGTHS</div>
          {result.strengths.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{s}</span>
            </div>
          ))}
        </Glass>
        <Glass style={{ padding: "20px" }}>
          <div style={{ fontSize: 9, color: "#f87171", letterSpacing: "2px", marginBottom: 12 }}>RISKS</div>
          {result.risks.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span style={{ color: "#f87171", flexShrink: 0 }}>⚠</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{r}</span>
            </div>
          ))}
        </Glass>
      </div>

      {/* Coaching */}
      <Glass style={{ padding: "20px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", marginBottom: 10 }}>COACHING NOTE</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontStyle: "italic" }}>"{result.coaching_note}"</div>
      </Glass>

      <button onClick={reset} style={{ width: "100%", padding: "16px", borderRadius: 12, background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 11, fontFamily: mono, letterSpacing: "2px" }}>
        AUDIT ANOTHER TRADE
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: 8 }}>INSTRUMENT</div>
          <select value={form.instrument} onChange={e => set("instrument", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            {["EURUSD","GBPUSD","USDJPY","XAUUSD","US30","NAS100","GBPJPY","AUDUSD","USDCAD","EURJPY","USDCHF","NZDUSD"].map(i => <option key={i} value={i} style={{ background: "#111" }}>{i}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: 8 }}>DIRECTION</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Long","Short"].map(d => (
              <button key={d} onClick={() => set("direction", d)} style={{
                flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${form.direction === d ? (d === "Long" ? "rgba(74,222,128,0.5)" : "rgba(248,113,113,0.5)") : "rgba(255,255,255,0.08)"}`,
                background: form.direction === d ? (d === "Long" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)") : "rgba(255,255,255,0.03)",
                color: form.direction === d ? (d === "Long" ? "#4ade80" : "#f87171") : "rgba(255,255,255,0.3)",
                fontSize: 11, fontFamily: mono, letterSpacing: "1px",
              }}>{d.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[["ENTRY","entry"],["STOP LOSS","sl"],["TAKE PROFIT","tp"]].map(([l,k]) => (
          <div key={k}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: 8 }}>{l} <span style={{ color: "#f87171" }}>*</span></div>
            <input type="number" step="any" placeholder="0.00000" value={form[k]} onChange={e => set(k, e.target.value)} style={inp} />
          </div>
        ))}
      </div>

      {rr && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: parseFloat(rr) >= 1.5 ? "rgba(74,222,128,0.06)" : "rgba(251,146,60,0.06)", border: `1px solid ${parseFloat(rr) >= 1.5 ? "rgba(74,222,128,0.15)" : "rgba(251,146,60,0.15)"}`, borderRadius: 10 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "2px" }}>R:R RATIO — </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: parseFloat(rr) >= 2 ? "#4ade80" : parseFloat(rr) >= 1.5 ? "#facc15" : "#fb923c", fontFamily: "'Syne',sans-serif" }}>1:{rr}</span>
          {parseFloat(rr) < 1.5 && <span style={{ fontSize: 10, color: "#fb923c", marginLeft: 8 }}>Below minimum</span>}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: 8 }}>REASON FOR THIS TRADE <span style={{ color: "#f87171" }}>*</span></div>
        <textarea value={form.reason} onChange={e => set("reason", e.target.value)}
          placeholder="Describe your setup, confluence, and why you're entering..."
          rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.7 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: 8 }}>EMOTIONAL STATE — {form.emotion}/5</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => set("emotion", n)} style={{
                flex: 1, padding: "12px 0", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${form.emotion === n ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                background: form.emotion === n ? "rgba(255,255,255,0.1)" : "transparent",
                color: form.emotion === n ? "#fff" : "rgba(255,255,255,0.2)",
                fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14,
              }}>{n}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: 8 }}>CHECKLIST DONE</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Yes","No","Partial"].map(o => (
              <button key={o} onClick={() => set("checklist", o)} style={{
                flex: 1, padding: "12px 4px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${form.checklist === o ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                background: form.checklist === o ? "rgba(255,255,255,0.08)" : "transparent",
                color: form.checklist === o ? "#fff" : "rgba(255,255,255,0.2)",
                fontSize: 10, fontFamily: mono, letterSpacing: "1px",
              }}>{o.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, padding: "12px 16px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, fontSize: 11, color: "#f87171" }}>{error}</div>}

      <button onClick={audit} style={{ width: "100%", padding: "18px", borderRadius: 14, background: "#fff", color: "#000", border: "none", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: "2px" }}>
        AUDIT MY DECISION →
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
const TABS = [
  { id: "ai", label: "AI AUDITOR", badge: "NEW", color: "#fff" },
  { id: "risk", label: "CALCULATOR", badge: null, color: "#facc15" },
  { id: "prop", label: "PROP RULES", badge: null, color: "#60a5fa" },
  { id: "checklist", label: "CHECKLIST", badge: null, color: "#4ade80" },
];

const TESTIMONIALS = [
  { name: "James O.", role: "FTMO Funded Trader", country: "UK", text: "The pre-trade checklist alone saved my challenge. I was about to revenge trade after a loss and the gate stopped me cold." },
  { name: "Tariq M.", role: "Prop Firm Candidate", country: "UAE", text: "First week using FXSpotlight I passed my challenge. The discipline tracker showed me exactly where I was breaking down." },
  { name: "Amara S.", role: "Independent FX Trader", country: "SA", text: "Finally a platform that treats discipline as a system not a feeling. This is what the industry has been missing." },
];

const FAQS = [
  { q: "What do I get immediately after paying?", a: "Immediate access to the Risk Calculator, Pre-Trade Checklist, and AI Trade Auditor. Full platform access within 30 days as remaining modules are completed." },
  { q: "Does it work with any prop firm?", a: "Yes. You input your firm's specific rules — daily loss limit, max drawdown, profit target — and the platform enforces them in real time." },
  { q: "Is this for beginners?", a: "FXSpotlight is built for traders who already have a strategy but struggle to execute it consistently. You need to understand risk management to get value from this." },
  { q: "What if I want a refund?", a: "30-day money back guarantee. No questions asked. Zero risk." },
  { q: "Why $49 lifetime instead of monthly?", a: "Founder Access is a one-time deal for the first 30 traders only. After the founding round closes it moves to $29/month permanently." },
];

export default function FXSpotlightV3Complete() {
  const [tab, setTab] = useState("ai");
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [slots] = useState(23);
  const mono = "'DM Mono','Courier New',monospace";
  const display = "'Syne',sans-serif";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: mono, overflowX: "hidden" }}>
      <FontLoader />

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -200, left: "10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(200,168,75,0.03) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 32px",
        background: scrolled ? "rgba(0,0,0,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontFamily: display, fontSize: 16, fontWeight: 900, letterSpacing: "3px" }}>FXSPOTLIGHT</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            {slots} SLOTS LEFT
          </div>
          <a href={GUMROAD} target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#000", padding: "10px 24px", borderRadius: 24, fontSize: 10, letterSpacing: "2px", fontWeight: 600, textDecoration: "none", fontFamily: mono }}>
            GET ACCESS
          </a>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 80px" }}>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 9, color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 18px", borderRadius: 20, marginBottom: 48, letterSpacing: "3px" }}>
              <div style={{ width: 5, height: 5, background: "#4ade80", borderRadius: "50%" }} />
              FOUNDER ACCESS — {slots} SLOTS REMAINING
            </div>
            <div style={{ fontFamily: display, fontSize: "clamp(48px,9vw,96px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-3px", marginBottom: 32 }}>
              <div>STOP</div>
              <div style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)", color: "transparent" }}>BREAKING</div>
              <div>YOUR RULES</div>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, maxWidth: 480, margin: "0 auto 48px" }}>
              FXSpotlight enforces your trading process before you enter the trade — not after the account is gone.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={GUMROAD} target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#000", padding: "18px 48px", borderRadius: 32, fontSize: 12, letterSpacing: "2px", fontWeight: 600, textDecoration: "none", fontFamily: mono }}>
                GET FOUNDER ACCESS — $49
              </a>
              <a href="#platform" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "18px 32px", borderRadius: 32, fontSize: 12, letterSpacing: "2px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)", fontFamily: mono }}>
                SEE PLATFORM ↓
              </a>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 20, letterSpacing: "2px" }}>30-DAY MONEY BACK GUARANTEE · NO QUESTIONS ASKED</div>
          </Reveal>
        </div>

        {/* Stats */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", maxWidth: 900, margin: "0 auto" }}>
            {[["6","MODULES"],["26+","INSTRUMENTS"],["$49","LIFETIME"],[`${slots}`,"SLOTS LEFT"]].map(([n,l],i) => (
              <div key={i} style={{ padding: "40px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ fontFamily: display, fontSize: 36, fontWeight: 900, marginBottom: 6 }}>{n}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "3px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem */}
        <div style={{ padding: "120px 32px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 32 }}>THE PROBLEM</div>
            <div style={{ fontFamily: display, fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "rgba(255,255,255,0.2)", marginBottom: 16, lineHeight: 1.2 }}>
              Most traders don't fail because their strategy is wrong.
            </div>
            <div style={{ fontFamily: display, fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, lineHeight: 1.2 }}>
              They fail because nothing stopped them.
            </div>
          </Reveal>
        </div>

        {/* Platform */}
        <div id="platform" style={{ padding: "0 24px 120px", maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 12 }}>LIVE PLATFORM — TRY IT NOW</div>
              <div style={{ fontFamily: display, fontSize: "clamp(28px,4vw,48px)", fontWeight: 900 }}>Everything Works. Right Now.</div>
            </div>
          </Reveal>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "10px 20px", borderRadius: 24, cursor: "pointer", flexShrink: 0,
                background: tab === t.id ? "#fff" : "rgba(255,255,255,0.04)",
                border: `1px solid ${tab === t.id ? "#fff" : "rgba(255,255,255,0.08)"}`,
                color: tab === t.id ? "#000" : "rgba(255,255,255,0.4)",
                fontSize: 10, fontFamily: mono, letterSpacing: "2px",
                fontWeight: tab === t.id ? 600 : 400, transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {t.label}
                {t.badge && <span style={{ fontSize: 8, background: tab === t.id ? "#000" : "#fff", color: tab === t.id ? "#fff" : "#000", padding: "2px 6px", borderRadius: 6 }}>{t.badge}</span>}
              </button>
            ))}
          </div>

          <Glass style={{ padding: "32px" }}>
            {tab === "ai" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", marginBottom: 8 }}>AI TRADE DECISION AUDITOR</div>
                  <div style={{ fontFamily: display, fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Submit Your Setup</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>AI analyses your decision quality and returns an institutional verdict. Not the outcome — the process.</div>
                </div>
                <AIAuditor />
              </div>
            )}
            {tab === "risk" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", marginBottom: 8 }}>RISK & LOT SIZE CALCULATOR</div>
                  <div style={{ fontFamily: display, fontSize: 22, fontWeight: 800 }}>Calculate. Don't Guess.</div>
                </div>
                <RiskCalc />
              </div>
            )}
            {tab === "prop" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", marginBottom: 8 }}>PROP FIRM RULE PROTECTION</div>
                  <div style={{ fontFamily: display, fontSize: 22, fontWeight: 800 }}>Know Before You Breach.</div>
                </div>
                <PropChecker />
              </div>
            )}
            {tab === "checklist" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", marginBottom: 8 }}>PRE-TRADE CHECKLIST</div>
                  <div style={{ fontFamily: display, fontSize: 22, fontWeight: 800 }}>No Pass. No Entry.</div>
                </div>
                <Checklist />
              </div>
            )}
          </Glass>
        </div>

        {/* Founder */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "100px 32px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Reveal>
              <Glass style={{ padding: "48px" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 32 }}>FROM THE FOUNDER</div>
                <div style={{ fontFamily: display, fontSize: "clamp(18px,3vw,28px)", fontWeight: 800, lineHeight: 1.3, marginBottom: 20 }}>
                  "I passed prop firm challenges. I still blew funded accounts."
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 2, marginBottom: 16 }}>
                  6 years trading FX, crypto and indices. Not because my strategy failed — because in the heat of the moment I forgot my own rules. I remembered them after the damage was done.
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 2 }}>
                  Every serious trader I knew had the same problem. So I built the system I wish existed.
                </div>
                <div style={{ marginTop: 28, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontWeight: 900, fontSize: 18 }}>V</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Victor</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px" }}>FOUNDER, FXSPOTLIGHT · 6-YEAR TRADER</div>
                  </div>
                </div>
              </Glass>
            </Reveal>
          </div>
        </div>

        {/* Testimonials */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "100px 32px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 12 }}>TRADER FEEDBACK</div>
                <div style={{ fontFamily: display, fontSize: "clamp(24px,3vw,40px)", fontWeight: 900 }}>What Traders Say</div>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <Glass style={{ padding: "28px 24px", borderTop: "3px solid rgba(255,255,255,0.1)", height: "100%" }}>
                    <div style={{ fontFamily: display, fontSize: 32, color: "rgba(255,255,255,0.15)", marginBottom: 16, lineHeight: 1 }}>"</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 24 }}>{t.text}</div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "2px" }}>{t.role} — {t.country}</div>
                    </div>
                  </Glass>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* What you get */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "100px 32px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 12 }}>FOUNDER ACCESS</div>
                <div style={{ fontFamily: display, fontSize: "clamp(26px,4vw,44px)", fontWeight: 900 }}>$49. Once. Forever.</div>
              </div>
              {[
                "Lifetime access to all 6 platform modules",
                "AI Trade Decision Auditor — unlimited audits",
                "All future features and updates included",
                "Direct input on the product roadmap",
                "Founding member status and community badge",
                "FXSpotlight Discord community access",
                "30-day money back guarantee",
                "Locked at $49 — never $29/month",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ color: "#4ade80", fontSize: 12, flexShrink: 0 }}>✦</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{item}</div>
                  </div>
                  {i === 7 && <div style={{ fontSize: 8, color: "#facc15", border: "1px solid rgba(250,204,21,0.3)", padding: "2px 10px", borderRadius: 8, letterSpacing: "2px", flexShrink: 0 }}>LOCKED IN</div>}
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "100px 32px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 12 }}>QUESTIONS</div>
                <div style={{ fontFamily: display, fontSize: "clamp(24px,3vw,40px)", fontWeight: 900 }}>Common Questions</div>
              </div>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${openFaq === i ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`, borderRadius: 12, overflow: "hidden", marginBottom: 8, transition: "all 0.2s" }}>
                  <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 13, color: openFaq === i ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: openFaq === i ? 600 : 400 }}>{faq.q}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, fontSize: 16, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</div>
                  </div>
                  {openFaq === i && (
                    <div style={{ padding: "0 20px 18px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ paddingTop: 14 }}>{faq.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "120px 32px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(255,255,255,0.02) 0%, transparent 70%)", pointerEvents: "none" }} />
          <Reveal>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "4px", marginBottom: 24 }}>{slots} FOUNDER SLOTS REMAINING</div>
            <div style={{ fontFamily: display, fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, lineHeight: 0.9, marginBottom: 32 }}>
              <div>PROCESS</div>
              <div style={{ WebkitTextStroke: "1px rgba(255,255,255,0.15)", color: "transparent" }}>OVER</div>
              <div>PROFITS</div>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 48, lineHeight: 2 }}>
              After the founding round closes, price moves to $29/month. Permanently.
            </div>
            <a href={GUMROAD} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "#fff", color: "#000", padding: "22px 64px", borderRadius: 32, fontSize: 12, letterSpacing: "3px", fontWeight: 600, textDecoration: "none", fontFamily: mono, marginBottom: 16 }}>
              SECURE FOUNDER ACCESS — $49
            </a>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.1)", letterSpacing: "2px" }}>ONE TIME · LIFETIME · 30-DAY GUARANTEE</div>
          </Reveal>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: display, fontSize: 14, fontWeight: 900, letterSpacing: "3px" }}>FXSPOTLIGHT</div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["DISCORD",DISCORD],["TELEGRAM",TELEGRAM],["GET ACCESS",GUMROAD]].map(([l,h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.08)", letterSpacing: "2px" }}>DECISION ENFORCEMENT FOR SERIOUS TRADERS</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input,textarea,select { color-scheme: dark; }
        input:focus,textarea:focus,select:focus { border-color: rgba(255,255,255,0.25) !important; }
        select option { background: #111; color: #fff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
        a:hover { opacity: 0.8; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}

