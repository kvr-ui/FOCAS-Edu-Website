import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Context } from "grammy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildPrompt, createBranchFlow, shortSummary, type BranchFlowDeps } from "../src/branch.js";
import { createClaudeRunner } from "../src/claude.js";
import type { IntakeImages } from "../src/images.js";
import { StateStore } from "../src/state.js";
import type { PageJob, ServiceEnv } from "../src/types.js";
import type { GetPreviewUrl } from "../src/vercel.js";
import { fakeQuery, skillBlock, type FakeCall, type FakeScript } from "./fake-sdk.js";
import { BOT_ID, MEMBER_ID, makeHarness, testConfig, textUpdate, tmpDir } from "./helpers.js";

/**
 * Everything runs against a throwaway setup in a temp dir:
 *   origin.git  bare "GitHub" remote
 *   seed/       a clone used to author commits on main
 *   repo/       the bot's checkout (REPO_DIR)
 * Claude is the fake SDK from fake-sdk.ts driving the REAL runner + tool policy; the
 * validator and `npm run build` are small fakes committed into the throwaway repo.
 */

const FAKE_VALIDATE = `
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const slug = process.argv[2];
const file = path.resolve("src/landing-pages", slug + ".js");
if (!existsSync(file)) { console.error("No config for slug " + slug); process.exit(1); }
const cfg = (await import(pathToFileURL(file).href)).default;
const errors = [];
if (cfg.slug !== slug) errors.push("slug: must equal the file name");
if (!cfg.meta || typeof cfg.meta.title !== "string") errors.push("meta.title: required string");
if (errors.length) { console.log("src/landing-pages/" + slug + ".js"); for (const e of errors) console.log("  - " + e); process.exit(1); }
console.log(slug + ": valid");
`;

const FAKE_BUILD = `
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
for (const f of readdirSync("src/landing-pages")) {
  if (readFileSync("src/landing-pages/" + f, "utf8").includes("BREAK_BUILD")) {
    for (let i = 1; i <= 40; i++) console.log("vite log line " + i);
    console.error("error during build: Unexpected token in " + f);
    process.exit(1);
  }
}
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", "<html></html>");
console.log("built");
`;

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function tryGit(cwd: string, ...args: string[]): string | undefined {
  try {
    return git(cwd, ...args);
  } catch {
    return undefined;
  }
}

