// =========================
// FILE: src/repositories/queryRepository.js
// =========================

import pool from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Persist query execution logs
 */
export const saveQueryLog = async ({
  tenantId,
  queryText,
  response,
  latency,
  status,
}) => {
  try {
    const start = Date.now();

    await pool.query(
      `INSERT INTO query_logs 
      (tenant_id, query_text, response, latency_ms, status)
      VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, queryText, response, latency, status]
    );

    const dbLatency = Date.now() - start;

    logger.info({
      event: 'DB_QUERY_LOG_INSERT',
      tenantId,
      status,
      dbLatencyMs: dbLatency,
    });
  } catch (error) {
    logger.error({
      event: 'DB_QUERY_LOG_FAILED',
      tenantId,
      error: error.message,
    });

    // DO NOT throw → logging should never break main flow
  }
};