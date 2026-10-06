---
task: 12
name: renderer-routing-variants-expiry
parallel_group: 3
depends_on: [1, 2, 3, 6, 7]
issue: 13
---

# Task 12: Landing page renderer, routing, variants & expiry

## What to build

Renderer under `src/landing/`: `LandingPage.jsx`, `LandingSuccess.jsx`, `LandingRouter.jsx`, `useVariant.js`.

**Routing.** In `src/App.jsx` keep every explicit route unchanged; replace the `*` NotFound route's element with `LandingRouter`. It reads the pathname's single segment, resolves `<slug>` or `<slug>-success` via the registry (task 2), lazy-loads the config, and renders `NotFound` for unknown slugs or multi-segment paths. In dev it shows validator errors on screen instead of a broken page.

**LandingPage.** Wraps in the theme (task 1); Navbar built from `config.nav`; renders `config.sections` in order via the merged `BLOCKS_A`/`BLOCKS_B` map (unknown type is skipped with `console.error` in dev); StickyCTA; the LeadForm modal (task 3) opened by any `onRegister`; sets `document.title`; pushes `dataLayer` `{event: "<slug>_page_view"}` and Pixel `ViewContent` once on mount.

**Variants.** `useVariant` reads `?v=`, persists it in sessionStorage per slug (so it survives to form submit and the success page), and deep-merges `variants[v].hero` over the hero section. An unknown `v` is ignored. The variant name is passed to LeadForm (source becomes `<source> - <v>`).

**Expiry.** If now > `expiresAt`: `afterExpiry.mode === "redirect"` renders `<Navigate replace to={redirectTo}>`; `"waitlist"` renders the hero, a closed message (`afterExpiry.message`) and LeadForm in waitlist mode, with all other sections hidden. Keep the date check in a small pure function so it is testable.

**LandingSuccess.** Renders `config.success` (heading, message, steps, WhatsApp group button). It fires nothing that double-counts leads (respect the `focas_lead_tracked` flag).

Does NOT create any real page config (task 13) or the skill (task 14).

## Acceptance criteria

- [ ] With a test config in `src/landing-pages/`, `/test` and `/test-success` render
- [ ] `/unknown` and multi-segment unknown paths render NotFound
- [ ] Existing routes (/rti, /fs, /manual, /career-guidance, ...) are unaffected
- [ ] `?v=parents` swaps the hero and the submitted source ends in " - parents"; an unknown `v` is ignored; the variant survives navigation to the success page
- [ ] Past `expiresAt`: waitlist mode shows hero + closed message + form only; redirect mode redirects
- [ ] page_view dataLayer event and Pixel ViewContent fire exactly once per mount
- [ ] Vitest tests for `useVariant` and the expiry logic pass; lint and build pass

## Commit convention

Your commit message MUST include `Closes #13` so the task's GitHub issue closes when the commit lands on the default branch.