function pageConfig(slug: string, opts: { title?: string; extra?: string; variants?: boolean } = {}) {
  return [
    "export default {",
    `  slug: "${slug}",`,
    `  meta: { title: "${opts.title ?? "CA Final Strategy Masterclass"}", description: "One evening, one plan." },`,
    `  sections: [{ type: "hero", id: "hero", title: "Pass CA Final", image: "/lp/${slug}/hero.webp" }],`,
    '  form: { fields: ["name", "phone"], submit: { kind: "zoho", source: "ca-final" } },',
    '  success: { title: "You are in!" },',
    opts.variants === false ? "" : '  variants: { "fear-angle": { hero: { title: "Do not fail again" }, sourceSuffix: "fear" } },',
    opts.extra ?? "",
    "};",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** A fake agent that writes `content` for the slug named in the prompt and runs the two allowed commands. */
function authoring(content: (slug: string) => string, extra: Partial<FakeScript> = {}) {
  return (call: FakeCall): FakeScript => {
    const slug = slugFromPrompt(call.prompt);
    return {
      ...extra,
      steps: [
        { tool: "Read", input: { file_path: "src/landing-pages/_template.js" } },
        { tool: "Write", input: { file_path: `src/landing-pages/${slug}.js`, content: content(slug) } },
        { tool: "Bash", input: { command: `node scripts/validate-landing.mjs ${slug}` } },
        { tool: "Bash", input: { command: "npm run build" } },
        ...(extra.steps ?? []),
      ],
      final: extra.final ?? skillBlock({ slug, variants: ["fear-angle"], couldntDo: ["Live chat widget (no block supports it)"], summary: "Created the page." }),
    };
  };
}

function slugFromPrompt(prompt: string): string {
  const m = prompt.match(/slug is fixed by the bot: "([^"]+)"/) ?? prompt.match(/landing page "([^"]+)"/);
  if (!m) throw new Error(`no slug in prompt:\n${prompt}`);
  return m[1];
}

interface Fixture {
  root: string;
  origin: string;
  repo: string;
  env: ServiceEnv;
  steps: string[];
  previews: Array<{ sha: string; branch: string }>;
  intake: ReturnType<typeof vi.fn<IntakeImages>>;
  getPreviewUrl: ReturnType<typeof vi.fn<GetPreviewUrl>>;
  flow(handler: Parameters<typeof fakeQuery>[0], deps?: Partial<BranchFlowDeps>): {
    run: (slug: string, job: Partial<PageJob>) => ReturnType<ReturnType<typeof createBranchFlow>>;
    fake: ReturnType<typeof fakeQuery>;
  };
  remoteBranch(slug: string): string | undefined;
  remoteFile(ref: string, file: string): string | undefined;
}

function setup(): Fixture {
  const root = tmpDir("lpbot-branch-");
  const origin = path.join(root, "origin.git");
  const seed = path.join(root, "seed");
  const repo = path.join(root, "repo");

  git(root, "init", "--quiet", "--bare", "-b", "main", origin);
  git(root, "clone", "--quiet", origin, seed);
  for (const cwd of [seed]) {
    git(cwd, "config", "user.name", "Test");
    git(cwd, "config", "user.email", "test@example.com");
    git(cwd, "config", "commit.gpgsign", "false");
  }
  git(seed, "checkout", "--quiet", "-b", "main");
  const files: Record<string, string> = {
    "package.json": '{ "name": "site", "private": true, "type": "module", "scripts": { "build": "node build.mjs" } }\n',
    "package-lock.json": '{ "lockfileVersion": 3 }\n',
    ".gitignore": "node_modules\ndist\n",
    "build.mjs": FAKE_BUILD,
    "scripts/validate-landing.mjs": FAKE_VALIDATE,
    "src/App.jsx": "line 1\nline 2\n",
    "src/landing-pages/_template.js": "export default {};\n",
    ".claude/skills/new-landing-page/SKILL.md": "---\nname: new-landing-page\n---\n",
  };
  for (const [f, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(seed, f)), { recursive: true });
    writeFileSync(path.join(seed, f), content);
  }
  git(seed, "add", "-A");
  git(seed, "commit", "--quiet", "-m", "initial");
  git(seed, "push", "--quiet", "-u", "origin", "main");

  git(root, "clone", "--quiet", origin, repo);
  git(repo, "config", "user.name", "Bot");
  git(repo, "config", "user.email", "bot@example.com");
  git(repo, "config", "commit.gpgsign", "false");
  // node_modules newer than package-lock.json, so no `npm ci` is attempted.
  mkdirSync(path.join(repo, "node_modules"));
  writeFileSync(path.join(repo, "node_modules/.package-lock.json"), "{}");
  const future = new Date(Date.now() + 3600_000);
  utimesSync(path.join(repo, "node_modules/.package-lock.json"), future, future);

  const config = testConfig({ repoDir: repo, stateDir: path.join(root, "state") });
  const steps: string[] = [];
  const env: ServiceEnv = { config, state: new StateStore(config.stateDir), report: async (l) => void steps.push(l) };
  const previews: Array<{ sha: string; branch: string }> = [];

  const intake = vi.fn<IntakeImages>(async (_ctx, slug, e) => {
    const dir = path.join(e.config.repoDir, "public/lp", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "hero.webp"), "RIFF-fake-webp");
    return { images: [{ path: `/lp/${slug}/hero.webp`, width: 1600, height: 900 }], rejected: [], captionText: "" };
  });
  const getPreviewUrl = vi.fn<GetPreviewUrl>(async (sha, branch) => {
    previews.push({ sha, branch });
    return { status: "ready", url: `https://site-git-${branch.replace(/\//g, "-")}-team.vercel.app` };
  });

  return {
    root,
    origin,
    repo,
    env,
    steps,
    previews,
    intake,
    getPreviewUrl,
    flow(handler, deps = {}) {
      const fake = fakeQuery(handler);
      const flow = createBranchFlow({
        intakeImages: intake,
        getPreviewUrl,
        runClaude: createClaudeRunner({ query: fake.query }),
        ...deps,
      });
      const run = (slug: string, job: Partial<PageJob>) =>
        flow(
          slug,
          { kind: "new", slug, text: "brief", chatId: 1, userId: 1, userName: "@tester", ctx: {} as Context, ...job } as PageJob,
          env,
        );
      return { run, fake };
    },
    remoteBranch: (slug) => tryGit(origin, "rev-parse", "--verify", "--quiet", `refs/heads/lp/${slug}`),
    remoteFile: (ref, file) => tryGit(origin, "show", `${ref}:${file}`),
  };
}

