// =========================
// FILE: src/services/aiService.js
// =========================

import CircuitBreaker from 'opossum';
import { logger } from '../utils/logger.js';
import { AIServiceError } from '../errors/AIServiceError.js';

// =========================
// Config
// =========================

const DEFAULT_DELAY_MS = parseInt(process.env.AI_DELAY_MS) || 500;
const FAILURE_RATE = parseFloat(process.env.AI_FAILURE_RATE) || 0.2;

// =========================
// Core AI Function
// =========================

const aiFunction = async ({ queryText, context }) => {
  await simulateDelay(DEFAULT_DELAY_MS);

  simulateFailure(FAILURE_RATE);

  return generateInsight(queryText, context);
};

// =========================
// Circuit Breaker
// =========================

const breaker = new CircuitBreaker(aiFunction, {
  timeout: parseInt(process.env.AI_TIMEOUT_MS) || 1000,
  errorThresholdPercentage: 50,
  resetTimeout: 5000,
});

// =========================
// Events
// =========================

breaker.on('open', () => {
  logger.warn({ event: 'CIRCUIT_OPEN' });
});

breaker.on('halfOpen', () => {
  logger.warn({ event: 'CIRCUIT_HALF_OPEN' });
});

breaker.on('close', () => {
  logger.info({ event: 'CIRCUIT_CLOSED' });
});

// =========================
// Public API
// =========================

export const callAI = async ({ queryText, context }) => {
  try {
    return await breaker.fire({ queryText, context });
  } catch (error) {
    logger.error({
      event: 'AI_CALL_FAILED',
      error: error.message,
    });

    // ✅ CRITICAL FIX: always throw AIServiceError
    throw new AIServiceError(error.message);
  }
};

// =========================
// Helpers
// =========================

const simulateDelay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const simulateFailure = (failureRate) => {
  if (Math.random() < failureRate) {
    throw new AIServiceError('AI_SERVICE_FAILURE');
  }
};

const generateInsight = (queryText, context) => {
  const industry = context?.industry || 'unknown industry';
  const region = context?.region || 'unknown region';

  return `Insight: For ${industry} business in ${region}, query "${queryText}" indicates potential trend changes.`;
};