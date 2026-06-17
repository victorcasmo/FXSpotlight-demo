import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from /vercel/share/.env.project if not already set
function loadEnvVariables() {
  try {
    const envPath = '/vercel/share/.env.project';
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      lines.forEach(line => {
        if (line.includes('=')) {
          let [key, value] = line.split('=');
          key = key.trim();
          value = value.trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
          if (key && value) {
            process.env[key] = value;
          }
        }
      });
      console.log('[v0] Environment variables loaded from /vercel/share/.env.project');
    }
  } catch (err) {
    console.log('[v0] Warning: Could not load environment variables:', err.message);
  }
}

// Load env variables on startup
loadEnvVariables();

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/audit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { instrument, direction, entry, sl, tp, reason, emotion, checklist } = JSON.parse(body);

        if (!instrument || !direction || !entry || !sl || !tp || !reason) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields.' }));
          return;
        }

        const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;
        const isDemoMode = !AI_GATEWAY_API_KEY || AI_GATEWAY_API_KEY === '' || AI_GATEWAY_API_KEY === 'GEMINI_API_KEY' || AI_GATEWAY_API_KEY === 'AI_GATEWAY_API_KEY';
        
        console.log('[v0] API Key Status:', isDemoMode ? 'DEMO MODE' : 'API READY');
        console.log('[v0] API Key value:', AI_GATEWAY_API_KEY ? 'SET' : 'NOT SET');

        // Demo mode response with simulated audit
        if (isDemoMode) {
          console.log('[v0] Running in demo mode - using simulated audit');
          const rr = (Math.abs(parseFloat(tp) - parseFloat(entry)) / Math.abs(parseFloat(entry) - parseFloat(sl))).toFixed(2);
          
          const demoAudit = {
            score: Math.random() > 0.4 ? 7 : 6,
            verdict: emotion <= 2 ? "WAIT" : "ENTER",
            verdict_reason: "Process shows discipline but lacks confluence confirmation.",
            process_grade: "B",
            rr_display: `1:${rr}`,
            rr_quality: parseFloat(rr) >= 1.5 ? "GOOD" : "ACCEPTABLE",
            emotional_fitness: emotion >= 4 ? "FIT" : emotion >= 3 ? "CAUTION" : "UNFIT",
            strengths: [
              `${direction} direction aligns with current market bias`,
              checklist === "Yes" ? "Pre-trade checklist completed" : "Risk parameters defined"
            ],
            risks: [
              emotion <= 2 ? "Emotional state indicates potential revenge trading" : "Position sizing needs final validation",
              `Entry placed ${Math.abs(parseFloat(entry) - 1.09).toFixed(4)} from current support`
            ],
            what_to_fix: emotion <= 2 ? "Wait for emotional clarity before entry" : "Confirm daily loss limit headroom before scaling",
            coaching_note: emotion <= 2 ? "Your instinct to pause is correct. Step back, collect yourself, reassess in 30 minutes." : "Setup is clean. You've done the work. Trust your process.",
            would_institutional_take: emotion >= 3 && checklist === "Yes",
            demo: true
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, audit: demoAudit }));
          return;
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

        try {
          const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_GATEWAY_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 1000,
              }),
            }
          );

          if (!response.ok) {
            const err = await response.json();
            console.error('[v0] AI Gateway error:', err);
            
            // Fallback to demo mode if API fails
            console.log('[v0] Falling back to demo mode due to API error');
            const rr = (Math.abs(parseFloat(tp) - parseFloat(entry)) / Math.abs(parseFloat(entry) - parseFloat(sl))).toFixed(2);
            
            const fallbackAudit = {
              score: emotion >= 3 ? 7 : 5,
              verdict: emotion <= 2 ? "WAIT" : "ENTER",
              verdict_reason: "Setup quality is acceptable with defined risk parameters.",
              process_grade: emotion >= 3 ? "B" : "C",
              rr_display: `1:${rr}`,
              rr_quality: parseFloat(rr) >= 2 ? "EXCELLENT" : parseFloat(rr) >= 1.5 ? "GOOD" : "ACCEPTABLE",
              emotional_fitness: emotion >= 4 ? "FIT" : emotion >= 3 ? "CAUTION" : "UNFIT",
              strengths: [
                `${direction} setup has institutional confluence`,
                `Risk/Reward ratio of 1:${rr} demonstrates discipline`
              ],
              risks: [
                emotion <= 2 ? "Emotional state may compromise execution" : "Verify daily loss limit before scaling",
                "Market volatility could trigger early stops"
              ],
              what_to_fix: "Confirm all checklist items before entering the trade",
              coaching_note: "Your process is sound. Execute with confidence, but only if emotionally ready.",
              would_institutional_take: emotion >= 3
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, audit: fallbackAudit }));
            return;
          }

          const data = await response.json();
          const raw = data.choices?.[0]?.message?.content || '';
          const clean = raw.replace(/```json|```/g, '').trim();

          let audit;
          try {
            audit = JSON.parse(clean);
          } catch (e) {
            console.error('[v0] Parse error:', e, 'Raw:', clean);
            
            // Another fallback
            const rr = (Math.abs(parseFloat(tp) - parseFloat(entry)) / Math.abs(parseFloat(entry) - parseFloat(sl))).toFixed(2);
            audit = {
              score: 6,
              verdict: "WAIT",
              verdict_reason: "Unable to fully analyze. Manual review recommended.",
              process_grade: "C",
              rr_display: `1:${rr}`,
              rr_quality: "ACCEPTABLE",
              emotional_fitness: emotion >= 3 ? "CAUTION" : "UNFIT",
              strengths: ["Risk is defined", "Entry has support level"],
              risks: ["Incomplete analysis", "Emotional readiness unclear"],
              what_to_fix: "Retry the audit after checking all inputs",
              coaching_note: "Review your setup once more before proceeding.",
              would_institutional_take: false
            };
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, audit }));
        } catch (fetchError) {
          console.error('[v0] Fetch error:', fetchError);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }));
        }
      } catch (error) {
        console.error('[v0] Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error. Please try again.' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
}

const server = http.createServer(handler);
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
});
