# Judge questions and technically honest answers

## Why SHA-1 if SHA-1 is insecure?

We use it only to speak the HIBP range-lookup format. Its collision weaknesses make it inappropriate for many security uses, and its speed makes it unsuitable for password storage. Neither digital signatures nor credential storage depend on it here. Lookup hashing and password-storage hashing serve different purposes.

## What is the difference from Argon2id or bcrypt?

SHA-1 quickly computes a lookup fingerprint compatible with an existing dataset. A storage scheme should deliberately make offline guesses expensive and use a unique salt and tuned work parameters. Argon2id is an example; bcrypt is another legacy-compatible option with its own limits. We store no credentials, so neither is implemented as a pretend authentication system.

## Can HIBP know the exact password?

We do not send the exact password, suffix or complete hash. The prefix selects a candidate group. It still leaks partial information and can be correlated with metadata or guesses; this is not a claim that inference is impossible. Explicit checks avoid leaking a sequence of prefixes while the user types.

## Why only five characters?

That is the HIBP Pwned Passwords range API contract used here. Five hexadecimal characters encode a 20-bit prefix. More characters would narrow the candidate group and reveal more information; fewer would return larger groups. We follow the service's defined format.

## What does the “k” equal?

We do not claim a fixed k. Candidate-set size depends on the prefix and corpus, and padding adds dummy entries. The privacy mechanism is grouping through a shared prefix, followed by local matching.

## How can you prove a password is not sent?

Inspect the browser-side hash and fetch implementation, inspect actual network requests during a demo, and run tests that capture request URLs, headers and bodies. These provide evidence about the observed code and run. They cannot prove safety under malicious extensions, modified JavaScript or a compromised device.

## Where do you store user passwords?

Nowhere persistently in our application. Fields and intermediate values exist temporarily in browser memory. Inputs are cleared after a successful simulation and released on navigation. JavaScript cannot securely wipe every memory copy. A user's own password manager may independently save an input.

## Are the demo passwords stored in source?

A few intentionally public, test-only common-password fixtures are. They are not collected user credentials. Random demonstration values are generated locally for each run. Reports contain neither type of password. The tradeoff is explicitly labelled in the code, README and dashboard.

## Is a strong password always accepted?

No. Strength is only a guessability estimate. A high-entropy password can have appeared in a breach, been reused or otherwise leaked. A positive breach result always blocks this simulation, regardless of the strength label.

## Does no HIBP match guarantee safety?

No. The password may be guessable, privately exposed, missing from HIBP's corpus or exposed in the future. We say “No known breach found” and still apply policy.

## What if HIBP is down?

The prototype fails closed: it shows an unavailable result and blocks the simulated action. A dashboard failure is unknown, not clear. A real company must define an availability policy and perhaps maintain a freshness-controlled offline breach corpus. That tradeoff needs explicit review; we do not silently bypass screening.

## How do you avoid hammering HIBP?

Checks are explicit, single-flight and protected against rapid duplicate starts. Batch processing is sequential and reuses prefixes within that run. It stops after repeated errors or a 429 response. The password API currently documents no standard rate limit, but we still handle infrastructure limits and errors defensively.

## What happens if someone changes the input mid-request?

The result immediately becomes unchecked, the active request is aborted, and the revision changes. Only a response for the current revision can update the UI. The submit handler reads current state references as well.

## Why not impose uppercase, numbers and symbols?

Predictable substitutions do not necessarily improve guessing resistance. We use length and whole-password blocklists, with local pattern-based feedback. A strong-score threshold is not used as a hidden composition rule.

## Are you NIST compliant?

We model relevant final SP 800-63B-4 password recommendations, not the complete identity standard. Production requirements such as trusted authentication, storage and recovery are outside this prototype. We explicitly say “designed to align,” not certified.

## What makes this enterprise-grade?

It demonstrates enterprise-oriented engineering: a shared policy component, fail-closed handling, race prevention, strict parsing, private reporting and reviewable network behavior. It is not an enterprise-ready identity platform. The difference is intentional and documented.

## Can someone bypass the gate in DevTools?

Yes. They control their browser. The simulation is not a trusted security boundary. Production must enforce the chosen policy at a trusted point and must not accept an unverified client flag such as `breached: false` as proof. Designing that integration without overstating privacy is a separate project.

## Is the admin screen protected?

No. It is a demonstration dashboard with synthetic accounts, not a real admin portal. Production would require authentication, authorization and access controls before exposing organization data.

## Is the audit trail permanent or tamper-proof?

No. It records up to 50 minimal in-memory events for the demonstration. Refresh clears it and client code can change it. A real audit design would require authenticated event ingestion, minimal data collection, retention controls and integrity protection.

## Why does the dashboard show a different rate from 23%?

The UI calculates actual outcomes. The corpus can change, some requests can fail, and the quick dataset has a different mixture. The denominator is successfully checked accounts; pending and unknown rows are displayed separately. The exact 23% result exists in a mocked automated test, not as a forced live outcome.

## Can this scan the company's existing password database?

Not directly. Production storage should use salted slow hashes, which cannot simply be converted into the required HIBP SHA-1 lookup. Screening is best applied when a password is chosen or changed within an appropriately designed authentication flow. Our dashboard is synthetic.

## What would you build next?

A trusted identity integration, authenticated reset flow, passkey/MFA support, role-based reporting, carefully minimized durable audit events, deployment hardening, independent review and a reviewed availability strategy. We would also optimize the strength engine's bundle and compute costs.
