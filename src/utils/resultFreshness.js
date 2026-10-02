export const RESULT_TTL_MS = 5 * 60 * 1000;

export function freshResult(result, now = Date.now()) {
  if (!["clear", "breached"].includes(result.status)) return result;
  const checkedAt = Date.parse(result.checkedAt);
  const age = now - checkedAt;
  if (!Number.isFinite(age) || age < 0 || age >= RESULT_TTL_MS)
    return { status: "expired", count: 0 };
  return result;
}
