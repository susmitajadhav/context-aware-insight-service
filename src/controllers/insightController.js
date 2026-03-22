// =========================
// FILE: src/controllers/insightController.js
// =========================

import { createInsight } from '../services/insightService.js';
import { logger } from '../utils/logger.js';
import { insightSchema } from '../validators/insightValidator.js';

/**
 * Controller: Handles incoming request for insight query
 */
export const createInsightController = async (req, res) => {
  const requestId = req.requestId;

  // =========================
  // Request Entry Log
  // =========================
  logger.info({
    requestId,
    event: 'REQUEST_RECEIVED',
    path: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  // =========================
  // Validation (Joi ONLY)
  // =========================
  const { error, value } = insightSchema.validate(req.body);

  if (error) {
    logger.warn({
      requestId,
      event: 'VALIDATION_FAILED',
      error: error.details[0].message,
    });

    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
      requestId,
    });
  }

  // Extract validated values
  const { tenantId, queryText } = value;

  try {
    // =========================
    // Call Service Layer
    // =========================
    const result = await createInsight({
      tenantId,
      queryText,
      requestId,
    });

    // =========================
    // Success Log
    // =========================
    logger.info({
      requestId,
      event: 'REQUEST_SUCCESS',
      tenantId,
      latencyMs: result.latencyMs,
    });

    return res.status(200).json({
      ...result,
      requestId,
    });
  } catch (error) {
    // =========================
    // Error Log (Structured)
    // =========================
    logger.error({
      requestId,
      event: 'REQUEST_FAILED',
      tenantId,
      error: error.message,
      stack: error.stack,
    });

    // =========================
    // Safe Error Mapping
    // =========================
    const { statusCode, message } = mapErrorToResponse(error);

    return res.status(statusCode).json({
      status: 'error',
      message,
      requestId,
    });
  }
};

// =========================
// Error Mapping Function
// =========================

const mapErrorToResponse = (error) => {
  switch (error.message) {
    case 'INVALID_INPUT':
      return {
        statusCode: 400,
        message: 'Invalid request input',
      };

    case 'CONTEXT_NOT_FOUND':
      return {
        statusCode: 404,
        message: 'Tenant context not found',
      };

    case 'TENANT_NOT_FOUND':
      return {
        statusCode: 404,
        message: 'Tenant not found',
      };

    case 'AI_FAILURE':
    case 'AI_SERVICE_FAILURE':
      return {
        statusCode: 502,
        message: 'AI service failed to process request',
      };

    default:
      return {
        statusCode: 500,
        message: 'Internal server error',
      };
  }
};