/**
 * Production deploy & rollback (task 11, issue #12).
 *
 * `deployToProd` merges `origin/lp/<slug>` into main in REPO_DIR, pushes, builds into
 * `dist-new`, atomically swaps the build into WEB_ROOT (keeping the old one as
 * `${WEB_ROOT}-prev`), verifies SITE_URL/<slug> and rolls back automatically if that fails.
 * `rollback` swaps WEB_ROOT and `${WEB_ROOT}-prev` back. Both record deploy history via
 * `env.state.appendDeployHistory`. Owner-only checks are done by the router before these are
 * called; both run inside the single job queue, so they never overlap with other git work.
 *
 * Every build dir carries a small `.deploy.json` ({commit, slug, time, by}) so a rollback
 * can tell which commit is live after the swap.
 */
import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { LANDING_PAGES_DIR } from "./pages.js";
import { isValidSlug } from "./slug.js";
import type { ServiceEnv } from "./types.js";

export type DeployResult =
  | { ok: true; liveUrl: string; successUrl: string; commit: string }
  | { ok: false; error: string; /** True if a failed verification was rolled back automatically. */ rolledBack?: boolean };

export type RollbackResult =
  | { ok: true; /** Commit that is live after the rollback, if known. */ liveCommit?: string }
  | { ok: false; error: string };

/** `by` identifies who triggered the deploy (for history), e.g. the owner's name or id. */
export type DeployToProd = (slug: string, by: string, env: ServiceEnv) => Promise<DeployResult>;
export type Rollback = (by: string, env: ServiceEnv) => Promise<RollbackResult>;

/** Build output directory, relative to REPO_DIR. */
export const BUILD_DIR = "dist-new";
/** Marker written into every deployed build. */
export const BUILD_INFO_FILE = ".deploy.json";
/** Vite build plus the per-page meta HTML generator (task 8), both writing into `dist-new`. */
export const DEFAULT_BUILD_COMMAND =
  `npx --no-install vite build --outDir ${BUILD_DIR} --emptyOutDir && ` +
  `node scripts/gen-landing-meta.mjs --outDir ${BUILD_DIR}`;
export const DEFAULT_INSTALL_COMMAND = "npm ci";

export interface DeployOptions {
  /**
   * Shell command run in REPO_DIR that must build the site into `dist-new/`
   * (SITE_URL is set in its environment). Default: env `DEPLOY_BUILD_CMD`, else
   * {@link DEFAULT_BUILD_COMMAND}.
   */
  buildCommand?: string;
  /** Shell command that installs dependencies in REPO_DIR. Default: `npm ci`. */
  installCommand?: string;
  /** HTTP client used for verification (tests pass a fake). Default: global fetch. */
  fetch?: typeof fetch;
  /** Verification attempts before giving up (default 3) and the pause between them (default 2000 ms). */
  verifyAttempts?: number;
  verifyDelayMs?: number;
  /** Limits for the install and build commands (default 15 minutes each). */
  commandTimeoutMs?: number;
}

export interface BuildInfo {
  commit: string;
  slug: string;
  time: string;
  by: string;
}

/** Expected failure: becomes `{ ok: false, error }` with this message. */
class DeployError extends Error {}

const REMOTE = "origin";
const MAIN = "main";
const OUTPUT_LIMIT = 200_000;
const BOT_IDENTITY = ["-c", "user.name=FOCAS LP Bot", "-c", "user.email=lp-bot@focasedu.invalid"];

