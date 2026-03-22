-- =========================
-- TABLE: business_context
-- =========================

CREATE TABLE IF NOT EXISTS business_context (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) UNIQUE NOT NULL,
  context JSONB NOT NULL
);

-- =========================
-- TABLE: query_logs
-- =========================

CREATE TABLE IF NOT EXISTS query_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100),
  query_text TEXT,
  response TEXT,
  latency_ms INT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- SAMPLE DATA
-- =========================

INSERT INTO business_context (tenant_id, context)
VALUES
('tenant_retail', '{"industry": "retail", "region": "India"}'),
('tenant_finance', '{"industry": "finance", "region": "US"}'),
('tenant_health', '{"industry": "healthcare", "region": "UK"}')
ON CONFLICT (tenant_id) DO NOTHING;