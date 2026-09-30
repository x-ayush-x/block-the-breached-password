# Understand the code from zero

A frontend is the part of an app running in the browser. React creates the interface. Vite starts a local development server, which serves the code. It does not receive your password. An API is a service you can request data from; HIBP is our external API.

## Read the files in this order

1. **src/main.jsx**: starts React inside index.html's root element.
2. **src/App.jsx**: chooses the visible page from a fixed hash fragment such as #signup. No credentials go in page addresses. Its audit array holds only short event labels in memory.
3. **src/pages/AccountPage.jsx**: a single form reused for signup and reset. The reset prop changes which fields are shown. The form prevents normal browser submission; successful creation is a message, not a database operation.
4. **src/components/PasswordSecurityChecker.jsx**: displays the password input, estimate, rules, check button and result. Components are reusable pieces of interface.
5. **src/utils/hashing.js**: turns UTF-8 bytes into the SHA-1 lookup hash. A hash is a fixed-size fingerprint, not encrypted text that you decrypt later. splitHash separates five characters from the remaining 35.
6. **src/services/hibpService.js**: contains the sole external data request. Read the fetch call first: it sends only a five-character prefix in the path and no body. The browser receives suffix candidates and matches locally.
7. **src/hooks/usePasswordSecurity.js**: coordinates the asynchronous check. A hook is reusable React behavior. A request can finish later, so the hook tracks a revision number and ignores results for an old revision. It also aborts requests when the input changes.
8. **src/utils/passwordStrength.js**: asks zxcvbn to estimate patterns. It deliberately keeps only safe result fields; the library's full result can contain the original password.
9. **src/utils/passwordPolicy.js**: defines acceptance rules. The strength estimate is advice. Eligibility requires the local rules and a current clear breach result.
10. **src/services/analyzeDemo.js**: checks test accounts sequentially. It removes each password reference and emits only an ID, timestamp and decision. Its temporary range cache reduces repeat requests.
11. **src/utils/reporting.js**: calculates counts and percentages. Dividing by successfully checked rows avoids accidentally counting failures as safe.
12. **src/pages/Privacy.jsx** and **Policy.jsx**: explain proof steps and scope to judges.

## The decision logic in plain English

- If known breached: reject.
- If length or local blocklist fails: reject.
- If no successful, current check exists: reject.
- Otherwise the password is eligible for the simulated action.
- Signup also needs a valid-looking email; reset also needs matching confirmation.

A red breach result and a green strength label can appear together. They answer different questions.

## Why explicit checking?

Strength can update while typing because it stays local. A breach check is a network request. Clicking once after finishing limits requests and avoids leaking a series of partial-password hash prefixes.

## Why do we use promises and await?

Hashing and network requests finish later. `await` waits for a result without freezing the whole browser. AbortController cancels a request; the revision counter protects the interface even if a stale operation still resolves.

## State versus storage

React state is temporary memory used to draw the screen. localStorage/sessionStorage persist data independently of a component's state. We never write passwords to those stores. Closing a screen releases app references, but JavaScript cannot prove that all memory copies have been wiped.

## Map to the build phases

1. Setup: package.json, main.jsx, index.html, Vite config.
2. HIBP: hashing.js, hibpService.js, security hook.
3. Strength: passwordStrength.js, StrengthMeter.
4. Forms: AccountPage, PasswordInput, PasswordSecurityChecker.
5. Dashboard: demoAccounts, analyzeDemo, reporting, Dashboard.
6. Architecture: SecurityFlow, HowItWorks, Privacy.
7. Policy: passwordPolicy, Policy.
8. Design: styles.css, Icon, Navbar and page layouts.
9. Tests: src/tests and e2e.
10. Handover: README and this docs folder.

Learn these parts in that order. You do not need to memorize every CSS rule to explain the security design.
