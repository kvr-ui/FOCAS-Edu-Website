import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createClaudeRunner, parseSkillOutput } from "../src/claude.js";
import { StateStore } from "../src/state.js";
import type { ServiceEnv } from "../src/types.js";
import { fakeQuery, skillBlock } from "./fake-sdk.js";
import { testConfig, tmpDir } from "./helpers.js";

const SLUG = "ca-final";

function makeEnv(overrides: Parameters<typeof testConfig>[0] = {}) {
  const root = tmpDir("lpbot-claude-");
  const repoDir = path.join(root, "repo");
  mkdirSync(path.join(repoDir, "src/landing-pages"), { recursive: true });
  writeFileSync(path.join(repoDir, "src/App.jsx"), "app\n");
  const config = testConfig({ repoDir, stateDir: path.join(root, "state"), ...overrides });
  const steps: string[] = [];
  const env: ServiceEnv = { config, state: new StateStore(config.stateDir), report: async (l) => void steps.push(l) };
  return { env, repoDir, steps };
}

describe("runClaude (fake SDK)", () => {
  it("passes the expected SDK options and parses the skill block", async () => {
    const { env } = makeEnv();
    const fake = fakeQuery(() => ({
      sessionId: "sess-1",
      final: skillBlock({ slug: SLUG, variants: ["fear-angle"], couldntDo: ["Live chat widget"], summary: "Made the page." }),
    }));
    const run = createClaudeRunner({ query: fake.query });
    const r = await run("Use the new-landing-page skill ...", { slug: SLUG }, env);

    expect(r).toMatchObject({
      ok: true,
      sessionId: "sess-1",
      couldntDo: ["Live chat widget"],
      questions: [],
      variants: ["fear-angle"],
      summary: "Made the page.",
      costUsd: 0.05,
    });
    const o = fake.calls[0].options;
    expect(o.cwd).toBe(env.config.repoDir);
    expect(o.settingSources).toEqual(["project"]);
    expect(o.model).toBe("claude-sonnet-5-5");
    expect(o.tools).toEqual(["Read", "Glob", "Grep", "Write", "Edit", "Bash", "Skill"]);
    expect(o.allowedTools).toEqual([]); // nothing pre-approved: every call goes through canUseTool
    expect(o.permissionMode).toBe("default");
    expect(o.skills).toEqual(["new-landing-page"]);
    expect(o.maxTurns).toBe(40);
    expect(o.maxBudgetUsd).toBe(2);
    expect(typeof o.canUseTool).toBe("function");
    expect(o.hooks?.PreToolUse?.length).toBe(1);
    expect(o.resume).toBeUndefined();
    expect(o.env?.ANTHROPIC_API_KEY).toBe("sk-ant-test");
    expect(fake.calls[0].prompt).toContain("Use the new-landing-page skill");
  });

  it("uses the configured model, caps and resume id", async () => {
    const { env } = makeEnv({ claudeModel: "claude-opus-5-5", claudeMaxTurns: 7, claudeMaxCostUsd: 0.5 });
    const fake = fakeQuery(() => ({ final: skillBlock({ slug: SLUG }) }));
    const r = await createClaudeRunner({ query: fake.query })("edit", { slug: SLUG, resumeSessionId: "sess-old" }, env);
    expect(r).toMatchObject({ ok: true, sessionId: "sess-old" });
    expect(fake.calls[0].options).toMatchObject({ model: "claude-opus-5-5", maxTurns: 7, maxBudgetUsd: 0.5, resume: "sess-old" });
  });

  it("an out-of-bounds Write is denied by canUseTool and never happens", async () => {
    const { env, repoDir } = makeEnv();
    const fake = fakeQuery(() => ({
      steps: [
        { tool: "Write", input: { file_path: "src/App.jsx", content: "pwned" } },
        { tool: "Write", input: { file_path: "src/landing-pages/../evil.js", content: "pwned" } },
        { tool: "Bash", input: { command: "npm run build && touch pwned" } },
        { tool: "Write", input: { file_path: `src/landing-pages/${SLUG}.js`, content: 'export default { slug: "ca-final" };\n' } },
      ],
      final: skillBlock({ slug: SLUG }),
    }));
    const r = await createClaudeRunner({ query: fake.query })("p", { slug: SLUG }, env);
    expect(fake.outcomes.map((o) => o.allowed)).toEqual([false, false, false, true]);
    expect(existsSync(path.join(repoDir, "src/evil.js"))).toBe(false);
    expect(existsSync(path.join(repoDir, "pwned"))).toBe(false);
    expect(existsSync(path.join(repoDir, `src/landing-pages/${SLUG}.js`))).toBe(true);
    expect(r.ok && r.denials).toHaveLength(3);
  });

  it("returns Claude's questions", async () => {
    const { env } = makeEnv();
    const fake = fakeQuery(() => ({
      final: skillBlock({ slug: SLUG, pending: true, questions: ["What is the price?", "When does registration close?"] }),
    }));
    const r = await createClaudeRunner({ query: fake.query })("p", { slug: SLUG }, env);
    expect(r).toMatchObject({ ok: true, questions: ["What is the price?", "When does registration close?"], couldntDo: [] });
  });

  it("stops at the SDK turn cap with a message", async () => {
    const { env } = makeEnv({ claudeMaxTurns: 5 });
    const fake = fakeQuery(() => ({ result: { subtype: "error_max_turns", is_error: true }, sessionId: "s-turns" }));
    const r = await createClaudeRunner({ query: fake.query })("p", { slug: SLUG }, env);
    expect(r).toMatchObject({ ok: false, reason: "max_turns", sessionId: "s-turns" });
    expect(!r.ok && r.error).toMatch(/maximum of 5 turns \(CLAUDE_MAX_TURNS\)/);
  });

  it("stops at the cost cap with a message", async () => {
    const { env } = makeEnv({ claudeMaxCostUsd: 1.5 });
    const fake = fakeQuery(() => ({ result: { subtype: "error_max_budget_usd", is_error: true, total_cost_usd: 1.51 } }));
    const r = await createClaudeRunner({ query: fake.query })("p", { slug: SLUG }, env);
    expect(r).toMatchObject({ ok: false, reason: "max_cost", costUsd: 1.51 });
    expect(!r.ok && r.error).toMatch(/\$1\.5 cost cap .*CLAUDE_MAX_COST_USD/);
  });

  it("stops a runaway stream itself even if the SDK cap does not trigger", async () => {
    const { env } = makeEnv({ claudeMaxTurns: 3 });
    const fake = fakeQuery(() => ({ runaway: true }));
    const r = await createClaudeRunner({ query: fake.query })("p", { slug: SLUG }, env);
    expect(r).toMatchObject({ ok: false, reason: "max_turns" });
    expect(fake.calls[0].options.abortController?.signal.aborted).toBe(true);
  });

  it("stops a job that runs past the timeout", async () => {
    const { env } = makeEnv({ claudeTimeoutMs: 50 });
    const fake = fakeQuery(() => ({ hang: true }));
    const r = await createClaudeRunner({ query: fake.query })("p", { slug: SLUG }, env);
    expect(r).toMatchObject({ ok: false, reason: "timeout" });
  });

  it("reports SDK errors", async () => {
    const { env } = makeEnv();
    const fake = fakeQuery(() => ({ throwAtStart: "Invalid API key" }));
    const r = await createClaudeRunner({ query: fake.query })("p", { slug: SLUG }, env);
    expect(r).toMatchObject({ ok: false, reason: "error" });
    expect(!r.ok && r.error).toContain("Invalid API key");
  });

  it("starts a fresh session if the stored one cannot be resumed", async () => {
    const { env, steps } = makeEnv();
    const fake = fakeQuery((call) =>
      call.options.resume ? { throwAtStart: "No conversation found with session ID" } : { sessionId: "sess-new", final: skillBlock({ slug: SLUG }) },
    );
    const r = await createClaudeRunner({ query: fake.query })("follow-up", { slug: SLUG, resumeSessionId: "gone", freshPrompt: "fresh prompt" }, env);
    expect(r).toMatchObject({ ok: true, sessionId: "sess-new", startedFresh: true });
    expect(fake.calls.map((c) => [c.options.resume, c.prompt])).toEqual([
      ["gone", "follow-up"],
      [undefined, "fresh prompt"],
    ]);
    expect(steps.join("\n")).toMatch(/starting a new one/);
  });
});