export function createDeployer(opts: DeployOptions = {}): { deployToProd: DeployToProd; rollback: Rollback } {
  const fetchImpl = (...args: Parameters<typeof fetch>) => (opts.fetch ?? fetch)(...args);
  const verifyAttempts = Math.max(1, opts.verifyAttempts ?? 3);
  const verifyDelayMs = opts.verifyDelayMs ?? 2000;
  const timeoutMs = opts.commandTimeoutMs ?? 15 * 60_000;

  const deployToProd: DeployToProd = async (slug, by, env) => {
    const { repoDir, webRoot, siteUrl } = env.config;
    const branch = `lp/${slug}`;
    const liveUrl = `${siteUrl}/${slug}`;
    const successUrl = `${siteUrl}/${slug}-success`;
    if (!isValidSlug(slug)) return { ok: false, error: `"${slug}" is not a valid page slug.` };
    if (!isDir(repoDir)) return { ok: false, error: `REPO_DIR does not exist or is not a directory: ${repoDir}` };

    const git = (args: string[]) => run("git", args, { cwd: repoDir, env: gitEnv() });
    const gitOrFail = async (args: string[], what: string) => {
      const r = await git(args);
      if (r.code !== 0) throw new DeployError(`${what} failed:\n${tail(r.output)}`);
      return r.output.trim();
    };

    try {
      // 1. fetch, check out main (up to date with origin/main), merge the page branch.
      await env.report(`Fetching ${REMOTE}`);
      await gitOrFail(["fetch", "--prune", REMOTE], "git fetch");
      const hasBranch = await git(["rev-parse", "--verify", "--quiet", `refs/remotes/${REMOTE}/${branch}^{commit}`]);
      if (hasBranch.code !== 0) {
        return { ok: false, error: `There is no branch ${branch} on ${REMOTE}, so there is nothing to deploy for "${slug}".` };
      }
      await gitOrFail(["checkout", MAIN], `git checkout ${MAIN}`);
      await gitOrFail(["merge", "--ff-only", `${REMOTE}/${MAIN}`], `Updating ${MAIN} from ${REMOTE}/${MAIN}`);
      const before = await gitOrFail(["rev-parse", "HEAD"], "git rev-parse");

      await env.report(`Merging ${branch} into ${MAIN}`);
      const identity = (await git(["config", "user.email"])).code === 0 ? [] : BOT_IDENTITY;
      const merge = await git([...identity, "merge", "--no-edit", "-m", `lp: deploy ${slug}`, `${REMOTE}/${branch}`]);
      if (merge.code !== 0) {
        const conflicted = (await git(["diff", "--name-only", "--diff-filter=U"])).output.trim().split("\n").filter(Boolean);
        await git(["merge", "--abort"]);
        await resetTo(git, before);
        return {
          ok: false,
          error: conflicted.length
            ? `Merge conflict: ${branch} cannot be merged into ${MAIN} automatically (conflicting files: ${conflicted.join(", ")}). ` +
              `The merge was aborted; ${MAIN} and the live site are unchanged. Update the page (/edit ${slug}) and deploy again.`
            : `Could not merge ${branch} into ${MAIN}; ${MAIN} and the live site are unchanged:\n${tail(merge.output)}`,
        };
      }
      const after = await gitOrFail(["rev-parse", "HEAD"], "git rev-parse");
      const short = after.slice(0, 7);

      // The page must exist on main now; read its title for verification before anything is pushed.
      const configFile = path.join(repoDir, LANDING_PAGES_DIR, `${slug}.js`);
      let title: string;
      try {
        if (!existsSync(configFile)) throw new DeployError(`${branch} has no ${LANDING_PAGES_DIR}/${slug}.js.`);
        title = await readPageTitle(configFile);
      } catch (err) {
        await resetTo(git, before);
        throw new DeployError(`${(err as Error).message} Nothing was pushed or deployed.`);
      }

      // 2. push main.
      await env.report(`Pushing ${MAIN}`);
      const push = await git(["push", REMOTE, `${MAIN}:${MAIN}`]);
      if (push.code !== 0) {
        await resetTo(git, before);
        return { ok: false, error: `Could not push ${MAIN}; nothing was deployed:\n${tail(push.output)}` };
      }

      // 3. npm ci (only when the lockfile changed, or on a checkout without node_modules), then build.
      const pushedNote = `${MAIN} was pushed (${short}) but the live site is unchanged.`;
      const lockChanged =
        before !== after && (await gitOrFail(["diff", "--name-only", before, after, "--", "package-lock.json"], "git diff")) !== "";
      if (lockChanged || !existsSync(path.join(repoDir, "node_modules"))) {
        await env.report("Installing dependencies (npm ci)");
        const install = await shell(opts.installCommand ?? DEFAULT_INSTALL_COMMAND, { cwd: repoDir, timeoutMs });
        if (install.code !== 0) {
          return { ok: false, error: `npm ci failed. ${pushedNote}\n${tail(install.output)}` };
        }
      }

      const buildDir = path.join(repoDir, BUILD_DIR);
      await rm(buildDir, { recursive: true, force: true });
      await env.report("Building");
      const buildCommand = opts.buildCommand ?? (process.env.DEPLOY_BUILD_CMD?.trim() || DEFAULT_BUILD_COMMAND);
      const build = await shell(buildCommand, { cwd: repoDir, timeoutMs, env: { SITE_URL: siteUrl } });
      if (build.code !== 0 || !existsSync(path.join(buildDir, "index.html"))) {
        await rm(buildDir, { recursive: true, force: true });
        const why = build.code !== 0 ? "" : `(the build did not produce ${BUILD_DIR}/index.html)\n`;
        return { ok: false, error: `Build failed. ${pushedNote}\n${why}${tail(build.output)}` };
      }
      const info: BuildInfo = { commit: after, slug, time: new Date().toISOString(), by };
      await writeFile(path.join(buildDir, BUILD_INFO_FILE), JSON.stringify(info, null, 2) + "\n");

      // 4. Atomic swap. Stage next to WEB_ROOT first so the final renames stay on one filesystem.
      await env.report("Swapping the new build into place");
      const { staged, prev } = siblings(webRoot);
      await mkdir(path.dirname(webRoot), { recursive: true });
      await rm(staged, { recursive: true, force: true });
      await moveDir(buildDir, staged);
      await rm(prev, { recursive: true, force: true });
      if (existsSync(webRoot)) await rename(webRoot, prev);
      await rename(staged, webRoot);

      // 5. Verify; roll back automatically on failure.
      await env.report(`Verifying ${liveUrl}`);
      const check = await verifyPage(liveUrl, title, fetchImpl, verifyAttempts, verifyDelayMs);
      if (!check.ok) {
        if (!existsSync(prev)) {
          return {
            ok: false,
            error: `Verification of ${liveUrl} failed: ${check.reason}. There is no previous build to restore, so the new build (${short}) stays live.`,
          };
        }
        await env.report("Verification failed, restoring the previous build");
        await restorePrevious(webRoot);
        const live = await readBuildInfo(webRoot);
        env.state.appendDeployHistory({ slug, commit: live?.commit ?? null, by, action: "auto-rollback" });
        return {
          ok: false,
          rolledBack: true,
          error:
            `Verification of ${liveUrl} failed: ${check.reason}. ` +
            `Live commit is ${live?.commit.slice(0, 7) ?? "unknown"} again; ${MAIN} still contains the merge (${short}).`,
        };
      }

      // 6. Record and report.
      env.state.appendDeployHistory({ slug, commit: after, by, action: "deploy" });
      return { ok: true, liveUrl, successUrl, commit: short };
    } catch (err) {
      if (err instanceof DeployError) return { ok: false, error: err.message };
      return { ok: false, error: `Unexpected error: ${(err as Error)?.message ?? String(err)}` };
    }
  };

  const rollback: Rollback = async (by, env) => {
    const { webRoot } = env.config;
    const { prev } = siblings(webRoot);
    if (!existsSync(prev)) {
      return { ok: false, error: "There is no previous build to roll back to. Nothing was changed." };
    }
    try {
      await swapDirs(webRoot, prev);
    } catch (err) {
      return { ok: false, error: `Could not swap the builds: ${(err as Error).message}` };
    }
    const live = await readBuildInfo(webRoot);
    env.state.appendDeployHistory({ slug: live?.slug ?? null, commit: live?.commit ?? null, by, action: "rollback" });
    return { ok: true, ...(live ? { liveCommit: live.commit.slice(0, 7) } : {}) };
  };

  return { deployToProd, rollback };
}

