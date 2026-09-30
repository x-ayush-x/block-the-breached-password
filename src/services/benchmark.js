import { sha1, splitHash } from '../utils/hashing.js';
import { checkBreachedPassword } from './hibpService.js';
import { analyzeDemo } from './analyzeDemo.js';

// Public synthetic fixtures only. Never use these as real credentials.
const fixtures = ['passwordpassword', 'password', '123456', 'qwerty', 'letmein'];
export function* benchmarkAccounts() {
  for (let i = 0; i < 1000; i++) yield {
    id: `BENCH-${String(i + 1).padStart(4, '0')}`,
    password: i < 230 ? fixtures[i % fixtures.length] : `synthetic-benchmark-only-${i}-orbit-valley`,
  };
}

export async function createMockRange({ signal, scenario = 'normal' } = {}) {
  if (!['normal', 'outage'].includes(scenario)) throw new Error('Invalid scenario');
  const corpus = new Map();
  for (const fixture of fixtures) {
    signal?.throwIfAborted();
    const { prefix, suffix } = splitHash(await sha1(fixture));
    corpus.set(prefix, `${corpus.get(prefix) ?? ''}${suffix}:10\r\n`);
  }
  let calls = 0;
  return async (url, options = {}) => {
    options.signal?.throwIfAborted();
    const match = /^https:\/\/api\.pwnedpasswords\.com\/range\/([A-F0-9]{5})$/.exec(url);
    if (!match || options.method !== 'GET' || options.body != null) throw new Error('Invalid mock request');
    calls++;
    // A local timer keeps progress and cancellation observable. This is NOT network latency.
    await new Promise((resolve, reject) => {
      const abort = () => { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); reject(new DOMException('Cancelled', 'AbortError')); };
      const timer = setTimeout(() => { options.signal?.removeEventListener('abort', abort); resolve(); }, 2);
      options.signal?.addEventListener('abort', abort, { once: true });
    });
    options.signal?.throwIfAborted();
    const fail = scenario === 'outage' && calls >= 8;
    return { ok: !fail, status: fail ? 503 : 200, text: async () => (corpus.get(match[1]) ?? '') + `${'0'.repeat(35)}:0\r\n` };
  };
}

export async function runBenchmark({ signal, scenario = 'normal', ...callbacks } = {}) {
  const fetchImpl = await createMockRange({ signal, scenario });
  signal?.throwIfAborted();
  return analyzeDemo(1000, {
    ...callbacks, signal, accounts: benchmarkAccounts(),
    check: (password, options) => checkBreachedPassword(password, { ...options, fetchImpl }),
  });
}
