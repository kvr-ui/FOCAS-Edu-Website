---
task: 11
name: bot-deploy-rollback
parallel_group: 2
depends_on: [5]
issue: 12
---

# Task 11: Bot production deploy & rollback

## What to build

Replace the `deployToProd` and `rollback` stubs in `bot/` (scaffolded by task 5) with real implementations. The bot runs on the production VPS, in a separate git checkout at env `REPO_DIR`; env vars used: `REPO_DIR`, `WEB_ROOT`, `SITE_URL`. Deploys run through the existing single-concurrency job queue.

**`deployToProd(slug, by)`**
1. In `REPO_DIR`: `git fetch`, checkout `main`, merge `origin/lp/<slug>` (fast-forward, else a merge commit "lp: deploy <slug>"). On conflict, `git merge --abort`, reply with a clear message, and stop; nothing is built or swapped.
2. Push `main`.
3. Run `npm ci` only if `package-lock.json` changed in the merge, then build to `dist-new` (`vite build --outDir dist-new`, with the per-page meta script from task 8 pointed at that directory, or build then move). A failed build stops the deploy with the error tail sent to Telegram; the live site is untouched.
4. Atomic swap (same filesystem as `WEB_ROOT`): remove `${WEB_ROOT}-prev`, `mv WEB_ROOT → ${WEB_ROOT}-prev`, `mv dist-new → WEB_ROOT`.
5. Verify: `curl SITE_URL/<slug>` returns 200 and the body contains the page's `og:title` (read from the page config's `meta.title`). If not, automatically roll back (see below) and report the failure.
6. Report success with the live URL, the `-success` URL, and the commit.

**`rollback()`** swaps `WEB_ROOT` and `${WEB_ROOT}-prev` back and reports which commit is now live. Refuses with a message if no previous build exists.

**Deploy history:** append `{slug, commit, time, by, action}` (deploy / rollback / auto-rollback) to the bot's state file; rollback records which commit became live.

Only the owner (owner Telegram ID from task 5 access control) can trigger `ok`/deploy or `/rollback`; allowlisted non-owners get a refusal message.

Does NOT run Claude, create branches, or build previews. Those are tasks 16 and 10.

## Acceptance criteria

- [ ] `deployToProd` merges `origin/lp/<slug>` into main, pushes, builds, swaps, verifies, and records history, tested against a temp `WEB_ROOT` directory and a throwaway repo.
- [ ] A merge conflict aborts cleanly with a message; main, `WEB_ROOT` unchanged.
- [ ] A failed build leaves the live `WEB_ROOT` untouched and sends the error tail.
- [ ] A failed verification (non-200 or missing og:title) automatically rolls back and reports it.
- [ ] `npm ci` runs only when `package-lock.json` changed.
- [ ] `/rollback` restores the previous build and reports the live commit; with no previous build it replies with a refusal message.
- [ ] A non-owner (including allowlisted members) cannot trigger deploy or rollback.
- [ ] Deploy history entries are persisted in the state file.

## Commit convention

Your commit message MUST include `Closes #12` so the task's GitHub issue closes when the commit lands on the default branch.
