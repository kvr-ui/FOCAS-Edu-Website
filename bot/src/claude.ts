/**
 * Claude Agent SDK runner — STUB. Implemented by task 16 (issue #17).
 *
 * Contract: run the `new-landing-page` skill in REPO_DIR with tools locked to
 * `src/landing-pages/**` and `public/lp/**`, resuming `resumeSessionId` when given.
 */
import type { ServiceEnv } from "./types.js";

export interface RunClaudeOptions {
  /** Resume this Claude session (edits, answers to Claude's questions). */
  resumeSessionId?: string;
  /** Abort a running job (e.g. bot shutdown). */
  signal?: AbortSignal;
}

export type ClaudeRunResult =
  | {
      ok: true;
      sessionId: string;
      /** Claude's final message (machine-friendly skill output). */
      output: string;
      /** Items from the skill's "Couldn't do" list. */
      couldntDo: string[];
      /** Questions Claude wants answered (no page written if non-empty). */
      questions: string[];
      costUsd?: number;
    }
  | { ok: false; error: string; sessionId?: string; costUsd?: number };

export type RunClaude = (prompt: string, opts: RunClaudeOptions, env: ServiceEnv) => Promise<ClaudeRunResult>;

export const runClaude: RunClaude = async (_prompt, opts) => ({
  ok: true,
  sessionId: opts.resumeSessionId ?? "stub-session",
  output: "(stub) Claude is not wired up yet (task 16).",
  couldntDo: [],
  questions: [],
});
