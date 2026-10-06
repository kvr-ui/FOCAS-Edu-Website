/**
 * Claude Agent SDK runner (task 16, issue #17).
 *
 * Runs Claude in REPO_DIR with the committed `.claude/skills/new-landing-page` skill
 * (`settingSources: ["project"]`), tools restricted by the job's {@link createToolPolicy}
 * (enforced both by `canUseTool` and a `PreToolUse` hook), a turn cap, a USD cost cap and a
 * wall-clock timeout. Resumes `resumeSessionId` when given, so `/edit` and answers to
 * Claude's questions continue the same conversation. Parses the skill's final output block
 * (SLUG / PAGE / SUCCESS / VARIANTS / COULDNT_DO / QUESTIONS).
 *
 * `query` is injectable (`createClaudeRunner({ query })`) so tests use a fake SDK: no
 * network and no ANTHROPIC_API_KEY needed.
 */
import type { Options, SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { CLAUDE_TOOLS, createToolPolicy, SKILL_NAME } from "./policy.js";
import type { ServiceEnv } from "./types.js";

export interface RunClaudeOptions {
  /** The page this job may write (scopes the tool policy). */
  slug: string;
  /** Resume this Claude session (edits, answers to Claude's questions). */
  resumeSessionId?: string;
  /**
   * Prompt for a fresh session, used if resuming `resumeSessionId` fails before Claude
   * produced anything (e.g. the session transcript is gone). Default: no retry.
   */
  freshPrompt?: string;
  /** Abort a running job (e.g. bot shutdown). */
  signal?: AbortSignal;
}

/** The skill's machine-readable final block, parsed. */
export interface SkillOutput {
  slug?: string;
  page?: string;
  success?: string;
  /** Variant names (from `/<slug>?v=<name>` lines). */
  variants: string[];
  couldntDo: string[];
  questions: string[];
  /** Free text Claude wrote before the block. */
  summary: string;
}

export type ClaudeStopReason = "max_turns" | "max_cost" | "timeout" | "aborted" | "error";

export type ClaudeRunResult =
  | {
      ok: true;
      sessionId: string;
      /** Claude's final message (machine-friendly skill output). */
      output: string;
      /** Parsed final block; undefined if Claude did not end with it. */
      parsed?: SkillOutput;
      /** Short human summary Claude wrote before the block. */
      summary: string;
      /** Items from the skill's "Couldn't do" list. */
      couldntDo: string[];
      /** Questions Claude wants answered (no page written if non-empty). */
      questions: string[];
      /** Variant names Claude reported. */
      variants: string[];
      costUsd?: number;
      numTurns?: number;
      /** Tool calls the policy denied during the run. */
      denials: string[];
      /** True if the stored session could not be resumed and a fresh one was started. */
      startedFresh?: boolean;
    }
  | {
      ok: false;
      error: string;
      reason: ClaudeStopReason;
      sessionId?: string;
      costUsd?: number;
      denials?: string[];
    };

export type RunClaude = (prompt: string, opts: RunClaudeOptions, env: ServiceEnv) => Promise<ClaudeRunResult>;

/** The subset of the SDK's `query()` the runner uses. */
export type QueryFn = (params: { prompt: string; options?: Options }) => AsyncIterable<SDKMessage>;

export interface ClaudeRunnerDeps {
  /** Default: the real `query` from `@anthropic-ai/claude-agent-sdk` (loaded lazily). */
  query?: QueryFn;
}

const SYSTEM_APPEND = [
  "You are running inside the FOCAS landing-page Telegram bot, unattended. Nobody can answer",
  "permission prompts: a denied tool call is final, so adapt instead of retrying it.",
  "Tool limits: Write/Edit only src/landing-pages/<slug>.js and public/lp/<slug>/; Bash only",
  '"node scripts/validate-landing.mjs <slug>" or "npm run build", exactly, nothing chained;',
  "use Read/Glob/Grep (not ls/cat) to inspect files. Never run git. Always end with the",
  "skill's final output block.",
].join(" ");

export function createClaudeRunner(deps: ClaudeRunnerDeps = {}): RunClaude {
  const getQuery = async (): Promise<QueryFn> => {
    if (deps.query) return deps.query;
    const sdk = await import("@anthropic-ai/claude-agent-sdk");
    return sdk.query as unknown as QueryFn;
  };

  const runOnce = async (
    prompt: string,
    opts: RunClaudeOptions,
    env: ServiceEnv,
    resume: string | undefined,
  ): Promise<{ result: ClaudeRunResult; producedOutput: boolean }> => {
    const { config } = env;
    const policy = createToolPolicy({ repoDir: config.repoDir, slug: opts.slug });
    const abort = new AbortController();
    let stopReason: ClaudeStopReason | undefined;
    const stop = (why: ClaudeStopReason) => {
      if (!stopReason) stopReason = why;
      abort.abort();
    };
    const onOuterAbort = () => stop("aborted");
    if (opts.signal?.aborted) stop("aborted");
    opts.signal?.addEventListener("abort", onOuterAbort, { once: true });
    const timer = setTimeout(() => stop("timeout"), config.claudeTimeoutMs);

    const options: Options = {
      cwd: config.repoDir,
      settingSources: ["project"],
      skills: [SKILL_NAME],
      model: config.claudeModel,
      tools: [...CLAUDE_TOOLS],
      allowedTools: [],
      permissionMode: "default",
      canUseTool: policy.canUseTool,
      hooks: { PreToolUse: [{ hooks: [policy.preToolUseHook] }] },
      maxTurns: config.claudeMaxTurns,
      maxBudgetUsd: config.claudeMaxCostUsd,
      abortController: abort,
      systemPrompt: { type: "preset", preset: "claude_code", append: SYSTEM_APPEND },
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: config.anthropicApiKey,
        CLAUDE_AGENT_SDK_CLIENT_APP: "focas-lp-bot/0.1.0",
      },
      ...(resume ? { resume } : {}),
    };

    let sessionId = resume;
    let lastText = "";
    let costUsd: number | undefined;
    let numTurns: number | undefined;
    let resultMsg: Extract<SDKMessage, { type: "result" }> | undefined;
    let producedOutput = false;
    const turnIds = new Set<string>();
    let thrown: unknown;

    try {
      const query = await getQuery();
      for await (const m of query({ prompt, options })) {
        const sid = (m as { session_id?: unknown }).session_id;
        if (typeof sid === "string" && sid) sessionId = sid;
        if (m.type === "assistant" && m.parent_tool_use_id === null) {
          producedOutput = true;
          const msg = m.message as { id?: string; content?: Array<{ type: string; text?: string }> };
          turnIds.add(msg.id ?? `turn-${turnIds.size}`);
          const text = (msg.content ?? [])
            .filter((b) => b.type === "text" && typeof b.text === "string")
            .map((b) => b.text)
            .join("");
          if (text.trim()) lastText = text;
          // Backstop for the SDK's own maxTurns: stop a runaway stream ourselves.
          if (turnIds.size > config.claudeMaxTurns + 1) {
            stop("max_turns");
            break;
          }
        } else if (m.type === "result") {
          resultMsg = m;
          costUsd = m.total_cost_usd;
          numTurns = m.num_turns;
          break;
        }
        if (stopReason) break;
      }
    } catch (err) {
      thrown = err;
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onOuterAbort);
    }

    const fail = (reason: ClaudeStopReason, error: string): { result: ClaudeRunResult; producedOutput: boolean } => ({
      result: { ok: false, reason, error, sessionId, costUsd, denials: [...policy.denials] },
      producedOutput,
    });
    const minutes = Math.round(config.claudeTimeoutMs / 60_000);
    const capMessage = (reason: ClaudeStopReason): string =>
      reason === "max_turns"
        ? `Claude was stopped after the maximum of ${config.claudeMaxTurns} turns (CLAUDE_MAX_TURNS) without finishing.`
        : reason === "max_cost"
          ? `Claude was stopped at the $${config.claudeMaxCostUsd} cost cap for one job (CLAUDE_MAX_COST_USD).`
          : reason === "timeout"
            ? `Claude was stopped after ${minutes} minutes (CLAUDE_TIMEOUT_MINUTES).`
            : "The Claude job was cancelled.";

    if (stopReason) return fail(stopReason, capMessage(stopReason));
    if (resultMsg?.subtype === "error_max_turns") return fail("max_turns", capMessage("max_turns"));
    if (resultMsg?.subtype === "error_max_budget_usd") return fail("max_cost", capMessage("max_cost"));
    if (thrown !== undefined) {
      return fail("error", `Claude failed: ${(thrown as Error)?.message ?? String(thrown)}`);
    }
    if (!resultMsg) return fail("error", "Claude ended without a result.");
    if (resultMsg.subtype !== "success") {
      const errors = (resultMsg as { errors?: string[] }).errors ?? [];
      return fail("error", `Claude failed (${resultMsg.subtype})${errors.length ? `: ${errors.join("; ")}` : "."}`);
    }
    const output = (resultMsg.result || lastText || "").trim();
    if (resultMsg.is_error) return fail("error", `Claude reported an error: ${output.slice(0, 1500) || "(no details)"}`);
    if (!sessionId) return fail("error", "Claude did not report a session id.");

    const parsed = parseSkillOutput(output);
    return {
      result: {
        ok: true,
        sessionId,
        output,
        parsed,
        summary: parsed ? parsed.summary : output,
        couldntDo: parsed?.couldntDo ?? [],
        questions: parsed?.questions ?? [],
        variants: parsed?.variants ?? [],
        costUsd,
        numTurns,
        denials: [...policy.denials],
      },
      producedOutput,
    };
  };

  return async (prompt, opts, env) => {
    const first = await runOnce(prompt, opts, env, opts.resumeSessionId);
    const canRetryFresh =
      !first.result.ok &&
      first.result.reason === "error" &&
      !first.producedOutput &&
      opts.resumeSessionId !== undefined &&
      opts.freshPrompt !== undefined;
    if (!canRetryFresh) return first.result;
    await env.report("Could not resume the earlier Claude session; starting a new one");
    const second = await runOnce(opts.freshPrompt!, opts, env, undefined);
    return second.result.ok ? { ...second.result, startedFresh: true } : second.result;
  };
}

