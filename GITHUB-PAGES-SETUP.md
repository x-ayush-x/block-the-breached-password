# Publish your project on GitHub Pages

Repository: https://github.com/x-ayush-x/block-the-breached-password
Expected website AFTER successful deployment: https://x-ayush-x.github.io/block-the-breached-password/

## Upload through your browser

1. Extract this ZIP into a fresh folder. No need to run npm install before uploading.
2. Open the extracted project folder in Finder. You should see package.json, src and vite.config.js.
3. Press Command+Shift+. to reveal hidden files. Include the .github folder: it contains the deployment workflow. Include .gitignore too.
4. Open your repository in Chrome. Choose Add file > Upload files (or “uploading an existing file” if empty).
5. Drag the CONTENTS of the project folder into the upload area. Do not drag the outer folder or ZIP. package.json must be at the top level in GitHub, alongside src, public and .github. Do not upload node_modules, dist, or test-results if you created them locally.
6. Commit changes to main. If GitHub offers only a different default branch, edit the workflow's branches list to that branch, or rename it to main before continuing.
7. Repository Settings > Pages > Build and deployment > Source: GitHub Actions.
8. Repository Actions > Deploy website to GitHub Pages > Run workflow > main > Run workflow. The first automatic run may have failed before Pages was enabled; this manual run retries after configuration.
9. Wait until the run shows a green check, then open the website URL above. It is not live until deployment succeeds.

## Troubleshooting

- Workflow missing in Actions: open the repository's .github/workflows/deploy.yml. If missing, choose Add file > Create new file, enter that exact path, and paste the contents of the supplied deploy.yml. Commit to main.
- npm cannot find package.json: you uploaded the outer folder. Move/upload its contents to the repository root.
- Pages configuration error: select GitHub Actions under Settings > Pages, then rerun the workflow.
- No Pages setting: check repository visibility and your account's Pages eligibility. Public repositories are the straightforward option for a public demo.
- Blank page or missing assets: this package uses build:pages with the exact repository prefix. Do not rename the repository without updating vite.config.js.
- Workflow failure: open the failed job in Actions and copy the error text; don't send credentials or tokens.

## After deployment

Use only public test credentials. Test signup and reset, inspect the Network tab for a five-character HIBP range prefix, and test both live dashboard and clearly labelled mock benchmark. A live service failure must keep submission blocked. We have not yet verified live HIBP access from the hosted URL.

## Local development

npm install
npm run dev

The ordinary build remains at / for local tests. npm run build:pages makes the repository-path build. With that build, npm run preview -- --mode github-pages previews at /block-the-breached-password/.

## Hosting security note

GitHub Pages does not consume public/_headers (that file targets hosts supporting this convention). The built HTML retains a meta Content-Security-Policy and referrer policy. Preview-server response headers are not proof of production headers. In particular, frame-ancestors needs an HTTP response header and is not enforced by the meta policy. Authentication remains simulated.

References: https://vite.dev/guide/static-deploy and https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
