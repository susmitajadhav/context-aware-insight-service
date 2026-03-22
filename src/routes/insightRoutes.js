// =========================
// FILE: src/routes/insightRoutes.js
// =========================

import express from 'express';
import { createInsightController } from '../controllers/insightController.js';

const router = express.Router();

/**
 * Health Check (IMPORTANT for production)
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Insight service is running',
  });
});

/**
 * Insight Query Endpoint
 * POST /api/v1/insight-query
 */
router.post('/v1/insight-query', createInsightController);

export default router;