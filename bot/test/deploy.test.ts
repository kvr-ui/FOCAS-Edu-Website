import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import type { Config } from "../src/config.js";
import { BUILD_INFO_FILE, createDeployer, hasOgTitle, readPageTitle, type DeployOptions } from "../src/deploy.js";
import { StateStore } from "../src/state.js";
import type { ServiceEnv } from "../src/types.js";
import { MEMBER_ID, OWNER_ID, makeHarness, testConfig, textUpdate, tmpDir } from "./helpers.js";

/**
 * Everything runs against a throwaway setup in a temp dir:
 *   origin.git  bare "GitHub" remote
 *   seed/       a clone used to author commits and push branches
 *   repo/       the bot's checkout (REPO_DIR)
 *   www/        WEB_ROOT, served by a fake fetch that reads <www>/<path>/index.html
 */

const FAKE_BUILD = `
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
if (existsSync("FAIL_BUILD")) {
  for (let i = 1; i <= 40; i++) console.log("build log line " + i);
  console.error("ERROR: something broke in the build");
  process.exit(1);
}
const out = "dist-new";
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, "index.html"), "<html><head><title>FOCAS</title></head></html>");
const dir = "src/landing-pages";
for (const f of existsSync(dir) ? readdirSync(dir) : []) {
  if (!f.endsWith(".js") || f.startsWith("_")) continue;
  const slug = f.slice(0, -3);
  const title = readFileSync(path.join(dir, f), "utf8").match(/title:\\s*"([^"]*)"/)[1];
  const og = existsSync("BREAK_OG") ? "" : '<meta property="og:title" content="' + title.replace(/&/g, "&amp;") + '">';
  for (const p of [slug, slug + "-success"]) {
    mkdirSync(path.join(out, p), { recursive: true });
    writeFileSync(path.join(out, p, "index.html"), "<html><head>" + og + "</head><body>" + process.env.SITE_URL + "</body></html>");
  }
}
`;

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function configureIdentity(cwd: string) {
  git(cwd, "config", "user.name", "Test");
  git(cwd, "config", "user.email", "test@example.com");
  git(cwd, "config", "commit.gpgsign", "false");
}

function pageConfig(slug: string, title: string) {
  return `export default {\n  slug: "${slug}",\n  meta: { title: "${title}", description: "d" },\n  sections: [],\n};\n`;
}

interface Fixture {
  root: string;
  origin: string;
  seed: string;
  repo: string;
  webRoot: string;
  ciLog: string;
  config: Config;
  state: StateStore;
  env: ServiceEnv;
  steps: string[];
  fetchCalls: string[];
  /** Commit, push and return the sha (in the seed clone). */
  commit(files: Record<string, string>, message: string): string;
  branch(name: string, from?: string): void;
  deployer(opts?: DeployOptions): ReturnType<typeof createDeployer>;
  live(file?: string): string;
}

