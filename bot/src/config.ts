import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Directory of the bot package (`bot/`), whether running from `src/` (tsx) or `dist/` (node). */
export const BOT_DIR = fileURLToPath(new URL("..", import.meta.url));

export interface Config {
  telegramBotToken: string;
  /** Telegram user IDs allowed to talk to the bot. Always includes the owner. */
  allowedIds: ReadonlySet<number>;
  /** The only Telegram user ID that may `ok` / `/deploy` / `/rollback`. */
  ownerId: number;
  /** How the owner is named in refusal messages ("Only <ownerName> can deploy"). */
  ownerName: string;
  anthropicApiKey: string;
  /** Model the Claude runner uses (CLAUDE_MODEL). */
  claudeModel: string;
  /** Max agent turns per Claude job (CLAUDE_MAX_TURNS); the job is stopped when exceeded. */
  claudeMaxTurns: number;
  /** Max estimated spend in USD per Claude job (CLAUDE_MAX_COST_USD). */
  claudeMaxCostUsd: number;
  /** Wall-clock limit per Claude job in ms (CLAUDE_TIMEOUT_MINUTES). */
  claudeTimeoutMs: number;
  vercelToken: string;
  vercelProjectId: string;
  vercelTeamId?: string;
  /** Absolute path of the bot's own git checkout of the website repo. */
  repoDir: string;
  /** Absolute path of the nginx web root that production builds are swapped into. */
  webRoot: string;
  /** Public site origin without trailing slash, e.g. https://focasedu.com */
  siteUrl: string;
  /** Directory for the bot's JSON state files. */
  stateDir: string;
}

export type Env = Record<string, string | undefined>;

export class ConfigError extends Error {
  constructor(public readonly problems: string[]) {
    super(
      [
        "Invalid bot configuration:",
        ...problems.map((p) => `  - ${p}`),
        "Copy bot/.env.example to bot/.env and fill in every required value.",
      ].join("\n"),
    );
    this.name = "ConfigError";
  }
}

export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-5-5";
export const DEFAULT_CLAUDE_MAX_TURNS = 40;
export const DEFAULT_CLAUDE_MAX_COST_USD = 2;
export const DEFAULT_CLAUDE_TIMEOUT_MINUTES = 20;

const TOKEN_RE = /^\d+:[A-Za-z0-9_-]{30,}$/;
const ID_RE = /^-?\d+$/;

/**
 * Load and validate the bot configuration from an env object (normally `process.env`).
 * Collects every problem and throws a single {@link ConfigError} listing them all.
 */
export function loadConfig(env: Env): Config {
  const problems: string[] = [];
  const get = (key: string): string => (env[key] ?? "").trim();

  const required = (key: string, hint = ""): string => {
    const value = get(key);
    if (!value) problems.push(`${key} is missing${hint ? ` (${hint})` : ""}`);
    return value;
  };

  const telegramBotToken = required("TELEGRAM_BOT_TOKEN", "get one from @BotFather");
  if (telegramBotToken && !TOKEN_RE.test(telegramBotToken)) {
    problems.push("TELEGRAM_BOT_TOKEN does not look like a bot token (expected <digits>:<secret>)");
  }

  const ownerRaw = required("TELEGRAM_OWNER_ID", "numeric Telegram user ID of the owner");
  let ownerId = 0;
  if (ownerRaw) {
    if (ID_RE.test(ownerRaw)) ownerId = Number(ownerRaw);
    else problems.push(`TELEGRAM_OWNER_ID must be a numeric Telegram user ID, got "${ownerRaw}"`);
  }

  const allowedRaw = required("TELEGRAM_ALLOWED_IDS", "comma-separated numeric Telegram user IDs");
  const allowedIds = new Set<number>();
  if (allowedRaw) {
    const parts = allowedRaw.split(/[\s,]+/).filter(Boolean);
    const bad = parts.filter((p) => !ID_RE.test(p));
    if (bad.length) {
      problems.push(`TELEGRAM_ALLOWED_IDS must contain only numeric IDs; invalid: ${bad.join(", ")}`);
    }
    for (const p of parts) if (ID_RE.test(p)) allowedIds.add(Number(p));
  }
  if (ownerId) allowedIds.add(ownerId);

  const anthropicApiKey = required("ANTHROPIC_API_KEY");
  const claudeModel = get("CLAUDE_MODEL") || DEFAULT_CLAUDE_MODEL;

  /** Optional positive number; integer-only when `integer` is set. */
  const positive = (key: string, fallback: number, integer: boolean): number => {
    const raw = get(key);
    if (!raw) return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0 || (integer && !Number.isInteger(n))) {
      problems.push(`${key} must be a positive ${integer ? "whole number" : "number"}, got "${raw}"`);
      return fallback;
    }
    return n;
  };
  const claudeMaxTurns = positive("CLAUDE_MAX_TURNS", DEFAULT_CLAUDE_MAX_TURNS, true);
  const claudeMaxCostUsd = positive("CLAUDE_MAX_COST_USD", DEFAULT_CLAUDE_MAX_COST_USD, false);
  const claudeTimeoutMs = positive("CLAUDE_TIMEOUT_MINUTES", DEFAULT_CLAUDE_TIMEOUT_MINUTES, false) * 60_000;
  const vercelToken = required("VERCEL_TOKEN");
  const vercelProjectId = required("VERCEL_PROJECT_ID");
  const vercelTeamId = get("VERCEL_TEAM_ID") || undefined;

  const repoDir = required("REPO_DIR", "absolute path of the bot's git checkout of this repo");
  if (repoDir) {
    if (!path.isAbsolute(repoDir)) problems.push(`REPO_DIR must be an absolute path, got "${repoDir}"`);
    else if (!existsSync(repoDir) || !statSync(repoDir).isDirectory()) {
      problems.push(`REPO_DIR does not exist or is not a directory: ${repoDir}`);
    }
  }

  const webRoot = required("WEB_ROOT", "e.g. /var/www/focas");
  if (webRoot && !path.isAbsolute(webRoot)) {
    problems.push(`WEB_ROOT must be an absolute path, got "${webRoot}"`);
  }

  let siteUrl = required("SITE_URL", "e.g. https://focasedu.com");
  if (siteUrl) {
    let ok = false;
    try {
      const u = new URL(siteUrl);
      ok = u.protocol === "https:" || u.protocol === "http:";
    } catch {
      ok = false;
    }
    if (!ok) problems.push(`SITE_URL must be an http(s) URL, got "${siteUrl}"`);
    siteUrl = siteUrl.replace(/\/+$/, "");
  }

  const stateDirRaw = get("BOT_STATE_DIR");
  const stateDir = stateDirRaw ? path.resolve(BOT_DIR, stateDirRaw) : path.join(BOT_DIR, "data");

  if (problems.length) throw new ConfigError(problems);

  return {
    telegramBotToken,
    allowedIds,
    ownerId,
    ownerName: get("TELEGRAM_OWNER_NAME") || "the owner",
    anthropicApiKey,
    claudeModel,
    claudeMaxTurns,
    claudeMaxCostUsd,
    claudeTimeoutMs,
    vercelToken,
    vercelProjectId,
    vercelTeamId,
    repoDir: path.resolve(repoDir),
    webRoot: path.resolve(webRoot),
    siteUrl,
    stateDir,
  };
}
