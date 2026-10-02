# HELLO WORLD v1.5 validation

Validated locally on 2 October 2026. Package: 1.5.0. Policy: hello-world-1.5.

## Executed checks

- `npm run check`: passed lint, all **79 unit/service tests**, and the normal production build.
- `npm run test:e2e`: all **30 browser tests passed** in local Chromium, using the project Playwright configuration and an existing Chromium executable supplied through `BBP_CHROMIUM_PATH`.
- `npm run build:pages`: passed. Verified `/block-the-breached-password/assets/` references and the production CSP in built HTML. Restored the normal-root build afterward.
- Final lint passed after documentation and optional visual-review test updates.
- Optional visual-review run captured every route at 1440px in light/dark mode, plus four phone pages at 390px. These are local screenshots with synthetic inputs and intercepted mock HIBP responses, not live HIBP evidence.
- Final targeted UI checks repeated system-theme switching, dark phone layouts/white printing, and the visual review after small contrast/spacing fixes.

## Newly covered behaviors

Five unit/service tests cover the exact freshness deadline, invalid/future/missing timestamps, non-clear outcomes, dataset composition matching generation, and single-scenario report scope/privacy.

Five normal browser tests cover system/light/dark appearance, pending-check continuity and empty storage, dataset composition changes, stale-result rejection despite a delayed timer, single-scenario execution/export, all-case reruns, mobile routes and dark-mode print contrast. The screenshot-only test is opt-in and is not counted among the normal 30 tests.

## Preserved security boundaries

- `hibpService.js` remains unchanged: only five uppercase SHA-1 prefix characters form the external range URL; GET, no body, omitted credentials, no referrer, no-store and requested padding remain intact.
- Browser-only hashing, exact local matching, strict response parsing, cancellation, revision guards, explicit checks and fail-closed outcomes are preserved.
- Theme preference remains in memory. No localStorage/sessionStorage or analytics were added.
- No real account creation, employee directory, credential upload, password database or authentication backend was added.
- Mock mode remains explicit and labelled. Live errors do not trigger mock fallback.
- Existing v1.4 report imports remain supported by the same schema; policy mismatches remain incompatible. No report authentication is claimed.

## Limits

These automated tests use controlled service responses; they establish behavior under those conditions, not current HIBP availability. No live HIBP requests were needed for this release validation. No GitHub push, merge, remote workflow execution or deployment was performed. The revised CI workflow was inspected locally but has not yet run on GitHub.

Print styles and report visibility were checked in browser print emulation; the native macOS Save as PDF dialog was not automated. Keyboard/phone checks and visual review are not a full assistive-technology audit or certification. Authentication remains simulated and client-side checks remain bypassable.

Vite reports a size advisory for the zxcvbn strength chunk (about 820 kB minified). The landing page still defers it. No new dependencies were added. Theme selection resets to System on reload by design.
