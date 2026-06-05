// api/audit.js
// FXSpotlight — AI Trade Decision Auditor
// Powered by Google Gemini API
// Add GEMINI_API_KEY to Vercel environment variables

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { instrument, direction, entry, sl, tp, reason, emotion, checklist } = req.body;

  if (!instrument || !direction || !entry || !sl || !tp || !reason) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const prompt = `You are FXSpotlight's institutional trading decision auditor. Audit this trade setup strictly on PROCESS quality only — not outcome prediction.

TRADE SUBMITTED:
Instrument: ${instrument}
Direction: ${direction}
Entry: ${entry} | Stop Loss: ${sl} | Take Profit: ${tp}
Reason: ${reason}
Emotional State: ${emotion}/5
Checklist Completed: ${checklist}

Rules:
- Score 0-10 on process quality only
- R:R below 1:1.5 = automatic -2 points
- Emotion 1 or 2 = automatic WAIT or ABORT
- Checklist No = automatic -1 point
- Be brutally honest

Return ONLY valid JSON, no markdown, no explanation:
{
  "score": <0-10>,
  "verdict": "<ENTER|WAIT|ABORT>",
  "verdict_reason": "<one sentence>",
  "process_grade": "<A|B|C|D|F>",
  "rr_display": "<e.g. 1:2.4>",
  "rr_quality": "<EXCELLENT|GOOD|ACCEPTABLE|POOR|INVALID>",
  "emotional_fitness": "<FIT|CAUTION|UNFIT>",
  "strengths": ["<point 1>", "<point 2>"],
  "risks": ["<point 1>", "<point 2>"],
  "what_to_fix": "<one specific actionable improvement>",
  "coaching_note": "<one direct sentence>",
  "would_institutional_take": <true|false>
}`;

  // Check if API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'GEMINI_API_KEY') {
    // Return demo response when API key is not configured
    return res.status(200).json({
      success: true,
      demo: true,
      message: "Demo mode: Configure GEMINI_API_KEY for live AI auditor",
      audit: {
        score: 7,
        verdict: "ENTER",
        verdict_reason: "Setup meets institutional standards with good R:R alignment.",
        process_grade: "B",
        rr_display: `1:${((parseFloat(tp) - parseFloat(entry)) / (parseFloat(entry) - parseFloat(sl))).toFixed(2)}`,
        rr_quality: "GOOD",
        emotional_fitness: "FIT",
        strengths: [
          "Risk-reward ratio above 1:1.5 threshold",
          "Emotional state acceptable for entry",
          "Clear technical confluence with support level"
        ],
        risks: [
          "Ensure position size matches maximum daily drawdown",
          "Watch for macro news during holding period"
        ],
        what_to_fix: "Document specific timeframe confluence (H4, D1) in reason.",
        coaching_note: "Solid setup. Enter with full checklist completion.",
        would_institutional_take: true
      }
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Gemini error:", err);
      return res.status(500).json({ error: "AI auditor unavailable. Please try again." });
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let audit;
    try {
      audit = JSON.parse(clean);
    } catch (e) {
      console.error("Parse error:", e, "Raw:", clean);
      return res.status(500).json({ error: "Failed to parse audit. Please try again." });
    }

    return res.status(200).json({ success: true, audit });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}

