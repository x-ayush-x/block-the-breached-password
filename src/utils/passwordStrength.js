import zxcvbn from "zxcvbn";
import { normalizePassword, characterCount, POLICY } from "./passwordPolicy.js";

export function evaluateStrength(password, email = "") {
  if (!password)
    return {
      label: "Not scored",
      level: 0,
      feedback: "Try a long, unique passphrase or a password manager.",
    };
  if (
    password.length > POLICY.rawInputLimit ||
    characterCount(normalizePassword(password)) > POLICY.maxLength
  ) {
    return {
      label: "Not scored",
      level: 0,
      feedback: "Reduce the input to 128 characters or fewer.",
    };
  }
  // zxcvbn returns password-bearing details. Retain ONLY the score and generic guidance.
  const result = zxcvbn(
    normalizePassword(password),
    [email, email.split("@")[0], "blockthebreachedpassword"].filter(Boolean),
  );
  const level = Math.max(1, result.score);
  const labels = ["Very weak", "Very weak", "Weak", "Medium", "Strong"];
  const advice = [
    "This looks very easy to guess. Choose a substantially different password.",
    "Common words, repeats and predictable substitutions can be easy to guess.",
    "Add more unrelated words, or use a password manager to generate a password.",
    "A longer, unique passphrase can make guessing harder.",
    "Harder to guess according to this estimate. A breach check is still required.",
  ];
  return { label: labels[result.score], level, feedback: advice[result.score] };
}
