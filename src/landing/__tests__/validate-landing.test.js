// @vitest-environment node
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const script = path.join(root, "scripts/validate-landing.mjs");
const fixtures = path.join(here, "fixtures");

const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });

describe("scripts/validate-landing.mjs", () => {
  it("schema.js imports under plain Node", () => {
    const res = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", 'const m = await import("./src/landing/schema.js"); console.log(m.BLOCK_TYPES.length);'],
      { cwd: root, encoding: "utf8" },
    );
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("15");
  });

  it("exits 0 on valid configs (including a custom lazy component) and skips _ files", () => {
    const res = run("--dir", path.join(fixtures, "valid"));
    expect(res.stderr).toBe("");
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("good-page.js");
    expect(res.stdout).toContain("paid-page.js");
    expect(res.stdout).not.toContain("_template");
    expect(res.stdout).toContain("2 landing-page configs valid.");
  });

  it("prints errors grouped by file and exits 1 on an invalid config", () => {
    const res = run("--dir", path.join(fixtures, "invalid"));
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("broken-page.js (6 errors)");
    expect(res.stderr).toContain('- slug: "rti" collides with an existing route /rti');
    expect(res.stderr).toContain('- sections[1].type: unknown block "foo"');
    expect(res.stderr).toContain("- success: required object with a heading");
    expect(res.stderr).toContain("1 of 2 landing-page configs invalid.");
    expect(res.stdout).toContain("fine-page.js");
  });

  it("validates a single slug", () => {
    expect(run("--dir", path.join(fixtures, "invalid"), "fine-page").status).toBe(0);
    expect(run("--dir", path.join(fixtures, "invalid"), "broken-page").status).toBe(1);
  });

  it("fails for an unknown or _-prefixed slug", () => {
    const res = run("--dir", path.join(fixtures, "valid"), "missing");
    expect(res.status).toBe(1);
    expect(res.stderr).toContain('No config for slug "missing"');
    expect(run("--dir", path.join(fixtures, "valid"), "_template").status).toBe(1);
  });

  it("succeeds on an empty or missing config directory", () => {
    const res = run("--dir", path.join(fixtures, "does-not-exist"));
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("No landing-page configs found");
  });
});
