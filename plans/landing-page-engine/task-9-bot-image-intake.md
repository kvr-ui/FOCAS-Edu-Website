---
task: 9
name: bot-image-intake
parallel_group: 2
depends_on: [5]
issue: 10
---

# Task 9: Bot image intake

## What to build

Implement `intakeImages(ctx, slug)` in the bot (`bot/`, interface stubbed in task 5). It collects photos and image documents sent with or after `/newpage` in the same chat before the job starts, including albums (media groups), and also images sent later with `/edit`.

For each image: download via the Telegram file API, convert with `sharp` to webp (max 1600px wide, never upscale, quality ~80), keep the original file-name stem slugified (photos without a name become `img-1.webp`, `img-2.webp`, ...; avoid collisions), and save to `<REPO_DIR>/public/lp/<slug>/`. Return the list of saved paths (as `/lp/<slug>/<file>.webp`) with width/height so the Claude prompt can reference them. Reject files over 20MB or non-images with a clear message to the user, without failing the rest. A caption on a photo is returned as extra brief text and treated as part of the brief.

Does NOT run Claude or git — that is task 16.

## Acceptance criteria

- [ ] An album of 3 photos produces 3 webp files in `public/lp/<slug>/` and 3 returned entries with dimensions.
- [ ] Output is webp, max 1600px wide, filename stems slugified; unnamed photos become `img-N.webp`.
- [ ] Files over 20MB and non-image documents are rejected with a message; valid ones in the same batch still succeed.
- [ ] Photo caption text is included in the brief returned to the caller.
- [ ] Images sent with `/edit` are saved under the same slug folder without overwriting existing files.
- [ ] Tests with fixture images (Telegram file download mocked) cover the above.

## Commit convention

Your commit message MUST include `Closes #10` so the task's GitHub issue closes when the commit lands on the default branch.
