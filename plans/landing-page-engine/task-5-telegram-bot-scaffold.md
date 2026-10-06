---
task: 5
name: telegram-bot-scaffold
parallel_group: 1
depends_on: []
issue: 6
---

# Task 5: Telegram bot scaffold & access control

## What to build

Scaffold a new `bot/` folder at the repo root: its own `package.json` and `tsconfig`, TypeScript, Node 20+, grammY with long polling. It runs on the production VPS under pm2/systemd and operates on a separate git checkout whose path is env `REPO_DIR`. Provide `bot/.env.example` (committed; `bot/.env` gitignored) with: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_IDS`, `TELEGRAM_OWNER_ID`, `ANTHROPIC_API_KEY`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` (optional), `REPO_DIR`, `WEB_ROOT` (e.g. `/var/www/focas`), `SITE_URL`.

Modules under `bot/src/`:
- `index.ts` — starts the grammY bot.
- `config.ts` — loads and validates env, fails fast with a clear message.
- `access.ts` — silently ignore anyone not in `TELEGRAM_ALLOWED_IDS` (no reply at all); `isOwner` checks `TELEGRAM_OWNER_ID`.
- Command router with stubs: `/newpage <brief>`, `/edit <slug> <instruction>` (a reply to a bot preview message also means edit of that slug), `ok` and `/deploy <slug>` (owner only; non-owner gets "Only <owner> can deploy"), `/rollback` (owner only), `/list` (pages in `src/landing-pages` of `REPO_DIR`), `/help`.
- `queue.ts` — single-concurrency job queue (one shared git checkout); waiting users get "You're #N in queue".
- `state.ts` — per-chat JSON-file store mapping slug to `{branch, lastPreviewUrl, claudeSessionId, lastMessageId}`.
- Progress helper that sends one status message and edits it as a job advances.

Stubs call interfaces that later tasks implement: `intakeImages` (task 9), `getPreviewUrl` (task 10), `deployToProd` / `rollback` (task 11), `runClaude` / `branchFlow` (task 16). Define these as typed interfaces with placeholder implementations.

Add `bot/README.md` with install, env, run (`npm run dev`, build/start) instructions.

Does NOT implement Claude, git, Vercel, deploy, or image handling — those are tasks 16, 10, 11 and 9.

## Acceptance criteria

- [ ] `npm run dev` in `bot/` starts the bot; missing/invalid env exits with a clear error.
- [ ] An allowed user gets replies from every command stub; an unknown user gets no reply.
- [ ] `ok` / `/deploy` / `/rollback` from a non-owner is refused with "Only <owner> can deploy"-style message; owner reaches the stub.
- [ ] Two concurrent `/newpage` requests run one after another; the second user sees "You're #N in queue".
- [ ] Replying to a bot preview message routes to `/edit` for that slug.
- [ ] Unit tests cover access control and the queue; `bot/.env` is gitignored and `bot/.env.example` committed.

## Commit convention

Your commit message MUST include `Closes #6` so the task's GitHub issue closes when the commit lands on the default branch.
