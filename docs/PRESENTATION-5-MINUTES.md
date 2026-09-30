# Five-minute presentation script

Suggested six-slide structure. These are speaking notes, not an automatically generated slide deck. Replace bracketed team details. Rehearse to match your speaking speed, allowing about 30 seconds for live interaction.

## 0:00–0:40 — The problem

“Hello, we are [team name]. Our project is Block the Breached Password.

A password can meet a company's character rules and still already be exposed. If someone reuses it, the company starts with a known risk. Our problem statement asks us to reject passwords found in breaches, while never sending the actual password to the breach-checking service.

That creates two questions: is the password predictable, and has it already appeared in breach data? Our interface treats them as separate questions.”

## 0:40–1:25 — The solution and user experience

“We built a React web application with signup and reset simulations. Users get local strength feedback and then explicitly check their completed password against Have I Been Pwned's Pwned Passwords service.

The form rejects a known breach match. A failed or unavailable lookup also prevents acceptance. A clear lookup alone is not enough: the remaining password policy and form validation must pass.

Here I load a public test fixture. It is marked compromised. Now I generate a fresh random test value and run the same check. If it passes, the app simulates account creation and clears the inputs. We are not creating a real account or storing a credential.”

## 1:25–2:20 — Privacy-preserving architecture

“The browser uses Web Crypto to generate a SHA-1 lookup hash. A SHA-1 hash has 40 hexadecimal characters. We split it into a five-character prefix and a 35-character suffix.

Only the prefix is sent in a direct HTTPS range request. HIBP returns many possible suffixes, and our browser searches for an exact match. The secret password and full hash are never included in that request.

We can show this in Chrome's Network tab. The request has no body, and the path contains five hash characters. The app also omits cookies and referrer information and requests response padding.

This is k-anonymity-style range lookup, not complete anonymity. The number of candidates varies, and the service still sees the prefix, IP address and timing. SHA-1 is the lookup format, not our storage algorithm. We have no password database.”

## 2:20–3:05 — Robustness

“A demonstration can look correct while hiding race conditions. Suppose someone checks one password and then edits it before the response returns. We immediately invalidate the earlier result, cancel the request and use a revision counter to stop late responses changing the decision for the new input.

We validate the API response, ignore zero-count padding, time out slow requests and disable duplicate checking while a request is active. A no-match is never substituted for an error. The submission handler rechecks the current decision, rather than relying only on a disabled button.”

## 3:05–3:45 — Reporting

“The dashboard analyzes a temporary synthetic dataset using the same lookup service. Public common-password fixtures represent reuse; fresh random test values provide contrast. No real user passwords are requested.

The dashboard counts successful checks, known breaches, no matches, errors and pending accounts. Its rate uses the successfully checked accounts as its denominator. Incomplete reports explicitly say so. It does not pretend a failed check is safe.

The exported report contains test IDs, timestamps, decisions and aggregates. The percentage you see is calculated from the run, not hard-coded.”

## 3:45–4:20 — Policy and validation

“Our password policy emphasizes length, blocklists and usability. The app accepts passphrases and paste, and does not require a special-character checklist. Guessability feedback is advisory; it cannot override a breach.

We verified the relevant current official NIST guidance and explain exactly which parts we model. We do not claim certification. Core tests use mocked API responses, and browser tests exercise the acceptance gates and privacy expectations without repeatedly contacting HIBP.”

## 4:20–5:00 — Scope and next steps

“Our enterprise-oriented contribution is a reusable privacy-conscious policy gate, explicit errors, measurable reporting and inspectable evidence.

The current app is a client-side prototype. Anyone controlling their browser can modify client logic, so production needs trusted enforcement, real authentication, authenticated recovery, secure sessions and appropriate credential storage. A browser's claim that a password is safe cannot simply be trusted by a server.

Next we would integrate with a real identity service, add stronger authentication options such as passkeys, and design minimal durable audit records. The objective is simple: stop a compromised password before it becomes a new account's first weakness. Thank you.”