/** Paths changed on origin's lp/<slug> relative to main. */
function changedOnBranch(f: Fixture, slug: string): string[] {
  return git(f.origin, "diff", "--name-only", `main...lp/${slug}`).split("\n").filter(Boolean).sort();
}

const BRIEF = "CA Final Strategy Masterclass, free, 30 Nov 2026 7pm IST, register by 29 Nov, add a live chat widget";

let f: Fixture;
beforeEach(() => {
  f = setup();
});

describe("branchFlow: /newpage", () => {
  it("pushes lp/<slug> with changes only under the allowed paths and returns preview/success/variant links", async () => {
    const slug = "ca-final-strategy";
    const { run, fake } = f.flow(authoring((s) => pageConfig(s)));
    const r = await run(slug, { kind: "new", text: BRIEF });

    expect(r).toMatchObject({ ok: true, branch: `lp/${slug}`, questions: [] });
    if (!r.ok) throw new Error(r.error);
    expect(changedOnBranch(f, slug)).toEqual([`public/lp/${slug}/hero.webp`, `src/landing-pages/${slug}.js`]);
    expect(f.remoteBranch(slug)).toBe(r.commitSha);
    expect(git(f.origin, "log", "-1", "--format=%s", `lp/${slug}`)).toBe(`lp: ${slug} — new page: ${BRIEF.slice(0, 59).trimEnd()}…`);
    expect(r.links).toEqual([
      `Page: https://site-git-lp-${slug}-team.vercel.app/${slug}`,
      `Success page: https://site-git-lp-${slug}-team.vercel.app/${slug}-success`,
      `Variant "fear-angle": https://site-git-lp-${slug}-team.vercel.app/${slug}?v=fear-angle`,
    ]);
    expect(r.couldntDo).toEqual(["Live chat widget (no block supports it)"]);
    expect(r.claudeSessionId).toMatch(/^fake-session-/);
    expect(f.previews).toEqual([{ sha: r.commitSha, branch: `lp/${slug}` }]);
    // Claude's own validate + build ran through the allowlist and worked.
    expect(fake.outcomes.filter((o) => o.tool === "Bash").map((o) => [o.allowed, o.status])).toEqual([
      [true, 0],
      [true, 0],
    ]);
    // The prompt carried the skill, the brief and the uploaded image.
    const prompt = fake.calls[0].prompt;
    expect(prompt).toContain("Use the new-landing-page skill");
    expect(prompt).toContain(BRIEF);
    expect(prompt).toContain(`/lp/${slug}/hero.webp`);
    expect(git(f.repo, "status", "--porcelain")).toBe("");
    // main is untouched.
    expect(git(f.origin, "log", "--format=%s", "main")).toBe("initial");
  });

  it("refuses to run in the checkout the bot itself runs from", async () => {
    const own = path.resolve(import.meta.dirname, "../..");
    const flow = createBranchFlow({ intakeImages: f.intake, getPreviewUrl: f.getPreviewUrl, runClaude: vi.fn() });
    const env = { ...f.env, config: { ...f.env.config, repoDir: own } };
    const r = await flow("x-page", { kind: "new", slug: "x-page", text: "b", chatId: 1, userId: 1, userName: "t", ctx: {} as Context }, env);
    expect(r).toMatchObject({ ok: false, error: expect.stringContaining("is the checkout the bot runs from") });
  });

  it("refuses to overwrite an existing remote branch for a new page", async () => {
    const slug = "taken";
    const first = f.flow(authoring((s) => pageConfig(s)));
    expect((await first.run(slug, { kind: "new" })).ok).toBe(true);
    const sha = f.remoteBranch(slug);
    const second = f.flow(authoring((s) => pageConfig(s, { title: "Other" })));
    const r = await second.run(slug, { kind: "new" });
    expect(r).toMatchObject({ ok: false, error: expect.stringContaining(`A branch lp/${slug} already exists`) });
    expect(f.remoteBranch(slug)).toBe(sha);
    expect(second.fake.calls).toHaveLength(0);
  });
});

