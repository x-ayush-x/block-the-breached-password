export const POLICY = Object.freeze({
  version: "hello-world-1.4",
  minLength: 15,
  maxLength: 128,
  rawInputLimit: 4096,
});
export const normalizePassword = (value) => value.normalize("NFC");
export const characterCount = (value) => Array.from(value).length;

// Public blocklist examples, never collected user credentials. Whole-value comparisons only.
const COMMON = new Set([
  "hello world",
  "helloworld",
  "helloworld123",
  "password",
  "password123",
  "passwordpassword",
  "passwordpasswordpassword",
  "123456",
  "123456789",
  "qwerty",
  "letmein",
  "iloveyou",
  "blockthebreachedpassword",
  "blockthebreachedpassword123",
]);

export function validatePassword(password, email = "") {
  if (typeof password !== "string" || password.length > POLICY.rawInputLimit) {
    return {
      valid: false,
      length: null,
      lengthOK: false,
      blocked: false,
      reason: "Input is too long. Use 15–128 characters.",
    };
  }
  const canonical = normalizePassword(password);
  const length = characterCount(canonical);
  const lower = canonical.toLowerCase();
  const user = email.trim().toLowerCase().split("@")[0];
  const context = user
    ? [
        user,
        email.trim().toLowerCase(),
        `${user}123`,
        `${user}123!`,
        `${user}2026`,
      ]
    : [];
  const blocked = COMMON.has(lower) || context.includes(lower);
  const lengthOK = length >= POLICY.minLength && length <= POLICY.maxLength;
  let reason = "";
  if (!length) reason = "Enter a password to begin.";
  else if (!lengthOK)
    reason = `Use ${POLICY.minLength}–${POLICY.maxLength} characters. Spaces are welcome.`;
  else if (blocked)
    reason =
      "This whole password is a common or account-related value. Choose a different one.";
  return { valid: lengthOK && !blocked, length, lengthOK, blocked, reason };
}

export function securityDecision(policy, breach) {
  if (breach.status === "breached")
    return { allowed: false, reason: "Compromised passwords cannot be used." };
  if (!policy.valid) return { allowed: false, reason: policy.reason };
  if (breach.status !== "clear")
    return {
      allowed: false,
      reason: "A successful breach check is required before continuing.",
    };
  return {
    allowed: true,
    reason: "Password policy passed. Ready for the simulated submission.",
  };
}
