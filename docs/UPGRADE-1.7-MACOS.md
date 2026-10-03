# Run HELLO WORLD v1.7 on macOS

## Complete project (recommended)

Extract `HELLO-WORLD-v1.7-complete.zip` into a new folder. Keep your previous folder as a backup. In Terminal type `cd `, drag the extracted `hello-world-v1.7` folder into Terminal, and press Return.

```bash
node -v
npm -v
npm ci
npm run dev
```

Node 24+ and npm must already be installed. `npm ci` installs project dependencies; it does not install Node. Open the URL printed by Vite, leave Terminal running, and stop with Control+C. Only use demonstration passwords.

## Update an existing v1.6 project

Back it up first. Extract `HELLO-WORLD-v1.7-update-only.zip`. Enter your existing project folder in Terminal. Replace the source path below with the actual extracted update directory; retain the trailing slash:

```bash
rsync -av "/path/to/hello-world-v1.7-update/" ./
npm ci
npm run check
npm run dev
```

This overwrites matching files without deleting others. See `docs/UPDATE-MANIFEST-1.7.txt`. The update includes the narrow-screen hotfix/PR validation files for installations that have the original v1.6. Use the complete ZIP for older baselines or uncertainty.

## Verify and demonstrate

```bash
npm run build
npx playwright install chromium
npm run test:e2e
npm run build:pages
```

On the dashboard, choose a source, run the analysis, and explain the match-rate equation and successful coverage. Expand the definitions or technical panels as needed. JSON and printed mock reports describe mock matches explicitly.

The application version is 1.7.0; the policy remains hello-world-1.5. No dependencies or password rules changed. Reports remain subject to the existing compatibility checks.

## GitHub

An extracted ZIP has no Git history. Use your existing real clone, review `git status`, and follow the branch/PR steps in the README. Do not overwrite unrelated changes or force-push. Merging to main triggers the existing Pages deployment workflow; testing a local project does not publish it.
