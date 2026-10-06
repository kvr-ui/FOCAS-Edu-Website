---
task: 2
name: config-schema-registry
parallel_group: 1
depends_on: []
issue: 3
---

# Task 2: Config schema, validator & registry

## What to build

The contract for landing-page configs (shape in main-plan.md) plus tooling to load and validate them.

**`src/landing/schema.js`** — plain JS (no JSX, no `import.meta`, no browser globals) so it imports from both the browser and Node. Exports the shared constant `BLOCK_TYPES` = hero, ticker, countdown, highlights, whatYouGet, howItWorks, agenda, compare, testimonials, videoTestimonials, gallery, faq, finalCta, footer, custom; and `validateConfig(cfg, { knownBlockTypes = BLOCK_TYPES, reservedPaths = [], filename })` returning an array of human-readable errors (`"<path>: <message>"`, e.g. `sections[2].type: unknown block "foo"`); empty array = valid. Rules:
- `slug` required, kebab-case, equals the filename (sans `.js`) when `filename` given; must not collide with `reservedPaths` (the explicit routes in App.jsx: focas, links, meet, payment, success, counselling, rti, career-guidance, audit, manual, workout-batch, fs, course, privacy-policy, and their `-success` forms) and must not itself end with `-success`.
- `meta.title` and `meta.description` required strings.
- `sections` non-empty; each has a `type` in `knownBlockTypes`.
- `form.fields` non-empty; each entry is either a field name from the allowed library (name, phone, email, caStatus, attempt, language, city, state, address) or an override object `{ field, key?, label?, options?, required? }` whose `field` is from that library (`key` = name sent to the backend, `options` = string array for selects).
- `form.submit.kind` in zoho | leadServer | razorpay; `source` required for all; `leadServer` requires `endpoint`; `razorpay` requires `amount`, `register`, `verify`.
- `success.heading` required.
- `expiresAt` optional, valid ISO date; if present `afterExpiry.mode` must be waitlist | redirect (redirect also needs `redirectTo`).
- `variants` keys kebab-case; each variant may only override `hero` and `sourceSuffix`.

**`src/landing/registry.js`** — `import.meta.glob('../landing-pages/*.js')` (lazy); exports `loadConfig(slug)` resolving the default export or `null` if absent, and `listSlugs()`. Files whose name starts with `_` are ignored.

**`scripts/validate-landing.mjs [slug]`** — Node CLI: imports every `src/landing-pages/*.js` (or just the given slug; skip `_*` files), runs `validateConfig` with the reserved-paths list, prints errors grouped by file, exits 1 on any error, 0 otherwise. `custom` sections' `component: () => import(...)` are functions that are never called, so Node import must not break. Add `npm run validate:landing`.

Does NOT build blocks, the renderer, meta HTML generation (task 8) or `_template.js` (task 14).

## Acceptance criteria

- [ ] Vitest tests (`npm test`) cover: a valid config, each error class above, and slug collision with `manual` and `rti` reserved routes and a `-success` suffix.
- [ ] `schema.js` has no browser-only or Vite-only dependencies and imports under Node.
- [ ] `loadConfig` lazy-loads configs and ignores `_`-prefixed files.
- [ ] `npm run validate:landing` prints readable errors and exits non-zero on an invalid config; exits 0 on valid ones (including a config with a `custom` lazy component).
- [ ] `BLOCK_TYPES` exported from `schema.js`.
- [ ] Field override objects validate; an override with an unknown `field` or non-array `options` is an error.

## Commit convention

Your commit message MUST include `Closes #3` so the task's GitHub issue closes when the commit lands on the default branch.