describe("parseSkillOutput", () => {
  it("parses the block from the skill", () => {
    const text = [
      "Created src/landing-pages/ca-final.js.",
      "",
      "SLUG: ca-final",
      "PAGE: /ca-final",
      "SUCCESS: /ca-final-success",
      "VARIANTS:",
      "- /ca-final?v=fear-angle",
      "- /ca-final?v=price",
      "COULDNT_DO:",
      "- A quiz section (no block supports it)",
      "- Map of the venue",
      "QUESTIONS:",
      "none",
    ].join("\n");
    expect(parseSkillOutput(text)).toEqual({
      slug: "ca-final",
      page: "/ca-final",
      success: "/ca-final-success",
      variants: ["fear-angle", "price"],
      couldntDo: ["A quiz section (no block supports it)", "Map of the venue"],
      questions: [],
      summary: "Created src/landing-pages/ca-final.js.",
    });
  });

  it("handles fences, inline values, pending fields and the last block wins", () => {
    const text = [
      "SLUG: old",
      "QUESTIONS:",
      "- stale?",
      "Thinking again...",
      "```",
      "SLUG: ca-final",
      "PAGE: pending",
      "SUCCESS: pending",
      "VARIANTS: none",
      "COULDNT_DO: none",
      "QUESTIONS:",
      "- What is the price",
      "  (in rupees)?",
      "2. Who is the faculty?",
      "```",
    ].join("\n");
    const p = parseSkillOutput(text)!;
    expect(p.slug).toBe("ca-final");
    expect(p.page).toBeUndefined();
    expect(p.variants).toEqual([]);
    expect(p.couldntDo).toEqual([]);
    expect(p.questions).toEqual(["What is the price (in rupees)?", "Who is the faculty?"]);
  });

  it("returns undefined without a block", () => {
    expect(parseSkillOutput("I could not finish.")).toBeUndefined();
  });
});