function setup(): Fixture {
  const root = tmpDir("lpbot-deploy-");
  const origin = path.join(root, "origin.git");
  const seed = path.join(root, "seed");
  const repo = path.join(root, "repo");
  const webRoot = path.join(root, "www");
  const ciLog = path.join(root, "ci.log");

  git(root, "init", "--quiet", "--bare", "-b", "main", origin);
  git(root, "clone", "--quiet", origin, seed);
  configureIdentity(seed);
  git(seed, "checkout", "--quiet", "-b", "main");

  const commit = (files: Record<string, string>, message: string) => {
    for (const [f, content] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(seed, f)), { recursive: true });
      writeFileSync(path.join(seed, f), content);
    }
    git(seed, "add", "-A");
    git(seed, "commit", "--quiet", "-m", message);
    git(seed, "push", "--quiet", "origin", "HEAD");
    return git(seed, "rev-parse", "HEAD");
  };

  commit(
    {
      "package.json": '{ "name": "site", "private": true, "type": "module" }\n',
      "package-lock.json": '{ "lockfileVersion": 3 }\n',
      ".gitignore": "node_modules\ndist-new\n",
      "build.mjs": FAKE_BUILD,
      "src/landing-pages/_template.js": "export default {};\n",
      "src/App.jsx": "line 1\nline 2\nline 3\n",
    },
    "initial",
  );
  git(seed, "push", "--quiet", "-u", "origin", "main");

  git(root, "clone", "--quiet", origin, repo);
  configureIdentity(repo);
  mkdirSync(path.join(repo, "node_modules"));

  // The site that is live before any bot deploy.
  mkdirSync(path.join(webRoot, "old-page"), { recursive: true });
  writeFileSync(path.join(webRoot, "index.html"), "OLD BUILD");
  writeFileSync(path.join(webRoot, BUILD_INFO_FILE), JSON.stringify({ commit: "0ld0000aaaaaaa", slug: "old-page", time: "t", by: "x" }));

  const config = testConfig({ repoDir: repo, webRoot, siteUrl: "https://focasedu.test", stateDir: path.join(root, "state") });
  const state = new StateStore(config.stateDir);
  const steps: string[] = [];
  const env: ServiceEnv = { config, state, report: async (l) => void steps.push(l) };
  const fetchCalls: string[] = [];

  const fakeFetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    fetchCalls.push(url.href);
    const file = path.join(webRoot, decodeURIComponent(url.pathname), "index.html");
    return existsSync(file)
      ? new Response(readFileSync(file, "utf8"), { status: 200 })
      : new Response("not found", { status: 404 });
  }) as typeof fetch;

  return {
    root,
    origin,
    seed,
    repo,
    webRoot,
    ciLog,
    config,
    state,
    env,
    steps,
    fetchCalls,
    commit,
    branch(name, from = "main") {
      git(seed, "checkout", "--quiet", "-B", name, from);
    },
    deployer: (opts = {}) =>
      createDeployer({
        buildCommand: "node build.mjs",
        installCommand: `echo ci >> "${ciLog}"`,
        fetch: fakeFetch,
        verifyAttempts: 1,
        verifyDelayMs: 0,
        ...opts,
      }),
    live: (file = "index.html") => readFileSync(path.join(webRoot, file), "utf8"),
  };
}

/** Push branch lp/<slug> with a page config, branched from current origin/main. */
function pushPage(f: Fixture, slug: string, title: string, extra: Record<string, string> = {}): string {
  git(f.seed, "fetch", "--quiet", "origin");
  f.branch(`lp/${slug}`, "origin/main");
  const sha = f.commit({ [`src/landing-pages/${slug}.js`]: pageConfig(slug, title), ...extra }, `lp: ${slug}`);
  git(f.seed, "checkout", "--quiet", "main");
  git(f.seed, "reset", "--quiet", "--hard", "origin/main");
  return sha;
}

const originMain = (f: Fixture) => git(f.origin, "rev-parse", "main");

