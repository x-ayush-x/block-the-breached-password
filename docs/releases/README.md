# Release records

Use [README.md](../../README.md) for current behavior and [CHANGELOG.md](../../CHANGELOG.md) for history. Historical upgrade/validation documents remain linked from the changelog; their commands and feature claims may describe older versions.

## Current detailed notes

- [1.8](1.8.md): compact source controls and actionable demo guide.
- [1.7](1.7.md): dashboard explanations and documentation overhaul.
- [Template](TEMPLATE.md): copy for each future release.

## Record every update

1. Inspect the current code and the previous release before writing change claims.
2. Choose the application version and describe the user-visible problem/outcome.
3. Record Added, Changed, Fixed and Removed items; explicitly say None when a category has no items.
4. Record security/privacy implications, report compatibility, dependencies and configuration changes. Do not increment policy or schema versions for purely visual changes.
5. Record tests present separately from tests actually run and passed. Include platform, mock/live source and remaining limitations. Never reuse an older release's counts as current evidence.
6. Update the README's status, changelog entry, detailed release note and package/lockfile/sidebar versions together.
7. Include migration instructions and a changed-file manifest for an update ZIP; retain old release history. Identify the baseline required by the update.
8. Verify local Markdown links and ZIP contents, then review the diff. Run PR checks before merge. Record a deployment only after evidence confirms it.

Prefer concrete notes such as “unknown checks are excluded from the displayed denominator,” rather than “improved security.” Never put entered credentials, hashes or copied user reports in release records. Screenshots must use public demonstration data and state whether responses are mocked.

This is a maintenance process, not a promise that files update themselves. Every future implementation change should carry its release-note update.
