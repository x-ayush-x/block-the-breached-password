# HELLO WORLD v1.6 validation and changes

Inspected and upgraded the local v1.5 source on 2 October 2026. Application version: 1.6.0. Password policy version: `hello-world-1.5` (unchanged rules).

## Changes

- Raised tiny supporting type in the shared styles and set body copy to a readable 14–16px rhythm. More consistent line height, panel padding, gaps, rounded corners and readable light/dark surfaces.
- Revised responsive grids and larger form controls; every route fits 320, 390, 768, 1024 and 1440 CSS-pixel viewports in light and dark modes.
- Mobile Explore pages button exposes all eight routes in a grid. It reports expanded state, supports Escape with focus restoration and closes after changing pages. Desktop navigation can scroll on short windows.
- Dashboard configuration and Run/Cancel controls appear before metrics and explanatory panels. Filtering to zero matches explains the empty result and offers Show all results. Mock filters and chart accessibility labels identify their source. Cancelled/interrupted run badges no longer say Ready to inspect.
- Changing mode, dataset size or mock scenario clears the previous dataset ID. Size changes also reset the table filter.
- Reset with invalid optional email stays disabled and explains how to fix the input. The submit handler uses the same validation. Empty optional email remains allowed.
- Empty password decisions say Awaiting input; processing stages explain how to begin. Breach states use plain-language labels rather than internal state names.
- Dashboard and session-activity scrollable tables have accessible region labels and keyboard focus. Separated touching privacy panels.

## Verification

- `npm run check`: lint, **79 unit/service tests**, and normal production build passed.
- `npm run build:pages` passed; repository asset prefix and production CSP were checked. The normal-root build was restored afterward.
- Final browser suite: **35 tests passed**. Five new tests cover mobile navigation/focus, reset optional email, empty filters/stale dataset identity, mock-source labels and all-route responsive layouts.
- The first browser run had one outdated mobile test that attempted to click the now-collapsed menu; it was updated to open the menu before navigating. The complete rerun passed.
- Screenshot capture covers all eight routes in both themes at 390 and 1440px. Visual review sampled every page, with additional mobile review. The responsive test covers 80 route/theme/width combinations and checks for page-level horizontal overflow and JavaScript errors.
- Existing tests still cover explicit checks, prefix-only requests, failures, stale responses, cancellation, expiry, clearing inputs, mocked dashboard calculations, print styles, report comparison, Lab execution and empty browser storage.

All automated HIBP interactions use controlled mock responses. This is not a live availability test, a comprehensive screen-reader audit, or a claim that no bugs can remain. Print media is emulated; the native macOS PDF dialog is not automated. Browser execution used the available local Chromium executable through `BBP_CHROMIUM_PATH`.

## Preserved boundaries

The HIBP service, security hook, hashing, policy, benchmark, report parser, Vite configuration and GitHub Pages workflow are unchanged from v1.5. Passwords stay in browser memory; external lookups use five SHA-1 prefix characters. No dependencies, analytics, password storage, real authentication or silent mock fallback were added. Appearance still resets to System on reload. Policy version remains stable so a cosmetic release does not manufacture policy incompatibility in reports.

The pre-existing deferred zxcvbn strength bundle still triggers Vite's 500 kB chunk advisory; the home page does not load it initially. No push, merge or deployment was performed for this release.
