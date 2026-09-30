import { generateDemoAccounts } from "../data/demoAccounts.js";
import { checkBreachedPassword } from "./hibpService.js";

export async function analyzeDemo(
  total,
  { signal, onRow, onMetrics, accounts, check = checkBreachedPassword } = {},
) {
  const started = performance.now();
  const metrics = { requestsStarted: 0, responsesReceived: 0, requestsFailed: 0, requestsCancelled: 0, reusedResults: 0, elapsedMs: 0 };
  const publishMetrics = () => onMetrics?.({ ...metrics, elapsedMs: Math.round(performance.now() - started) });
  const onLookup = ({ status }) => {
    const key = { requesting: "requestsStarted", received: "responsesReceived", failed: "requestsFailed", cancelled: "requestsCancelled", reused: "reusedResults" }[status];
    if (key) metrics[key]++;
    publishMetrics();
  };
  const rangeCache = new Map();
  publishMetrics();
  let consecutiveErrors = 0;
  try {
    // Sequential requests keep load bounded. Shared public prefixes reuse a per-run cache.
    for (const account of (accounts ?? generateDemoAccounts(total))) {
      signal?.throwIfAborted();
      let row;
      try {
        const result = await check(account.password, { signal, rangeCache, onLookup });
        signal?.throwIfAborted();
        row = {
          id: account.id,
          status: result.breached ? "breached" : "clear",
          checkedAt: new Date().toISOString(),
        };
        consecutiveErrors = 0;
      } catch (error) {
        if (error.name === "AbortError" || signal?.aborted) throw error;
        row = {
          id: account.id,
          status: "unknown",
          checkedAt: new Date().toISOString(),
          reason: error.code ?? "NETWORK",
        };
        consecutiveErrors++;
        onRow(row);
        if (error.code === "RATE_LIMIT" || consecutiveErrors >= 3)
          return { stoppedEarly: true };
        continue;
      } finally {
        account.password = "";
      }
      onRow(row);
    }
    return { stoppedEarly: false };
  } finally {
    rangeCache.clear();
    publishMetrics();
  }
}
