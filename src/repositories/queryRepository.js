import { pool } from '../config/db.js';

export const logQuery = async ({
  tenantId,
  queryText,
  response,
  status,
  latencyMs,
}) => {
  await pool.query(
    `INSERT INTO query_logs 
    (tenant_id, query_text, response, status, latency_ms)
    VALUES ($1, $2, $3, $4, $5)`,
    [tenantId, queryText, response, status, latencyMs]
  );
};