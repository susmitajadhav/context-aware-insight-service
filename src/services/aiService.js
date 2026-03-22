// =========================
// FILE: src/services/aiService.js
// =========================

import CircuitBreaker from 'opossum';
import { logger } from '../utils/logger.js';

// =========================
// Config
// =========================

const DEFAULT_DELAY_MS = parseInt(process.env.AI_DELAY_MS) || 500;
const FAILURE_RATE = parseFloat(process.env.AI_FAILURE_RATE) || 0.2;

// =========================
// Core AI Function (wrapped by circuit breaker)
// =========================

const aiFunction = async ({ queryText, context }) => {
  // --- Simulate delay ---
  await simulateDelay(DEFAULT_DELAY_MS);

  // --- Simulate failure ---
  simulateFailure(FAILURE_RATE);

  // --- Generate response ---
  return generateInsight(queryText, context);
};

// =========================
// Circuit Breaker Setup
// =========================

const breaker = new CircuitBreaker(aiFunction, {
  timeout: parseInt(process.env.AI_TIMEOUT_MS) || 1000, // max time allowed
  errorThresholdPercentage: 50, // open circuit if 50% fail
  resetTimeout: 5000, // retry after 5 sec
});

// =========================
// Circuit Breaker Events (IMPORTANT)
// =========================

breaker.on('open', () => {
  logger.warn({
    event: 'CIRCUIT_OPEN',
    message: 'AI service circuit opened',
  });
});

breaker.on('halfOpen', () => {
  logger.warn({
    event: 'CIRCUIT_HALF_OPEN',
    message: 'AI service circuit half-open',
  });
});

breaker.on('close', () => {
  logger.info({
    event: 'CIRCUIT_CLOSED',
    message: 'AI service circuit closed',
  });
});

breaker.on('fallback', () => {
  logger.warn({
    event: 'CIRCUIT_FALLBACK',
    message: 'Fallback executed',
  });
});

// =========================
// Public API Function
// =========================

export const callAI = async ({ queryText, context }) => {
  try {
    return await breaker.fire({ queryText, context });
  } catch (error) {
    logger.error({
      event: 'AI_CALL_FAILED',
      error: error.message,
    });

    throw error;
  }
};

// =========================
// Helper Functions
// =========================

const simulateDelay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const simulateFailure = (failureRate) => {
  if (Math.random() < failureRate) {
    const error = new Error('AI_SERVICE_FAILURE');
    error.code = 'AI_FAILURE';
    throw error;
  }
};

const generateInsight = (queryText, context) => {
  const industry = context?.industry || 'unknown industry';
  const region = context?.region || 'unknown region';

  return `Insight: For ${industry} business in ${region}, query "${queryText}" indicates potential trend changes requiring attention.`;
};