const defaults = createDeployer();
export const deployToProd: DeployToProd = defaults.deployToProd;
export const rollback: Rollback = defaults.rollback;

// --- filesystem ---------------------------------------------------------------

function siblings(webRoot: string) {
  return { prev: `${webRoot}-prev`, staged: `${webRoot}-new`, failed: `${webRoot}-failed` };
}

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/** Rename, falling back to copy + delete when `from` is on another filesystem. */
async function moveDir(from: string, to: string): Promise<void> {
  try {
    await rename(from, to);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
    await cp(from, to, { recursive: true });
    await rm(from, { recursive: true, force: true });
  }
}

/** Exchange two directories with three renames (`a` may be missing). */
async function swapDirs(a: string, b: string): Promise<void> {
  const tmp = `${a}-swap`;
  await rm(tmp, { recursive: true, force: true });
  if (existsSync(a)) await rename(a, tmp);
  await rename(b, a);
  if (existsSync(tmp)) await rename(tmp, b);
}

/**
 * After a failed verification: put `${webRoot}-prev` back live. The bad build is parked in
 * `${webRoot}-failed` for inspection (not in -prev, so /rollback can never re-publish it).
 */
async function restorePrevious(webRoot: string): Promise<void> {
  const { prev, failed } = siblings(webRoot);
  await rm(failed, { recursive: true, force: true });
  if (existsSync(webRoot)) await rename(webRoot, failed);
  await rename(prev, webRoot);
}

export async function readBuildInfo(dir: string): Promise<BuildInfo | undefined> {
  try {
    const data = JSON.parse(await readFile(path.join(dir, BUILD_INFO_FILE), "utf8")) as Partial<BuildInfo>;
    return typeof data.commit === "string" ? (data as BuildInfo) : undefined;
  } catch {
    return undefined;
  }
}

// --- page config & verification ---------------------------------------------------

