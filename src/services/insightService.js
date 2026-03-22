// =========================
// FILE: src/services/insightService.js
// =========================

import { getTenantContext } from '../repositories/contextRepository.js';
import { callAI } from './aiService.js';
import { retry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';
import { saveQueryLog } from '../repositories/queryRepository.js';
import { config } from '../config/index.js';

/**
 * Core business logic: Create insight
 */
export const createInsight = async ({
  tenantId,
  queryText,
  requestId,
}) => {
  const start = Date.now();

  // 🔹 Ensure requestId exists (for tracing)
  const reqId =
    requestId || `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // 🔹 Input validation
  if (!tenantId || !queryText?.trim()) {
    throw new Error('INVALID_INPUT');
  }

  try {
    // =========================
    // 1. Fetch Tenant Context
    // =========================

    // 🔥 START LOG
    logger.info({
      requestId: reqId,
      event: 'CONTEXT_FETCH_START',
      tenantId,
    });

    const context = await getTenantContext(tenantId);

    // 🔥 SUCCESS LOG
    logger.info({
      requestId: reqId,
      event: 'CONTEXT_FETCH_SUCCESS',
      tenantId,
    });

    if (!context) {
      throw new Error('CONTEXT_NOT_FOUND');
    }

    // =========================
    // 2. Call AI (with retry)
    // =========================

    // 🔥 START LOG
    logger.info({
      requestId: reqId,
      event: 'AI_CALL_START',
    });

    const insight = await retry(
      () =>
        callAI({
          queryText,
          context,
        }),
      config.ai.retryCount,
      config.ai.retryDelay
    );

    // 🔥 SUCCESS LOG
    logger.info({
      requestId: reqId,
      event: 'AI_CALL_SUCCESS',
    });

    const latency = Date.now() - start;

    // =========================
    // 3. Save SUCCESS log
    // =========================
    await safeLog({
      tenantId,
      queryText,
      response: insight,
      status: 'SUCCESS',
      latency,
      requestId: reqId,
    });

    // =========================
    // 4. Return response
    // =========================
    return {
      status: 'SUCCESS',
      insight,
      latencyMs: latency,
    };
  } catch (error) {
    const latency = Date.now() - start;

    // 🔥 FAILURE LOG
    logger.error({
      requestId: reqId,
      tenantId,
      event: 'INSIGHT_FAILED',
      error: error.message,
      latencyMs: latency,
    });

    // =========================
    // 5. Save FAILURE log
    // =========================
    await safeLog({
      tenantId,
      queryText,
      response: error.message,
      status: 'FAILURE',
      latency,
      requestId: reqId,
    });

    // =========================
    // 6. Throw error (controller handles mapping)
    // =========================
    throw error;
  }
};

// =========================
// Helper: Safe Logging Wrapper
// =========================

const safeLog = async ({
  tenantId,
  queryText,
  response,
  status,
  latency,
  requestId,
}) => {
  try {
    await saveQueryLog({
      tenantId,
      queryText,
      response,
      latency,
      status,
    });
  } catch (err) {
    logger.error({
      requestId,
      event: 'LOGGING_FAILED',
      error: err.message,
    });
  }
};