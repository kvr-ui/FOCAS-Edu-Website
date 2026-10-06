# FOCAS landing-page bot

A Telegram bot (grammY, long polling) that lets the team turn an ad brief into a landing
page: it runs Claude in its own checkout of this repo, pushes an `lp/<slug>` branch, replies
with the Vercel preview, and, after the owner's `ok`, deploys the page to the production VPS.

This folder is its own Node package. It is not part of the website build, and the root
eslint and vitest configs ignore it.

> Status: scaffold (task 5). Access control, commands, queue, state and progress messages
> work. Image intake (task 9), Vercel previews (task 10), deploy/rollback (task 11) and
> Claude + git (task 16) are still stubs that reply with "not implemented yet" messages.

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
| `ANTHROPIC_API_KEY` | yes | Used by the Claude runner (task 16). |
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
npm test           # vitest: access control, queue, router, state, config, startup
npm run typecheck
```

The tests drive the real router with fake Telegram updates and record outgoing API calls,
so they need no token and no network.

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
| `images.ts` | **Stub**: `intakeImages`, `imageMiddleware` (task 9). |
| `vercel.ts` | **Stub**: `getPreviewUrl` (task 10). |
| `deploy.ts` | **Stub**: `deployToProd`, `rollback` (task 11). |
| `claude.ts` | **Stub**: `runClaude` (task 16). |
| `branch.ts` | **Stub**: `branchFlow` (task 16), which calls the image, Claude and Vercel services. |

Each stub exports a typed function signature (`IntakeImages`, `GetPreviewUrl`,
`DeployToProd`, `Rollback`, `RunClaude`, `BranchFlow`) and its result types. To replace a
stub, change the implementation in that one file and keep the signature. The router doesn't
need to change.
