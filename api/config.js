/**
 * Centralized API Configuration
 * Manages Gemini API setup and validation
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_NAME = 'gemini-2.0-flash';

/**
 * Validate that API key is configured
 */
function validateApiKey() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please configure it in your Vercel project settings.');
  }
  return true;
}

/**
 * Build Gemini API URL with authentication
 */
function buildGeminiUrl(endpoint) {
  validateApiKey();
  return `${GEMINI_BASE_URL}/${MODEL_NAME}:${endpoint}?key=${GEMINI_API_KEY}`;
}

/**
 * Default request options for Gemini API
 */
function getDefaultHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

/**
 * Timeout configuration (in ms)
 */
const TIMEOUTS = {
  api: 30000,
  health: 10000
};

module.exports = {
  GEMINI_API_KEY,
  GEMINI_BASE_URL,
  MODEL_NAME,
  validateApiKey,
  buildGeminiUrl,
  getDefaultHeaders,
  TIMEOUTS
};
