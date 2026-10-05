# HELLO WORLD

### Block the Breached Password · Microsoft Innovate hackathon prototype

**Reject known compromised passwords before simulated signup or reset, while keeping the password inside the browser.**

HELLO WORLD is our hackathon team and application name. The repository remains `block-the-breached-password` so its existing GitHub Pages path continues to work.

| Project status | Current implementation |
| --- | --- |
| Application version | **1.11.0** |
| Password-policy version | `hello-world-1.5` — rules unchanged in v1.6/v1.7 |
| Authentication | Simulated; no real accounts, login sessions or reset emails |
| Breach checking | Browser-only HIBP range lookup; only five hash-prefix characters sent |
| Dashboard data | Synthetic test accounts; never collected employee credentials |
| Offline demonstration | Explicit local mock corpus; never an automatic fallback |
| Persistence | No application credential database, browser storage or analytics |

[Repository](https://github.com/x-ayush-x/block-the-breached-password) · [GitHub Pages address](https://x-ayush-x.github.io/block-the-breached-password/) · [Changelog](CHANGELOG.md) · [Release notes](docs/releases/README.md)

The Pages address is the configured publication location. Its deployed version depends on the latest successful deployment; it is not proof that the current local release is already published.

## Contents

1. [Problem and scope](#problem-and-scope)
2. [What is new in v1.11](#what-is-new-in-v111)
3. [Run on macOS](#run-on-macos)
4. [Every page](#every-page)
5. [A first demonstration](#a-first-demonstration)
6. [Understand the dashboard](#understand-the-dashboard)
7. [Live, mock and offline modes](#live-mock-and-offline-modes)
8. [Architecture and request lifecycle](#architecture-and-request-lifecycle)
9. [Policy and decision rules](#policy-and-decision-rules)
10. [Reports, printing and comparison](#reports-printing-and-comparison)
11. [Privacy and security boundaries](#privacy-and-security-boundaries)
12. [Technology and source map](#technology-and-source-map)
13. [Commands and testing](#commands-and-testing)
14. [GitHub and deployment](#github-and-deployment)
15. [Troubleshooting](#troubleshooting)
16. [Release records and future work](#release-records-and-future-work)
17. [Learning materials and references](#learning-materials-and-references)

## Problem and scope

A password can be long and difficult to guess but still appear in a known breach. Reusing it creates risk even when a strength meter calls it strong. The challenge asks for signup/reset screens, local strength feedback, privacy-preserving breach checks and a report showing the percentage of **test accounts** with matched passwords.

This project implements that demonstration. It does **not** give a company administrator access to employee passwords. The dashboard generates public/synthetic inputs locally; it does not ingest credentials from signup, a directory, a database or a file upload.

A match means the proposed password value appears in the checked corpus. It does not prove that this particular person's account was breached. No match means no known match in that lookup, not complete safety.

The application's contribution is the integrated UI, policy gate, request lifecycle, failure handling, privacy evidence, reporting, educational Lab, accessibility work and regression tests. HIBP supplies the breach corpus and range API; zxcvbn supplies the strength estimator; browser Web Crypto supplies hashing. We do not claim to have invented those techniques.

## What is new in v1.11

Dashboard report comparison now shows what is inside each file and why a comparison is allowed or blocked.

- Side-by-side summaries show mock/live source, timestamp, dataset identity, policy, scenario, run status, coverage and match rate.
- A five-part compatibility checklist exposes every mismatch: source, dataset/size, policy, scenario and full successful coverage.
- Reading, empty, invalid and loaded states are explicit. Remove clears the selected file and invalidates any pending read; older reads cannot restore it.
- Help explains JSON versus PDF, repeated mock datasets, fresh live datasets, and percentage points. Files remain local and self-reported, not authenticated evidence.
- Dashboard JSON and printable reports now include the application version. Policy and dashboard schema stay unchanged.
- Import validation rejects empty policy/dataset identities and unexpected live-scenario metadata; absent legacy live scenarios normalize to null.

Existing signup/reset, Lab, mock/live separation and security controls remain intact. See [v1.11 release notes](docs/releases/1.11.md) and [the changelog](CHANGELOG.md).

## Run on macOS

### Prerequisites

Use Node.js **24 or newer**, as specified by `package.json`, and npm. Node runs development/build tools here; it does not make this application a Node backend.

```bash
node -v
npm -v
```

If either command is missing, install Node from its [official download page](https://nodejs.org/en/download), then reopen Terminal or VS Code. Installing Node/npm is different from installing this project's dependencies.

### Option A: clone the repository

```bash
git clone https://github.com/x-ayush-x/block-the-breached-password.git
cd block-the-breached-password
npm ci
npm run dev
```

A clone downloads Git history and the default branch. An unmerged release PR is not automatically included. Use its branch explicitly if you intend to preview that release.

### Option B: use the complete ZIP

Extract into a new folder and retain your existing project as a backup. In Terminal, type `cd `, drag the extracted folder containing `package.json` into Terminal, then press Return. Run:

```bash
npm ci
npm run dev
```

`npm ci` installs the versions in `package-lock.json` and replaces any existing `node_modules`. No HIBP API key is needed. Open the localhost URL printed by Vite and leave Terminal running. Control+C stops the server. Do not open `index.html` directly using a `file://` URL.

If using an update-only ZIP, follow [v1.11 update instructions](docs/UPGRADE-1.11-MACOS.md). An extracted ZIP is not a Git repository.

### Preview a production build

```bash
npm run build
npm run preview
```

The production files are written to `dist/`. Preview serves them locally. For the hosted repository subpath, use `npm run build:pages`; see deployment below.

## Every page

| Page / route | Purpose and important controls | Main source |
| --- | --- | --- |
| Overview `#home` | Introduces the problem, checker/dashboard links and an illustrative privacy flow | `src/pages/Home.jsx` |
| Sign up `#signup` | Email context, password reveal, local rules, strength, explicit check, cancel, stage breakdown, current prefix evidence and simulated submission | `src/pages/AccountPage.jsx` |
| Reset `#reset` | Same gate, optional email context and matching confirmation; invalid optional email must be corrected or cleared | `src/pages/AccountPage.jsx` |
| Security dashboard `#dashboard` | Live/mock source, dataset size, run/cancel, formula, coverage, chart, filters, pagination, diagnostics, reports and comparison | `src/pages/Dashboard.jsx` |
| Security Test Lab `#lab` | Choose one scenario with a plain-English explanation, inspect expected/actual decisions, run all nine, cancel and export evidence | `src/pages/SecurityLab.jsx` |
| How it works `#architecture` | Browser/API flow, prefix/suffix split and decision architecture | `src/pages/HowItWorks.jsx` |
| Privacy & proof `#privacy` | Independent DevTools instructions, data boundaries and up to 50 in-memory activity events | `src/pages/Privacy.jsx` |
| Password policy `#policy` | Implemented rules, NIST alignment statement and production limitations | `src/pages/Policy.jsx` |

Appearance offers System, Light and Dark. The selection stays in memory and resets on reload. On a phone, **Explore pages** opens all routes; Escape closes it and restores focus. The skip link moves keyboard focus into the main content. Route changes cancel active checks and discard page-local results.

Open **Demo guide** to follow five steps: rejection, a different password, signup privacy evidence, dashboard and Lab. The guide is optional and its selected step is not proof of successful execution. Choose **Practice · mock data** explicitly for offline simulations; changing source clears signup/reset/dashboard inputs and results. Readiness checks detect a secure context, Web Crypto and a browser network hint; they do not establish HIBP availability.

## A first demonstration

Only use public test inputs, never real credentials.

1. Open Sign up and select **Load breached demo**. The public fixture is `passwordpassword`.
2. Select **Check password securely**. In live mode, HIBP supplies the verdict. A match blocks simulated submission. The public example is also locally blocklisted, so use the Lab's strong-but-exposed scenario to isolate that lesson.
3. Expand the check's privacy evidence. For independent inspection, open Chrome DevTools with Command+Option+I, choose Network, filter `range` and inspect a fresh explicit check.
4. Select **Generate random demo**, then check it. A successful no-match plus the local rules and valid email enables the simulation. A generated value is not guaranteed absent from HIBP.
5. Try reset with matching and mismatched confirmation. Success clears form inputs and creates no real account or credential.
6. In the dashboard, choose a live 20-account demo or an explicitly local mock benchmark. Run, explain the formula and coverage, then export before navigating away.
7. Run the Lab's **Strong, but already exposed** case. Correct rejection is a PASS because actual behavior matches the expected behavior.

## Understand the dashboard

### What is a test account?

A generated identifier such as `DEMO-001` represents one synthetic input to the demonstration. It is not a registered user. There is no employee list or password-upload feature.

| Dataset | Input composition | Source of verdicts |
| --- | --- | --- |
| Live, 20 accounts | 5 entries cycling public common examples + 15 fresh random inputs | Real HIBP responses |
| Live, 100 accounts | 23 entries cycling public common examples + 77 fresh random inputs | Real HIBP responses |
| Mock, 1,000 accounts | 230 entries cycling mock-listed examples + 770 fixed synthetic inputs absent from that corpus | Local mock responses |

Live random inputs are 36 hexadecimal characters generated from 18 cryptographically random bytes. Inputs are produced one at a time and excluded from dashboard rows and reports. Public fixtures in source are intentionally non-secret; they are not collected user passwords.

### Why does the result often show 23%?

In a complete 100-account run, if the 23 common entries match and the other 77 do not, the calculated result is 23%. The 20-account mix would yield 25% under the equivalent outcome. Live verdicts still come from HIBP; the deliberate input mix explains repetition. The normal mock benchmark is explicitly designed to calculate 230/1,000 = 23%. None of these is an estimate of real employee exposure.

### Counts and denominators

| Term | Meaning |
| --- | --- |
| Total | Number of inputs selected for this run |
| Successfully checked | Match + no match |
| Match | Positive exact suffix match in the selected corpus |
| No match | Successful lookup without a positive match; not a safety guarantee |
| Unknown | A failed check: timeout, network, HTTP or invalid response |
| Pending | No completed row yet, including unfinished work after cancellation |
| Processed | Match + no match + unknown |
| Match rate | Matches ÷ successfully checked × 100, rounded to one decimal |
| Coverage | Successfully checked ÷ total × 100, rounded to one decimal |

**Worked example:** of 20 inputs, 3 match, 9 have no match, 2 are unknown and 6 are pending. Successful checks = 12; processed = 14; match rate = 3/12 = **25%**; coverage = 12/20 = **60%**. The report is incomplete. Calling the rate 3/20 would incorrectly include unresolved inputs in the denominator.

The ring represents all accounts, including unknown and pending. Its center shows successful coverage as a count. Rate and coverage are different measures; a high coverage is not proof of secure passwords. With zero successful checks the match rate is unavailable, not 0%.

### Controls and lifecycle

Choose source/size, then Run analysis. Changing configuration resets existing results and dataset identity. Run again starts a fresh analysis and replaces the old report. Cancel retains completed rows and marks the run incomplete. Leaving the page cancels and discards it; export first to keep a report.

Filters affect the visible table only, not the aggregates or export. Pages display up to ten matching rows. An empty filter explains how to show all results.

Expand **Why does the percentage often repeat?** for composition. Expand **Technical details: requests, reuse and timing** for measured request counts. Sequential processing bounds request load; a per-run prefix cache can serve several test inputs from one response. Therefore accounts checked and request attempts need not be equal. The cache clears after the run. Attempts do not prove server arrival and do not count browser-managed preflight requests.

A rate-limit response or three consecutive errors stops analysis. Unknown/pending work never becomes clear. The mock outage begins HTTP 503 responses at its eighth uncached request; local timing is not a measurement of HIBP speed.

## Live, mock and offline modes

| Context | External HIBP request? | What the result establishes |
| --- | --- | --- |
| Signup/reset, live | Only after explicit check | A lookup verdict for the current normalized password |
| Dashboard, live | During the requested analysis | Results for generated synthetic inputs |
| Dashboard, local mock benchmark | No | Behavior against a small fixed test corpus |
| Global offline demonstration | No HIBP calls from signup/reset/dashboard | Explicitly labelled simulations; changing mode clears those pages' state |
| Security Test Lab | No, regardless of global mode | Engine behavior under controlled fixtures and responses |

A live error never silently selects mock data. Offline demonstration is not an offline-installable PWA: keep the local server running. There is no service worker or guaranteed hosted offline reload. The Lab's request-contract evidence observes arguments supplied to a mock transport, not live packets.

## Architecture and request lifecycle

```text
Browser input (temporary React state)
  → NFC normalization + local policy + local zxcvbn feedback
  → explicit check
  → Web Crypto SHA-1 (40 hexadecimal characters)
  → prefix: 5 characters ── HTTPS GET /range/{prefix} ── HIBP
  → suffix: 35 characters retained locally             │
  ← padded candidate suffix/count response ────────────┘
  → strict parsing + exact local suffix comparison
  → current result + policy → simulated allow/block decision
```

The request uses GET, no body, `Add-Padding: true`, omitted credentials/referrer, no-store cache mode and rejected redirects. Count-zero padding never indicates a breach. SHA-1 is an API lookup format here, **not a password-storage algorithm**.

The security hook owns current input, result, AbortController, revision guard and expiry timer. Editing invalidates the result and aborts pending work. Late responses cannot overwrite a newer input. Explicit checks have a 750ms guard, a 12-second request timeout and five-minute result freshness. Submission independently verifies timestamps rather than trusting a possibly delayed timer or disabled button.

The prefix narrows the possible hashes; it is not zero knowledge, a fixed-size anonymity set or guaranteed anonymity. HIBP can still observe prefix, IP, timing and normal connection metadata.

## Policy and decision rules

- NFC-normalized length: **15–128 Unicode code points**; spaces and paste allowed.
- Raw input above 4,096 JavaScript code units is rejected before expensive processing.
- Small whole-value common and account-related blocklists; not a complete production dictionary.
- No mandatory symbol/uppercase mix. Strength is advisory and has no acceptance threshold.
- A positive breach match always blocks; unchecked, expired, failed or cancelled checks do not approve.
- Signup also needs valid email context. Reset needs matching normalized confirmation and a valid email if the optional field is supplied.

The Policy page documents the project's intended alignment with relevant NIST SP 800-63B-4 recommendations. Its historical source-check date is retained there. This release does not conduct a new standards review or claim certification/full compliance. The policy identifier stays unchanged because v1.7 changes presentation, not these rules.

## Reports, printing and comparison

JSON reports include source/mode, dataset identity, policy version, scenario, phase, timestamp, aggregate coverage, formula denominator, recommended actions, performance counters and test-ID result rows. They exclude passwords, emails, full hashes, prefixes and suffixes. Lab evidence has its own scenario-report shape.

**Print / Save as PDF** prints the dashboard's aggregate security report. Choose Save as PDF in the browser's print dialog. Navigation and paginated table content are excluded; the report covers all results, regardless of the current filter. Partial reports remain explicitly incomplete.

Comparison presents two source-labelled summaries and a five-part compatibility checklist. Remove clears one file and invalidates any pending read. Loading a replacement immediately removes the old comparison. All processing stays in the browser.

Comparison accepts supported v1.4-or-newer dashboard JSON exports, at most 1 MB per file. It validates count consistency and retains only allowlisted metadata; imported account rows are not rendered. Both reports must have the same source, dataset/size, policy and scenario, with complete successful coverage. Separate live runs get new dataset IDs, so they cannot be compared as if they were the same population. Output is a difference in **percentage points**, not proof of security improvement. Files are self-reported and unauthenticated. No upload occurs.

## Privacy and security boundaries

| Data | Location/use | External transmission or persistence |
| --- | --- | --- |
| Password and confirmation | Temporary browser state/values | Not logged, stored by app or exported |
| Email context | Local account-related feedback | Not sent to HIBP or reports |
| Full hash and suffix | Temporary local lookup values | Not sent or exported |
| Five-character prefix | HIBP range URL and current evidence UI | Sent to HIBP only in live mode |
| Breach verdict | Current state / synthetic result row | Non-sensitive synthetic rows may be exported |
| Activity event | Fixed action/outcome labels and time, last 50 in memory | No analytics or durable audit log |
| Theme selection | Memory for this page session | Resets on reload |
| Imported report | Browser memory; validated metadata | No upload; file remains user-controlled |

Input references clear on success/unmount, but JavaScript memory cannot be reliably wiped. Extensions, DevTools and password managers are separate considerations. Local code is not a defense against a compromised browser.

Production HTML includes a CSP meta tag restricting script/style sources and network destinations. Vite preview additionally configures response headers. `public/_headers` is a host-specific example, not proof those headers are deployed on GitHub Pages. HTTPS depends on the host. Development mode includes Vite tooling and differs from production.

This remains a client-side prototype. A user can alter its JavaScript or bypass UI checks. A real backend blindly trusting a browser's “passed” flag would not solve that. Production authentication needs a separately designed trusted enforcement boundary, secure credential handling, ownership verification, recovery, session security, rate limiting and operational controls. No real employee-password collection is proposed.

## Technology and source map

| Technology | Role |
| --- | --- |
| React / JavaScript | Components, state, events and asynchronous UI |
| HTML / CSS | Document structure, responsive layout and themes |
| Vite | Local server, lazy route bundling and production output |
| Node.js / npm | Development and testing tools; locked dependency installation |
| Web Crypto / fetch | Local hashing/randomness and controlled range requests |
| zxcvbn 4.4.2 | Local guessability estimate; wrapper discards sensitive intermediate details |
| Node test runner / Playwright | Core logic tests and browser interaction tests |

```text
.github/workflows/   validate.yml: PR checks; deploy.yml: main/Pages deployment
public/_headers      Optional headers for compatible static hosts
src/
  App.jsx            Hash navigation, global mock setting and session activity
  main.jsx           React entry and stylesheet imports
  components/        Inputs, strength/status, navigation, evidence, explanations
  pages/             Eight navigation destinations; shared signup/reset page
  hooks/             usePasswordSecurity.js: cancellation, freshness, stale guards
  services/          hibpService.js, analyzeDemo.js, benchmark.js, securityLab.js
  utils/             Hashing, policy, strength, freshness, reporting, explanations
  data/              Navigation, public demo fixtures and synthetic generators
  tests/             Core/unit/service tests using mock responses
e2e/                 Playwright browser regressions
styles (in src/)     styles.css: base; theme.css: palette; refinements.css: layout
README.md            Current user/developer guide
CHANGELOG.md         Historical record, newest release first
docs/releases/       Detailed release notes and release-record template
package.json         Scripts, package version and dependency requirements
package-lock.json    Exact installed dependency graph
vite.config.js       Repository base path and build/preview security settings
playwright.config.js Local production preview and browser-test settings
```

`DashboardExplanation.jsx` uses the pure `explainDashboard()` helper to describe actual `summarize()` counts. It never performs a lookup or approves a password. `reportSentence()` uses source-aware wording; `parseReport()` and `compareReports()` enforce report compatibility. `securityDecision()` remains the policy gate. `checkBreachedPassword()` performs the lookup lifecycle.

## Commands and testing

| Command | Effect |
| --- | --- |
| `npm ci` | Install exactly the lockfile dependency graph |
| `npm run dev` | Start Vite development server |
| `npm run lint` | ESLint source checks |
| `npm test` | Node unit/service tests |
| `npm run build` | Standard production build into `dist/` |
| `npm run preview` | Serve an existing production build locally |
| `npm run test:e2e` | Browser tests; requires built output and installed Chromium |
| `npm run test:all` | Build, unit tests, browser tests; does not include lint |
| `npm run check` | Lint, unit tests and build; does not include browser tests |
| `npm run build:pages` | Build for `/block-the-breached-password/` |

```bash
npm run check
npx playwright install chromium
npm run test:e2e
npm run build:pages
```

The browser test server uses port 4173 with strict port checking. Stop any other process using that port first. Run the standard build before browser tests, not the Pages-subpath build. The optional `BBP_CHROMIUM_PATH` variable can select an already installed browser; no machine-specific executable path is committed.

Tests use controlled mock HIBP responses, not repeated real-service calls. They cover privacy contracts, malformed responses, fail-closed behavior, stale/expired checks, cancellation, reports, Lab scenarios, mobile navigation and layouts. Traces/videos/screenshots are off by default; opt-in screenshots use public demonstration data. Test success is not proof of current HIBP availability or complete security.

The deferred zxcvbn dictionary still triggers Vite's large-chunk advisory. That advisory is not a failed build. Initial home loading does not request the strength bundle. Consult [release validation](docs/releases/1.11.md) for tests actually executed.

## GitHub and deployment

Git tracks local changes; GitHub hosts the repository; GitHub Pages serves built static files. Hash routes such as `#dashboard` avoid a server rewrite requirement. The Vite repository base keeps asset URLs correct beneath the existing Pages subpath.

The PR workflow runs Linux lint, unit tests, browser tests and a Pages build without deployment. The deployment workflow runs on a push to `main` or an explicit manual dispatch, validates the application, then uploads and publishes `dist/` to Pages. A branch push/PR alone does not publish it.

In a real clone, with a clean working tree:

```bash
git status
git switch main
git pull --ff-only
git switch -c upgrade-hello-world-v1.11
```

Apply the intended update, validate locally, and inspect before committing:

```bash
git diff --stat
git add README.md CHANGELOG.md docs src e2e package.json package-lock.json
git diff --cached --stat
git commit -m "Explain HELLO WORLD v1.11 report comparisons"
git push -u origin upgrade-hello-world-v1.11
```

If the update includes workflow changes, review/stage those explicitly too. Do not overwrite unrelated work, commit secrets, force-push or merge just to silence a test. Open a PR and wait for validation. Merging it triggers deployment.

For a failed deployment, open Actions → failed run → failing step. Find the first real error: a Node test, browser assertion, build error or hosting error. The Ubuntu-image migration notice and zxcvbn size advisory are not themselves failures. The v1.6 hotfix corrected a font-dependent 320px overflow without weakening tests.

A merged commit is not proof of publication. Confirm the deployment run succeeds for that commit, then reload Pages. The footer shows application/policy versions and a build ID on all screen sizes. Compare the build ID with the successful deployment commit; local builds show `local`.

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| `package.json` missing | Enter the project folder, not its parent |
| Vite missing | Run `npm ci` in the project folder |
| Old UI locally | Stop the old server, check the folder/version and use the new printed URL |
| Crypto unavailable | Use localhost/127.0.0.1 or HTTPS; do not disable browser security |
| Check unavailable | Wait and retry the explicit check; unavailable must remain blocked |
| Submit disabled | Read the decision, email/confirmation, length/blocklist and freshness requirements |
| 23% repeats | Expand dataset composition; synthetic input mix explains repeatability |
| 0% with partial coverage | Explain coverage; unresolved inputs are not proven safe |
| Reports cannot compare | Check source, dataset ID, policy, scenario and full coverage |
| Print button disabled | Finish or cancel a run first; report must have a completion timestamp |
| Mock versus live confusion | Read global mode plus dashboard/Lab source labels; Lab always mocks |
| Browser executable missing | Run `npx playwright install chromium` |
| `git` says not a repository | ZIP folders have no Git history; use a clone |

## Release records and future work

[CHANGELOG.md](CHANGELOG.md) records additions, behavior changes, fixes, validation and known limitations. [Release notes](docs/releases/README.md) explain how to maintain that record. Historical documents retain their original claims and test counts, with historical-context notices where old behavior differs from current behavior.

Every future release should update the package version, README status, changelog, detailed release note, validation evidence and changed-file manifest together. Policy/report versions change only when their semantics require it, not merely because the UI changes. The release process is documented; it is not an autonomous future-editing service.

**Future work, not implemented:** production authentication integration with trusted policy enforcement; verified recovery; passkeys/MFA; maintained production blocklists; carefully scoped authorized reporting; broader assistive-technology testing; strength work off the main UI thread. None should turn the demo dashboard into an employee-password collection tool.

## Learning materials and references

- [Start here](docs/START-HERE.md), [code walkthrough](docs/CODE-WALKTHROUGH.md)
- [Two-minute demo](docs/DEMO-2-MINUTES.md), [five-minute script](docs/PRESENTATION-5-MINUTES.md), [judge questions](docs/JUDGE-QA.md)
- [Security review](docs/SECURITY-REVIEW.md)
- [NIST SP 800-63B-4 password guidance](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/#passwords)
- [HIBP Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords)
- [zxcvbn source](https://github.com/dropbox/zxcvbn), [Vite documentation](https://vite.dev/guide/)

Team: **HELLO WORLD**. Member names, roles, institution and mentor details have not been supplied and are not invented here. This is a student-built demonstration, not an official Microsoft or HIBP product.
