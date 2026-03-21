export const retry = async (fn, retries, delay) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;

      await new Promise((res) =>
        setTimeout(res, delay * Math.pow(2, attempt))
      );

      attempt++;
    }
  }
};