/** `meta.title` of a landing-page config, imported in a separate Node process (no module cache). */
export async function readPageTitle(configFile: string): Promise<string> {
  const script =
    "const m = await import(process.argv[1]);" +
    "process.stdout.write(JSON.stringify(m.default?.meta?.title ?? null));";
  const r = await run(process.execPath, ["--input-type=module", "-e", script, pathToFileURL(configFile).href], {
    cwd: path.dirname(configFile),
    timeoutMs: 30_000,
  });
  let title: unknown = null;
  if (r.code === 0) {
    try {
      title = JSON.parse(r.output.trim());
    } catch {
      title = null;
    }
  }
  if (typeof title !== "string" || !title.trim()) {
    // Fall back to reading the literal from the source.
    const src = await readFile(configFile, "utf8");
    const m = src.match(/\bmeta\s*:\s*\{[\s\S]*?\btitle\s*:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/);
    title = m ? m[2].replace(/\\(.)/g, "$1") : null;
  }
  if (typeof title !== "string" || !title.trim()) {
    throw new DeployError(`Could not read meta.title from ${path.basename(configFile)}.`);
  }
  return title;
}

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (whole, e: string) => {
    const k = e.toLowerCase();
    if (k === "amp") return "&";
    if (k === "lt") return "<";
    if (k === "gt") return ">";
    if (k === "quot") return '"';
    if (k === "apos") return "'";
    const code = k.startsWith("#x") ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
  });
}

/** True if `html` has a `<meta property="og:title">` whose content equals `title`. */
export function hasOgTitle(html: string, title: string): boolean {
  const want = title.trim();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? "";
    }
    const key = attrs.property ?? attrs.name;
    if (key === "og:title" && decodeEntities(attrs.content ?? "").trim() === want) return true;
  }
  return false;
}

async function verifyPage(
  url: string,
  title: string,
  fetchImpl: typeof fetch,
  attempts: number,
  delayMs: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  let reason = "not checked";
  for (let i = 0; i < attempts; i++) {
    if (i > 0 && delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    try {
      const res = await fetchImpl(url, {
        headers: { "cache-control": "no-cache" },
        signal: AbortSignal.timeout(15_000),
      });
      const body = await res.text();
      if (res.status !== 200) reason = `HTTP ${res.status}`;
      else if (!hasOgTitle(body, title)) reason = `the page has no og:title "${title}"`;
      else return { ok: true };
    } catch (err) {
      reason = `request failed (${(err as Error).message})`;
    }
  }
  return { ok: false, reason };
}

// --- processes ----------------------------------------------------------------

interface RunResult {
  code: number;
  /** Combined stdout + stderr (last {@link OUTPUT_LIMIT} chars). */
  output: string;
}

function gitEnv(): NodeJS.ProcessEnv {
  return { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_MERGE_AUTOEDIT: "no", LC_ALL: "C" };
}

async function resetTo(git: (args: string[]) => Promise<RunResult>, commit: string): Promise<void> {
  const head = await git(["rev-parse", "HEAD"]);
  if (head.output.trim() !== commit) await git(["reset", "--hard", commit]);
}

function shell(command: string, opts: { cwd: string; timeoutMs?: number; env?: Record<string, string> }) {
  return run("sh", ["-c", command], { cwd: opts.cwd, timeoutMs: opts.timeoutMs, env: { ...process.env, ...opts.env } });
}

function run(
  command: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv; timeoutMs?: number },
): Promise<RunResult> {
  return new Promise((resolve) => {
    let output = "";
    let done = false;
    const append = (d: Buffer) => {
      output += d.toString();
      if (output.length > OUTPUT_LIMIT) output = output.slice(-OUTPUT_LIMIT);
    };
    const finish = (code: number) => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      resolve({ code, output });
    };
    // Own process group, so a timeout also kills e.g. vite started by `sh -c`.
    const child = spawn(command, args, { cwd: opts.cwd, env: opts.env ?? process.env, stdio: ["ignore", "pipe", "pipe"], detached: true });
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          output += `\n[timed out after ${Math.round(opts.timeoutMs! / 1000)}s]`;
          try {
            process.kill(-child.pid!, "SIGKILL");
          } catch {
            child.kill("SIGKILL");
          }
        }, opts.timeoutMs)
      : undefined;
    child.on("error", (err) => {
      output += `\n${err.message}`;
      finish(-1);
    });
    child.on("close", (code) => finish(code ?? 1));
  });
}

/** Last lines of command output, short enough for a Telegram message. */
export function tail(output: string, lines = 25, maxChars = 2500): string {
  let t = output.trimEnd().split("\n").slice(-lines).join("\n");
  if (t.length > maxChars) t = "..." + t.slice(-maxChars);
  return t || "(no output)";
}