describe("branchFlow: out-of-bounds changes", () => {
  it("a forced out-of-bounds Write is denied by canUseTool; the page still ships without it", async () => {
    const slug = "guarded";
    const { run, fake } = f.flow(
      authoring((s) => pageConfig(s), {
        steps: [
          { tool: "Write", input: { file_path: "src/App.jsx", content: "pwned" } },
          { tool: "Edit", input: { file_path: "src/landing-pages/../App.jsx", old_string: "line 1", new_string: "pwned" } },
          { tool: "Bash", input: { command: "npm run build && echo pwned > src/App.jsx" } },
          { tool: "Bash", input: { command: "git push origin HEAD:main" } },
        ],
      }),
    );
    const r = await run(slug, { kind: "new" });
    expect(fake.outcomes.filter((o) => !o.allowed).map((o) => o.tool)).toEqual(["Write", "Edit", "Bash", "Bash"]);
    expect(r.ok ? "" : r.error).toBe("");
    expect(r.ok).toBe(true);
    expect(changedOnBranch(f, slug)).toEqual([`public/lp/${slug}/hero.webp`, `src/landing-pages/${slug}.js`]);
    expect(f.remoteFile(`lp/${slug}`, "src/App.jsx")).toBe("line 1\nline 2");
    if (r.ok) expect(r.summary).toMatch(/Blocked tool calls \(4\)/);
  });

  it("a change that slips past canUseTool is caught by the porcelain guard: reset, clean, abort, nothing pushed", async () => {
    const slug = "sneaky";
    const { run } = f.flow(
      authoring((s) => pageConfig(s), {
        steps: [
          {
            bypass: (cwd) => {
              writeFileSync(path.join(cwd, "src/App.jsx"), "pwned\n");
              mkdirSync(path.join(cwd, "src/components"), { recursive: true });
              writeFileSync(path.join(cwd, "src/components/Evil.jsx"), "evil\n");
              writeFileSync(path.join(cwd, "src/landing-pages/other-page.js"), "export default {};\n");
            },
          },
        ],
      }),
    );
    const r = await run(slug, { kind: "new" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/outside src\/landing-pages\/sneaky\.js and public\/lp\/sneaky\//);
    expect(r.error).toContain("- src/App.jsx");
    expect(r.error).toContain("- src/components/Evil.jsx");
    expect(r.error).toContain("- src/landing-pages/other-page.js");
    expect(r.error).not.toContain(`src/landing-pages/${slug}.js\n`);
    expect(f.remoteBranch(slug)).toBeUndefined();
    expect(readFileSync(path.join(f.repo, "src/App.jsx"), "utf8")).toBe("line 1\nline 2\n");
    expect(existsSync(path.join(f.repo, "src/components/Evil.jsx"))).toBe(false);
    expect(existsSync(path.join(f.repo, `src/landing-pages/${slug}.js`))).toBe(false);
    expect(git(f.repo, "status", "--porcelain")).toBe("");
    expect(f.previews).toHaveLength(0);
  });
});

describe("branchFlow: validation and build failures", () => {
  it("failed validation pushes nothing and returns the error tail", async () => {
    const slug = "invalid-page";
    const { run } = f.flow(authoring((s) => `export default { slug: "${s}", meta: {} };\n`));
    const r = await run(slug, { kind: "new" });
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/^Validation failed, nothing was pushed:\n[\s\S]*meta\.title: required string/) });
    expect(r.ok ? undefined : r.claudeSessionId).toMatch(/^fake-session-/);
    expect(f.remoteBranch(slug)).toBeUndefined();
    expect(git(f.repo, "status", "--porcelain")).toBe("");
    expect(f.previews).toHaveLength(0);
  });

  it("failed build pushes nothing and returns the last lines of the build output", async () => {
    const slug = "broken-build";
    const { run } = f.flow(authoring((s) => pageConfig(s, { extra: '  note: "BREAK_BUILD",' })));
    const r = await run(slug, { kind: "new" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/^Build failed, nothing was pushed:\n/);
    expect(r.error).toContain("error during build: Unexpected token");
    expect(r.error).not.toContain("vite log line 1\n"); // only the tail
    expect(f.remoteBranch(slug)).toBeUndefined();
    expect(git(f.repo, "status", "--porcelain")).toBe("");
  });

  it("Claude not writing the config pushes nothing", async () => {
    const { run } = f.flow(() => ({ final: "I got confused." }));
    const r = await run("nothing", { kind: "new" });
    expect(r).toMatchObject({ ok: false, error: expect.stringContaining("Claude did not write src/landing-pages/nothing.js") });
    expect(r.ok ? "" : r.error).toContain("I got confused.");
    expect(f.remoteBranch("nothing")).toBeUndefined();
  });

  it("the turn and cost caps stop a runaway job with a message and nothing is pushed", async () => {
    f.env.config.claudeMaxTurns = 4;
    const runaway = f.flow((call) => ({
      steps: [{ tool: "Write", input: { file_path: `src/landing-pages/${slugFromPrompt(call.prompt)}.js`, content: pageConfig(slugFromPrompt(call.prompt)) } }],
      runaway: true,
    }));
    const r1 = await runaway.run("runaway", { kind: "new" });
    expect(r1).toMatchObject({ ok: false, error: expect.stringMatching(/maximum of 4 turns \(CLAUDE_MAX_TURNS\)[\s\S]*Nothing was pushed/) });
    expect(f.remoteBranch("runaway")).toBeUndefined();
    expect(git(f.repo, "status", "--porcelain")).toBe("");

    const costly = f.flow(() => ({ result: { subtype: "error_max_budget_usd", is_error: true } }));
    const r2 = await costly.run("costly", { kind: "new" });
    expect(r2).toMatchObject({ ok: false, error: expect.stringMatching(/\$2 cost cap.*CLAUDE_MAX_COST_USD[\s\S]*Nothing was pushed/) });
    expect(f.remoteBranch("costly")).toBeUndefined();
  });
});

