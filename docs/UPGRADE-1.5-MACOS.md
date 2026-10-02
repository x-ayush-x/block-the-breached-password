# HELLO WORLD v1.5 - macOS upgrade guide

This release keeps the GitHub repository name and Pages path `block-the-breached-password`. The displayed project name remains HELLO WORLD. It does not create real accounts or collect employee passwords.

## What changed

- Light, Dark and System appearance controls in the top bar. System follows macOS appearance. Your selection survives route changes in the current tab but resets to System on reload. No browser storage is used.
- Refreshed surfaces, cards, navigation, buttons and status colors across all eight routes. Printed reports stay white in dark mode.
- Dashboard explains its synthetic inputs before you run it: 23 common examples plus 77 fresh random strings (or 5 plus 15 in the quick live demo). No employee-password collection or upload exists. Live responses are still real HIBP responses; the test accounts are generated locally.
- Lab explains why correct rejection is PASS. Run one case or all nine; exported evidence identifies the actual test scope. A new run replaces the previous results.
- Signup/reset verify the actual age of a breach result at submission, even if the browser delayed the five-minute timer.
- Current-check privacy panel has step-by-step independent Network inspection instructions. It still exposes no password or full hash.
- GitHub workflow runs browser tests before building and deploying the Pages version. Local changes do not deploy automatically.
- Policy version is `hello-world-1.5`. Older v1.4 report files remain readable, but differing policy versions cannot be compared. Existing live dataset compatibility rules remain unchanged.

## Choose your ZIP

**Complete-project ZIP:** use this to run a fresh local copy. It contains the full source, configuration, tests and project documentation. It does not contain node_modules, generated builds, Git history or earlier generated PDF guides.

**Update-only ZIP:** use this to update an existing v1.4 project or GitHub clone. It contains changed/new files only. No files need deleting. Do not upload the ZIP itself as the website. Extract and copy its contents into the project.

Before copying, make a backup of your existing folder using Finder: select it, press Command+D. Keep personal changes separately; update files replace files with the same names.

## A. Run the complete project

1. Download the complete ZIP to Downloads and double-click it. The extracted folder is `hello-world-v1.5`.
2. Open Terminal with Spotlight (Command+Space, type Terminal).
3. Check that Node and npm are installed:

```bash
node -v
npm -v
```

This project requires Node 24 or newer; Node 24 is used by the GitHub workflow. If either command is missing, install Node from its official website, then reopen Terminal.

4. Run these commands one at a time:

```bash
cd "$HOME/Downloads/hello-world-v1.5"
npm ci
npm run dev
```

`cd` enters the folder. `npm ci` installs the exact dependencies recorded in package-lock.json. `npm run dev` starts the local development server. Open the localhost URL Terminal prints. Leave Terminal running. Control+C stops the server.

If Finder put the folder elsewhere, type `cd ` (including its space), drag the extracted folder into Terminal, and press Return.

## B. Apply the update-only ZIP to your existing project

1. Double-click the update ZIP in Downloads. The extracted folder is `hello-world-v1.5-update`.
2. In Terminal, enter your existing project folder. For the original workspace:

```bash
cd "$HOME/HACKATHON/Innovate26/block-the-breached-password"
pwd
ls
```

Check that `package.json` and `src` are visible. If your GitHub clone lives elsewhere, use that folder instead.

3. Copy the update, including the hidden `.github` directory and `.gitignore`:

```bash
rsync -av "$HOME/Downloads/hello-world-v1.5-update/" ./
npm ci
npm run check
npm run dev
```

The trailing slash after the update folder means copy its contents. `rsync` replaces matching files; it does not delete other files, copy a `.git` directory or alter your Git history. `npm run check` runs lint, unit/service tests and a normal production build.

## C. Check the upgrade

- Appearance: select Dark, Light and System. Navigate between routes. Theme changes must not clear an active password check.
- Dashboard: read Dataset composition. Change between 100 and 20 inputs and see the counts update. Explicit mock mode must stay labelled.
- Lab: run Strong, but already exposed alone. It should show 1 of 1 completed and explain correct rejection. Run all to see nine separate verdicts.
- Signup/reset: use only demonstration inputs. Live errors must block, never become mock approval.
- Reports: verify source, coverage, timestamp and policy version. Print / Save as PDF stays a white report even in dark mode.

Run the full browser suite locally:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

The tests use port 4173. Stop any existing preview server on that port first. All automated HIBP responses are controlled mocks; tests do not repeatedly query the live service.

Check the GitHub Pages build separately:

```bash
npm run build:pages
```

This creates assets for `/block-the-breached-password/`. Before running the normal browser suite again, restore the root-path build using `npm run build`.

## D. Review and update GitHub only when you are ready

No push, merge or deployment was performed as part of this upgrade. Publishing to main can trigger your existing Pages workflow.

If you are in a GitHub clone, check it before making changes:

```bash
git status
git remote -v
```

If Git says “not a git repository”, your folder is an extracted ZIP. Clone the repository into a new folder first, then apply the update there. Do not initialize a new unrelated history over the ZIP just to fix the error.

Example new clone:

```bash
cd "$HOME"
git clone https://github.com/x-ayush-x/block-the-breached-password.git hello-world-github-v15
cd hello-world-github-v15
git switch -c upgrade-hello-world-v1.5
rsync -av "$HOME/Downloads/hello-world-v1.5-update/" ./
npm ci
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
npm run build:pages
git status
git diff --stat
```

Review the diff and make sure only intended project files are included. Then, when you choose to publish the branch:

```bash
git add .
git commit -m "Upgrade HELLO WORLD to v1.5"
git push -u origin upgrade-hello-world-v1.5
```

On GitHub, create a pull request with base `main` and compare `upgrade-hello-world-v1.5`. Review it before merging. A branch push or creating the PR does not publish this workflow; merging into main does. Check Actions for a successful deployment afterward. Do not force-push.

Keep the Vite Pages base path unchanged unless you deliberately rename the repository and update the hosting configuration. Older generated learning PDFs describe v1.4; use this document for the v1.5 differences.
