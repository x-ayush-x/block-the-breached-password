# HELLO WORLD v1.6 — run and update on macOS

This release improves the existing v1.5 application. It does not create real accounts or change the password policy. The package is 1.6.0; the policy remains `hello-world-1.5` because its rules have not changed. No deployment is performed by extracting or running the project.

## Try the complete project

1. Extract `HELLO-WORLD-v1.6-complete.zip` into a new folder. Keep your old project as a backup.
2. In Terminal type `cd ` (include the space), drag the extracted `hello-world-v1.6` folder into Terminal, and press Return.
3. Run each command separately:

```bash
node -v
npm -v
npm ci
npm run dev
```

Node/npm must already be installed; this project specifies Node 24 or newer. `npm ci` installs the exact locked dependencies. Open the localhost address Vite prints. Keep Terminal running; Control+C stops the server. Light/Dark/System is in the header; phones have an Explore pages button. Only use public demonstration values.

Live mode needs internet access to HIBP. Offline demonstration mode uses explicit local mock responses and still needs the local server running. Never present mock results as live evidence.

## Apply only the changed files

The update-only ZIP is for an existing **v1.5** project. It is not a replacement for the full project and is not a patch for v1.4. Use the complete ZIP if uncertain.

Back up the v1.5 folder. Extract the update ZIP. In Terminal, enter your existing project folder using `cd ` and drag-and-drop. Then run the command below, replacing the quoted source path with the extracted update folder's actual path:

```bash
rsync -av "/path/to/hello-world-v1.6-update/" ./
npm ci
npm run check
npm run dev
```

The trailing slash means copy the contents. This overwrites matching files but does not delete other files; there are no removed files in this update. Read `docs/UPDATE-MANIFEST-1.6.txt` to see the changed paths.

## Optional browser verification

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

The tests run a local preview server and controlled mock HIBP responses; passing them does not establish current HIBP availability. `npm run build:pages` builds for the existing repository URL.

## GitHub, when you are ready

Use a real clone of your GitHub repository. An extracted ZIP is not a Git checkout. If you have not merged the v1.5 PR, build your v1.6 branch from its `upgrade-hello-world-v1.5` branch; otherwise use updated `main`. Do not overwrite unrelated uncommitted work.

In your clone:

```bash
git status
git fetch origin
```

For an unmerged v1.5 PR:

```bash
git switch -c upgrade-hello-world-v1.6 origin/upgrade-hello-world-v1.5
```

Or, if v1.5 is already in main:

```bash
git switch main
git pull --ff-only
git switch -c upgrade-hello-world-v1.6
```

Copy the update contents with the `rsync` command above, then:

```bash
npm ci
npm run check
git status
git diff --stat
git add src e2e package.json package-lock.json README.md docs
git diff --cached --stat
git commit -m "Improve HELLO WORLD v1.6 usability and UI"
git push -u origin upgrade-hello-world-v1.6
```

Review exactly what `git add` staged before committing. Open a pull request on GitHub. A push to this branch does not deploy Pages; merging into main triggers the existing Pages workflow. Do not merge until ready to publish. No force push is required.
