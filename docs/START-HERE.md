# Run the completed project

Your old Phase 1 folder is only the starter. This is a complete replacement project in a separate folder; no merging is needed.

1. In the old terminal, press Control+C.
2. Extract the new ZIP.
3. In VS Code: File → Open Folder → block-the-breached-password-complete.
4. In Terminal → New Terminal:

```bash
npm install
npm run dev
```

5. Open the local URL printed in the terminal.
6. Click Sign up → Load breached demo → Check password securely.
7. Click Generate random demo → Check password securely → Simulate account creation, if eligible.
8. Visit Reset password, Dashboard, How it works, Privacy & proof, and Password policy.

No API key or backend is required. Use test values only. Live checking needs internet access. Keep the terminal open. Stop it with Control+C.

If something fails, send the exact terminal error and the visible browser message. Do not send real passwords.

## What is different from Phase 1?

The starter cards have become a full interface. All source files are already in place. `npm install` adds zxcvbn for strength estimation and Playwright for testing. The same two startup commands still work.

## Before judging

Run these in a second terminal:

```bash
npm run lint
npm test
npm run build
```

For the production build demo, stop the development server and run:

```bash
npm run preview
```

Open its printed URL, usually http://127.0.0.1:4173. Test the venue's internet beforehand. If HIBP is unreachable, explain and show fail-closed behavior; do not describe an unavailable result as safe.
