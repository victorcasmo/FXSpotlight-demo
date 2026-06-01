/**
 * api/audit.js
 * FXSpotlight — AI Trade Decision Auditor
 * Powered by Google Gemini API
 * GEMINI_API_KEY required in environment variables
 */

import { buildGeminiUrl, getDefaultHeaders, TIMEOUTS } from './config.js';

/**
 * Validate trade data
 */
function validateTradeData(data) {
  const { instrument, direction, entry, sl, tp, reason } = data;
  const errors = [];

  if (!instrument?.trim()) errors.push('Instrument is required');
  if (!direction || !['BUY', 'SELL'].includes(direction.toUpperCase())) 
    errors.push('Direction must be BUY or SELL');
  if (!entry || isNaN(entry) || entry <= 0) errors.push('Entry must be a positive number');
  if (!sl || isNaN(sl) || sl <= 0) errors.push('Stop Loss must be a positive number');
  if (!tp || isNaN(tp) || tp <= 0) errors.push('Take Profit must be a positive number');
  if (!reason?.trim()) errors.push('Trade reason is required');
  
  // Validate that SL and TP are on correct sides
  const entryNum = parseFloat(entry);
  const slNum = parseFloat(sl);
  const tpNum = parseFloat(tp);
  
  if (direction.toUpperCase() === 'BUY') {
    if (slNum >= entryNum) errors.push('For BUY: Stop Loss must be below Entry');
    if (tpNum <= entryNum) errors.push('For BUY: Take Profit must be above Entry');
  } else {
    if (slNum <= entryNum) errors.push('For SELL: Stop Loss must be above Entry');
    if (tpNum >= entryNum) errors.push('For SELL: Take Profit must be below Entry');
  }

  return errors;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { instrument, direction, entry, sl, tp, reason, emotion = 3, checklist = true } = req.body;

  // Validate input
  const validationErrors = validateTradeData({ instrument, direction, entry, sl, tp, reason });
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: "Validation failed",
      details: validationErrors 
    });
  }

  // Calculate R:R ratio for context
  const entryNum = parseFloat(entry);
  const slNum = parseFloat(sl);
  const tpNum = parseFloat(tp);
  const risk = Math.abs(entryNum - slNum);
  const reward = Math.abs(tpNum - entryNum);
  const ratio = (reward / risk).toFixed(2);

  const prompt = `You are FXSpotlight's institutional trading decision auditor. Audit this trade setup strictly on PROCESS quality only — not outcome prediction.

TRADE SUBMITTED:
Instrument: ${instrument}
Direction: ${direction.toUpperCase()}
Entry: ${entry} | Stop Loss: ${sl} | Take Profit: ${tp}
Risk:Reward Ratio: 1:${ratio}
Reason: ${reason}
Emotional State: ${emotion}/5
Pre-trade Checklist Completed: ${checklist}

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

  try {
    // Check API key configuration
    if (!process.env.GEMINI_API_KEY) {
      console.error('[Audit] GEMINI_API_KEY is not configured');
      return res.status(503).json({ 
        error: "AI auditor not configured. Admin: Please set GEMINI_API_KEY." 
      });
    }

    // Set timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.api);

    try {
      const response = await fetch(
        buildGeminiUrl('generateContent'),
        {
          method: "POST",
          headers: getDefaultHeaders(),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('[Audit] Gemini API error:', response.status, err);
        
        if (response.status === 429) {
          return res.status(429).json({ error: "Rate limited. Please try again in a moment." });
        } else if (response.status === 401 || response.status === 403) {
          return res.status(503).json({ error: "API authentication failed. Admin: Check GEMINI_API_KEY." });
        }
        
        return res.status(500).json({ error: "AI auditor unavailable. Please try again." });
      }

      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!raw) {
        console.error('[Audit] Empty response from Gemini API');
        return res.status(500).json({ error: "Empty response from auditor. Please try again." });
      }

      const clean = raw.replace(/```json|```/g, "").trim();

      let audit;
      try {
        audit = JSON.parse(clean);
      } catch (e) {
        console.error('[Audit] JSON parse error:', e.message, 'Raw:', clean.substring(0, 200));
        return res.status(500).json({ 
          error: "Failed to parse audit response. Please try again.",
          hint: "The AI response was malformed"
        });
      }

      // Validate audit response structure
      const requiredFields = ['score', 'verdict', 'process_grade', 'rr_display'];
      const missingFields = requiredFields.filter(f => !(f in audit));
      if (missingFields.length > 0) {
        console.error('[Audit] Missing fields in response:', missingFields);
        return res.status(500).json({ 
          error: "Audit response incomplete",
          missing: missingFields 
        });
      }

      console.log('[Audit] Successfully processed trade:', instrument, direction);
      return res.status(200).json({ success: true, audit });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[Audit] Request timeout');
        return res.status(504).json({ error: "Request timed out. Please try again." });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[Audit] Server error:', error.message);
    return res.status(500).json({ 
      error: "Server error. Please try again.",
      message: error.message 
    });
  }
}

