import pool from '../config/db.js';

export const saveQueryLog = async ({ tenantId, queryText, response, latency, status }) => {
  await pool.query(
    `INSERT INTO query_logs (tenant_id, query_text, response, latency_ms, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [tenantId, queryText, response, latency, status]
  );
};