export const runClaude: RunClaude = createClaudeRunner();

// --- skill output ---------------------------------------------------------------

const KEYS = ["SLUG", "PAGE", "SUCCESS", "VARIANTS", "COULDNT_DO", "QUESTIONS"] as const;
type Key = (typeof KEYS)[number];
const KEY_LINE = /^\s*\**\s*(SLUG|PAGE|SUCCESS|VARIANTS|COULDNT_DO|COULDN'T_DO|QUESTIONS)\s*\**\s*:\s*(.*)$/i;

const isEmptyValue = (v: string) => /^(none|n\/a|-|pending|\(none\))\.?$/i.test(v.trim());

/**
 * Parse the skill's final block. Takes the LAST `SLUG:` line and reads the keys after it;
 * list values are `- item` bullets (or `none`). Returns undefined if there is no block.
 */
export function parseSkillOutput(text: string): SkillOutput | undefined {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let start = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(KEY_LINE);
    if (m && m[1].toUpperCase() === "SLUG") {
      start = i;
      break;
    }
  }
  if (start < 0) return undefined;

  const scalars: Partial<Record<Key, string>> = {};
  const lists: Record<"VARIANTS" | "COULDNT_DO" | "QUESTIONS", string[]> = { VARIANTS: [], COULDNT_DO: [], QUESTIONS: [] };
  let current: Key | undefined;
  for (const raw of lines.slice(start)) {
    const line = raw.trimEnd();
    if (/^\s*```/.test(line)) continue;
    const m = line.match(KEY_LINE);
    if (m) {
      current = m[1].toUpperCase().replace("COULDN'T_DO", "COULDNT_DO") as Key;
      const value = m[2].trim();
      if (current === "VARIANTS" || current === "COULDNT_DO" || current === "QUESTIONS") {
        if (value && !isEmptyValue(value)) lists[current].push(value.replace(/^[-*•]\s*/, ""));
      } else if (value && !isEmptyValue(value)) {
        scalars[current] = value;
      }
      continue;
    }
    const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet && current && (current === "VARIANTS" || current === "COULDNT_DO" || current === "QUESTIONS")) {
      const item = bullet[1].trim();
      if (item && !isEmptyValue(item)) lists[current].push(item);
      continue;
    }
    // A continuation line of the previous bullet (wrapped text).
    if (line.trim() && current && (current === "COULDNT_DO" || current === "QUESTIONS") && lists[current].length) {
      const list = lists[current];
      list[list.length - 1] = `${list[list.length - 1]} ${line.trim()}`;
    }
  }

  const variants = lists.VARIANTS.map((v) => {
    const m = v.match(/[?&]v=([^&\s`]+)/);
    return (m ? decodeURIComponent(m[1]) : v).replace(/[`]/g, "").trim();
  }).filter((v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v));

  const summary = lines
    .slice(0, start)
    .filter((l) => !/^\s*```/.test(l))
    .join("\n")
    .trim();

  return {
    slug: scalars.SLUG,
    page: scalars.PAGE,
    success: scalars.SUCCESS,
    variants: [...new Set(variants)],
    couldntDo: lists.COULDNT_DO,
    questions: lists.QUESTIONS,
    summary,
  };
}
