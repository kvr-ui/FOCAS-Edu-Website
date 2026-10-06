---
task: 17
name: vps-install-e2e
parallel_group: 6
depends_on: [11, 15, 16]
issue: 18
---

# Task 17: VPS install & end-to-end pipeline test

## What to build

Install the bot on the production VPS, document the setup, then run and record the full end-to-end check.

**Install**
- Create the `REPO_DIR` checkout with a GitHub deploy key that has push access.
- Create `bot/.env` from `.env.example` (TELEGRAM_*, ANTHROPIC_API_KEY, VERCEL_*, REPO_DIR, WEB_ROOT, SITE_URL).
- Commit `bot/deploy/focas-lp-bot.service` (or a pm2 config) with restart on failure and logged output; enable it.
- Ensure the bot user can write `WEB_ROOT` and its parent (for the atomic swap and `-prev` copy).
- Confirm nginx has `try_files $uri $uri/ /index.html;`.
- Document all of this in `bot/README.md`, including how to add a team member to the allowlist and how to rotate keys (Telegram token, Anthropic, Vercel, deploy key).

**End-to-end check** (record each result in the issue with screenshots/links):
1. Allowed non-owner runs `/newpage` with a sample brief + 2 photos; the preview link opens on Vercel (Razorpay test key).
2. `/edit` changes the hero; a new preview is produced.
3. Non-owner `ok` is refused.
4. Owner `ok`: page is live on `SITE_URL/<slug>` with `/<slug>-success` working, and the og preview is correct in the Meta Sharing Debugger.
5. A test lead creates a trackLead row in the follow-up dashboard with UTMs.
6. `/rollback` restores the previous build.
7. An unknown Telegram ID is ignored.
8. A brief requesting an unsupported section yields a "Couldn't do" reply and no code.
9. Existing routes `/rti`, `/fs`, `/career-guidance`, `/manual` still work in prod.

Does NOT add new bot features; fixes found here go back to the owning task's code as small follow-ups.

## Acceptance criteria

- [ ] Bot runs under the committed service/pm2 definition, survives a forced crash and a reboot, and logs are viewable.
- [ ] `bot/README.md` covers install, env vars, allowlist changes, and key rotation.
- [ ] nginx `try_files` confirmed on the VPS.
- [ ] Every end-to-end step above passes and is ticked off in the issue with evidence (screenshots/links).
- [ ] Existing routes `/rti`, `/fs`, `/career-guidance`, `/manual` verified working after the deploy.
- [ ] Test pages and test leads created during the check are removed or marked as test.

## Commit convention

Your commit message MUST include `Closes #18` so the task's GitHub issue closes when the commit lands on the default branch.
