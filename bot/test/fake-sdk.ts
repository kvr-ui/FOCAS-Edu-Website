/**
 * A fake `query()` from @anthropic-ai/claude-agent-sdk: no network, no API key.
 *
 * Each call runs a scripted "agent": for every step it asks the real PreToolUse hook and
 * `canUseTool` callback from the options (as the CLI does) and, only if both allow it,
 * performs the tool for real in `options.cwd` (Write/Edit change files, Bash runs the
 * command). A `bypass` step changes files WITHOUT asking, to simulate a permission
 * bypass that only the porcelain guard can catch.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Options, SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { QueryFn } from "../src/claude.js";

export type FakeStep =
  | { tool: string; input: Record<string, unknown> }
  | { bypass: (cwd: string) => void };

export interface FakeScript {
  steps?: FakeStep[];
  /** Final assistant text (the skill's output block). */
  final?: string;
  sessionId?: string;
  /** Override the result message (e.g. `{ subtype: "error_max_turns" }`). */
  result?: Record<string, unknown>;
  /** Emit assistant turns forever (until aborted). */
  runaway?: boolean;
  /** Never finish (until aborted). */
  hang?: boolean;
  /** Throw before emitting anything (e.g. "session not found"). */
  throwAtStart?: string;
}

export interface ToolOutcome {
  tool: string;
  input: Record<string, unknown>;
  allowed: boolean;
  reason?: string;
  /** Bash: exit status and output. */
  status?: number | null;
  output?: string;
}

export interface FakeCall {
  prompt: string;
  options: Options;
}

export function fakeQuery(handler: (call: FakeCall, index: number) => FakeScript | Promise<FakeScript>) {
  const calls: FakeCall[] = [];
  const outcomes: ToolOutcome[] = [];
  let sessionCounter = 0;

  const query: QueryFn = ({ prompt, options }) => {
    const opts = options ?? {};
    const call = { prompt, options: opts };
    calls.push(call);
    const index = calls.length - 1;
    const signal = opts.abortController?.signal;
    const abortError = () => Object.assign(new Error("Claude Code process aborted by user"), { name: "AbortError" });

    async function* gen(): AsyncGenerator<SDKMessage> {
      const script = await handler(call, index);
      if (script.throwAtStart) throw new Error(script.throwAtStart);
      const sessionId = script.sessionId ?? opts.resume ?? `fake-session-${++sessionCounter}`;
      const cwd = opts.cwd ?? process.cwd();
      yield { type: "system", subtype: "init", session_id: sessionId, cwd, tools: [] } as unknown as SDKMessage;
      let turn = 0;
      const assistant = (content: unknown[]) =>
        ({
          type: "assistant",
          parent_tool_use_id: null,
          session_id: sessionId,
          message: { id: `msg_${index}_${++turn}`, role: "assistant", content },
        }) as unknown as SDKMessage;

      if (script.runaway) {
        for (;;) {
          if (signal?.aborted) throw abortError();
          yield assistant([{ type: "tool_use", id: `tu${turn}`, name: "Read", input: { file_path: "src/App.jsx" } }]);
          await new Promise((r) => setImmediate(r));
        }
      }
      if (script.hang) {
        await new Promise<void>((_, reject) => {
          if (signal?.aborted) reject(abortError());
          signal?.addEventListener("abort", () => reject(abortError()), { once: true });
        });
      }

      for (const step of script.steps ?? []) {
        if (signal?.aborted) throw abortError();
        if ("bypass" in step) {
          step.bypass(cwd);
          continue;
        }
        yield assistant([{ type: "tool_use", id: `tu${turn}`, name: step.tool, input: step.input }]);
        outcomes.push(await runTool(opts, cwd, sessionId, step.tool, step.input));
      }

      yield assistant([{ type: "text", text: script.final ?? "" }]);
      yield {
        type: "result",
        subtype: "success",
        is_error: false,
        result: script.final ?? "",
        num_turns: turn,
        total_cost_usd: 0.05,
        session_id: sessionId,
        errors: [],
        ...script.result,
      } as unknown as SDKMessage;
    }
    return gen();
  };

  return { query, calls, outcomes };
}

async function runTool(opts: Options, cwd: string, sessionId: string, tool: string, input: Record<string, unknown>): Promise<ToolOutcome> {
  const signal = opts.abortController?.signal ?? new AbortController().signal;
  for (const matcher of opts.hooks?.PreToolUse ?? []) {
    for (const hook of matcher.hooks) {
      const out = (await hook(
        { hook_event_name: "PreToolUse", tool_name: tool, tool_input: input, tool_use_id: "tu", session_id: sessionId, transcript_path: "", cwd } as never,
        "tu",
        { signal },
      )) as { hookSpecificOutput?: { permissionDecision?: string; permissionDecisionReason?: string } };
      if (out.hookSpecificOutput?.permissionDecision === "deny") {
        return { tool, input, allowed: false, reason: out.hookSpecificOutput.permissionDecisionReason };
      }
    }
  }
  if (!opts.canUseTool) throw new Error("fake SDK: no canUseTool given");
  const perm = await opts.canUseTool(tool, input, { signal, toolUseID: "tu", requestId: "rq", cwd } as never);
  if (!perm || perm.behavior !== "allow") return { tool, input, allowed: false, reason: perm?.message ?? "no decision" };

  const file = typeof input.file_path === "string" ? path.resolve(cwd, input.file_path) : "";
  switch (tool) {
    case "Write":
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, String(input.content));
      return { tool, input, allowed: true };
    case "Edit": {
      const cur = readFileSync(file, "utf8");
      writeFileSync(file, cur.replace(String(input.old_string), String(input.new_string)));
      return { tool, input, allowed: true };
    }
    case "Bash": {
      const r = spawnSync("sh", ["-c", String(input.command)], { cwd, encoding: "utf8" });
      return { tool, input, allowed: true, status: r.status, output: `${r.stdout}${r.stderr}` };
    }
    default:
      return { tool, input, allowed: true };
  }
}

/** The skill's final output block. */
export function skillBlock(o: {
  slug: string;
  variants?: string[];
  couldntDo?: string[];
  questions?: string[];
  summary?: string;
  pending?: boolean;
}): string {
  const list = (xs?: string[]) => (xs?.length ? xs.map((x) => `- ${x}`).join("\n") : "none");
  return [
    o.summary ?? "",
    "```",
    `SLUG: ${o.slug}`,
    `PAGE: ${o.pending ? "pending" : `/${o.slug}`}`,
    `SUCCESS: ${o.pending ? "pending" : `/${o.slug}-success`}`,
    "VARIANTS:",
    o.variants?.length ? o.variants.map((v) => `- /${o.slug}?v=${v}`).join("\n") : "none",
    "COULDNT_DO:",
    list(o.couldntDo),
    "QUESTIONS:",
    list(o.questions),
    "```",
  ].join("\n");
}