describe("branchFlow: /edit and questions", () => {
  it("/edit resumes the stored session, modifies the same config and produces a new preview", async () => {
    const slug = "edit-me";
    const created = await f.flow(authoring((s) => pageConfig(s))).run(slug, { kind: "new" });
    if (!created.ok) throw new Error(created.error);

    // main moves on meanwhile: the edit must rebase onto it.
    const seed = path.join(f.root, "seed");
    writeFileSync(path.join(seed, "README.md"), "news\n");
    git(seed, "add", "README.md");
    git(seed, "commit", "--quiet", "-m", "unrelated main change");
    git(seed, "push", "--quiet", "origin", "main");

    const { run, fake } = f.flow((call) => ({
      steps: [
        { tool: "Read", input: { file_path: `src/landing-pages/${slug}.js` } },
        { tool: "Edit", input: { file_path: `src/landing-pages/${slug}.js`, old_string: "Pass CA Final", new_string: "Pass CA Final in 2027" } },
        { tool: "Bash", input: { command: `node scripts/validate-landing.mjs ${slug}` } },
      ],
      final: skillBlock({ slug, variants: ["fear-angle"], summary: `Changed the hero title (session ${call.options.resume}).` }),
    }));
    const r = await run(slug, { kind: "edit", text: "make the hero say 2027", resumeSessionId: created.claudeSessionId });

    expect(fake.calls[0].options.resume).toBe(created.claudeSessionId);
    expect(fake.calls[0].prompt).toContain("make the hero say 2027");
    expect(r).toMatchObject({ ok: true, claudeSessionId: created.claudeSessionId });
    if (!r.ok) throw new Error(r.error);
    expect(r.commitSha).not.toBe(created.commitSha);
    expect(f.remoteBranch(slug)).toBe(r.commitSha);
    expect(f.remoteFile(`lp/${slug}`, `src/landing-pages/${slug}.js`)).toContain("Pass CA Final in 2027");
    expect(f.remoteFile(`lp/${slug}`, "README.md")).toBe("news"); // rebased on the new main
    expect(git(f.origin, "log", "-1", "--format=%s", `lp/${slug}`)).toBe(`lp: ${slug} — make the hero say 2027`);
    expect(changedOnBranch(f, slug)).toEqual([`public/lp/${slug}/hero.webp`, `src/landing-pages/${slug}.js`]);
    expect(f.previews.map((p) => p.sha)).toEqual([created.commitSha, r.commitSha]);
    expect(r.links[0]).toBe(`Page: https://site-git-lp-${slug}-team.vercel.app/${slug}`);
  });

  it("questions are relayed without pushing; the answer continues the same session and ships the page", async () => {
    const slug = "rti-batch";
    const asking = f.flow(() => ({
      sessionId: "sess-q",
      final: skillBlock({ slug, pending: true, questions: ["What is the price?", "When does registration close?"] }),
    }));
    const q = await asking.run(slug, { kind: "new", text: "RTI batch" });
    expect(q).toMatchObject({ ok: true, questions: ["What is the price?", "When does registration close?"], claudeSessionId: "sess-q", links: [] });
    expect(f.remoteBranch(slug)).toBeUndefined();
    expect(f.previews).toHaveLength(0);
    // The uploaded image is kept in a local commit for the follow-up.
    expect(git(f.repo, "log", "-1", "--format=%s", `lp/${slug}`)).toMatch(/files pending answers/);

    f.intake.mockImplementationOnce(async () => ({ images: [], rejected: [], captionText: "" }));
    const answering = f.flow((call) => ({
      steps: [{ tool: "Write", input: { file_path: `src/landing-pages/${slug}.js`, content: pageConfig(slug, { title: "RTI batch", variants: false }) } }],
      final: skillBlock({ slug, summary: `Answers received in ${call.options.resume}.` }),
    }));
    const r = await answering.run(slug, { kind: "edit", text: "Rs 2999, closes 1 Dec", resumeSessionId: "sess-q" });
    expect(answering.fake.calls[0].options.resume).toBe("sess-q");
    expect(answering.fake.calls[0].prompt).toMatch(/^Follow-up from the team about landing page "rti-batch"/);
    expect(answering.fake.calls[0].prompt).toContain("Rs 2999, closes 1 Dec");
    expect(answering.fake.calls[0].prompt).toContain("Other images already in public/lp/rti-batch/: hero.webp");
    expect(r).toMatchObject({ ok: true, questions: [], claudeSessionId: "sess-q" });
    expect(changedOnBranch(f, slug)).toEqual([`public/lp/${slug}/hero.webp`, `src/landing-pages/${slug}.js`]);
    if (r.ok) expect(r.links).toHaveLength(2); // page + success, no variants
  });
});

