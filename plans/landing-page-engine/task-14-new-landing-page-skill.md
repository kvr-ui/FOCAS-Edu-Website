---
task: 14
name: new-landing-page-skill
parallel_group: 4
depends_on: [2, 12]
issue: 15
---

# Task 14: new-landing-page skill & template

## What to build

**(a)** `src/landing-pages/_template.js`: a fully commented reference config listing every block type with all props (generated from the blocks' JSDoc), every form field, all three submit kinds, expiry and variants.

**(b)** Project skill `.claude/skills/new-landing-page/SKILL.md`, committed (the Telegram bot on the VPS loads it from the repo checkout). Input: a free-text ad brief plus image file names already placed in `public/lp/<slug>/`. Steps:

1. Derive the slug.
2. List missing essentials (price/submit kind, lead source name, dates, success message) and ask for them.
3. Write `src/landing-pages/<slug>.js` using ONLY existing block types. Never JSX/React and never the `custom` block. If the brief needs something no block supports, build the closest version and report it in a final "Couldn't do" list.
4. Run `node scripts/validate-landing.mjs <slug>` and fix until clean, then `npm run build`.
5. For edit requests, modify the existing config minimally.

Final output format (machine-friendly for the bot): slug, page path, success path, variant paths, "Couldn't do" list, questions (if any).

The skill only writes inside `src/landing-pages/` and `public/lp/`.

Does NOT build the bot — that is task 16.

## Acceptance criteria

- [ ] `_template.js` covers every block type, field, submit kind, expiry and variants, and passes the validator
- [ ] Running the skill in Claude Code locally with a sample brief produces a config that validates, builds and renders
- [ ] A brief requesting an unsupported section yields a "Couldn't do" entry, not code
- [ ] An edit request changes only the relevant parts of an existing config
- [ ] Output follows the specified format; no files outside `src/landing-pages/` and `public/lp/` are written

## Commit convention

Your commit message MUST include `Closes #15` so the task's GitHub issue closes when the commit lands on the default branch.
