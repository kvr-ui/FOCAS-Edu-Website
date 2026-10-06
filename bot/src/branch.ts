/**
 * Git branch flow for `/newpage` and `/edit` — STUB. Implemented by task 16 (issue #17).
 *
 * Contract (task 16): in REPO_DIR, check out / create `lp/<slug>`, run image intake,
 * run Claude, guard that only `src/landing-pages/**` and `public/lp/**` changed, commit,
 * push, and look up the Vercel preview. Expected failures are returned, not thrown.
 *
 * The stub only walks the service interfaces so the bot is usable end-to-end
 * before the real implementations land: no git, no Claude, no Vercel.
 */
import { intakeImages } from "./images.js";
import { runClaude } from "./claude.js";
import { getPreviewUrl } from "./vercel.js";
import type { PageJob, ServiceEnv } from "./types.js";

export type BranchFlowResult =
  | {
      ok: true;
      branch: string;
      commitSha?: string;
      /** Base preview deployment URL (no path), if the preview is ready. */
      previewUrl?: string;
      /** Ready-to-send links: page, `-success`, and `?v=` variants. */
      links: string[];
      /** Short human summary of what changed. */
      summary: string;
      couldntDo: string[];
      /** If non-empty, Claude asked questions instead of producing a page. */
      questions: string[];
      claudeSessionId?: string;
    }
  | { ok: false; error: string; claudeSessionId?: string };

export type BranchFlow = (slug: string, job: PageJob, env: ServiceEnv) => Promise<BranchFlowResult>;

export const branchFlow: BranchFlow = async (slug, job, env) => {
  const branch = `lp/${slug}`;
  await env.report("Collecting images");
  const images = await intakeImages(job.ctx, slug, env);
  await env.report("Running Claude (stub)");
  const claude = await runClaude(
    [job.text, images.captionText].filter(Boolean).join("\n\n"),
    { resumeSessionId: job.resumeSessionId },
    env,
  );
  if (!claude.ok) return { ok: false, error: claude.error, claudeSessionId: claude.sessionId };
  await env.report("Looking up preview (stub)");
  const preview = await getPreviewUrl("0000000", branch, env);
  return {
    ok: true,
    branch,
    previewUrl: preview.status === "ready" ? preview.url : undefined,
    links: [],
    summary: "(stub) No page was generated: Claude, git and Vercel are not wired up yet (task 16).",
    couldntDo: claude.couldntDo,
    questions: claude.questions,
    claudeSessionId: claude.sessionId,
  };
};