describe("router + real branch flow (fake Claude, throwaway repo)", () => {
  it("/newpage replies with preview, success and variant links plus Couldn't do; a reply edits in the same session", async () => {
    const fake = fakeQuery((call) =>
      call.options.resume
        ? {
            steps: [
              {
                tool: "Edit",
                input: { file_path: `src/landing-pages/${slugFromPrompt(call.prompt)}.js`, old_string: "You are in!", new_string: "See you there!" },
              },
            ],
            final: skillBlock({ slug: slugFromPrompt(call.prompt), variants: ["fear-angle"] }),
          }
        : authoring((s) => pageConfig(s))(call),
    );
    const branchFlow = createBranchFlow({ intakeImages: f.intake, getPreviewUrl: f.getPreviewUrl, runClaude: createClaudeRunner({ query: fake.query }) });
    const h = makeHarness({
      config: f.env.config,
      deps: { branchFlow, imageMiddleware: () => (_ctx, next) => next() },
    });

    await h.send(textUpdate(MEMBER_ID, `/newpage ${BRIEF}`));
    const preview = h.sent().find((c) => String(c.payload.text).startsWith("Preview for"));
    expect(preview, h.texts().join("\n---\n")).toBeDefined();
    const text = String(preview!.payload.text);
    const slug = text.match(/Preview for "([^"]+)"/)![1];
    expect(slug).toBe("ca-final-strategy-masterclass");
    const base = `https://site-git-lp-${slug}-team.vercel.app`;
    expect(text).toContain(`Page: ${base}/${slug}`);
    expect(text).toContain(`Success page: ${base}/${slug}-success`);
    expect(text).toContain(`Variant "fear-angle": ${base}/${slug}?v=fear-angle`);
    expect(text).toContain("Couldn't do:\n- Live chat widget (no block supports it)");
    const session = h.state.getPage(MEMBER_ID, slug)?.claudeSessionId;
    expect(session).toMatch(/^fake-session-/);

    const previewId = 500 + h.sent().indexOf(preview!);
    await h.send(textUpdate(MEMBER_ID, "change the thank-you title", { replyTo: { message_id: previewId, fromId: BOT_ID } }));
    expect(fake.calls[1].options.resume).toBe(session);
    expect(f.remoteFile(`lp/${slug}`, `src/landing-pages/${slug}.js`)).toContain("See you there!");
    expect(h.texts().filter((t) => t.startsWith("Preview for"))).toHaveLength(2);
  });

  it("questions are relayed to Telegram and a plain next message (private chat) continues the session", async () => {
    const fake = fakeQuery((call) => {
      const slug = slugFromPrompt(call.prompt);
      return call.options.resume
        ? { steps: [{ tool: "Write", input: { file_path: `src/landing-pages/${slug}.js`, content: pageConfig(slug) } }], final: skillBlock({ slug }) }
        : { sessionId: "sess-ask", final: skillBlock({ slug, pending: true, questions: ["What is the price?"] }) };
    });
    const branchFlow = createBranchFlow({ intakeImages: f.intake, getPreviewUrl: f.getPreviewUrl, runClaude: createClaudeRunner({ query: fake.query }) });
    const h = makeHarness({ config: f.env.config, deps: { branchFlow, imageMiddleware: () => (_ctx, next) => next() } });

    await h.send(textUpdate(MEMBER_ID, "/newpage RTI weekend batch"));
    expect(h.texts().join("\n")).toContain('Claude has questions about "rti-weekend-batch":\n- What is the price?');
    expect(h.state.getPage(MEMBER_ID, "rti-weekend-batch")).toMatchObject({ claudeSessionId: "sess-ask", awaitingAnswers: true });

    await h.send(textUpdate(MEMBER_ID, "Rs 2999"));
    expect(fake.calls[1].options.resume).toBe("sess-ask");
    expect(fake.calls[1].prompt).toContain("Rs 2999");
    expect(h.texts().join("\n")).toContain('Preview for "rti-weekend-batch"');
    expect(h.state.getPage(MEMBER_ID, "rti-weekend-batch")?.awaitingAnswers).toBe(false);
    expect(f.remoteBranch("rti-weekend-batch")).toBeDefined();
  });

  it("a failed build is reported with its tail and a reply to the failure continues the session", async () => {
    const fake = fakeQuery((call) => {
      const slug = slugFromPrompt(call.prompt);
      return call.options.resume
        ? { steps: [{ tool: "Write", input: { file_path: `src/landing-pages/${slug}.js`, content: pageConfig(slug) } }], final: skillBlock({ slug }) }
        : authoring((s) => pageConfig(s, { extra: '  note: "BREAK_BUILD",' }))(call);
    });
    const branchFlow = createBranchFlow({ intakeImages: f.intake, getPreviewUrl: f.getPreviewUrl, runClaude: createClaudeRunner({ query: fake.query }) });
    const h = makeHarness({ config: f.env.config, deps: { branchFlow, imageMiddleware: () => (_ctx, next) => next() } });

    await h.send(textUpdate(MEMBER_ID, "/newpage Audit course promo"));
    const failure = h.sent().find((c) => String(c.payload.text).startsWith('Could not create "audit-course-promo"'))!;
    expect(String(failure.payload.text)).toContain("Build failed, nothing was pushed:");
    expect(String(failure.payload.text)).toContain("error during build: Unexpected token");
    expect(f.remoteBranch("audit-course-promo")).toBeUndefined();

    const session = h.state.getPage(MEMBER_ID, "audit-course-promo")?.claudeSessionId;
    expect(session).toMatch(/^fake-session-/);
    const failId = 500 + h.sent().indexOf(failure);
    await h.send(textUpdate(MEMBER_ID, "fix it", { replyTo: { message_id: failId, fromId: BOT_ID } }));
    expect(fake.calls[1].options.resume).toBe(session);
    expect(h.texts().join("\n")).toContain('Preview for "audit-course-promo"');
    expect(f.remoteBranch("audit-course-promo")).toBeDefined();
  });
});

describe("prompt and summary helpers", () => {
  it("builds the new/edit/follow-up prompts", () => {
    const base = { slug: "x-page", text: "brief", images: [], existingImages: [], pageExists: false };
    expect(buildPrompt({ ...base, kind: "new", resume: false })).toMatch(/^Use the new-landing-page skill to create a NEW landing page/);
    expect(buildPrompt({ ...base, kind: "edit", pageExists: true, resume: false })).toMatch(/^Use the new-landing-page skill to EDIT/);
    expect(buildPrompt({ ...base, kind: "edit", resume: true })).toMatch(/^Follow-up from the team/);
  });

  it("makes a one-line commit summary", () => {
    expect(shortSummary({ kind: "edit", text: "make\nthe CTA   green" })).toBe("make the CTA green");
    expect(shortSummary({ kind: "new", text: "x".repeat(100) })).toBe(`new page: ${"x".repeat(59)}…`);
  });
});
