/**
 * Health Check Endpoint
 * Validates API configuration and connectivity
 */

import { buildGeminiUrl, getDefaultHeaders, TIMEOUTS } from './config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is configured
    const apiKeyConfigured = !!process.env.GEMINI_API_KEY;
    
    if (!apiKeyConfigured) {
      return res.status(503).json({
        status: 'error',
        message: 'GEMINI_API_KEY is not configured',
        timestamp: new Date().toISOString()
      });
    }

    // Test connectivity with a simple request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.health);

    try {
      const testPrompt = 'Respond with "OK" only.';
      const response = await fetch(buildGeminiUrl('generateContent'), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testPrompt }]
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return res.status(200).json({
          status: 'healthy',
          message: 'API is configured and responding',
          timestamp: new Date().toISOString(),
          apiKeyConfigured: true
        });
      } else {
        const errorData = await response.json();
        return res.status(503).json({
          status: 'error',
          message: `API returned status ${response.status}`,
          details: errorData,
          timestamp: new Date().toISOString()
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return res.status(503).json({
          status: 'timeout',
          message: 'Health check request timed out',
          timestamp: new Date().toISOString()
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[Health Check Error]', error.message);
    return res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
