import { sha1, splitHash } from "../utils/hashing.js";
import {
  normalizePassword,
  characterCount,
  POLICY,
} from "../utils/passwordPolicy.js";

export class BreachCheckError extends Error {
  constructor(code) {
    super(code);
    this.name = "BreachCheckError";
    this.code = code;
  }
}

export function parseRangeResponse(text) {
  if (typeof text !== "string" || text.length > 2_000_000 || !text.trim())
    throw new BreachCheckError("MALFORMED");
  const entries = new Map();
  for (const line of text.trim().split(/\r?\n/)) {
    const match = /^([A-Fa-f0-9]{35}):([0-9]+)$/.exec(line);
    if (!match) throw new BreachCheckError("MALFORMED");
    const count = Number(match[2]);
    if (!Number.isSafeInteger(count) || count < 0)
      throw new BreachCheckError("MALFORMED");
    if (count === 0) continue; // HIBP padding is never a breach match.
    const suffix = match[1].toUpperCase();
    if (entries.has(suffix)) throw new BreachCheckError("MALFORMED");
    entries.set(suffix, count);
  }
  return entries;
}

export function matchSuffix(entries, suffix) {
  if (!/^[A-F0-9]{35}$/.test(suffix)) throw new BreachCheckError("MALFORMED");
  const count = entries.get(suffix) ?? 0;
  return { breached: count > 0, count };
}

export async function fetchRange(
  prefix,
  { signal, timeoutMs = 12000, fetchImpl = globalThis.fetch, onLookup } = {},
) {
  if (!/^[A-F0-9]{5}$/.test(prefix))
    throw new BreachCheckError("INVALID_PREFIX");
  signal?.throwIfAborted();
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    // This is the application's ONLY external data request. Never add password,
    // full hash, suffix, email, analytics, query parameters or a request body here.
    onLookup?.({ status: "requesting", prefix });
    const response = await fetchImpl(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        method: "GET",
        headers: { "Add-Padding": "true" },
        signal: controller.signal,
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        redirect: "error",
      },
    );
    if (response.status === 429) throw new BreachCheckError("RATE_LIMIT");
    if (!response.ok) throw new BreachCheckError("UNAVAILABLE");
    const result = parseRangeResponse(await response.text());
    controller.signal.throwIfAborted();
    onLookup?.({ status: "received", prefix });
    return result;
  } catch (error) {
    onLookup?.({ status: signal?.aborted ? "cancelled" : "failed", prefix });
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    if (timedOut) throw new BreachCheckError("TIMEOUT");
    if (error instanceof BreachCheckError) throw error;
    throw new BreachCheckError("NETWORK"); // Never expose a raw error with request details.
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}

export async function checkBreachedPassword(
  password,
  { rangeCache, ...options } = {},
) {
  if (
    typeof password !== "string" ||
    !password ||
    password.length > POLICY.rawInputLimit
  )
    throw new BreachCheckError("INPUT");
  const canonical = normalizePassword(password);
  if (characterCount(canonical) > POLICY.maxLength)
    throw new BreachCheckError("INPUT");
  options.signal?.throwIfAborted();
  let hash;
  try {
    hash = await sha1(canonical);
  } catch {
    throw new BreachCheckError("CRYPTO");
  }
  options.signal?.throwIfAborted();
  const { prefix, suffix } = splitHash(hash);
  hash = undefined;
  // Optional cache lives only for a single dashboard run and is cleared afterward.
  let entries = rangeCache?.get(prefix);
  if (entries) options.onLookup?.({ status: "reused", prefix });
  if (!entries) {
    entries = await fetchRange(prefix, options);
    rangeCache?.set(prefix, entries);
  }
  options.signal?.throwIfAborted();
  return matchSuffix(entries, suffix);
}

export const errorMessage = (code) =>
  ({
    TIMEOUT:
      "The breach service took too long. Please retry. Submission remains blocked.",
    RATE_LIMIT: "The service asked us to slow down. Wait a minute and retry.",
    MALFORMED:
      "The service returned an invalid response. We cannot confirm a result.",
    UNAVAILABLE: "The breach service is unavailable. Please retry later.",
    NETWORK: "Could not reach HIBP. Check your internet connection and retry.",
    CRYPTO:
      "Browser cryptography is unavailable. Use Chrome on localhost or an HTTPS site.",
    INPUT: "Enter between 1 and 128 characters before checking.",
  })[code] ??
  "The check could not finish. Please retry. Submission remains blocked.";
