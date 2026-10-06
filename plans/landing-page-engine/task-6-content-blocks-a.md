---
task: 6
name: content-blocks-a
parallel_group: 2
depends_on: [1]
issue: 7
---

# Task 6: Content blocks set A

## What to build

Prop-driven section blocks under `src/landing/blocks/`, ported from `Manual.jsx`, `Counselling.jsx` and `career/CareerGuidance.jsx`. Each block receives its config section object (spread or as `section`) plus `onRegister`, and uses the primitives and theme variables from task 1 (`Reveal`, `var(--lp-accent)`, `var(--lp-accent-2)`).

- `hero`: badge, headline with optional gradient-highlighted span, sub, emphasis line, price table, CTA (label from config), stat cards, and media = image OR Bunny HLS video URL. Desktop and mobile layouts as in Manual.
- `ticker`: scrolling marquee of config items using the `ticker` keyframes.
- `countdown`: counts down to a config date; hides itself once the date has passed.
- `highlights`: icon/stat grid.
- `whatYouGet`: cards (icon, title, desc, colour) plus bottom CTA bar.
- `howItWorks`: timeline steps plus optional feature cards.

Conventions: wrap in `Reveal`; accept `id` for nav anchoring; missing optional fields render nothing harmful (no crashes, no empty wrappers); no page-specific strings hardcoded. Each block has a JSDoc comment documenting its props shape (task 14's skill catalogue is built from these). Export a `BLOCKS_A` map `{ type: Component }` keyed by the config `type` strings above.

Does NOT do agenda/compare/testimonials/videoTestimonials/gallery/faq/finalCta/footer/custom (task 7) or the page renderer (task 12).

## Acceptance criteria

- [ ] All six blocks exist and are exported via `BLOCKS_A`
- [ ] Rendering each block with Manual's content reproduces Manual's section visually (desktop and mobile)
- [ ] Hero supports image and HLS video media; countdown hides when past
- [ ] Every block uses theme CSS variables, `Reveal`, and an `id` prop
- [ ] Omitting any optional field does not break rendering
- [ ] JSDoc props shape on every block
- [ ] No page-specific strings hardcoded
- [ ] No existing page modified; `npm run lint` passes

## Commit convention

Your commit message MUST include `Closes #7` so the task's GitHub issue closes when the commit lands on the default branch.