describe("deployToProd", () => {
  let f: Fixture;
  beforeEach(() => {
    f = setup();
  });

  it("fast-forwards main to lp/<slug>, pushes, builds, swaps, verifies and records history", async () => {
    const sha = pushPage(f, "audit-masterclass", "Audit & Assurance Masterclass");
    const { deployToProd } = f.deployer();

    const r = await deployToProd("audit-masterclass", "@owner", f.env);

    expect(r).toEqual({
      ok: true,
      liveUrl: "https://focasedu.test/audit-masterclass",
      successUrl: "https://focasedu.test/audit-masterclass-success",
      commit: sha.slice(0, 7),
    });
    expect(originMain(f)).toBe(sha); // fast-forward, pushed
    expect(git(f.repo, "rev-parse", "HEAD")).toBe(sha);
    // New build is live, the old one kept as -prev; no build leftovers.
    expect(f.live("audit-masterclass/index.html")).toContain('content="Audit &amp; Assurance Masterclass"');
    expect(f.live("audit-masterclass/index.html")).toContain("https://focasedu.test"); // SITE_URL passed to the build
    expect(JSON.parse(f.live(BUILD_INFO_FILE))).toMatchObject({ commit: sha, slug: "audit-masterclass", by: "@owner" });
    expect(readFileSync(path.join(`${f.webRoot}-prev`, "index.html"), "utf8")).toBe("OLD BUILD");
    expect(existsSync(path.join(f.repo, "dist-new"))).toBe(false);
    expect(existsSync(`${f.webRoot}-new`)).toBe(false);
    expect(f.fetchCalls).toEqual(["https://focasedu.test/audit-masterclass"]);
    // History persisted in the state file.
    const history = JSON.parse(readFileSync(path.join(f.config.stateDir, "deploy-history.json"), "utf8"));
    expect(history).toEqual([{ slug: "audit-masterclass", commit: sha, by: "@owner", action: "deploy", time: expect.any(String) }]);
    expect(f.steps).toEqual(expect.arrayContaining(["Merging lp/audit-masterclass into main", "Pushing main", "Building"]));
  });

  it('creates a merge commit "lp: deploy <slug>" when main moved on', async () => {
    const page = pushPage(f, "fs-batch", "FS Batch");
    const other = f.commit({ "src/App.jsx": "line 1\nline 2\nline 3\nline 4\n" }, "unrelated change on main");
    const { deployToProd } = f.deployer();

    const r = await deployToProd("fs-batch", "@owner", f.env);

    expect(r.ok).toBe(true);
    const head = originMain(f);
    expect(git(f.origin, "log", "-1", "--format=%s", head)).toBe("lp: deploy fs-batch");
    expect(git(f.origin, "rev-list", "--parents", "-n", "1", head).split(" ").slice(1).sort()).toEqual([other, page].sort());
    if (r.ok) expect(r.commit).toBe(head.slice(0, 7));
  });

  it("aborts a merge conflict cleanly: main, origin and WEB_ROOT unchanged", async () => {
    pushPage(f, "clash", "Clash", { "src/App.jsx": "page branch edit\n" });
    const mainBefore = f.commit({ "src/App.jsx": "main edit\n" }, "conflicting change on main");
    const { deployToProd } = f.deployer();

    const r = await deployToProd("clash", "@owner", f.env);

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toMatch(/Merge conflict/);
      expect(r.error).toContain("src/App.jsx");
      expect(r.rolledBack).toBeUndefined();
    }
    expect(git(f.repo, "rev-parse", "HEAD")).toBe(mainBefore);
    expect(originMain(f)).toBe(mainBefore);
    expect(existsSync(path.join(f.repo, ".git", "MERGE_HEAD"))).toBe(false);
    expect(git(f.repo, "status", "--porcelain")).toBe("");
    expect(f.live()).toBe("OLD BUILD");
    expect(existsSync(`${f.webRoot}-prev`)).toBe(false);
    expect(f.state.getDeployHistory()).toEqual([]);
  });

  it("a failed build leaves WEB_ROOT untouched and returns the error tail", async () => {
    pushPage(f, "broken", "Broken", { FAIL_BUILD: "1" });
    const { deployToProd } = f.deployer();

    const r = await deployToProd("broken", "@owner", f.env);

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toMatch(/^Build failed\./);
      expect(r.error).toContain("ERROR: something broke in the build");
      expect(r.error).toContain("build log line 40");
      expect(r.error).not.toContain("build log line 1\n"); // only the tail
    }
    expect(f.live()).toBe("OLD BUILD");
    expect(existsSync(`${f.webRoot}-prev`)).toBe(false);
    expect(existsSync(path.join(f.repo, "dist-new"))).toBe(false);
    expect(f.state.getDeployHistory()).toEqual([]);
  });

  it("rolls back automatically when og:title is missing", async () => {
    pushPage(f, "no-og", "No OG", { BREAK_OG: "1" });
    const { deployToProd } = f.deployer();

    const r = await deployToProd("no-og", "@owner", f.env);

    expect(r).toMatchObject({ ok: false, rolledBack: true });
    if (!r.ok) expect(r.error).toMatch(/og:title "No OG"/);
    expect(f.live()).toBe("OLD BUILD");
    expect(f.state.getDeployHistory()).toEqual([
      expect.objectContaining({ slug: "no-og", commit: "0ld0000aaaaaaa", action: "auto-rollback", by: "@owner" }),
    ]);
    // The bad build is parked, not kept as -prev (so /rollback cannot re-publish it).
    expect(existsSync(`${f.webRoot}-prev`)).toBe(false);
    expect(existsSync(path.join(`${f.webRoot}-failed`, "no-og", "index.html"))).toBe(true);
  });

  it("rolls back automatically on a non-200 response", async () => {
    pushPage(f, "down", "Down");
    const { deployToProd } = f.deployer({ fetch: (async () => new Response("bad gateway", { status: 502 })) as typeof fetch });

    const r = await deployToProd("down", "@owner", f.env);

    expect(r).toMatchObject({ ok: false, rolledBack: true });
    if (!r.ok) expect(r.error).toContain("HTTP 502");
    expect(f.live()).toBe("OLD BUILD");
    expect(f.state.getDeployHistory().map((h) => h.action)).toEqual(["auto-rollback"]);
  });

  it("runs npm ci only when package-lock.json changed", async () => {
    pushPage(f, "one", "One");
    const { deployToProd } = f.deployer();
    expect((await deployToProd("one", "@owner", f.env)).ok).toBe(true);
    expect(existsSync(f.ciLog)).toBe(false);

    pushPage(f, "two", "Two", { "package-lock.json": '{ "lockfileVersion": 3, "packages": {} }\n' });
    expect((await deployToProd("two", "@owner", f.env)).ok).toBe(true);
    expect(readFileSync(f.ciLog, "utf8")).toBe("ci\n");
    expect(f.steps).toContain("Installing dependencies (npm ci)");
  });

  it("reports a missing page branch without touching anything", async () => {
    const { deployToProd } = f.deployer();
    const r = await deployToProd("nope", "@owner", f.env);
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/no branch lp\/nope/) });
    expect(f.live()).toBe("OLD BUILD");
  });
});

