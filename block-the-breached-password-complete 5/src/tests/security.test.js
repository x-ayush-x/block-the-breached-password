import test from "node:test";
import assert from "node:assert/strict";
import { sha1, splitHash } from "../utils/hashing.js";
import {
  parseRangeResponse,
  matchSuffix,
  fetchRange,
  checkBreachedPassword,
  BreachCheckError,
} from "../services/hibpService.js";
import {
  validatePassword,
  securityDecision,
  normalizePassword,
} from "../utils/passwordPolicy.js";
import { evaluateStrength } from "../utils/passwordStrength.js";
import { summarize, reportSentence } from "../utils/reporting.js";
import { analyzeDemo } from "../services/analyzeDemo.js";
import {
  generateDemoAccounts,
  generateDemoPassword,
} from "../data/demoAccounts.js";

const fakeResponse = (text) => ({
  ok: true,
  status: 200,
  text: async () => text,
});
const suffix = "A".repeat(35);
const other = "B".repeat(35);
const validPassword = "An unusual demo phrase 972681";

test("SHA-1 matches the standard abc vector", async () =>
  assert.equal(await sha1("abc"), "A9993E364706816ABA3E25717850C26C9CD0D89D"));
test("SHA-1 is 40 uppercase hexadecimal characters", async () =>
  assert.match(await sha1("a Unicode example 🌍"), /^[A-F0-9]{40}$/));
test("prefix and suffix use the exact 5/35 split", async () => {
  const hash = await sha1("password");
  const parts = splitHash(hash);
  assert.equal(parts.prefix, "5BAA6");
  assert.equal(parts.suffix.length, 35);
  assert.equal(parts.prefix + parts.suffix, hash);
});
test("invalid full hashes are rejected", () =>
  assert.throws(() => splitHash("12345")));
test("parser handles CRLF, trailing newline and lowercase suffixes", () =>
  assert.equal(
    parseRangeResponse(`${suffix.toLowerCase()}:123\r\n${other}:9\r\n`).get(
      suffix,
    ),
    123,
  ));
test("exact suffix match returns occurrence count", () =>
  assert.deepEqual(matchSuffix(parseRangeResponse(`${suffix}:45`), suffix), {
    breached: true,
    count: 45,
  }));
test("no matching suffix returns no known match", () =>
  assert.deepEqual(matchSuffix(parseRangeResponse(`${other}:4`), suffix), {
    breached: false,
    count: 0,
  }));
test("matching zero-count padding is not a breach", () =>
  assert.deepEqual(matchSuffix(parseRangeResponse(`${suffix}:0`), suffix), {
    breached: false,
    count: 0,
  }));
for (const [name, body] of [
  ["empty", ""],
  ["html", "<html>failure</html>"],
  ["partial", `${suffix}:3\nBAD`],
  ["negative", `${suffix}:-1`],
  ["unsafe count", `${suffix}:99999999999999999999999`],
  ["duplicate", `${suffix}:2\n${suffix}:3`],
]) {
  test(`parser fails closed for ${name} response`, () =>
    assert.throws(() => parseRangeResponse(body), { code: "MALFORMED" }));
}
test("lookup sends only five hex characters, no body, cookies or referrer", async () => {
  let captured;
  const hash = await sha1(validPassword);
  const result = await checkBreachedPassword(validPassword, {
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return fakeResponse(`${hash.slice(5)}:7`);
    },
  });
  assert.deepEqual(result, { breached: true, count: 7 });
  assert.equal(
    captured.url,
    `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`,
  );
  assert.equal(captured.options.method, "GET");
  assert.equal(captured.options.body, undefined);
  assert.equal(captured.options.headers["Add-Padding"], "true");
  assert.equal(captured.options.credentials, "omit");
  assert.equal(captured.options.referrerPolicy, "no-referrer");
  assert.equal(captured.options.redirect, "error");
  assert.equal(captured.options.cache, "no-store");
  assert.ok(!JSON.stringify(captured).includes(validPassword));
  assert.ok(!JSON.stringify(captured).includes(hash));
});
test("Unicode NFC is applied before HIBP hashing", async () => {
  const raw = "e\u0301".repeat(15);
  const hash = await sha1(normalizePassword(raw));
  await checkBreachedPassword(raw, {
    fetchImpl: async (url) => {
      assert.ok(url.endsWith(hash.slice(0, 5)));
      return fakeResponse(`${other}:1`);
    },
  });
});
for (const [status, code] of [
  [429, "RATE_LIMIT"],
  [500, "UNAVAILABLE"],
  [404, "UNAVAILABLE"],
]) {
  test(`HTTP ${status} is never treated as a no-match`, async () =>
    assert.rejects(
      fetchRange("ABCDE", { fetchImpl: async () => ({ ok: false, status }) }),
      { code },
    ));
}
test("network error is sanitized", async () =>
  assert.rejects(
    fetchRange("ABCDE", {
      fetchImpl: async () => {
        throw new Error("sensitive details");
      },
    }),
    { code: "NETWORK", message: "NETWORK" },
  ));
