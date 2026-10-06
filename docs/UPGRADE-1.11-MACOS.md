# HELLO WORLD v1.11 on macOS

Extract the complete ZIP into a new folder and keep v1.10 as a backup. In Terminal type `cd `, drag the extracted `hello-world-v1.11` folder into Terminal, and press Return.

```bash
npm ci
npm run dev
```

Node 24+ and npm must already be installed. Open the printed localhost URL. Leave Terminal running; Control+C stops the server.

For the update-only ZIP, enter your existing **v1.10** folder, then replace the path below with the extracted update folder:

```bash
rsync -av "/path/to/hello-world-v1.11-update/" ./
npm ci
npm run check
npm run dev
```

This overwrites matching files but removes nothing. See `docs/UPDATE-MANIFEST-1.11.txt`. Use the complete ZIP for older baselines.

Open Security dashboard and scroll to Compare exported reports. Import two dashboard JSON files, read each summary and the compatibility checklist. Use Remove to clear a slot. The same complete mock report loaded twice yields zero percentage points; this demonstrates the tool, not a security improvement. No upload occurs. PDF exports and Lab evidence cannot be compared here.

Browser verification:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
npm run build:pages
```

Policy remains hello-world-1.5; authentication is still simulated. Tests mock HIBP. No deployment happens locally. In a real Git clone, follow the README's branch/PR process; merging main triggers the existing Pages workflow. Do not force-push or overwrite unrelated work.
