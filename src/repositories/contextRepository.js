import { pool } from '../config/db.js';

export const getTenantContext = async (tenantId) => {
  const res = await pool.query(
    'SELECT context FROM tenant_context WHERE tenant_id = $1',
    [tenantId]
  );

  return res.rows[0]?.context || null;
};