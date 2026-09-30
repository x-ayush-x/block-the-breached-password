# Two-minute demonstration script

Rehearse at about 130 words/minute and let interface actions carry part of the explanation. Have the app open, DevTools ready, and a separate tab with a completed live dashboard run. Do not reload that dashboard tab. Never use real credentials.

**0:00–0:20 — Overview**

“Block the Breached Password prevents a known compromised password from being accepted during signup or reset. The challenge is to check a password without handing it to the breach service. Our prototype does the sensitive work in your browser.”

**0:20–0:45 — Rejection**

Open Sign up. Load the breached demo and check it.

“This is a public test password. The strength estimate and breach check are independent. HIBP found a match, so our simulated account action is blocked—even if another password happened to receive a Strong estimate.”

**0:45–1:10 — Privacy evidence**

Show the GET request in DevTools.

“The browser generated a SHA-1 hash locally. The request contains only its first five characters. There is no password or full hash in the request body or URL. HIBP returns candidates; exact comparison stays local. The prefix and connection metadata are still visible to HIBP.”

**1:10–1:30 — Acceptance**

Generate a random test password, check it, and simulate creation if eligible.

“No known breach found is not a guarantee of safety. Length and local policy must also pass. No account or password is stored in this prototype. Reset uses the same checker and also requires confirmation.”

**1:30–2:00 — Dashboard and limits**

Switch to the completed dashboard tab and read the ACTUAL measured percentage.

“Our dashboard measures a synthetic test dataset without reporting passwords. Unknown checks are separated rather than treated as safe. The policy is designed around relevant current NIST guidance. This is a tested client-side prototype; production authentication and trusted server enforcement are future work.”

If the internet fails, show the unavailable state and explain that submission stays blocked. Do not imply an offline replay is a live check.
