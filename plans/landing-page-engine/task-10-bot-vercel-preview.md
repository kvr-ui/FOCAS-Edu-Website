---
task: 10
name: bot-vercel-preview
parallel_group: 2
depends_on: [4, 5]
issue: 11
---

# Task 10: Bot Vercel preview lookup

## What to build

Implement `getPreviewUrl(commitSha, branch)` in the bot (`bot/`, interface stubbed in task 5), using env `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` and optional `VERCEL_TEAM_ID` (sent as `teamId`).

- Poll the Vercel REST API `GET /v6/deployments` filtered by `projectId` and matching `meta.githubCommitSha` to the commit, every ~5s for up to ~5 minutes, until state is `READY`. Return the deployment URL, preferring the branch alias URL if present.
- On `ERROR`/`CANCELED`, fetch the deployment events (build log) and return the log tail so the bot can show it.
- On timeout, return a clear message (still building / not found, with the inspector link if known).
- Return a discriminated result (ready / error / timeout), not thrown exceptions, for expected outcomes. Poll interval and timeout are injectable for tests.
- Provide a helper that builds the URLs the bot sends: `https://<preview>/<slug>`, the `/<slug>-success` URL, and each `/<slug>?v=<variant>` URL.

Does NOT push branches — that is task 16. Requires the Vercel project configured in task 4.

## Acceptance criteria

- [ ] Unit tests with mocked `fetch` cover READY (including alias preference), ERROR (log tail returned), and timeout, with fake timers.
- [ ] Deployment not yet created on first polls is retried rather than treated as failure; auth failures give a clear error.
- [ ] URL helper returns page, `-success` and variant URLs.
- [ ] Manual test against a real pushed branch returns a working URL.

## Commit convention

Your commit message MUST include `Closes #11` so the task's GitHub issue closes when the commit lands on the default branch.
