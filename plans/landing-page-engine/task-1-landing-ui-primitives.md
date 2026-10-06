---
task: 1
name: landing-ui-primitives
parallel_group: 1
depends_on: []
issue: 2
---

# Task 1: Landing UI primitives & theming

## What to build

Shared, prop-driven UI primitives under `src/landing/ui/`, used by every landing block. No page-specific text anywhere; all copy and values arrive via props/config.

- `useInView` hook + `Reveal` component: scroll-triggered fade/slide-in with optional `delay` and `className`, identical behaviour to the ones in `src/components/manual/Manual.jsx`.
- `Navbar`: config-driven. Props: logo, `nav` links (`[{label, target}]` — `target` is a section id; click smooth-scrolls to it), register CTA with label from config, `onRegister`. Scroll-aware styling, mobile hamburger menu that closes after a link is chosen. Visually matches the Manual navbar.
- `StickyCTA`: mobile-only floating register button (label + `onRegister` from props); hidden on desktop.
- `WhatsAppButton`: optional floating button; renders nothing when no number is provided in config.
- `LandingTheme`: wrapper element that sets CSS variables `--lp-accent` and `--lp-accent-2` from `config.theme`, defaulting to `#1D9E75` / `#FFA500`. Blocks must use `var(--lp-accent)` / `var(--lp-accent-2)` rather than hardcoded colours.
- Shared CSS (injected once, e.g. via the theme wrapper) containing the `ticker` keyframes (and the `ping` keyframes Manual uses) needed by blocks.

Does NOT build content sections (tasks 6/7), the lead form (task 3), or the page renderer/routing (task 12). Does not modify any existing page.

## Acceptance criteria

- [ ] `useInView`, `Reveal`, `Navbar`, `StickyCTA`, `WhatsAppButton`, `LandingTheme` are exported from `src/landing/ui/`
- [ ] Components are pure/prop-driven; no page-specific text or hardcoded brand colours
- [ ] Navbar links smooth-scroll to section ids; mobile hamburger opens/closes; CTA label comes from config
- [ ] `LandingTheme` applies default accent colours when `config.theme` is missing or partial
- [ ] `WhatsAppButton` renders nothing without a number; `StickyCTA` shows only on mobile
- [ ] Reveal and Navbar visually match Manual's
- [ ] `ticker` keyframes available to blocks
- [ ] No existing page or file outside `src/landing/` is modified
- [ ] `npm run lint` passes

## Commit convention

Your commit message MUST include `Closes #2` so the task's GitHub issue closes when the commit lands on the default branch.
