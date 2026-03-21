import { getTenantContext } from '../repositories/contextRepository.js';
import { callAI } from './aiService.js';
import { retry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';
import { logQuery } from '../repositories/queryRepository.js';

export const createInsight = async ({
  tenantId,
  queryText,
  requestId,
}) => {
  const start = Date.now();

  // 🔹 Step 1: Load tenant context
  const context = await getTenantContext(tenantId);

  if (!context) {
    const latency = Date.now() - start;

    await logQuery({
      tenantId,
      queryText,
      response: 'No context found',
      status: 'FAILED',
      latencyMs: latency,
    });

    return {
      status: 'FAILED',
      insight: 'No business context found for tenant',
      latencyMs: latency,
    };
  }

  try {
    // 🔹 Step 2: Call AI with retry
    const aiResponse = await retry(
      () =>
        callAI({
          queryText,
          context,
          requestId,
        }),
      2, // retry count
      100 // initial delay
    );

    const latency = Date.now() - start;

    // 🔹 Step 3: Log success in DB
    await logQuery({
      tenantId,
      queryText,
      response: aiResponse.insight,
      status: 'SUCCESS',
      latencyMs: latency,
    });

    // 🔹 Step 4: Return success response
    return {
      status: 'SUCCESS',
      insight: aiResponse.insight,
      latencyMs: latency,
    };
  } catch (err) {
    const latency = Date.now() - start;

    // 🔹 Step 5: Log error (structured logging)
    logger.error({
      requestId,
      tenantId,
      event: 'AI_CALL_FAILED',
      error: err.message,
      latencyMs: latency,
    });

    // 🔹 Step 6: Log failure in DB
    await logQuery({
      tenantId,
      queryText,
      response: 'Fallback insight',
      status: 'FAILED',
      latencyMs: latency,
    });

    // 🔹 Step 7: Return fallback response
    return {
      status: 'PARTIAL_SUCCESS',
      insight: 'AI service unavailable, returning fallback insight',
      latencyMs: latency,
    };
  }
};