test("timeout aborts the request and returns a safe error", async () =>
  assert.rejects(
    fetchRange("ABCDE", {
      timeoutMs: 5,
      fetchImpl: (_url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Abort", "AbortError")),
            { once: true },
          );
        }),
    }),
    { code: "TIMEOUT" },
  ));
test("caller cancellation aborts without classifying a password", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(fetchRange("ABCDE", { signal: controller.signal }), {
    name: "AbortError",
  });
});
test("invalid prefix never reaches the network", async () =>
  assert.rejects(
    fetchRange("ABCDEF", {
      fetchImpl: () => assert.fail("network must not be called"),
    }),
    { code: "INVALID_PREFIX" },
  ));
test("empty and oversized input never reach the network", async () => {
  for (const password of ["", "a".repeat(129), "a".repeat(5000)])
    await assert.rejects(
      checkBreachedPassword(password, {
        fetchImpl: () => assert.fail("network must not be called"),
      }),
      { code: "INPUT" },
    );
});
test("per-run prefix cache avoids duplicate range calls", async () => {
  const cache = new Map();
  let calls = 0;
  const options = {
    rangeCache: cache,
    fetchImpl: async () => {
      calls++;
      return fakeResponse(`${other}:1`);
    },
  };
  await checkBreachedPassword(validPassword, options);
  await checkBreachedPassword(validPassword, options);
  assert.equal(calls, 1);
  cache.clear();
});
test("policy accepts long lowercase passphrases without composition rules", () =>
  assert.equal(
    validatePassword("violet railway lantern riverside").valid,
    true,
  ));
test("policy enforces 15 minimum and 128 maximum without truncation", () => {
  assert.equal(validatePassword("x".repeat(14)).valid, false);
  assert.equal(validatePassword("x".repeat(15)).lengthOK, true);
  assert.equal(validatePassword("x".repeat(128)).valid, true);
  assert.equal(validatePassword("x".repeat(129)).valid, false);
});
test("Unicode length counts code points and normalizes NFC", () => {
  assert.equal(validatePassword("🌍".repeat(15)).length, 15);
  assert.equal(validatePassword("e\u0301".repeat(15)).length, 15);
});
test("common/context blocklist uses whole values, not contained words", () => {
  assert.equal(validatePassword("passwordpassword").blocked, true);
  assert.equal(
    validatePassword("judgeaccount12345", "judgeaccount12345@example.test")
      .blocked,
    true,
  );
  assert.equal(
    validatePassword("my password sails beyond the horizon").blocked,
    false,
  );
});
test("spaces are preserved rather than silently trimmed", () =>
  assert.equal(validatePassword("     abcdefghij").length, 15));
test("strength recognizes predictable repeated text", () =>
  assert.ok(evaluateStrength("aaaaaaaaaaaaaaaaaaaaaaaa").level <= 2));