describe("rollback", () => {
  let f: Fixture;
  beforeEach(() => {
    f = setup();
  });

  it("restores the previous build and reports the live commit", async () => {
    const sha = pushPage(f, "page-a", "Page A");
    const { deployToProd, rollback } = f.deployer();
    expect((await deployToProd("page-a", "@owner", f.env)).ok).toBe(true);

    const r = await rollback("@owner", f.env);

    expect(r).toEqual({ ok: true, liveCommit: "0ld0000" });
    expect(f.live()).toBe("OLD BUILD");
    // Swapped, not deleted: rolling back again re-publishes the newer build.
    expect(JSON.parse(readFileSync(path.join(`${f.webRoot}-prev`, BUILD_INFO_FILE), "utf8")).commit).toBe(sha);
    expect(f.state.getDeployHistory().map((h) => [h.action, h.commit])).toEqual([
      ["deploy", sha],
      ["rollback", "0ld0000aaaaaaa"],
    ]);

    expect(await rollback("@owner", f.env)).toEqual({ ok: true, liveCommit: sha.slice(0, 7) });
    expect(existsSync(path.join(f.webRoot, "page-a", "index.html"))).toBe(true);
  });

  it("refuses when there is no previous build", async () => {
    const { rollback } = f.deployer();
    const r = await rollback("@owner", f.env);
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/no previous build/) });
    expect(f.live()).toBe("OLD BUILD");
    expect(f.state.getDeployHistory()).toEqual([]);
  });
});

describe("owner-only, through the bot", () => {
  it("allowlisted members cannot deploy or roll back; the owner can", async () => {
    const f = setup();
    pushPage(f, "team-page", "Team Page");
    const d = f.deployer();
    const h = makeHarness({ config: f.config, deps: { deployToProd: d.deployToProd, rollback: d.rollback } });

    await h.send(textUpdate(MEMBER_ID, "/deploy team-page"));
    await h.send(textUpdate(MEMBER_ID, "/rollback"));
    expect(h.texts()).toEqual(["Only Sandy can deploy.", "Only Sandy can roll back."]);
    expect(f.live()).toBe("OLD BUILD");
    expect(originMain(f)).not.toBe(git(f.origin, "rev-parse", "lp/team-page"));

    await h.send(textUpdate(OWNER_ID, "/deploy team-page"));
    expect(h.texts().at(-1)).toMatch(/^"team-page" is live:\nhttps:\/\/focasedu\.test\/team-page\n/);
    await h.send(textUpdate(OWNER_ID, "/rollback"));
    expect(h.texts().at(-1)).toBe("Rolled back. Live commit: 0ld0000");
    expect(f.live()).toBe("OLD BUILD");
  });
});

describe("helpers", () => {
  it("hasOgTitle matches the decoded og:title content exactly", () => {
    expect(hasOgTitle(`<meta property="og:title" content="A &amp; B &quot;C&quot; &#39;d&#x27;">`, `A & B "C" 'd'`)).toBe(true);
    expect(hasOgTitle(`<meta content='X' property='og:title' />`, "X")).toBe(true);
    expect(hasOgTitle(`<meta property="og:description" content="X">`, "X")).toBe(false);
    expect(hasOgTitle(`<meta property="og:title" content="X Y">`, "X")).toBe(false);
    expect(hasOgTitle(`<title>X</title>`, "X")).toBe(false);
  });

  it("readPageTitle imports the config", async () => {
    const dir = tmpDir();
    const file = path.join(dir, "p.mjs");
    writeFileSync(file, `const t = "Built " + "title";\nexport default { meta: { title: t } };\n`);
    expect(await readPageTitle(file)).toBe("Built title");
  });
});
