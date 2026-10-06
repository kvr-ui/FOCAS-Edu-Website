/**
 * Git branch flow for `/newpage` and `/edit` (task 16, issue #17).
 *
 * In REPO_DIR (the bot's own checkout; it is reset/cleaned at the start of every job):
 *  1. `git fetch`; new page: `git checkout -B lp/<slug> origin/main`; edit: check out the
 *     existing `lp/<slug>` (local pending commits win if they contain origin's) and rebase
 *     it on `origin/main`.
 *  2. Image intake into `public/lp/<slug>/`.
 *  3. Claude (`runClaude`) with the new-landing-page skill.
 *  4. Guard: any change outside `src/landing-pages/<slug>.js` / `public/lp/<slug>/**` →
 *     `git reset --hard` + `git clean -fd`, report the paths, push nothing.
 *  5. Questions instead of a page → relay them (uploaded images are kept in a local,
 *     unpushed commit so the follow-up has them).
 *  6. `node scripts/validate-landing.mjs <slug>` and `npm run build`; on failure reset,
 *     push nothing and return the error tail.
 *  7. Commit "lp: <slug> — <short summary>", push (`--force-with-lease`, because the
 *     branch is rebased), look up the Vercel preview and return the page, `-success` and
 *     `?v=` variant links plus Claude's "Couldn't do" list.
 *
 * Expected failures are returned as `{ ok: false, error }`, not thrown. Never touches main,
 * never deploys (task 11 does that).
 */
