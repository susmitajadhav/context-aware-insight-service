<<<<<<< HEAD

=======
# Context-Aware Insight Query Service

## 🚀 Overview

This service is a **production-style backend system** designed to generate business insights using **tenant-specific context** and a **mock AI service**.

It demonstrates:

* Multi-tenant SaaS thinking
* Failure handling (timeouts, retries, circuit breaker)
* Structured logging & observability
* Production-oriented design patterns

---

## 🏗️ Architecture

```
Client → Controller → Service → Repository → Database
                          ↓
                        AI Service (HTTP)
```

### Key Components

* **Controller Layer**

  * Handles request validation & response formatting
* **Service Layer**

  * Core business logic orchestration
* **Repository Layer**

  * Database interactions (PostgreSQL)
* **AI Service**

  * External HTTP call with resilience (retry + circuit breaker)
* **Middleware**

  * Request tracing, logging, rate limiting

---

## 📌 API Endpoints

### 1. Create Insight Query

**POST** `/api/v1/insight-query`

#### Request

```json
{
  "tenantId": "tenant_retail",
  "queryText": "sales trend"
}
```

#### Response

```json
{
  "status": "SUCCESS",
  "insight": "Insight for 'sales trend' in retail",
  "latencyMs": 450
}
```

---

### 2. Mock AI Service

**POST** `/mock-ai`

* Simulates:

  * Random delay
  * Failure scenarios
* Used to mimic real AI dependency

---

## 🧠 Design Decisions

### 1. Multi-Tenant Awareness

* Tenant-specific context is fetched using:

```sql
WHERE tenant_id = $1
```

* Ensures no cross-tenant data leakage

---

### 2. Resilience Strategy

#### Retry Mechanism

* Retries only AI failures
* Exponential backoff

#### Circuit Breaker (Opossum)

* Prevents cascading failures
* Opens when failure rate exceeds threshold
* Automatically recovers

---

### 3. Error Handling

* Custom error classes (`AppError`, `AIServiceError`)
* Safe error responses (no internal leaks)
* Proper HTTP status mapping

---

### 4. Logging & Observability

* Structured JSON logs
* Request tracing using `requestId`
* Key events logged:

  * Request start/end
  * DB queries
  * AI calls
  * Failures

---

### 5. Configuration

* All configs via `.env`
* Includes:

  * DB config
  * AI timeout
  * Retry settings
  * Failure simulation

---

## 🗄️ Data Model

### business_context

| column    | type   |
| --------- | ------ |
| tenant_id | string |
| context   | JSONB  |

---

### query_logs

| column     | type   |
| ---------- | ------ |
| tenant_id  | string |
| query_text | text   |
| response   | text   |
| latency_ms | int    |
| status     | string |

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone <repo-url>
cd context-aware-insight-service
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create `.env` file:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=insight_db

AI_SERVICE_URL=http://localhost:4000/mock-ai
AI_TIMEOUT_MS=1000
RETRY_COUNT=2
RETRY_DELAY_MS=100

AI_FAILURE_RATE=0.2
LOG_LEVEL=info
```

---

### 4. Setup Database

Run SQL:

```sql
CREATE TABLE business_context (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) UNIQUE NOT NULL,
  context JSONB NOT NULL
);

CREATE TABLE query_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100),
  query_text TEXT,
  response TEXT,
  latency_ms INT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Insert sample data:

```sql
INSERT INTO business_context (tenant_id, context)
VALUES
('tenant_retail', '{"industry": "retail", "region": "India"}'),
('tenant_finance', '{"industry": "finance", "region": "US"}'),
('tenant_health', '{"industry": "healthcare", "region": "UK"}');
```

---

### 5. Start Mock AI Server

```bash
node src/utils/mock-ai-server.js
```

---

### 6. Start Backend

```bash
npm run dev
```

---

## 🧪 Testing

Use Postman:

### Success Case

```json
{
  "tenantId": "tenant_retail",
  "queryText": "sales trend"
}
```

---

### Failure Scenarios

#### 1. Invalid Tenant

```json
{
  "tenantId": "tenant_unknown",
  "queryText": "sales"
}
```

#### 2. AI Failure Simulation

Set:

```env
AI_FAILURE_RATE=1
```

---

## ⚠️ Known Limitations

* In-memory rate limiting (not distributed)
* No authentication (out of scope)
* No schema migration tooling
* Logging uses console (can be upgraded to pino/winston)

---

## 🚀 Production Improvements (Future)

* Redis-based rate limiting
* Distributed circuit breaker
* Centralized logging (ELK)
* Docker deployment
* Schema migrations (Knex/Prisma)

---

## 🎯 Summary

This implementation demonstrates:

* Clean layered architecture
* Strong failure handling
* Multi-tenant awareness
* Production-oriented design decisions

The focus was on **engineering correctness and resilience**, not feature breadth.
>>>>>>> 05aa513 (Added file schema.sql)
