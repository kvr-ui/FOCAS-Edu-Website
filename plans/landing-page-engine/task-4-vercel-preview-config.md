---
task: 4
name: vercel-preview-config
parallel_group: 1
depends_on: []
issue: 5
---

# Task 4: Vercel preview project config

## What to build

Make every pushed git branch produce a working Vercel preview of the Vite site. Vercel is used for previews only; production stays on the VPS (nginx).

- Add `vercel.json` at the repo root: build command `npm run build`, output directory `dist`, and an SPA rewrite so any path that is not an existing file is served `/index.html`. Filesystem must win first, so per-page `/<slug>/index.html` files emitted by the build (task 8) stay reachable and static assets are never rewritten.
- Add a "Preview deployments" section to the README documenting the one-time manual Vercel setup:
  1. Import the GitHub repo as a Vercel project.
  2. Set Production Branch to an unused branch (e.g. `vercel-prod-unused`) so Vercel never serves production.
  3. Set Preview-scoped env vars: the `VITE_*` vars (`VITE_LEAD_TRACK_URL`, `VITE_COUNSELING_API`, `VITE_BACKEND_URL`, `VITE_RTI_BACKEND_URL`, `VITE_RAZORPAY_KEY_ID`, etc.) using the Razorpay TEST key and test/dummy lead endpoints where available.
  4. Turn Deployment Protection (Vercel Authentication) off for previews, or document using the protection-bypass token, so the team can open links sent via Telegram.
  5. Note where to find the values the bot needs: `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`, and creating `VERCEL_TOKEN`.

Does NOT write bot code — that is task 10.

## Acceptance criteria

- [ ] `vercel.json` exists with build command `npm run build`, output `dist`, and a filesystem-first SPA rewrite to `/index.html`.
- [ ] Pushing any branch produces a Vercel preview where deep links such as `/rti` and `/some-slug` load (no 404).
- [ ] Static files and `/<slug>/index.html` build output are served as-is, not rewritten.
- [ ] README has a "Preview deployments" section covering all one-time setup steps above.

## Commit convention

Your commit message MUST include `Closes #5` so the task's GitHub issue closes when the commit lands on the default branch.
