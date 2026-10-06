# FOCAS landing-page bot

A Telegram bot (grammY, long polling) that lets the team turn an ad brief into a landing
page: it runs Claude in its own checkout of this repo, pushes an `lp/<slug>` branch, replies
with the Vercel preview, and, after the owner's `ok`, deploys the page to the production VPS.

This folder is its own Node package. It is not part of the website build, and the root
eslint and vitest configs ignore it.

> Status: all services are implemented: access control, queue, state and progress messages,
> image intake, Claude + git branch flow, Vercel previews, and production deploy/rollback.
> The automated tests use fakes (Telegram, Claude Agent SDK, Vercel, a throwaway git remote);
> a live end-to-end run with real Telegram/Anthropic/Vercel is task 18.

## Requirements

- Node.js 20 or newer, and npm
- A bot token from [@BotFather](https://t.me/BotFather)
- A **separate** git checkout of this repo for the bot to work in (`REPO_DIR`). Don't use
  the checkout the bot itself runs from.

## Install

```sh
cd bot
npm ci            # or: npm install
cp .env.example .env
# then edit .env
```

## Environment (`bot/.env`)

`bot/.env` is gitignored. `bot/.env.example` is the committed template. The bot checks the
values at startup. If any are missing or invalid, it prints every problem and exits with
code 1.

| Variable | Required | Meaning |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | yes | Token from @BotFather. |
| `TELEGRAM_ALLOWED_IDS` | yes | Comma-separated Telegram user IDs that may use the bot. Anyone else gets **no reply at all**. |
| `TELEGRAM_OWNER_ID` | yes | The only user who can `ok` / `/deploy` / `/rollback`. Always allowed, even if not listed above. |
| `TELEGRAM_OWNER_NAME` | no | Name used in refusals ("Only Sandy can deploy."). Default: "the owner". |
| `ANTHROPIC_API_KEY` | yes | API key for the Claude Agent SDK (passed to the Claude Code process the bot starts). |
| `CLAUDE_MODEL` | no | Model for page jobs. Default: `claude-sonnet-5-5`. |
| `CLAUDE_MAX_TURNS` | no | Max agent turns per job (whole number). Default: `40`. A job that hits it is stopped and reported; nothing is pushed. |
| `CLAUDE_MAX_COST_USD` | no | Max estimated spend per job in USD. Default: `2`. Same handling as the turn cap. |
| `CLAUDE_TIMEOUT_MINUTES` | no | Wall-clock limit per Claude run. Default: `20`. |
| `VERCEL_TOKEN` | yes | Vercel API token for preview lookups (task 10). |
| `VERCEL_PROJECT_ID` | yes | Vercel project of this site. |
| `VERCEL_TEAM_ID` | no | Only when the project belongs to a Vercel team. |
| `REPO_DIR` | yes | Absolute path of the bot's own checkout of this repo. It must already exist. |
| `WEB_ROOT` | yes | Absolute path of the nginx web root, e.g. `/var/www/focas`. |
| `SITE_URL` | yes | Public site origin, e.g. `https://focasedu.com`. |
| `BOT_STATE_DIR` | no | Where the JSON state is kept. Default: `bot/data` (gitignored). |

To find someone's Telegram user ID, have them message [@userinfobot](https://t.me/userinfobot).
To add a team member, append their ID to `TELEGRAM_ALLOWED_IDS` and restart the bot.

## Run

```sh
npm run dev        # run from source with tsx (exits on bad config)
npm run dev:watch  # same, restarting on file changes

npm run build      # compile TypeScript to dist/
npm start          # run the compiled bot: node dist/index.js
```

On the VPS, run `npm run build` and then keep `npm start` (or `node dist/index.js`, with the
working directory set to `bot/`) alive under pm2 or systemd. The service definition is added
in task 17.

## Test

```sh
npm test           # vitest: router, queue, state, config, images, Claude runner, tool policy,
                   # branch flow, Vercel, deploy
npm run typecheck
```

The tests drive the real router with fake Telegram updates and record outgoing API calls,
so they need no token and no network. Claude is replaced by a fake `query()`
(`test/fake-sdk.ts`) that sends its tool calls through the bot's real `canUseTool` callback
and `PreToolUse` hook, and the git tests run against a throwaway clone with a bare temp
"origin". No `ANTHROPIC_API_KEY` is needed for the tests.

## Commands

| Command | Who | What |
| --- | --- | --- |
| `/newpage <brief>` | team | Create a page from an ad brief. Photos can go with the message or follow it. |
| `/edit <slug> <instruction>` | team | Change an existing page. **Replying to a preview message** does the same for that page. |
| `ok` | owner | Deploy the page just previewed in this chat, or the one whose preview you reply to. |
| `/deploy <slug>` | owner | Deploy a specific page. |
| `/rollback` | owner | Restore the previous live build. |
| `/list` | team | Pages in `REPO_DIR/src/landing-pages` and the previews made in this chat. |
| `/help` | team | Usage. |

When a team member who isn't the owner sends `ok`, `/deploy` or `/rollback`, the bot replies
"Only <owner> can deploy." (or "roll back").

The bot works on one shared checkout, so jobs (new page, edit, deploy, rollback) run one at a
time. Each job sends one status message and edits it as the job advances. If another job is
running, the status message says "You're #N in queue".

In group chats, Telegram's default privacy mode only delivers commands and replies to the
bot's own messages. Replying `ok` to a preview works. A bare `ok` that isn't a reply only
works in a private chat, or after you turn off privacy mode in @BotFather (`/setprivacy`).

## Creating and editing pages

`/newpage <brief>` and `/edit <slug> <instruction>` (or a reply to a preview) run one job on the
queue. In `REPO_DIR`:

1. The checkout is cleaned first (`git reset --hard`, `git clean -fd`, aborting a leftover
   rebase/merge), so `REPO_DIR` must be the bot's own checkout. Then `git fetch`.
   New page: `git checkout -B lp/<slug> origin/main` (refused if `origin/lp/<slug>` already
   exists). Edit: check out `lp/<slug>` and rebase it on `origin/main`; a rebase conflict
   stops the job without changes.
2. Photos sent with the command are saved to `public/lp/<slug>/` (image intake).
3. Claude runs through the Claude Agent SDK with `cwd` = `REPO_DIR`,
   `settingSources: ["project"]` (so the committed `.claude/skills/new-landing-page` skill
   loads), the model from `CLAUDE_MODEL`, the turn/cost/time caps above, and only the tools
   Read, Glob, Grep, Write, Edit, Bash and Skill. Nothing is pre-approved: every call is
   checked by `canUseTool` **and** by a `PreToolUse` hook (hooks run before settings
   allow-rules, so a permissive `.claude/settings.json` in the repo cannot bypass them):
   - Write/Edit: only `src/landing-pages/<slug>.js` and files under `public/lp/<slug>/`
     (paths resolved through `..` and symlinks; no dotfiles or `.html`/`.js`/`.svg` under
     `public/lp`). The config must stay a plain data module (no `import`, `require`,
     `eval`, `process.*`).
   - Bash: exactly `node scripts/validate-landing.mjs [<slug>]` or `npm run build`. Anything
     chained, piped, substituted, redirected or env-prefixed is denied.
   - Read/Glob/Grep: inside `REPO_DIR` only, not `.env*` or `.git/`. Skill: only
     `new-landing-page`. Other tools are not available.
   The Claude session id is stored per page, so `/edit` and replies resume the same
   conversation (if the stored session is gone, a new one is started and the reply says so).
4. Guard: if `git status --porcelain` shows any path other than the page's own files, the
   bot runs `git reset --hard` + `git clean -fd`, lists the paths, and pushes nothing.
5. If Claude asks questions instead of writing the page, they are sent to Telegram. Reply to
   that message (or, in a private chat, just send the next message) and the answer continues
   the same Claude session. Uploaded images are kept in a local, unpushed commit meanwhile.
6. The bot runs `node scripts/validate-landing.mjs <slug>` and `npm run build` itself
   (`npm ci` first if `node_modules` is missing or older than `package-lock.json`). On
   failure nothing is pushed and the last lines of the output are sent. Reply to that message
   to ask Claude to fix it in the same session.
7. Commit `lp: <slug> — <short summary>` (only the page's files are staged), push with
   `--force-with-lease` (the branch is rebased), wait for the Vercel preview of that commit
   and reply with the page, `/<slug>-success` and `?v=<variant>` links, plus Claude's
   "Couldn't do" list and any blocked tool calls.

Nothing in this flow touches `main` or production; that is `ok` / `/deploy` below. The bot
user needs push access to `origin` for `lp/*` branches.

## Production deploy and rollback

`ok` / `/deploy <slug>` (owner only, on the job queue) runs, in `REPO_DIR`:

1. `git fetch`, check out `main` (fast-forwarded to `origin/main`), merge `origin/lp/<slug>`
   (fast-forward, else a merge commit `lp: deploy <slug>`). On a conflict the merge is aborted
   and nothing else happens.
2. `git push origin main`.
3. `npm ci`, only if `package-lock.json` changed in the merge (or `node_modules` is missing),
   then the build into `dist-new/`:
   `npx --no-install vite build --outDir dist-new --emptyOutDir && node scripts/gen-landing-meta.mjs --outDir dist-new`
   (override with `DEPLOY_BUILD_CMD`; `SITE_URL` is passed to it). A failed build sends the
   last lines of its output and leaves the live site alone.
4. Swap: `dist-new` is moved to `${WEB_ROOT}-new` (next to `WEB_ROOT`, so the renames are on
   one filesystem), then `${WEB_ROOT}-prev` is removed, `WEB_ROOT` becomes `${WEB_ROOT}-prev`
   and `${WEB_ROOT}-new` becomes `WEB_ROOT`.
5. Verify: `GET SITE_URL/<slug>` must return 200 with an `og:title` equal to the page
   config's `meta.title`. Otherwise the previous build is restored automatically (the failed
   one is kept in `${WEB_ROOT}-failed` for inspection) and the failure is reported.

`/rollback` swaps `WEB_ROOT` and `${WEB_ROOT}-prev` (running it again undoes it) and reports
the commit now live, read from the `.deploy.json` the bot writes into every build. Without a
`${WEB_ROOT}-prev` it refuses. Every deploy, rollback and auto-rollback is appended to
`<BOT_STATE_DIR>/deploy-history.json` as `{slug, commit, time, by, action}`.

The bot user needs write access to the parent directory of `WEB_ROOT`, push access to
`origin`, and a git identity in `REPO_DIR` (if none is set, merge commits are authored as
"FOCAS LP Bot").

## Code layout (`src/`)

| File | Role |
| --- | --- |
| `index.ts` | Entry point: loads `.env`, validates config, starts long polling. |
| `config.ts` | `loadConfig(env)`: validation that fails fast with every problem listed. |
| `access.ts` | Allowlist guard (silently drops unknown users) and `isOwner`. |
| `router.ts` | `createBot({ config, deps })`: command routing and wiring. Services are injected through `deps`. |
| `queue.ts` | Single-concurrency job queue. |
| `state.ts` | Per-chat JSON store (`slug -> {branch, lastPreviewUrl, claudeSessionId, lastMessageId}`) plus deploy history. |
| `progress.ts` | One status message per job, edited as it advances. |
| `pages.ts`, `slug.ts` | Listing pages in `REPO_DIR`, deriving and validating slugs. |
| `types.ts` | `ServiceEnv` (config, state, `report()`) and `PageJob`, shared by the services. |
| `images.ts` | `intakeImages`, `imageMiddleware`: photos to `public/lp/<slug>/*.webp`. |
| `vercel.ts` | `getPreviewUrl` (polls Vercel for the commit's preview) and preview link helpers. |
| `deploy.ts` | `deployToProd` (merge `lp/<slug>` into main, push, build, swap into `WEB_ROOT`, verify, auto-rollback) and `rollback`. |
| `claude.ts` | `runClaude` (Claude Agent SDK `query()`, caps, session resume) and `parseSkillOutput`. `createClaudeRunner({ query })` takes a fake SDK in tests. |
| `policy.ts` | The per-job tool policy: `canUseTool`, the `PreToolUse` hook, the Bash allowlist and the allowed-path rule used by the porcelain guard. |
| `branch.ts` | `branchFlow`: git checkout/rebase, image intake, Claude, guard, validate/build, commit, push, preview links. `createBranchFlow(deps)` swaps the services in tests. |
| `proc.ts` | Child-process helpers (run, shell, output tail) shared by `branch.ts` and `deploy.ts`. |

Each service exports a typed function signature (`IntakeImages`, `GetPreviewUrl`,
`DeployToProd`, `Rollback`, `RunClaude`, `BranchFlow`) and its result types, and the router
receives them through `deps`, so tests can replace any of them.
