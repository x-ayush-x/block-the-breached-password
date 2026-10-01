# HELLO WORLD v1.4 — macOS guide

HELLO WORLD is the hackathon team and displayed project name. The product demonstrates blocking breached passwords. The repository name and GitHub Pages base path remain `block-the-breached-password`; do not rename the repository or change `vite.config.js` for this upgrade.

## Choose ONE installation method

The complete ZIP contains the entire source project, including GitHub Pages configuration and all tests. The update-only ZIP contains added or changed files relative to the supplied v1.3 project. Neither ZIP contains node_modules, Git history, real passwords, test recordings or build output. Use the complete ZIP if your old project differs from the supplied v1.3 source.

Install Node.js 24 or newer first if needed. Open Terminal (Command+Space, type Terminal, press Return). Check:

```bash
node -v
npm -v
```

Stop any running project server with Control+C. The following commands assume the ZIP is in Downloads. If you saved it elsewhere, use its actual path. Run each line separately. No command below pushes or deploys anything.

## Option A — complete project (recommended)

Use a new destination folder; do not unzip over your existing project.

```bash
mkdir -p "$HOME/HELLO-WORLD-v1.4"
unzip "$HOME/Downloads/hello-world-v1.4-complete.zip" -d "$HOME/HELLO-WORLD-v1.4"
cd "$HOME/HELLO-WORLD-v1.4/hello-world-complete"
npm ci
npm run check
npm run dev
```

Open the local address printed in Terminal, normally http://127.0.0.1:5173. Keep Terminal running. Press Control+C to stop. This installs locked dependencies; the initial install requires internet.

## Option B — update the supplied v1.3 project

These commands use the project location from this workspace. If yours differs, type `cd ` (including the space), drag your old project folder from Finder into Terminal, then press Return. Confirm `pwd` shows the old project and `ls` includes package.json before copying.

```bash
cd "$HOME/HACKATHON/Innovate26/block-the-breached-password"
pwd
ls
```

Create a dated backup outside your project, then extract and preview the update. The backup includes source and configuration, without downloaded dependencies or Git history. It does not change your existing `.git` directory.

```bash
tar --exclude=node_modules --exclude=dist --exclude=.git --exclude=deliverables -czf "$HOME/Downloads/hello-world-before-update-$(date +%Y%m%d-%H%M%S).tar.gz" .
mkdir -p "$HOME/HELLO-WORLD-update-v1.4"
unzip "$HOME/Downloads/hello-world-v1.4-update-only.zip" -d "$HOME/HELLO-WORLD-update-v1.4"
cat "$HOME/HELLO-WORLD-update-v1.4/UPDATE-MANIFEST.txt"
rsync -avn "$HOME/HELLO-WORLD-update-v1.4/hello-world-update/" ./
```

The last command previews the files. Apply the update (overwrites only listed files; no deletions):

```bash
rsync -av "$HOME/HELLO-WORLD-update-v1.4/hello-world-update/" ./
npm ci
npm run check
npm run dev
```

If you have customized a listed file, merge that change with your backup before continuing. Do not use update-only against an unrelated version.

## Browser tests and GitHub Pages build

Stop the development server with Control+C before running these optional additional checks:

```bash
npx playwright install chromium
npm run test:e2e
npm run build:pages
```

`build:pages` generates files for the preserved `/block-the-breached-password/` URL path. It does not deploy. Use `npm run build` before `npm run preview` or browser tests to restore the localhost build. The existing GitHub Actions workflow deploys on a push to main; do not push to main until you intentionally want deployment.

## New features and demonstration

- Open the guided walkthrough at the top of any page, then run readiness checks. This checks secure context, browser cryptography and the network hint; only an explicit live check establishes HIBP reachability.
- Signup/reset show current length, whole-value common/account-context rules, advisory strength and breach status. Reset now accepts optional email context. Explicit checks show actual hashing, prefix lookup, local comparison and completion stages. Cancel stops the current check; edits invalidate results. No fake progress timers are used.
- Live is the default. Explicitly select **Offline demonstration mode** to use the synthetic corpus for signup/reset and dashboard. Changing mode clears account inputs/results or the dashboard run. Live failures never switch to mock. Authentication is always simulated.
- With local dependencies installed and the local server running, the demonstration can run without internet. Hosted pages are not an offline-installed app: a disconnected reload or unloaded lazy route may fail. Load required pages before disconnecting or use the local server.
- Load the public breached fixture, explicitly check, and show rejection. Generate a random demo and check it to show the separate rules. Do not use real passwords on stage.
- For live privacy evidence, expand the evidence panel before leaving signup and inspect DevTools → Network → range. Only five SHA-1 prefix characters are sent to HIBP. Mock mode has no HIBP network evidence.
- Dashboard: run analysis, inspect successful coverage plus unknown/pending, export JSON, or select **Print / Save as PDF**. In macOS's print dialog use **PDF → Save as PDF** (Chrome may show a Save as PDF destination). Printing includes aggregate coverage, source, timestamp, dataset identity, policy version, findings and recommended actions. It does not depend on table filters or the current table page.
- Compare two v1.4 JSON exports locally. Matching source, dataset, policy, scenario and full successful coverage are required. Deterministic mock runs can compare; fresh live runs contain different random accounts and are deliberately blocked. v1.3 exports lack reliable dataset identities and are unsupported. Imported reports are not signed or independently authenticated.
- Finish in Security Test Lab. It always uses labelled deterministic local simulations, regardless of the live/offline setting.

## Security and accessibility notes

No password storage, logging, analytics or backend was added. Transient inputs, hashing and matching stay in browser memory. The live range request still uses GET, exactly five uppercase hexadecimal prefix characters, padding, no body, credentials omitted, no referrer, no-store and redirects blocked. Unknown/error/expired checks fail closed. SHA-1 is used for HIBP lookup only, not credential storage.

Strength is advisory, preserving the existing policy; a high score never bypasses a breach match. A no-match result never guarantees security. Session events contain fixed labels only. Reports exclude passwords and hashes.

The home page defers route modules and the large strength dictionary. Keyboard focus, navigation skip link, live stage/status announcements, labelled file inputs and reduced-motion styles are included. Automated browser checks are not a substitute for a full assistive-technology audit.
