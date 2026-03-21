import { createInsight } from '../services/insightService.js';

export const createInsightHandler = async (req, res, next) => {
  try {
    const result = await createInsight({
      tenantId: req.body.tenantId,
      queryText: req.body.queryText,
      requestId: req.requestId,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};