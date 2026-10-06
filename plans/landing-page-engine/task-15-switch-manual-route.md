---
task: 15
name: switch-manual-route
parallel_group: 5
depends_on: [13]
issue: 16
---

# Task 15: Switch /manual to the config page

## What to build

After the owner confirms parity of `/manual-v2`:

- rename the config to `src/landing-pages/manual.js` (slug `manual`) and move images to `public/lp/manual/`
- remove the explicit `/manual` and `/manual-success` routes and their imports from `src/App.jsx`
- delete `src/components/manual/` (Manual.jsx, ManualSuccess.jsx) only if nothing else imports them
- remove `manual` from the schema's reserved-route list

Does NOT migrate any other page.

## Acceptance criteria

- [ ] `/manual` and `/manual-success` are served by the engine
- [ ] The ad's existing URL with UTMs works and UTMs reach trackLead
- [ ] Razorpay test payment works end to end
- [ ] `dist/manual/index.html` has og tags
- [ ] No other route changes; `/manual-v2` is removed or redirected as the owner decides
- [ ] Lint, test and build pass

## Commit convention

Your commit message MUST include `Closes #16` so the task's GitHub issue closes when the commit lands on the default branch.
