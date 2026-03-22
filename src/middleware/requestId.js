// =========================
// FILE: src/middleware/requestId.js
// =========================

export const requestIdMiddleware = (req, res, next) => {
  const requestId =
    req.headers['x-request-id'] ||
    `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  req.requestId = requestId;

  res.setHeader('x-request-id', requestId);

  next();
};