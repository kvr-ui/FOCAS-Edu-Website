import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig, type Env } from "../src/config.js";
import { tmpDir } from "./helpers.js";

function validEnv(overrides: Env = {}): Env {
  return {
    TELEGRAM_BOT_TOKEN: "123456789:AAH-abcdefghijklmnopqrstuvwxyz_0123",
    TELEGRAM_ALLOWED_IDS: "111, 222,333",
    TELEGRAM_OWNER_ID: "999",
    ANTHROPIC_API_KEY: "sk-ant-xyz",
    VERCEL_TOKEN: "vtok",
    VERCEL_PROJECT_ID: "prj_1",
    REPO_DIR: tmpDir(),
    WEB_ROOT: "/var/www/focas",
    SITE_URL: "https://focasedu.com/",
    ...overrides,
  };
}

function problemsOf(env: Env): string[] {
  try {
    loadConfig(env);
  } catch (err) {
    expect(err).toBeInstanceOf(ConfigError);
    return (err as ConfigError).problems;
  }
  throw new Error("expected loadConfig to throw");
}

describe("loadConfig", () => {
  it("parses a valid env", () => {
    const env = validEnv();
    const c = loadConfig(env);
    expect(c.allowedIds).toEqual(new Set([111, 222, 333, 999]));
    expect(c.ownerId).toBe(999);
    expect(c.ownerName).toBe("the owner");
    expect(c.siteUrl).toBe("https://focasedu.com");
    expect(c.repoDir).toBe(env.REPO_DIR);
    expect(c.webRoot).toBe("/var/www/focas");
    expect(c.vercelTeamId).toBeUndefined();
    expect(c.stateDir).toMatch(/data$/);
  });

  it("defaults and reads the Claude model and caps", () => {
    const d = loadConfig(validEnv());
    expect(d).toMatchObject({ claudeModel: "claude-sonnet-5-5", claudeMaxTurns: 40, claudeMaxCostUsd: 2, claudeTimeoutMs: 20 * 60_000 });
    const c = loadConfig(
      validEnv({ CLAUDE_MODEL: "claude-opus-5-5", CLAUDE_MAX_TURNS: "25", CLAUDE_MAX_COST_USD: "0.75", CLAUDE_TIMEOUT_MINUTES: "5" }),
    );
    expect(c).toMatchObject({ claudeModel: "claude-opus-5-5", claudeMaxTurns: 25, claudeMaxCostUsd: 0.75, claudeTimeoutMs: 5 * 60_000 });
  });

  it("rejects invalid Claude caps", () => {
    const problems = problemsOf(validEnv({ CLAUDE_MAX_TURNS: "2.5", CLAUDE_MAX_COST_USD: "-1", CLAUDE_TIMEOUT_MINUTES: "soon" }));
    expect(problems).toEqual([
      expect.stringMatching(/^CLAUDE_MAX_TURNS must be a positive whole number/),
      expect.stringMatching(/^CLAUDE_MAX_COST_USD must be a positive number/),
      expect.stringMatching(/^CLAUDE_TIMEOUT_MINUTES must be a positive number/),
    ]);
  });

  it("always allows the owner, even if not in TELEGRAM_ALLOWED_IDS", () => {
    expect(loadConfig(validEnv()).allowedIds.has(999)).toBe(true);
  });

  it("reads optional values", () => {
    const c = loadConfig(validEnv({ VERCEL_TEAM_ID: "team_1", TELEGRAM_OWNER_NAME: "Sandy" }));
    expect(c.vercelTeamId).toBe("team_1");
    expect(c.ownerName).toBe("Sandy");
  });

  it("lists every missing required variable at once", () => {
    const problems = problemsOf({});
    for (const key of [
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_ALLOWED_IDS",
      "TELEGRAM_OWNER_ID",
      "ANTHROPIC_API_KEY",
      "VERCEL_TOKEN",
      "VERCEL_PROJECT_ID",
      "REPO_DIR",
      "WEB_ROOT",
      "SITE_URL",
    ]) {
      expect(problems.some((p) => p.startsWith(`${key} is missing`))).toBe(true);
    }
    expect(problems.some((p) => p.includes("VERCEL_TEAM_ID"))).toBe(false);
  });

  it("treats blank values as missing", () => {
    expect(problemsOf(validEnv({ ANTHROPIC_API_KEY: "   " }))).toEqual(["ANTHROPIC_API_KEY is missing"]);
  });

  it("rejects malformed values with clear messages", () => {
    const problems = problemsOf(
      validEnv({
        TELEGRAM_BOT_TOKEN: "not-a-token",
        TELEGRAM_ALLOWED_IDS: "111,bob",
        TELEGRAM_OWNER_ID: "owner",
        REPO_DIR: "relative/path",
        WEB_ROOT: "www",
        SITE_URL: "focasedu.com",
      }),
    );
    expect(problems).toEqual([
      expect.stringContaining("TELEGRAM_BOT_TOKEN does not look like a bot token"),
      expect.stringContaining('TELEGRAM_OWNER_ID must be a numeric Telegram user ID, got "owner"'),
      expect.stringContaining("TELEGRAM_ALLOWED_IDS must contain only numeric IDs; invalid: bob"),
      expect.stringContaining("REPO_DIR must be an absolute path"),
      expect.stringContaining("WEB_ROOT must be an absolute path"),
      expect.stringContaining("SITE_URL must be an http(s) URL"),
    ]);
  });

  it("requires REPO_DIR to exist", () => {
    expect(problemsOf(validEnv({ REPO_DIR: "/definitely/not/here" }))).toEqual([
      "REPO_DIR does not exist or is not a directory: /definitely/not/here",
    ]);
  });

  it("produces a readable error message", () => {
    try {
      loadConfig({});
    } catch (err) {
      expect((err as Error).message).toMatch(/^Invalid bot configuration:\n  - TELEGRAM_BOT_TOKEN is missing/);
      expect((err as Error).message).toMatch(/bot\/\.env\.example/);
    }
  });
});