import { existsSync, readdirSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { intakeImages as intakeImagesImpl, type IntakeImages, type SavedImage } from "./images.js";
import { runClaude as runClaudeImpl, type RunClaude } from "./claude.js";
import { buildPreviewUrls, getPreviewUrl as getPreviewUrlImpl, type GetPreviewUrl, type PreviewLookupOptions } from "./vercel.js";
import { BOT_DIR } from "./config.js";
import { isAllowedChangePath } from "./policy.js";
import { LANDING_PAGES_DIR } from "./pages.js";
import { gitEnv, run, shell, tail, type RunResult } from "./proc.js";
import { isValidSlug } from "./slug.js";
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

export interface BranchFlowDeps {
  intakeImages?: IntakeImages;
  runClaude?: RunClaude;
  getPreviewUrl?: GetPreviewUrl;
  /** Passed to getPreviewUrl (tests shorten the polling). */
  previewOptions?: PreviewLookupOptions;
  /** Default: `npm run build`. */
  buildCommand?: string;
  /** Default: `npm ci` (only run when node_modules is missing or older than package-lock.json). */
  installCommand?: string;
  /** Limit for install/build/validate commands (default 15 minutes). */
  commandTimeoutMs?: number;
}

const REMOTE = "origin";
const MAIN = "main";
const BOT_IDENTITY = ["-c", "user.name=FOCAS LP Bot", "-c", "user.email=lp-bot@focasedu.invalid"];

/** Expected failure: becomes `{ ok: false, error }`. */
class FlowError extends Error {}

export function createBranchFlow(deps: BranchFlowDeps = {}): BranchFlow {
  const intakeImages = deps.intakeImages ?? intakeImagesImpl;
  const runClaude = deps.runClaude ?? runClaudeImpl;
  const getPreviewUrl = deps.getPreviewUrl ?? getPreviewUrlImpl;
  const timeoutMs = deps.commandTimeoutMs ?? 15 * 60_000;

  return async (slug, job, env) => {
    const { repoDir } = env.config;
    const branch = `lp/${slug}`;
    const configRel = `${LANDING_PAGES_DIR}/${slug}.js`;
    const configFile = path.join(repoDir, configRel);
    let sessionId = job.resumeSessionId;

    if (!isValidSlug(slug)) return { ok: false, error: `"${slug}" is not a valid page slug.` };
    if (!isDir(repoDir)) return { ok: false, error: `REPO_DIR does not exist or is not a directory: ${repoDir}` };
    if (sameDir(repoDir, path.resolve(BOT_DIR, ".."))) {
      // This flow starts with `git reset --hard` + `git clean -fd`: never in a working checkout.
      return { ok: false, error: `REPO_DIR (${repoDir}) is the checkout the bot runs from. Point it at a separate clone.` };
    }

    const git = (args: string[]) => run("git", args, { cwd: repoDir, env: gitEnv(), timeoutMs: 5 * 60_000 });
    const gitOrFail = async (args: string[], what: string): Promise<string> => {
      const r = await git(args);
      if (r.code !== 0) throw new FlowError(`${what} failed:\n${tail(r.output)}`);
      return r.stdout.trim();
    };
    const refSha = async (ref: string): Promise<string | undefined> => {
      const r = await git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
      return r.code === 0 ? r.stdout.trim() : undefined;
    };
    const discardChanges = async () => {
      await git(["reset", "--hard", "--quiet"]);
      await git(["clean", "-fd", "--quiet"]);
    };
    const identity = async () => ((await git(["config", "user.email"])).code === 0 ? [] : BOT_IDENTITY);

    try {
      // 0. Start from a clean tree: abort leftovers of an interrupted job.
      if ((await git(["rev-parse", "--is-inside-work-tree"])).code !== 0) {
        return { ok: false, error: `REPO_DIR is not a git checkout: ${repoDir}` };
      }
      await env.report(`Preparing branch ${branch}`);
      const gitDir = await gitOrFail(["rev-parse", "--absolute-git-dir"], "git rev-parse");
      if (existsSync(path.join(gitDir, "rebase-merge")) || existsSync(path.join(gitDir, "rebase-apply"))) {
        await git(["rebase", "--abort"]);
      }
      if (existsSync(path.join(gitDir, "MERGE_HEAD"))) await git(["merge", "--abort"]);
      await discardChanges();

      // 1. fetch + check out the page branch.
      await gitOrFail(["fetch", "--prune", REMOTE], "git fetch");
      const mainRef = `refs/remotes/${REMOTE}/${MAIN}`;
      if (!(await refSha(mainRef))) throw new FlowError(`${REMOTE}/${MAIN} does not exist.`);
      const remoteSha = await refSha(`refs/remotes/${REMOTE}/${branch}`);
      const localSha = await refSha(`refs/heads/${branch}`);

      if (job.kind === "new") {
        if (remoteSha) {
          return {
            ok: false,
            error: `A branch ${branch} already exists on ${REMOTE}. Use /edit ${slug} <change> to change that page, or send a different brief.`,
          };
        }
        await gitOrFail(["checkout", "--quiet", "-B", branch, mainRef], `git checkout -B ${branch}`);
      } else {
        let start = `${REMOTE}/${MAIN}`;
        if (localSha && (!remoteSha || (await git(["merge-base", "--is-ancestor", remoteSha, localSha])).code === 0)) {
          start = localSha; // local commits not pushed yet (e.g. images kept while Claude asked questions)
        } else if (remoteSha) {
          start = remoteSha;
        }
        await gitOrFail(["checkout", "--quiet", "-B", branch, start], `git checkout ${branch}`);
        const rebase = await git([...(await identity()), "rebase", "--quiet", mainRef]);
        if (rebase.code !== 0) {
          await git(["rebase", "--abort"]);
          throw new FlowError(
            `Could not rebase ${branch} on ${REMOTE}/${MAIN} (conflict). Nothing was changed or pushed.\n${tail(rebase.output, 10)}`,
          );
        }
      }

      // 2. Images.
      await env.report("Collecting images");
      const intake = await intakeImages(job.ctx, slug, env);
      const pageExisted = existsSync(configFile);
      const existingImages = listImages(repoDir, slug, intake.images);

      // 3. Claude.
      await ensureDependencies(repoDir, deps.installCommand, timeoutMs, env);
      await env.report(job.resumeSessionId ? "Running Claude (continuing the earlier session)" : "Running Claude");
      const text = [job.text, intake.captionText].filter(Boolean).join("\n\n");
      const promptInput = { kind: job.kind, slug, text, images: intake.images, existingImages, pageExists: pageExisted };
      const claude = await runClaude(
        buildPrompt({ ...promptInput, resume: Boolean(job.resumeSessionId) }),
        {
          slug,
          resumeSessionId: job.resumeSessionId,
          freshPrompt: job.resumeSessionId ? buildPrompt({ ...promptInput, resume: false }) : undefined,
        },
        env,
      );
      if (claude.sessionId) sessionId = claude.sessionId;
      if (!claude.ok) {
        await discardChanges();
        const denied = claude.denials?.length ? `\n\nDenied tool calls:\n${claude.denials.slice(0, 5).map((d) => `- ${d}`).join("\n")}` : "";
        return { ok: false, error: `${claude.error} Nothing was pushed.${denied}`, claudeSessionId: sessionId };
      }

      // 4. Guard: only the page's own files may have changed.
      await env.report("Checking changed files");
      const offending = (await changedPaths(git)).filter((p) => !isAllowedChangePath(p, slug));
      if (offending.length) {
        await discardChanges();
        return {
          ok: false,
          error:
            `Claude changed files outside src/landing-pages/${slug}.js and public/lp/${slug}/, so all changes were ` +
            `discarded and nothing was pushed:\n${offending.slice(0, 20).map((p) => `- ${p}`).join("\n")}`,
          claudeSessionId: sessionId,
        };
      }

      // 5. Questions instead of a page.
      if (claude.questions.length) {
        const pending = await changedPaths(git);
        if (pending.length) {
          await gitOrFail(["add", "-A", "--", ...pending], "git add");
          await gitOrFail(
            [...(await identity()), "commit", "--quiet", "--no-verify", "-m", `lp: ${slug} — files pending answers (not pushed)`],
            "git commit",
          );
        }
        return {
          ok: true,
          branch,
          links: [],
          summary: claude.summary,
          couldntDo: claude.couldntDo,
          questions: claude.questions,
          claudeSessionId: sessionId,
        };
      }

      if (!existsSync(configFile)) {
        await discardChanges();
        const said = claude.summary || claude.output;
        return {
          ok: false,
          error:
            `Claude did not write ${configRel}, so nothing was pushed.` +
            (said ? `\n\nClaude said:\n${said.slice(0, 1500)}` : ""),
          claudeSessionId: sessionId,
        };
      }

      // 6. Validate + build (the bot checks itself; Claude's word is not enough).
      await env.report("Validating the page config");
      const validate = await run(process.execPath, ["scripts/validate-landing.mjs", slug], { cwd: repoDir, timeoutMs });
      if (validate.code !== 0) {
        await discardChanges();
        return { ok: false, error: `Validation failed, nothing was pushed:\n${tail(validate.output)}`, claudeSessionId: sessionId };
      }
      await env.report("Building the site");
      const build = await shell(deps.buildCommand ?? "npm run build", { cwd: repoDir, timeoutMs });
      if (build.code !== 0) {
        await discardChanges();
        return { ok: false, error: `Build failed, nothing was pushed:\n${tail(build.output)}`, claudeSessionId: sessionId };
      }

      // Re-check after the build: it must not have produced tracked or unignored files.
      const changed = await changedPaths(git);
      const afterBuild = changed.filter((p) => !isAllowedChangePath(p, slug));
      if (afterBuild.length) {
        await discardChanges();
        return {
          ok: false,
          error: `Unexpected changes outside the page's files after the build; nothing was pushed:\n${afterBuild.slice(0, 20).map((p) => `- ${p}`).join("\n")}`,
          claudeSessionId: sessionId,
        };
      }

      // 7. Commit (only the page's own paths) and push.
      if (changed.length) {
        await gitOrFail(["add", "-A", "--", ...changed], "git add");
        const message = `lp: ${slug} — ${shortSummary(job)}\n\nRequested by ${job.userName} via the Telegram bot.`;
        await gitOrFail([...(await identity()), "commit", "--quiet", "--no-verify", "-m", message], "git commit");
      }
      const head = await gitOrFail(["rev-parse", "HEAD"], "git rev-parse");
      if (head !== remoteSha) {
        await env.report(`Pushing ${branch}`);
        const push = await git([
          "push",
          "--quiet",
          `--force-with-lease=refs/heads/${branch}:${remoteSha ?? ""}`,
          REMOTE,
          `HEAD:refs/heads/${branch}`,
        ]);
        if (push.code !== 0) {
          throw new FlowError(`Could not push ${branch}:\n${tail(push.output)}`);
        }
      }

      // 8. Preview links.
      const variants = (await readPageVariants(configFile)) ?? claude.variants;
      const notes: string[] = [];
      if (!changed.length) notes.push("Claude made no file changes this time.");
      if (claude.startedFresh) notes.push("(The earlier Claude conversation could not be resumed, so a new one was started.)");
      if (claude.denials.length) {
        notes.push(`Blocked tool calls (${claude.denials.length}):`, ...claude.denials.slice(0, 5).map((d) => `- ${d}`));
      }
      const summaryParts = [`Commit ${head.slice(0, 7)} on ${branch}.`, claude.summary.slice(0, 1200), ...notes].filter(Boolean);

      await env.report("Waiting for the Vercel preview");
      const preview = await getPreviewUrl(head, branch, env, deps.previewOptions);
      if (preview.status === "error") {
        return {
          ok: false,
          error:
            `${branch} was pushed (${head.slice(0, 7)}), but the Vercel preview failed:\n${preview.logTail}` +
            (preview.inspectorUrl ? `\n${preview.inspectorUrl}` : ""),
          claudeSessionId: sessionId,
        };
      }
      if (preview.status === "timeout") {
        summaryParts.push(`Preview not ready yet: ${preview.message}${preview.inspectorUrl ? ` ${preview.inspectorUrl}` : ""}`);
        return {
          ok: true,
          branch,
          commitSha: head,
          links: [],
          summary: summaryParts.join("\n"),
          couldntDo: claude.couldntDo,
          questions: [],
          claudeSessionId: sessionId,
        };
      }
      const urls = buildPreviewUrls(preview.url, slug, variants);
      const links = [
        `Page: ${urls.pageUrl}`,
        `Success page: ${urls.successUrl}`,
        ...Object.entries(urls.variantUrls).map(([name, url]) => `Variant "${name}": ${url}`),
      ];
      return {
        ok: true,
        branch,
        commitSha: head,
        previewUrl: preview.url,
        links,
        summary: summaryParts.join("\n"),
        couldntDo: claude.couldntDo,
        questions: [],
        claudeSessionId: sessionId,
      };
    } catch (err) {
      await discardChanges().catch(() => undefined);
      const message = err instanceof FlowError ? err.message : `Unexpected error: ${(err as Error)?.message ?? String(err)}`;
      return { ok: false, error: message, claudeSessionId: sessionId };
    }
  };
}

export const branchFlow: BranchFlow = createBranchFlow();

// --- prompt ---------------------------------------------------------------------

export interface PromptInput {
  kind: PageJob["kind"];
  slug: string;
  /** Brief, edit instruction, or answers to Claude's questions. */
  text: string;
  /** Images uploaded with this request. */
  images: SavedImage[];
  /** Every image file already in public/lp/<slug>/ (file names). */
  existingImages: string[];
  pageExists: boolean;
  /** True when continuing an earlier Claude session. */
  resume: boolean;
}

export function buildPrompt(p: PromptInput): string {
  const configRel = `${LANDING_PAGES_DIR}/${p.slug}.js`;
  const lines: string[] = [];
  if (p.resume) {
    lines.push(
      `Follow-up from the team about landing page "${p.slug}": answers to your questions, or a change request.`,
      `Continue with the new-landing-page skill. The files on disk are authoritative (earlier attempts may have been discarded): ` +
        `re-read ${configRel} first if it exists.`,
    );
  } else if (p.kind === "new" || !p.pageExists) {
    lines.push(
      "Use the new-landing-page skill to create a NEW landing page.",
      `The slug is fixed by the bot: "${p.slug}". Use exactly this slug (file ${configRel}, images in public/lp/${p.slug}/).`,
    );
  } else {
    lines.push(
      `Use the new-landing-page skill to EDIT the existing landing page "${p.slug}" (${configRel}).`,
      "Change only what is asked; keep everything else byte-identical. Do not rename the slug.",
    );
  }
  lines.push("");
  if (p.images.length) {
    lines.push("Images uploaded with this message (already saved):");
    for (const img of p.images) lines.push(`- ${img.path} (file public${img.path}, ${img.width}x${img.height})`);
  } else {
    lines.push("No images were uploaded with this message.");
  }
  const older = p.existingImages.filter((f) => !p.images.some((img) => img.path.endsWith(`/${f}`)));
  if (older.length) lines.push(`Other images already in public/lp/${p.slug}/: ${older.join(", ")}`);
  lines.push(
    "",
    `You may only write ${configRel} and files under public/lp/${p.slug}/. Bash allows exactly ` +
      `"node scripts/validate-landing.mjs ${p.slug}" and "npm run build"; use Glob instead of ls. Do not run git.`,
    "",
    p.resume ? "Message:" : p.kind === "new" || !p.pageExists ? "Ad brief:" : "Change request:",
    '"""',
    p.text.trim(),
    '"""',
    "",
    "End with the skill's final output block (SLUG / PAGE / SUCCESS / VARIANTS / COULDNT_DO / QUESTIONS).",
  );
  return lines.join("\n");
}

/** One line for the commit subject: "<first words of the request>". */
export function shortSummary(job: Pick<PageJob, "kind" | "text">, max = 60): string {
  const flat = job.text.replace(/\s+/g, " ").trim();
  const cut = flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
  return job.kind === "new" ? `new page: ${cut || "(no brief)"}` : cut || "update";
}

// --- helpers --------------------------------------------------------------------

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function sameDir(a: string, b: string): boolean {
  try {
    return realpathSync(a) === realpathSync(b);
  } catch {
    return false;
  }
}

const IMAGE_EXT = /\.(webp|png|jpe?g|gif|avif)$/i;

function listImages(repoDir: string, slug: string, uploaded: SavedImage[]): string[] {
  const dir = path.join(repoDir, "public", "lp", slug);
  let names: string[] = [];
  try {
    names = readdirSync(dir).filter((n) => IMAGE_EXT.test(n));
  } catch {
    names = [];
  }
  for (const img of uploaded) {
    const n = path.posix.basename(img.path);
    if (!names.includes(n)) names.push(n);
  }
  return names.sort();
}

/**
 * Paths changed in the work tree (tracked changes, staged changes and untracked files,
 * both sides of a rename), repo-relative.
 */
export async function changedPaths(git: (args: string[]) => Promise<RunResult>): Promise<string[]> {
  const r = await git(["status", "--porcelain=v1", "-z", "--untracked-files=all", "--ignored=no"]);
  if (r.code !== 0) throw new FlowError(`git status failed:\n${tail(r.output)}`);
  const fields = r.stdout.split("\0");
  const paths: string[] = [];
  for (let i = 0; i < fields.length; i++) {
    const entry = fields[i];
    if (entry.length < 4) continue;
    const xy = entry.slice(0, 2);
    paths.push(entry.slice(3));
    if (xy[0] === "R" || xy[0] === "C") {
      const from = fields[++i];
      if (from) paths.push(from);
    }
  }
  return [...new Set(paths)];
}

/** Install dependencies when node_modules is missing or older than package-lock.json. */
async function ensureDependencies(repoDir: string, installCommand: string | undefined, timeoutMs: number, env: ServiceEnv) {
  const lock = path.join(repoDir, "package-lock.json");
  const marker = path.join(repoDir, "node_modules", ".package-lock.json");
  const nodeModules = path.join(repoDir, "node_modules");
  let needed = !existsSync(nodeModules);
  if (!needed && existsSync(lock) && existsSync(marker)) {
    needed = statSync(lock).mtimeMs > statSync(marker).mtimeMs;
  }
  if (!needed) return;
  await env.report("Installing dependencies (npm ci)");
  const r = await shell(installCommand ?? "npm ci", { cwd: repoDir, timeoutMs });
  if (r.code !== 0) throw new FlowError(`npm ci failed; nothing was changed or pushed:\n${tail(r.output)}`);
}

/** Variant names from the config (`Object.keys(variants)`), imported in a separate Node process. */
export async function readPageVariants(configFile: string): Promise<string[] | undefined> {
  const script =
    "const m = await import(process.argv[1]);" +
    "const v = m.default?.variants;" +
    "process.stdout.write(JSON.stringify(v && typeof v === 'object' ? Object.keys(v) : []));";
  const r = await run(process.execPath, ["--input-type=module", "-e", script, pathToFileURL(configFile).href], {
    cwd: path.dirname(configFile),
    timeoutMs: 30_000,
  });
  if (r.code !== 0) return undefined;
  try {
    const names = JSON.parse(r.stdout.trim()) as unknown;
    return Array.isArray(names) ? names.filter((n): n is string => typeof n === "string") : undefined;
  } catch {
    return undefined;
  }
}
