# Plan: landing-page-engine

## Goal

Make a new ad landing page a matter of writing one content (config) file plus images — no new JSX, no route edits, with lead/UTM/Pixel/GA tracking guaranteed — and then let the team create pages from Telegram: paste the brief to a bot, get a Vercel preview link, reply `ok`, and the page goes live on the production VPS.

## Approach

**Phase A – engine (in the React/Vite site).** A library of prop-driven section blocks (ported from the existing hand-written pages), a config-driven lead form that supports all three existing submit paths, a config schema + validator, and a catch-all route that renders `/:slug` and `/:slug-success` from `src/landing-pages/<slug>.js`. A post-build script emits per-page HTML with `<title>`/og tags. Proven by rebuilding `/manual` from a config, then switching the live route over. A `new-landing-page` Claude skill turns a brief into a config.

**Phase B – Telegram pipeline (new `bot/` service on the VPS).** A grammY bot runs the Claude Agent SDK with that skill inside a checkout of the repo, pushes a `lp/<slug>` branch, returns the Vercel preview URL, and on the owner's `ok` merges to `main`, builds, and atomically swaps the build into the nginx web root (with rollback).

Config shape (encodes the decisions below):

```js
export default {
  slug: "manual",
  meta: { title, description, ogImage: "/lp/manual/og.jpg" },
  theme: { accent: "#1D9E75", accent2: "#FFA500" },
  nav: [{ label: "Benefits", target: "offer" }],
  sections: [
    { type: "hero", id: "home", headline, sub, video | image, cta },
    { type: "faq", id: "faq", items: [{ q, a }] },
    { type: "custom", component: () => import("./custom/X.jsx") }, // humans only, never the bot
  ],
  form: {
    fields: ["name", "phone", "address",
             { field: "caStatus", key: "groupSelection", label: "Group", options: ["Group 1", "Group 2"] }],
    submit: { kind: "zoho" | "leadServer" | "razorpay", source: "manual-class",
              amount: 299, register: "/api/manual-class/register",
              verify: "/api/manual-class/payment-success", backend: "VITE_BACKEND_URL" },
    events: { ga: "manual_form_submit", pixelName: "Manual ₹299" },
  },
  success: { heading, message, whatsappGroup, steps: [] },
  expiresAt: "2026-11-30T23:59:00+05:30",
  afterExpiry: { mode: "waitlist" | "redirect", redirectTo: "/focas", message },
  variants: { parents: { hero: { headline, sub, image }, sourceSuffix: "parents" } },
};
```

## Decisions & Rejected Alternatives

- **Pages are authored as config files in the repo by developers/Claude** — no new infra, content reviewable in git, same shape a CMS could later consume. Rejected: admin panel/headless CMS (infra + auth for no current need); Google Sheet fetched at runtime (fragile, no validation).
- **Section-block library + per-page accent colour, with a `custom` escape hatch** — existing pages already differ in section mix (Countdown/Agenda vs Ticker/Compare), so a fixed template can't express them; the escape hatch stops an unusual campaign from forcing a 1,000-line copy. Rejected: one fixed template (too rigid); blocks with no escape hatch.
- **One config-driven form supporting all three submit kinds (zoho, leadServer, razorpay); tracking is unconditional** — new campaigns still need all backends; centralising `captureUtms` + `trackLead` + Pixel `Lead` + GA event fixes the recurring "page forgot to track" bug (commits 578e3f6, 17f6c09). Rejected: standardising every new page on one backend.
- **Top-level URLs `/:slug` and `/:slug-success`** via a catch-all after explicit routes — keeps short ad URLs and existing `-success` conversion rules. Rejected: namespaced `/lp/:slug` (longer URLs, breaks conversion convention).
- **Prove on `/manual`, migrate the rest opportunistically** — Manual is the simplest page yet exercises the paid Razorpay path; avoids a big-bang rewrite of ~6,700 lines of live ad funnels. Rejected: leave old pages forever; migrate all at once.
- **Expired campaigns show a "registrations closed — join waitlist" form (tracking-only lead), optionally redirect** — old ad links keep getting clicks; turn them into leads. Rejected: doing nothing.
- **Per-page og/title via post-build static HTML copies** — WhatsApp/FB previews need server-visible meta; no SSR needed. Rejected: client-side `document.title` only (previews stay generic).
- **`?v=` variants override hero + lead-source suffix** — one config serves many ad angles and the dashboard shows which converted. Rejected: one config file per angle.
- **Authoring runs from a Telegram bot on the same VPS as the site** — the user wants to paste briefs from Telegram. The skill lives in the repo checkout the bot uses (this reversed the earlier "personal skill on laptop" choice).
- **Vercel is used for preview links only; production stays on the VPS (nginx)** — user chose to keep prod hosting. Deploy = build to `dist-new`, atomic directory swap, previous build kept for `/rollback`. Rejected: moving prod frontend to Vercel.
- **Claude runs via the Agent SDK with an API key, tools locked to `src/landing-pages/**` and `public/lp/**`** — reliable on an always-on server, per-page cost visible. Rejected: `claude -p` on a subscription login (session expiry).
- **Team members on an allowlist can create/edit/preview; only the owner's Telegram ID can `ok`/deploy/rollback.**
- **The bot never writes React code** — it uses existing blocks only and reports gaps ("couldn't do X") so a developer adds a reusable block. Rejected: letting the bot write custom sections (unreviewed code to prod).

## Tasks

| # | Task | Phase | Depends on | Status |
|---|------|-------|------------|--------|
| 1 | Landing UI primitives & theming | 1 | — | pending |
| 2 | Config schema, validator & registry | 1 | — | pending |
| 3 | Config-driven lead form & submitters | 1 | — | pending |
| 4 | Vercel preview project config | 1 | — | pending |
| 5 | Telegram bot scaffold & access control | 1 | — | pending |
| 6 | Content blocks set A (hero, ticker, countdown, highlights, what-you-get, how-it-works) | 2 | 1 | pending |
| 7 | Content blocks set B (agenda, compare, testimonials, video testimonials, gallery, FAQ, final CTA, footer, custom) | 2 | 1 | pending |
| 8 | Per-page meta HTML generation at build | 2 | 2 | pending |
| 9 | Bot image intake | 2 | 5 | pending |
| 10 | Bot Vercel preview lookup | 2 | 4, 5 | pending |
| 11 | Bot production deploy & rollback | 2 | 5 | pending |
| 12 | Landing page renderer, routing, variants & expiry | 3 | 1, 2, 3, 6, 7 | pending |
| 13 | Manual pilot config at /manual-v2 | 4 | 8, 12 | pending |
| 14 | new-landing-page skill & template | 4 | 2, 12 | pending |
| 15 | Switch /manual to the config page | 5 | 13 | pending |
| 16 | Bot Claude runner & git branch flow | 5 | 5, 9, 10, 14 | pending |
| 17 | VPS install & end-to-end pipeline test | 6 | 11, 15, 16 | pending |

## Execution phases

- **Phase 1 (parallel):** task-1, task-2, task-3, task-4, task-5
- **Phase 2 (parallel):** task-6, task-7, task-8, task-9, task-10, task-11
- **Phase 3:** task-12
- **Phase 4 (parallel):** task-13, task-14
- **Phase 5 (parallel):** task-15, task-16
- **Phase 6:** task-17
