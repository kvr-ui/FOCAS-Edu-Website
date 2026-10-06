/**
 * Child-process helpers shared by the git/deploy services: run a command without a shell
 * (or a shell command via `sh -c`), capture combined output, and kill the whole process
 * group on timeout.
 */
import { spawn } from "node:child_process";

const OUTPUT_LIMIT = 200_000;

export interface RunResult {
  code: number;
  /** Combined stdout + stderr (last {@link OUTPUT_LIMIT} chars). */
  output: string;
  /** stdout alone (last {@link OUTPUT_LIMIT} chars), for commands whose output is parsed. */
  stdout: string;
}

export function gitEnv(): NodeJS.ProcessEnv {
  return { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_MERGE_AUTOEDIT: "no", LC_ALL: "C" };
}

export function shell(command: string, opts: { cwd: string; timeoutMs?: number; env?: Record<string, string> }) {
  return run("sh", ["-c", command], { cwd: opts.cwd, timeoutMs: opts.timeoutMs, env: { ...process.env, ...opts.env } });
}

export function run(
  command: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv; timeoutMs?: number },
): Promise<RunResult> {
  return new Promise((resolve) => {
    let output = "";
    let stdout = "";
    let done = false;
    const append = (d: Buffer) => {
      output += d.toString();
      if (output.length > OUTPUT_LIMIT) output = output.slice(-OUTPUT_LIMIT);
    };
    const appendStdout = (d: Buffer) => {
      stdout += d.toString();
      if (stdout.length > OUTPUT_LIMIT) stdout = stdout.slice(-OUTPUT_LIMIT);
      append(d);
    };
    const finish = (code: number) => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      resolve({ code, output, stdout });
    };
    // Own process group, so a timeout also kills e.g. vite started by `sh -c`.
    const child = spawn(command, args, { cwd: opts.cwd, env: opts.env ?? process.env, stdio: ["ignore", "pipe", "pipe"], detached: true });
    child.stdout.on("data", appendStdout);
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
