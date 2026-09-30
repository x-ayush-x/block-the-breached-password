import { sha1, splitHash } from '../utils/hashing.js';
import { validatePassword, securityDecision } from '../utils/passwordPolicy.js';
import { evaluateStrength } from '../utils/passwordStrength.js';
import { checkBreachedPassword } from './hibpService.js';

// Public, synthetic test material only. No user input is accepted by this lab.
const STRONG_FIXTURE = 't9@Vx!4Qz#7Lp$2Rm&8Ks';
const definitions = [
  ['strong-breached', 'Strong, but already exposed', 'A high strength score must never override a breach match.', 'match', false, 'breached'],
  ['clear', 'Policy passes; no match', 'A completed no-match check and a valid local policy allow the simulation.', 'clear', true, 'clear'],
  ['common', 'Common password', 'A local blocklist must reject a common whole password, even without a mock breach match.', 'clear', false, 'clear'],
  ['short', 'Too short', 'No mock breach match does not override the minimum length.', 'clear', false, 'clear'],
  ['unavailable', 'Service unavailable', 'An HTTP 503 must leave the gate closed.', 'unavailable', false, 'error'],
  ['rate-limit', 'Rate limit', 'An HTTP 429 must remain unknown, never clear.', 'rate-limit', false, 'error'],
  ['malformed', 'Invalid service response', 'An invalid response must not become a no-match result.', 'malformed', false, 'error'],
  ['timeout', 'Request timeout', 'An unanswered request must time out and keep submission blocked.', 'timeout', false, 'error'],
  ['padding', 'Zero-count padding', 'A matching suffix with count zero is padding, not evidence of exposure.', 'padding', true, 'clear'],
];
export const LAB_SCENARIOS = Object.freeze(definitions.map(([id, title, explanation, response, expectedAllowed, expectedStatus]) => Object.freeze({ id, title, explanation, response, expectedAllowed, expectedStatus })));

function fixtureFor(id) {
  if (id === 'common') return 'passwordpassword';
  if (id === 'short') return 'short';
  return STRONG_FIXTURE;
}

// Inspect the real request constructed by the shared service, before returning a local response.
// This verifies the application's fetch arguments, not packets or browser/extension behavior.
export function requestContract(url, options) {
  return typeof url === 'string' && /^https:\/\/api\.pwnedpasswords\.com\/range\/[A-F0-9]{5}$/.test(url)
    && options.method === 'GET' && options.body === undefined
    && options.credentials === 'omit' && options.referrerPolicy === 'no-referrer'
    && options.cache === 'no-store' && options.redirect === 'error'
    && Object.keys(options.headers ?? {}).length === 1
    && options.headers['Add-Padding'] === 'true'
    && Object.keys(options).every(key => ['method', 'headers', 'signal', 'credentials', 'referrerPolicy', 'cache', 'redirect'].includes(key));
}

export async function runLabScenario(id, { signal } = {}) {
  const scenario = LAB_SCENARIOS.find(item => item.id === id);
  if (!scenario) throw new Error('Unknown lab scenario');
  signal?.throwIfAborted();
  const fixture = fixtureFor(id);
  const policy = validatePassword(fixture);
  const strength = evaluateStrength(fixture);
  const { suffix } = splitHash(await sha1(fixture));
  let requests = 0;
  let contractPassed = true;
  let breach;
  let errorCode = null;
  const started = performance.now();
  const fetchImpl = async (url, options) => {
    requests++;
    contractPassed = contractPassed && requestContract(url, options);
    options.signal.throwIfAborted();
    if (scenario.response === 'timeout') {
      return new Promise((resolve, reject) => {
        // The shared service's timeout/cancellation owns this abort signal.
        options.signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true });
      });
    }
    const status = scenario.response === 'unavailable' ? 503 : scenario.response === 'rate-limit' ? 429 : 200;
    const body = scenario.response === 'malformed' ? 'invalid service response'
      : scenario.response === 'match' ? `${suffix}:42\r\n`
      : scenario.response === 'padding' ? `${suffix}:0\r\n`
      : `${'0'.repeat(35)}:0\r\n`;
    return { ok: status === 200, status, text: async () => body };
  };
  try {
    const result = await checkBreachedPassword(fixture, { signal, fetchImpl, timeoutMs: 60 });
    breach = { status: result.breached ? 'breached' : 'clear' };
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    breach = { status: 'error' };
    errorCode = ['UNAVAILABLE', 'RATE_LIMIT', 'MALFORMED', 'TIMEOUT'].includes(error.code) ? error.code : 'UNEXPECTED';
  }
  signal?.throwIfAborted();
  const decision = securityDecision(policy, breach);
  const expectedError = { unavailable: 'UNAVAILABLE', 'rate-limit': 'RATE_LIMIT', malformed: 'MALFORMED', timeout: 'TIMEOUT' }[id] ?? null;
  const passed = decision.allowed === scenario.expectedAllowed && breach.status === scenario.expectedStatus
    && errorCode === expectedError && requests === 1 && contractPassed
    && (id !== 'strong-breached' || strength.label === 'Strong');
  // Explicit evidence allowlist. Never return fixture, full hash, suffix, prefix or raw request.
  return { id, passed, allowed: decision.allowed, breachStatus: breach.status, policyPassed: policy.valid,
    strength: strength.label, errorCode, requestContractPassed: requests === 1 && contractPassed,
    mockRequests: requests, durationMs: Math.round(performance.now() - started), reason: decision.reason };
}

export async function runSecurityLab({ signal, onResult } = {}) {
  const results = [];
  for (const scenario of LAB_SCENARIOS) {
    signal?.throwIfAborted();
    // Yield between checks so the interface can paint progress and accept cancellation.
    await new Promise(resolve => setTimeout(resolve, 25));
    signal?.throwIfAborted();
    const result = await runLabScenario(scenario.id, { signal });
    results.push(result);
    onResult?.(result);
  }
  return results;
}

export function labReport(results, phase) {
  return { project: 'Block the Breached Password', version: '1.3.0', generatedAt: new Date().toISOString(),
    source: 'LOCAL SYNTHETIC TESTS — NOT LIVE HIBP', phase,
    scope: 'Shared hashing, request construction, response parsing, strength and policy functions. No external requests. Not a production security certification or browser network capture.',
    totalScenarios: LAB_SCENARIOS.length, completed: results.length, passed: results.filter(row => row.passed).length,
    results: results.map(row => ({ id: row.id, passed: row.passed, allowed: row.allowed, breachStatus: row.breachStatus,
      policyPassed: row.policyPassed, strength: row.strength, errorCode: row.errorCode,
      requestContractPassed: row.requestContractPassed, mockRequests: row.mockRequests, durationMs: row.durationMs })) };
}
