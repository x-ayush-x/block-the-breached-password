// PUBLIC, TEST-ONLY fixtures. These are intentionally in source, not collected credentials.
export const BREACHED_DEMO = "passwordpassword";
const PUBLIC_FIXTURES = [
  BREACHED_DEMO,
  "password",
  "123456",
  "qwerty",
  "letmein",
];

export function generateDemoPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function demoComposition(total) {
  if (![20, 100].includes(total)) throw new Error("Unsupported demonstration size");
  const common = Math.round(total * 0.23);
  return { common, random: total - common };
}

export function* generateDemoAccounts(total = 100) {
  if (![20, 100].includes(total))
    throw new Error("Unsupported demonstration size");
  const { common: commonCount } = demoComposition(total);
  for (let i = 0; i < total; i++) {
    yield {
      id: `DEMO-${String(i + 1).padStart(3, "0")}`,
      password:
        i < commonCount
          ? PUBLIC_FIXTURES[i % PUBLIC_FIXTURES.length]
          : generateDemoPassword(),
    };
  }
}
