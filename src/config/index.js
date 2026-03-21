import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  ai: {
    url: process.env.AI_SERVICE_URL,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 1000,
    retryCount: Number(process.env.RETRY_COUNT) || 2,
    retryDelay: Number(process.env.RETRY_DELAY_MS) || 100,
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};