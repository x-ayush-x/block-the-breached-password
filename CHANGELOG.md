# Changelog

Changes are recorded newest first. Application versions and password-policy versions are separate. Historical entries below were reconstructed from the existing source, upgrade guides and validation notes; unknown dates and test results are not invented. A local release does not mean GitHub Pages has deployed it.

## 1.7.0 — 2026-10-04

### Added
- Count-based dashboard explanation with actual match-rate calculation, successful coverage, stage-sensitive next steps and definitions of all result states.
- Detailed current README with a table of contents, page guide, numerical examples, architecture, data boundaries, commands and deployment troubleshooting.
- This consolidated changelog, detailed release notes, a release-note template and a checklist for maintaining future release records.
- Regression coverage for zero successful checks, partial/cancelled results, mock wording and expandable explanations.

### Changed
- Dashboard follows three steps: choose a demonstration, understand results, keep the report.
- Chart center shows successful checks out of all inputs. Match-rate cards retain the successful-check denominator. Explanations distinguish the two.
- Dataset composition and request diagnostics are expandable. Existing data and controls remain available.
- JSON, printable and on-screen mock report sentences explicitly describe local mock matches.
- Updated package/sidebar/Lab application version to 1.7.0/v1.7. Policy stays `hello-world-1.5`; report schema stays `hello-world-report-1`.

### Preserved / limitations
- Browser-only HIBP transport, prefix-only requests, explicit checks, cancellation, stale/expired-result protection and fail-closed decisions are unchanged.
- Authentication remains simulated. No employee passwords, accounts or real-world exposure estimates were added.
- Includes the v1.6 layout hotfix and Linux PR checks. Pages deployment configuration remains unchanged.
- Deferred strength bundle size advisory remains. Expanded panels are session-local; they reset when the dashboard remounts.
- Local validation: 84 unit/service and 38 browser tests, lint, standard build and Pages build passed; HIBP responses mocked. These were packaging-time results. [PR #5](https://github.com/x-ayush-x/block-the-breached-password/pull/5) carries current Linux validation; no merge or deployment was performed by this update.
- [Detailed scope, migration and validation](docs/releases/1.7.md).

## 1.6.0 — 2026-10-02

### Added / changed
- More readable supporting type, consistent spacing, form sizes and responsive grids across all eight routes.
- Mobile Explore pages navigation with expanded-state semantics, Escape handling and focus restoration; scrollable desktop sidebar.
- Dashboard run controls moved before results and explanatory panels.
- Keyboard-focusable, named dashboard and activity tables.

### Fixed
- Invalid optional reset email leaving the simulation button enabled.
- Unexplained empty result filters; added Show all results.
- Stale dataset ID and filters after configuration changes.
- Misleading cancelled/interrupted badges and mock filter/chart labels.
- Raw internal state wording and missing empty-stage guidance; touching privacy panels.

### Validation / limits
- Original local verification: 79 unit/service tests and 35 browser tests, lint and both builds passed.
- Linux later exposed a 320px layout issue; see the hotfix below. Original macOS success was not proof of Linux layout behavior.
- [Original validation](docs/VALIDATION-1.6.md), [upgrade guide](docs/UPGRADE-1.6-MACOS.md).

### Post-release hotfix (package remained 1.6.0)
- Wrapped decorative password-mask glyphs to avoid font-dependent overflow on narrow screens.
- Added wider-glyph regression and element-level overflow diagnostics without loosening layout assertions or CSP.
- Added Linux pull-request validation before merge; existing deployment workflow retained.
- GitHub Linux validation passed in [run 37024512707](https://github.com/x-ayush-x/block-the-breached-password/actions/runs/37024512707). The browser suite gained one test (36 total).
- [Fix PR #4](https://github.com/x-ayush-x/block-the-breached-password/pull/4). This entry records verified checks, not a claim about its later merge/deployment status.

## 1.5.0 — 2026-10-02

### Added / changed
- Light, dark and system appearance controls held in memory; semantic palette and white print output.
- Explicit 20/100/1,000-input dataset composition and explanation of repeated percentages; no employee-credential access.
- Single-case Lab execution, scoped exports, clearer expected-versus-observed PASS explanation.
- Independent DevTools verification instructions for current lookup evidence.
- Browser tests included in the Pages workflow before publication.

### Fixed / validated
- Submit-time timestamp freshness validation protects against delayed expiry timers; invalid/future/missing timestamps cannot authorize submission.
- Policy identifier became `hello-world-1.5`.
- 79 unit/service and 30 browser tests passed locally; lint and both builds passed. Mocked service responses were used.
- [Validation](docs/VALIDATION-1.5.md), [upgrade guide](docs/UPGRADE-1.5-MACOS.md).

## 1.4.0 — 2026-10-01

### Added / changed
- HELLO WORLD project branding while retaining the repository/Pages path.
- Live decision breakdown and real processing stages without full hashes or password disclosure.
- Lazy page loading, skip navigation and reduced-motion support.
- Printable aggregate security reports with source, timestamp, coverage, policy and recommendations.
- Compatible JSON comparison with source/dataset/policy/scenario/coverage checks.
- Guided hackathon walkthrough, readiness hints and explicit offline mock mode.

### Validation / limitations
- 74 unit/service and 25 full-suite browser tests passed; lint and both builds passed.
- Native print dialog not automated; offline hosted reload not guaranteed; no production authentication added.
- [Validation](docs/VALIDATION-1.4.md), [upgrade guide](docs/UPGRADE-1.4-MACOS.md).

## 1.3 — historical date not recorded here

- Added Security Test Lab with nine deterministic synthetic scenarios: strong-but-exposed, valid no-match, common, short, 503, 429, malformed response, timeout and zero-count padding.
- Shared real hashing/parser/strength/policy engine with mock transport; expected/observed decisions, cancellation and non-sensitive evidence export.
- Historical validation records 70 core and 21 browser tests, lint and both builds passing.
- [Original notes](docs/UPGRADE-1.3.md). At this version signup/reset were live-only; v1.4 later added explicit global offline mode.

## 1.2 — historical date not recorded here

- Added local 1,000-account mock benchmark, 230/770 synthetic mix, normal/outage scenarios and explicit provenance in reports.
- Measured local timer/caching behavior; no live HIBP speed or real exposure claims.
- Historical validation records 56 core tests and 19 browser tests (17 existing + 2 benchmark tests), lint and build passing.
- [Original notes](docs/BENCHMARK-1.2.md). Its statements about live-only signup/reset describe that historical version.

## 1.1 — historical date not recorded here

- Added current-prefix evidence and request lifecycle display; evidence clears on edit.
- Added measured dashboard requests, reuse, failures, cancellation and elapsed-time counters plus JSON export.
- Historical validation records 53 core and 17 browser tests, lint and build passing.
- [Original notes](docs/UPGRADE-1.1.md).

## Initial project — baseline, exact release metadata unavailable

- Browser-only signup/reset simulation, local strength/policy feedback and explicit HIBP range checks.
- Generated-account dashboard, basic reports, architecture, privacy and policy pages.
- Cancellation, stale-response rejection, response validation and failure blocking.
- Exact initial release date, version tag and original test count were not established from the retained records.
