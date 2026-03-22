import { getTenantContext } from '../repositories/contextRepository.js';
import { callAI } from './aiService.js';
import { retry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';
import { logQuery } from '../repositories/queryRepository.js';
import { config } from '../config/index.js';

export const createInsight = async ({
  tenantId,
  queryText,
  requestId,
}) => {
  const start = Date.now();

  // ✅ Input validation
  if (!tenantId || !queryText?.trim()) {
    throw new Error('Invalid input: tenantId and queryText required');
  }

  // 🔹 Load tenant context
  const context = await getTenantContext(tenantId);

  if (!context) {
    const latency = Date.now() - start;

    try {
      await logQuery({
        tenantId,
        queryText,
        response: 'No context found',
        status: 'FAILED',
        latencyMs: latency,
      });
    } catch (err) {
      logger.error({ requestId, event: 'LOGGING_FAILED', error: err.message });
    }

    return {
      status: 'FAILED',
      insight: 'No business context found for tenant',
      latencyMs: latency,
    };
  }

  try {
    // 🔹 AI call with retry (config-driven)
    const aiResponse = await retry(
      () =>
        callAI({
          queryText,
          context,
          requestId,
        }),
      config.ai.retryCount,
      config.ai.retryDelay
    );

    const latency = Date.now() - start;

    try {
      await logQuery({
        tenantId,
        queryText,
        response: aiResponse.insight,
        status: 'SUCCESS',
        latencyMs: latency,
      });
    } catch (err) {
      logger.error({ requestId, event: 'LOGGING_FAILED', error: err.message });
    }

    return {
      status: 'SUCCESS',
      insight: aiResponse.insight,
      latencyMs: latency,
    };
  } catch (err) {
    const latency = Date.now() - start;

    logger.error({
      requestId,
      tenantId,
      event: 'AI_CALL_FAILED',
      error: err.message,
      latencyMs: latency,
    });

    try {
      await logQuery({
        tenantId,
        queryText,
        response: 'Fallback insight',
        status: 'FAILED',
        latencyMs: latency,
      });
    } catch (logErr) {
      logger.error({
        requestId,
        event: 'LOGGING_FAILED',
        error: logErr.message,
      });
    }

    return {
      status: 'PARTIAL_SUCCESS',
      insight: 'AI service unavailable, returning fallback insight',
      latencyMs: latency,
    };
  }
};