test("strength scores a high-entropy demonstration string strongly", () =>
  assert.equal(
    evaluateStrength("7c96a183f20bd94e58a3c71df628").label,
    "Strong",
  ));
test("strength response never retains plaintext or zxcvbn sequence data", () => {
  const result = evaluateStrength(validPassword);
  assert.deepEqual(Object.keys(result).sort(), ["feedback", "label", "level"]);
  assert.ok(!JSON.stringify(result).includes(validPassword));
});
test("empty and extreme strength inputs are handled", () => {
  assert.equal(evaluateStrength("").level, 0);
  assert.equal(evaluateStrength("x".repeat(5000)).label, "Not scored");
});
test("breached password is rejected even when local policy passes", () =>
  assert.equal(
    securityDecision(validatePassword(validPassword), { status: "breached" })
      .allowed,
    false,
  ));
for (const status of ["idle", "checking", "error", "expired"])
  test(`${status} breach status fails closed`, () =>
    assert.equal(
      securityDecision(validatePassword(validPassword), { status }).allowed,
      false,
    ));
test("clear breach result cannot override a failed length rule", () =>
  assert.equal(
    securityDecision(validatePassword("short"), { status: "clear" }).allowed,
    false,
  ));
test("clear result and valid policy permit simulation", () =>
  assert.equal(
    securityDecision(validatePassword(validPassword), { status: "clear" })
      .allowed,
    true,
  ));
test("complete exposure report calculates rather than hardcodes its percentage", () => {
  const rows = [
    ...Array.from({ length: 23 }, () => ({ status: "breached" })),
    ...Array.from({ length: 77 }, () => ({ status: "clear" })),
  ];
  const result = summarize(rows, 100);
  assert.equal(result.percentage, 23);
  assert.equal(
    reportSentence(result),
    "23% of test accounts use a breached password.",
  );
});
test("unknown/pending results are excluded with explicit incomplete wording", () => {
  const result = summarize(
    [{ status: "breached" }, { status: "clear" }, { status: "unknown" }],
    5,
  );
  assert.equal(result.percentage, 50);
  assert.equal(result.pending, 2);
  assert.equal(result.tested, 2);
  assert.match(reportSentence(result), /incomplete/);
});
test("empty report never claims 0 percent exposure", () =>
  assert.equal(summarize([], 100).percentage, null));
test("random generator uses fresh cryptographic bytes", () => {
  const a = generateDemoPassword(),
    b = generateDemoPassword();
  assert.match(a, /^[0-9a-f]{36}$/);
  assert.notEqual(a, b);
});
test("dataset has 100 ephemeral test-only accounts", () => {
  const rows = [...generateDemoAccounts(100)];
  assert.equal(rows.length, 100);
  assert.equal(new Set(rows.map((x) => x.id)).size, 100);
});
test("analysis emits only identifiers, decisions and timestamps, never passwords", async () => {
  const rows = [];
  await analyzeDemo(20, {
    onRow: (row) => rows.push(row),
    check: async () => ({ breached: false, count: 0 }),
  });
  assert.equal(rows.length, 20);
  for (const row of rows)
    assert.deepEqual(Object.keys(row).sort(), ["checkedAt", "id", "status"]);
});
test("analysis stops after 3 consecutive failures and preserves unknown status", async () => {
  const rows = [];
  const result = await analyzeDemo(20, {
    onRow: (row) => rows.push(row),
    check: async () => {
      throw new BreachCheckError("NETWORK");
    },
  });
  assert.equal(result.stoppedEarly, true);
  assert.equal(rows.length, 3);
  assert.ok(rows.every((row) => row.status === "unknown"));
});
test("analysis stops immediately on a rate-limit response", async () => {
  const rows = [];
  await analyzeDemo(20, {
    onRow: (row) => rows.push(row),
    check: async () => {
      throw new BreachCheckError("RATE_LIMIT");
    },
  });
  assert.equal(rows.length, 1);
});
