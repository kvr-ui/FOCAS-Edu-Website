---
task: 8
name: meta-html-generation
parallel_group: 2
depends_on: [2]
issue: 9
---

# Task 8: Per-page meta HTML generation at build

## What to build

`scripts/gen-landing-meta.mjs`, run after the Vite build: change the `build` script in package.json to `vite build && node scripts/gen-landing-meta.mjs`.

The script reads the build output directory from `--outDir <dir>` (default `dist`) so the bot's production deploy can build into `dist-new` (task 11).

The script:
1. Validates all `src/landing-pages/*.js` configs (skipping `_*`) with task 2's `validateConfig`; any error prints readable messages and exits non-zero, failing the build.
2. For each config writes `dist/<slug>/index.html` and `dist/<slug>-success/index.html`, each a copy of `dist/index.html` with `<title>`, `meta name="description"`, `og:title`, `og:description`, `og:image`, `og:url`, and `twitter:card` set (replacing existing tags or inserting them). Content comes from `meta.title`, `meta.description`, `meta.ogImage`.
3. `og:image` and `og:url` are absolute using `SITE_URL` (env, default `https://focasedu.com`, the domain used elsewhere in the repo). `og:url` is `<SITE_URL>/<slug>` (success page: `/<slug>-success`).
4. The success page additionally gets `<meta name="robots" content="noindex">`.
5. Values are HTML-escaped. The same JS/CSS asset tags from `dist/index.html` are preserved so the SPA boots normally.

Add a README section explaining this step and stating that nginx must use `try_files $uri $uri/ /index.html;` for `/<slug>` to serve the generated file (and fall through to the SPA for everything else).

Does NOT change runtime rendering (task 12).

## Acceptance criteria

- [ ] After `npm run build` with a sample config, `dist/<slug>/index.html` contains the og/twitter tags and the same JS/CSS asset tags as `dist/index.html`; `dist/<slug>-success/index.html` also has noindex.
- [ ] `npm run build` fails (non-zero exit, readable errors) on an invalid config.
- [ ] With no configs present the script succeeds and writes nothing.
- [ ] `SITE_URL` overrides the default domain.
- [ ] `vite build --outDir dist-new && node scripts/gen-landing-meta.mjs --outDir dist-new` writes into `dist-new/`.
- [ ] `npx vite preview` serves `/<slug>` correctly (page loads in the browser).
- [ ] README section added.

## Commit convention

Your commit message MUST include `Closes #9` so the task's GitHub issue closes when the commit lands on the default branch.
