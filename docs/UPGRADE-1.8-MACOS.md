# HELLO WORLD v1.8 on macOS

Extract the complete ZIP into a new folder and keep v1.7 as a backup. In Terminal type `cd `, drag the extracted `hello-world-v1.8` folder into Terminal, and press Return.

```bash
npm ci
npm run dev
```

Node 24+ and npm must already be installed. Open the printed localhost URL. Leave Terminal running; Control+C stops the server.

For the update-only ZIP, enter your existing **v1.7** folder, then replace the path below with the extracted update folder:

```bash
rsync -av "/path/to/hello-world-v1.8-update/" ./
npm ci
npm run check
npm run dev
```

This overwrites matching files but removes nothing. See `docs/UPDATE-MANIFEST-1.8.txt`. Use the complete ZIP for older baselines.

Try the new Check source selector. Live contacts HIBP only during an explicit check; Practice uses labelled local mock data. Changing source clears current forms/results. Demo guide opens the five presentation steps, browser readiness and challenge checklist. The footer shows app/policy/build identifiers.

Browser verification:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
npm run build:pages
```

Policy remains hello-world-1.5; authentication is still simulated. Tests mock HIBP. No deployment happens locally. In a real Git clone, follow the README's branch/PR process; merging main triggers the existing Pages workflow. Do not force-push or overwrite unrelated work.
