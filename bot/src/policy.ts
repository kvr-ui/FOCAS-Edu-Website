/**
 * What Claude may do in REPO_DIR while it authors one landing page.
 *
 * One policy object per job (it is scoped to that job's slug) answers two questions:
 *  - may this tool call run? (`checkToolUse`, used by both the SDK `canUseTool` callback
 *    and a `PreToolUse` hook, so a permissive `.claude/settings.json` in the repo cannot
 *    pre-approve anything past it);
 *  - may this changed path be committed? (`isAllowedChangePath`, used by the
 *    `git status --porcelain` guard in branch.ts after Claude has finished).
 *
 * Rules:
 *  - Write/Edit: only `src/landing-pages/<slug>.js` and files under `public/lp/<slug>/`
 *    (no dotfiles, no active content such as .html/.js/.svg there). Paths are resolved
 *    against REPO_DIR and through symlinks before they are checked. The page config must
 *    stay a plain data module (no imports, require, eval, process access).
 *  - Bash: exactly `npm run build` or `node scripts/validate-landing.mjs [<slug>]`.
 *    The whole command must match one of those shapes; nothing may be chained, piped,
 *    substituted, redirected or prefixed. No background runs.
 *  - Read/Glob/Grep: only inside REPO_DIR (no `.env*`, no `.git/` internals).
 *  - Skill: only `new-landing-page`. Every other tool is denied.
 */
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import type { CanUseTool, HookCallback, PermissionResult } from "@anthropic-ai/claude-agent-sdk";
import { SLUG_RE } from "./slug.js";

export const SKILL_NAME = "new-landing-page";
/** Built-in tools Claude is given (everything else is unavailable). */
export const CLAUDE_TOOLS = ["Read", "Glob", "Grep", "Write", "Edit", "Bash", "Skill"] as const;

export type ToolDecision = { allow: true } | { allow: false; reason: string };

const ALLOW: ToolDecision = { allow: true };
const deny = (reason: string): ToolDecision => ({ allow: false, reason });

const VALIDATE_RE = /^[ \t]*node[ \t]+scripts\/validate-landing\.mjs(?:[ \t]+[a-z0-9]+(?:-[a-z0-9]+)*)?[ \t]*$/;
const BUILD_RE = /^[ \t]*npm[ \t]+run[ \t]+build[ \t]*$/;

/** True only for the two Bash commands Claude may run, in their exact shapes. */
export function isAllowedBashCommand(command: unknown): boolean {
  if (typeof command !== "string") return false;
  return VALIDATE_RE.test(command) || BUILD_RE.test(command);
}

/** Files under public/lp/<slug>/ that the site would execute or render as a document. */
const ACTIVE_EXT = new Set([".html", ".htm", ".xhtml", ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".svg", ".xml", ".php", ".wasm"]);

/**
 * Whether a repo-relative path (POSIX separators, as `git status` prints it) is one the
 * job for `slug` may create or change.
 */
export function isAllowedChangePath(rel: string, slug: string): boolean {
  if (!SLUG_RE.test(slug)) return false;
  if (!rel || rel.includes("\0") || rel.includes("\\") || path.posix.isAbsolute(rel)) return false;
  if (path.posix.normalize(rel) !== rel) return false;
  if (rel === `src/landing-pages/${slug}.js`) return true;
  const prefix = `public/lp/${slug}/`;
  if (!rel.startsWith(prefix) || rel.length === prefix.length) return false;
  const parts = rel.slice(prefix.length).split("/");
  if (parts.some((p) => p === "" || p === "." || p === ".." || p.startsWith("."))) return false;
  return !ACTIVE_EXT.has(path.posix.extname(rel).toLowerCase());
}

/**
 * Patterns that have no place in a landing-page config (a plain `export default {...}`
 * data module). The config is imported by Node during validation, so this keeps it from
 * becoming a way to run code. Defence in depth, not a sandbox.
 */
