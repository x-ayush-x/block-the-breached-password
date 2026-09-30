// SHA-1 is exclusively for the HIBP lookup, never credential storage.
export async function sha1(password) {
  if (!globalThis.crypto?.subtle) throw new Error("WEB_CRYPTO_UNAVAILABLE");
  const bytes = new TextEncoder().encode(password);
  try {
    const digest = await crypto.subtle.digest("SHA-1", bytes);
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    )
      .join("")
      .toUpperCase();
  } finally {
    bytes.fill(0); // Best effort; JavaScript strings themselves cannot be securely erased.
  }
}

export function splitHash(hash) {
  if (!/^[A-F0-9]{40}$/.test(hash)) throw new Error("INVALID_HASH");
  return { prefix: hash.slice(0, 5), suffix: hash.slice(5) };
}
