import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error({
    requestId: req.requestId,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.statusCode || 500).json({
    error: 'Something went wrong',
    requestId: req.requestId,
  });
};