const CODE_PATTERNS: Array<[RegExp, string]> = [
  [/^\s*import\b/m, "import statements"],
  [/\bimport\s*\(/, "dynamic import()"],
  [/\bimport\s*\.\s*meta\b/, "import.meta"],
  [/\brequire\s*\(/, "require()"],
  [/\bchild_process\b/, "child_process"],
  [/\beval\s*\(/, "eval()"],
  [/\bFunction\s*\(/, "the Function constructor"],
  [/\bprocess\s*(?:\.\s*(?:env|exit|binding|kill|dlopen|mainModule|getBuiltinModule)\b|\[)/, "process access"],
  [/\bglobalThis\b/, "globalThis"],
];

export function configCodeProblem(source: string): string | undefined {
  for (const [re, what] of CODE_PATTERNS) if (re.test(source)) return what;
  return undefined;
}

export interface ToolPolicy {
  slug: string;
  repoDir: string;
  checkToolUse(toolName: string, input: Record<string, unknown>): ToolDecision;
  canUseTool: CanUseTool;
  preToolUseHook: HookCallback;
  /** Human-readable log of denied calls ("Write src/App.jsx: ..."), for the job report. */
  denials: string[];
}

export function createToolPolicy(opts: { repoDir: string; slug: string }): ToolPolicy {
  const { slug } = opts;
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid landing-page slug: ${slug}`);
  const repoDir = path.resolve(opts.repoDir);
  let repoReal: string;
  try {
    repoReal = realpathSync(repoDir);
  } catch {
    repoReal = repoDir;
  }
  const denials: string[] = [];

  /** Canonical absolute path (symlinks of existing ancestors resolved), or undefined if unusable. */
  const canonical = (p: unknown): string | undefined => {
    if (typeof p !== "string" || !p.trim() || p.includes("\0")) return undefined;
    if (p.startsWith("~")) return undefined;
    const abs = path.resolve(repoDir, p);
    let existing = abs;
    const rest: string[] = [];
    while (!existsSync(existing)) {
      const parent = path.dirname(existing);
      if (parent === existing) break;
      rest.unshift(path.basename(existing));
      existing = parent;
    }
    try {
      return path.join(realpathSync(existing), ...rest);
    } catch {
      return undefined;
    }
  };

  /** Repo-relative POSIX path, or undefined if `p` is outside REPO_DIR. */
  const repoRelative = (p: unknown): string | undefined => {
    const real = canonical(p);
    if (!real) return undefined;
    const rel = path.relative(repoReal, real);
    if (rel === "") return ".";
    if (rel.startsWith("..") || path.isAbsolute(rel)) return undefined;
    return rel.split(path.sep).join("/");
  };

  const isSecretOrGit = (rel: string) =>
    rel.split("/").some((part) => part === ".git" || part.startsWith(".env"));

  const checkReadPath = (p: unknown, what: string): ToolDecision => {
    const rel = repoRelative(p);
    if (rel === undefined) return deny(`${what} must be inside the repository.`);
    if (isSecretOrGit(rel)) return deny(`${what} may not touch .env files or .git internals.`);
    return ALLOW;
  };

  const checkPattern = (pattern: unknown, what: string): ToolDecision => {
    if (pattern === undefined) return ALLOW;
    if (typeof pattern !== "string") return deny(`${what} must be a string.`);
    if (pattern.includes("\0") || pattern.startsWith("/") || pattern.startsWith("~") || pattern.split(/[\\/]/).includes("..")) {
      return deny(`${what} must be a relative pattern inside the repository.`);
    }
    if (/(^|\/)\.(env|git)\b/.test(pattern)) return deny(`${what} may not target .env files or .git internals.`);
    return ALLOW;
  };

  const writeTarget = (filePath: unknown): { rel: string } | { error: string } => {
    const rel = repoRelative(filePath);
    if (rel === undefined || !isAllowedChangePath(rel, slug)) {
      return {
        error:
          `Writes are only allowed to src/landing-pages/${slug}.js and files under public/lp/${slug}/ ` +
          `(got ${typeof filePath === "string" ? filePath : "no path"}).`,
      };
    }
    return { rel };
  };

  const checkConfigSource = (rel: string, source: string): ToolDecision => {
    if (rel !== `src/landing-pages/${slug}.js`) return ALLOW;
    const problem = configCodeProblem(source);
    return problem
      ? deny(`The page config must be a plain data object (export default {...}); ${problem} is not allowed.`)
      : ALLOW;
  };

  const checkToolUse = (toolName: string, input: Record<string, unknown>): ToolDecision => {
    switch (toolName) {
      case "Read":
        return checkReadPath(input.file_path, "Read");
      case "Glob": {
        const where = input.path === undefined ? ALLOW : checkReadPath(input.path, "Glob path");
        return where.allow ? checkPattern(input.pattern, "Glob pattern") : where;
      }
      case "Grep": {
        const where = input.path === undefined ? ALLOW : checkReadPath(input.path, "Grep path");
        return where.allow ? checkPattern(input.glob, "Grep glob") : where;
      }
      case "Write": {
        const t = writeTarget(input.file_path);
        if ("error" in t) return deny(t.error);
        if (typeof input.content !== "string") return deny("Write needs string content.");
        return checkConfigSource(t.rel, input.content);
      }
      case "Edit": {
        const t = writeTarget(input.file_path);
        if ("error" in t) return deny(t.error);
        const oldS = input.old_string;
        const newS = input.new_string;
        if (typeof oldS !== "string" || typeof newS !== "string") return deny("Edit needs old_string and new_string.");
        let current = "";
        try {
          current = readFileSync(path.join(repoReal, t.rel), "utf8");
        } catch {
          current = "";
        }
        let next: string;
        if (input.replace_all === true) next = current.split(oldS).join(newS);
        else {
          const at = current.indexOf(oldS);
          next = at < 0 ? newS : current.slice(0, at) + newS + current.slice(at + oldS.length);
        }
        const whole = checkConfigSource(t.rel, next);
        return whole.allow ? checkConfigSource(t.rel, newS) : whole;
      }
      case "Bash": {
        if (input.run_in_background === true) return deny("Background commands are not allowed.");
        if (input.dangerouslyDisableSandbox === true) return deny("Disabling the sandbox is not allowed.");
        if (!isAllowedBashCommand(input.command)) {
          return deny(
            `Only these exact commands may be run: "node scripts/validate-landing.mjs ${slug}" and "npm run build". ` +
              "Use Read/Glob/Grep to inspect files.",
          );
        }
        return ALLOW;
      }
      case "Skill": {
        const name = String(input.skill ?? input.command ?? "").replace(/^\//, "").trim();
        return name === SKILL_NAME ? ALLOW : deny(`Only the ${SKILL_NAME} skill may be used.`);
      }
      default:
        return deny(`The ${toolName} tool is not available in this job.`);
    }
  };

  const record = (toolName: string, input: Record<string, unknown>, d: ToolDecision): void => {
    if (d.allow) return;
    const target = input.file_path ?? input.command ?? input.path ?? input.pattern ?? "";
    const line = `${toolName}${target ? ` ${String(target).slice(0, 200)}` : ""}: ${d.reason}`;
    if (!denials.includes(line)) denials.push(line);
  };

  const decide = (toolName: string, input: unknown): ToolDecision => {
    const args = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    let d: ToolDecision;
    try {
      d = checkToolUse(toolName, args);
    } catch (err) {
      d = deny(`Permission check failed: ${(err as Error).message}`);
    }
    record(toolName, args, d);
    return d;
  };

  const canUseTool: CanUseTool = async (toolName, input): Promise<PermissionResult> => {
    const d = decide(toolName, input);
    return d.allow ? { behavior: "allow", updatedInput: input } : { behavior: "deny", message: d.reason };
  };

  const preToolUseHook: HookCallback = async (hookInput) => {
    if (hookInput.hook_event_name !== "PreToolUse") return {};
    const d = decide(hookInput.tool_name, hookInput.tool_input);
    if (d.allow) return {}; // no opinion: canUseTool still gets the final say
    return {
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: d.reason },
    };
  };

  return { slug, repoDir, checkToolUse: (t, i) => decide(t, i), canUseTool, preToolUseHook, denials };
}
