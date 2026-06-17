import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from /vercel/share/.env.project if not already set
function loadEnvVariables() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'GEMINI_API_KEY') {
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
      }
    } catch (err) {
      console.log('[v0] Warning: Could not load environment variables:', err.message);
    }
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

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'GEMINI_API_KEY') {
          console.log('[v0] GEMINI_API_KEY not set. Returning demo response.');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          const rr = ((parseFloat(tp) - parseFloat(entry)) / (parseFloat(entry) - parseFloat(sl))).toFixed(2);
          res.end(JSON.stringify({ 
            success: true, 
            demo: true,
            audit: {
              score: 7,
              verdict: "ENTER",
              verdict_reason: "Setup meets institutional standards with good R:R alignment.",
              process_grade: "B",
              rr_display: `1:${rr}`,
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
          }));
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

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
          console.error('Gemini error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'AI auditor unavailable. Please try again.' }));
          return;
        }

        const data = await response.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const clean = raw.replace(/```json|```/g, '').trim();

        let audit;
        try {
          audit = JSON.parse(clean);
        } catch (e) {
          console.error('Parse error:', e, 'Raw:', clean);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to parse audit. Please try again.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, audit }));
      } catch (error) {
        console.error('Server error:', error);
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
