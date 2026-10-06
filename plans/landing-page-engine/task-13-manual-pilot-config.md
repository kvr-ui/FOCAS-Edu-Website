---
task: 13
name: manual-pilot-config
parallel_group: 4
depends_on: [8, 12]
issue: 14
---

# Task 13: Manual pilot config at /manual-v2

## What to build

Create `src/landing-pages/manual-v2.js` (slug `manual-v2`) reproducing the live `/manual` page entirely from config:

- navbar links, ticker, hero (badge, gradient headline, Bunny HLS video, price table, stat cards, CTA "GET YOURS TODAY! — ₹299"), what-you-get, testimonials, how-it-works, compare, FAQ, footer
- form fields as in `Manual.jsx` RegisterPage: name, phone, CA group as an override `{ field: "caStatus", key: "groupSelection", label: "Group Selection", options: ["Group 1", "Group 2"] }`, and `address` (line1, line2, city, state, pincode) — the register request body must match what Manual.jsx sends today
- `submit.kind: "razorpay"`, source `manual-class`, amount 299, register `/api/manual-class/register`, verify `/api/manual-class/payment-success`, backend `VITE_BACKEND_URL`
- events: ga + pixelName "Manual ₹299"
- success content taken from `ManualSuccess.jsx`
- meta title/description/og image (image under `public/lp/manual-v2/`)

If something cannot be expressed by the existing blocks, fix the block with a small, generic prop. Do not add page-specific code.

Does NOT touch the live `/manual` route — that is task 15.

## Acceptance criteria

- [ ] `/manual-v2` and `/manual` match side by side at 1440px and 390px; screenshots are included in the PR/commit notes
- [ ] Razorpay test-mode payment completes and lands on `/manual-v2-success`
- [ ] Network shows the trackLead POST with UTMs and source `manual-class`
- [ ] Pixel `Lead` and `Purchase` fire
- [ ] `npm run build` emits `dist/manual-v2/index.html` with og tags
- [ ] Validator passes; no new page-specific code in `src/landing/`; `/manual` untouched

## Commit convention

Your commit message MUST include `Closes #14` so the task's GitHub issue closes when the commit lands on the default branch.
