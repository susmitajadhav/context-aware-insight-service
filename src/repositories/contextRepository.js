import pool from '../config/db.js';

export const getTenantContext = async (tenantId) => {
  const res = await pool.query(
    'SELECT context FROM business_context WHERE tenant_id = $1',
    [tenantId]
  );

  if (res.rows.length === 0) {
    throw new Error('CONTEXT_NOT_FOUND');
  }

  return res.rows[0].context;
};
