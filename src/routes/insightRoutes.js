import express from 'express';
import { createInsightHandler } from '../controllers/insightController.js';
import { validateInsightRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/insight-query', validateInsightRequest, createInsightHandler);

export default router;