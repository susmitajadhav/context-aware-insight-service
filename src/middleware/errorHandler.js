import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error({
    requestId: req.requestId,
    message: err.message,
  });

  res.status(err.statusCode || 500).json({
    error: err.message,
    requestId: req.requestId,
  });
};