import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const BOT_DIR = fileURLToPath(new URL("..", import.meta.url));
const REQUIRED = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_ALLOWED_IDS",
  "TELEGRAM_OWNER_ID",
  "ANTHROPIC_API_KEY",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_ID",
  "REPO_DIR",
  "WEB_ROOT",
  "SITE_URL",
];

describe("startup", () => {
  it("exits 1 with a clear message when env is missing (before touching Telegram)", () => {
    // Blank values also shadow anything a local bot/.env would provide (dotenv never overrides).
    const env: Record<string, string> = { PATH: process.env.PATH ?? "" };
    for (const k of REQUIRED) env[k] = "";
    const tsx = path.join(BOT_DIR, "node_modules", "tsx", "dist", "cli.mjs");
    const r = spawnSync(process.execPath, [tsx, "src/index.ts"], { cwd: BOT_DIR, env, encoding: "utf8", timeout: 30_000 });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Invalid bot configuration:");
    for (const k of REQUIRED) expect(r.stderr).toContain(`${k} is missing`);
  }, 30_000);
});
