import { config } from '../config/index.js';
import { AIServiceError } from '../errors/AIServiceError.js';

export const callAI = async (payload) => {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    config.ai.timeoutMs
  );

  try {
    const res = await fetch(config.ai.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new AIServiceError(`AI responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new AIServiceError('AI request timeout');
    }

    throw new AIServiceError(err.message, { cause: err });
  } finally {
    clearTimeout(timeout);
  }
};