---
task: 16
name: bot-claude-runner-git
parallel_group: 5
depends_on: [5, 9, 10, 14]
issue: 17
---

# Task 16: Bot Claude runner & git branch flow

## What to build

Replace the `runClaude` and `branchFlow` stubs in `bot/` so `/newpage` and `/edit` author landing-page configs and push a preview branch.

**`branchFlow(slug, job)`** in `REPO_DIR`:
1. `git fetch`. New page: `git checkout -B lp/<slug> origin/main`. Edit: check out the existing `lp/<slug>` and rebase on `origin/main`.
2. Run image intake (task 9) for uploaded photos.
3. Call `runClaude`.
4. Guard: if `git status --porcelain` shows any path outside `src/landing-pages/**` and `public/lp/**`, run `git reset --hard` + `git clean -fd`, report the offending paths, and abort without pushing.
5. Commit "lp: <slug> — <short summary>", push, call `getPreviewUrl` (task 10), and reply with the preview link, the `/<slug>-success` and variant (`?v=`) links, plus Claude's "Couldn't do" list and any questions.

**`runClaude(prompt, {resumeSessionId})`** uses `@anthropic-ai/claude-agent-sdk` `query()`:
- cwd `REPO_DIR`, `settingSources: ["project"]` so the committed `.claude/skills/new-landing-page` skill loads, model `claude-sonnet-5-5`, allowedTools Read/Glob/Grep/Write/Edit/Bash.
- `canUseTool` callback denies Write/Edit outside `src/landing-pages/**` and `public/lp/**`, and any Bash other than `node scripts/validate-landing.mjs …` and `npm run build`.
- `maxTurns` and a USD cost cap per job (configurable via env); abort and report if exceeded.
- Prompt: "Use the new-landing-page skill" + the brief + the uploaded image paths (or the edit instruction).
- Store the session id per slug in the state store so `/edit` resumes the same conversation.
- If validation or build fails, nothing is pushed and the error tail is sent to Telegram.
- If Claude returns questions instead of a page, relay them and treat the user's next reply as a continuation of the same session.

Does NOT deploy to production, merge to main, or handle `ok`/rollback. That is task 11.

## Acceptance criteria

- [ ] Integration test on a throwaway repo clone: `/newpage` with a sample brief pushes `lp/<slug>` containing changes only under allowed paths, and the reply has preview, success and variant links.
- [ ] A forced out-of-bounds write is denied by `canUseTool`, or caught by the porcelain guard, which resets, cleans and aborts without pushing.
- [ ] Disallowed Bash commands are denied; the two allowed commands work.
- [ ] `/edit` resumes the stored session, modifies the same config, and produces a new preview.
- [ ] A questions-instead-of-page response is relayed and the user's reply continues the same session.
- [ ] Failed validation/build pushes nothing and sends the error tail.
- [ ] Turn and cost caps stop a runaway job with a message.
- [ ] "Couldn't do" items from Claude appear in the Telegram reply.

## Commit convention

Your commit message MUST include `Closes #17` so the task's GitHub issue closes when the commit lands on the default branch.
