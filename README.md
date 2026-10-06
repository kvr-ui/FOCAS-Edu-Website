How to push Hostinger

1. Npm Run Build
2. rsync -avz --delete -e "ssh -i ~/.ssh/id_ed25519" dist/ root@31.97.228.184:/var/www/focasedu-react/
3. Enter VPS Password

## Preview deployments

Every pushed git branch gets a Vercel preview of the Vite site (config in `vercel.json`: `npm run build`, output `dist`, SPA rewrite to `/index.html`). Vercel rewrites only apply after the filesystem check, so static assets and per-page `/<slug>/index.html` files emitted by the build are served as-is, and any other path (e.g. `/rti`) falls back to the SPA.

Vercel is for previews only. Production stays on the VPS (nginx), deployed as described above.

## Landing-page meta HTML

`npm run build` runs `scripts/gen-landing-meta.mjs` after Vite. The script validates every
non-template config in `src/landing-pages/`, then copies `dist/index.html` to
`dist/<slug>/index.html` and `dist/<slug>-success/index.html` with page-specific title,
description, Open Graph, Twitter card, and success-page `noindex` metadata. Set `SITE_URL` to
override the production URL (`https://focasedu.com`), or pass `--outDir <dir>` when invoking the
script directly after a Vite build into a different directory.

Production nginx must use `try_files $uri $uri/ /index.html;`. This serves the generated file for
`/<slug>` while all other routes fall through to the SPA.

### One-time Vercel setup (manual)

1. **Import the project.** In the Vercel dashboard choose Add New > Project and import this GitHub repo. Vercel picks up `vercel.json` (Vite, `npm run build`, `dist`).
2. **Set an unused Production Branch.** Project Settings > Environments (or Git) > Production Branch: set it to a branch that does not exist or is never pushed to, e.g. `vercel-prod-unused`. This guarantees Vercel never serves production; all real branches deploy as Previews.
3. **Add Preview-scoped environment variables.** Project Settings > Environment Variables, with only the "Preview" environment ticked. Use the Razorpay TEST key and test/dummy lead endpoints where available. Never put live secrets here.
   - `VITE_LEAD_TRACK_URL`
   - `VITE_COUNSELING_API`
   - `VITE_BACKEND_URL`
   - `VITE_RTI_BACKEND_URL`
   - `VITE_RAZORPAY_KEY_ID` (use the `rzp_test_...` key)

   These are the `import.meta.env.VITE_*` variables read in `src/`; re-grep `import.meta.env.VITE_` when adding new ones. Vite inlines them at build time, so redeploy after changing them.
4. **Allow the team to open preview links.** Project Settings > Deployment Protection: turn Vercel Authentication off for Preview deployments, so links shared via Telegram open without a Vercel login. Alternative: keep protection on and enable "Protection Bypass for Automation", then append `?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true` to preview URLs.
5. **Values the Telegram bot needs** (set in the bot's environment, not in this repo):
   - `VERCEL_PROJECT_ID`: Project Settings > General > Project ID.
   - `VERCEL_TEAM_ID`: Team Settings > General > Team ID (starts with `team_`). Not needed for a personal account.
   - `VERCEL_TOKEN`: create at Account Settings > Tokens (vercel.com/account/tokens), scoped to the team that owns the project.

Note: after setup, push any branch and confirm that deep links such as `/rti` load on the preview URL.
