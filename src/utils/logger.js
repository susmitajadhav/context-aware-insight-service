// =========================
// FILE: src/utils/logger.js
// =========================

const log = (level, data) => {
  const logEntry = {
    level,
    timestamp: new Date().toISOString(),
    ...data,
  };

  console.log(JSON.stringify(logEntry));
};

export const logger = {
  info: (data) => log('info', data),
  error: (data) => log('error', data),
  warn: (data) => log('warn', data),
};