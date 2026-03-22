// =========================
// FILE: src/services/insightService.js
// =========================

import { getTenantContext } from '../repositories/contextRepository.js';
import { callAI } from './aiService.js';
import { retry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';
import { saveQueryLog } from '../repositories/queryRepository.js';
import { config } from '../config/index.js';
import { AppError } from '../errors/AppError.js';

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

  // =========================
  // 🔹 STRICT INPUT VALIDATION
  // =========================
  if (!tenantId || typeof tenantId !== 'string') {
    throw new AppError('Invalid tenantId', 400, 'INVALID_INPUT');
  }

  if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
    throw new AppError('Invalid queryText', 400, 'INVALID_INPUT');
  }

  // 🔹 Normalize input
  const normalizedTenantId = tenantId.trim();
  const normalizedQueryText = queryText.trim();

  try {
    // =========================
    // 1. Fetch Tenant Context
    // =========================

    logger.info({
      requestId: reqId,
      event: 'CONTEXT_FETCH_START',
      tenantId: normalizedTenantId,
    });

    const context = await getTenantContext(normalizedTenantId);

    logger.info({
      requestId: reqId,
      event: 'CONTEXT_FETCH_SUCCESS',
      tenantId: normalizedTenantId,
    });

    if (!context) {
      throw new AppError(
        'Tenant context not found',
        404,
        'CONTEXT_NOT_FOUND'
      );
    }

    // =========================
    // 2. Call AI (with retry)
    // =========================

    logger.info({
      requestId: reqId,
      event: 'AI_CALL_START',
      tenantId: normalizedTenantId,
    });

   const insight = await retry(
  async () => {
    return await callAI({
      queryText: normalizedQueryText,
      context,
      requestId: reqId, // 🔥 ADD THIS
    });
  },
  config.ai.retryCount,
  config.ai.retryDelay
);

    logger.info({
      requestId: reqId,
      event: 'AI_CALL_SUCCESS',
      tenantId: normalizedTenantId,
    });

    const latency = Date.now() - start;

    // =========================
    // 3. Save SUCCESS log
    // =========================
    await safeLog({
      tenantId: normalizedTenantId,
      queryText: normalizedQueryText,
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

    // =========================
    // 🔥 FAILURE LOG (ENHANCED)
    // =========================
    logger.error({
      requestId: reqId,
      tenantId: normalizedTenantId,
      event: 'INSIGHT_FAILED',
      error: error.message,
      errorCode: error.code || 'UNKNOWN_ERROR',
      latencyMs: latency,
    });

    // =========================
    // 5. Save FAILURE log
    // =========================
    await safeLog({
      tenantId: normalizedTenantId,
      queryText: normalizedQueryText,
      response: error.message,
      status: 'FAILURE',
      latency,
      requestId: reqId,
    });

    // =========================
    // 6. Rethrow (controller handles mapping)
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