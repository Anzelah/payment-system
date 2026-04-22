async function withRetry(fn, retries = 2, delay = 2000) {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;

        console.log("[DB RETRY] Retrying after failure...");
        await new Promise(res => setTimeout(res, delay));

        return withRetry(fn, retries - 1, delay);
    }
}

module.exports = withRetry