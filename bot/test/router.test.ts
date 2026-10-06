import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { BranchFlow, BranchFlowResult } from "../src/branch.js";
import type { DeployToProd, Rollback } from "../src/deploy.js";
import {
  BOT_ID,
  MEMBER2_ID,
  MEMBER_ID,
  OWNER_ID,
  deferred,
  flush,
  makeHarness,
  testConfig,
  textUpdate,
} from "./helpers.js";

const okResult = (slug: string, extra: Partial<Extract<BranchFlowResult, { ok: true }>> = {}): BranchFlowResult => ({
  ok: true,
  branch: `lp/${slug}`,
  previewUrl: `https://focas-git-lp-${slug}.vercel.app`,
  links: [],
  summary: "Built it.",
  couldntDo: [],
  questions: [],
  claudeSessionId: `sess-${slug}`,
  ...extra,
});

function previewFlow() {
  return vi.fn<BranchFlow>(async (slug, job) => okResult(slug, { claudeSessionId: job.resumeSessionId ?? `sess-${slug}` }));
}

/** Create a page via /newpage and return the slug and the bot's preview message id. */
async function createPage(h: ReturnType<typeof makeHarness>, fromId: number, brief: string) {
  await h.send(textUpdate(fromId, `/newpage ${brief}`));
  const preview = h.sent().filter((c) => String(c.payload.text).startsWith("Preview for")).at(-1)!;
  const slug = String(preview.payload.text).match(/Preview for "([^"]+)"/)![1];
  // The recorder hands out message ids 500, 501, ... in sendMessage order.
  const messageId = 500 + h.sent().indexOf(preview);
  return { slug, messageId };
}

describe("command stubs reply to allowed users", () => {
  it("/help and /start describe the commands", async () => {
    const h = makeHarness();
    await h.send(textUpdate(MEMBER_ID, "/help"));
    await h.send(textUpdate(MEMBER_ID, "/start"));
    const [help, start] = h.texts();
    for (const t of [help, start]) {
      for (const cmd of ["/newpage", "/edit", "/deploy", "/rollback", "/list", "/help", "ok"]) expect(t).toContain(cmd);
    }
  });

  it("/newpage with the default stubs reports progress and a (stub) preview", async () => {
    const h = makeHarness();
    await h.send(textUpdate(MEMBER_ID, "/newpage CA Inter crash course, May 2026, Rs 4999"));
    const texts = h.texts();
    expect(texts[0]).toBe("New page: ca-inter-crash-course\nStarting...");
    expect(h.calls.some((c) => c.method === "editMessageText")).toBe(true);
    expect(texts.join("\n")).toContain('Preview for "ca-inter-crash-course"');
    expect(texts.join("\n")).toContain("(stub)");
    expect(h.calls.at(-1)!.payload.text).toMatch(/Done\.$/);
    expect(h.state.getPage(MEMBER_ID, "ca-inter-crash-course")?.branch).toBe("lp/ca-inter-crash-course");
  });

  it("/newpage without a brief shows usage", async () => {
    const h = makeHarness();
    await h.send(textUpdate(MEMBER_ID, "/newpage"));
    expect(h.texts()).toEqual([expect.stringMatching(/^Usage: \/newpage/)]);
  });

  it("/edit validates arguments and unknown slugs", async () => {
    const branchFlow = previewFlow();
    const h = makeHarness({ deps: { branchFlow } });
    await h.send(textUpdate(MEMBER_ID, "/edit"));
    await h.send(textUpdate(MEMBER_ID, "/edit only-slug"));
    await h.send(textUpdate(MEMBER_ID, "/edit Bad_Slug! make it red"));
    await h.send(textUpdate(MEMBER_ID, "/edit nope make it red"));
    const texts = h.texts();
    expect(texts[0]).toMatch(/^Usage: \/edit/);
    expect(texts[1]).toMatch(/^Usage: \/edit/);
    expect(texts[2]).toMatch(/not a valid page slug/);
    expect(texts[3]).toMatch(/I don't know a page called "nope"/);
    expect(branchFlow).not.toHaveBeenCalled();
  });

  it("/edit runs an edit job for a known page and resumes its Claude session", async () => {
    const branchFlow = previewFlow();
    const h = makeHarness({ deps: { branchFlow } });
    const { slug } = await createPage(h, MEMBER_ID, "Audit course launch");
    await h.send(textUpdate(MEMBER_ID, `/edit ${slug} make the hero red\nand bigger`));
    expect(branchFlow).toHaveBeenCalledTimes(2);
    const [s, job] = branchFlow.mock.calls[1];
    expect(s).toBe(slug);
    expect(job).toMatchObject({ kind: "edit", text: "make the hero red\nand bigger", resumeSessionId: `sess-${slug}` });
    expect(h.texts().some((t) => t.startsWith(`Editing: ${slug}`))).toBe(true);
  });

  it("/edit accepts pages that exist in REPO_DIR/src/landing-pages", async () => {
    const config = testConfig();
    mkdirSync(path.join(config.repoDir, "src/landing-pages"), { recursive: true });
    writeFileSync(path.join(config.repoDir, "src/landing-pages/manual-v2.js"), "export default {}");
    const branchFlow = previewFlow();
    const h = makeHarness({ config, deps: { branchFlow } });
    await h.send(textUpdate(MEMBER_ID, "/edit manual-v2 change the price"));
    expect(branchFlow).toHaveBeenCalledWith("manual-v2", expect.objectContaining({ kind: "edit" }), expect.anything());
  });

  it("/list shows repo pages and this chat's previews", async () => {
    const config = testConfig();
    const dir = path.join(config.repoDir, "src/landing-pages");
    mkdirSync(dir, { recursive: true });
    for (const f of ["manual-v2.js", "_template.js", "rti-may.js", "notes.md"]) writeFileSync(path.join(dir, f), "");
    const h = makeHarness({ config, deps: { branchFlow: previewFlow() } });
    await h.send(textUpdate(MEMBER_ID, "/list"));
    expect(h.texts()[0]).toBe(
      "Pages in the repo (2):\n- manual-v2: https://focasedu.com/manual-v2\n- rti-may: https://focasedu.com/rti-may",
    );
    await createPage(h, MEMBER_ID, "Workshop for articleship students");
    await h.send(textUpdate(MEMBER_ID, "/list"));
    expect(h.texts().at(-1)).toContain("Previews in this chat:\n- workshop-articleship-students: https://focas-git-lp-");
  });

  it("/list with no pages folder", async () => {
    const h = makeHarness();
    await h.send(textUpdate(MEMBER_ID, "/list"));
    expect(h.texts()).toEqual(["No pages in the repo yet."]);
  });

  it("unknown text in a private chat gets a hint; in a group it is ignored", async () => {
    const h = makeHarness();
    await h.send(textUpdate(MEMBER_ID, "hello"));
    await h.send(textUpdate(MEMBER_ID, "hello", { chatId: -500 }));
    expect(h.texts()).toEqual(["I didn't understand that. Send /help to see what I can do."]);
  });

  it("a failed branch flow reports the error and remembers nothing", async () => {
    const branchFlow = vi.fn<BranchFlow>(async () => ({ ok: false, error: "validation failed: hero.title missing" }));
    const h = makeHarness({ deps: { branchFlow } });
    await h.send(textUpdate(MEMBER_ID, "/newpage Broken page"));
    expect(h.texts().at(-1)).toBe('Could not create "broken":\nvalidation failed: hero.title missing');
    expect(h.state.getChat(MEMBER_ID).pages).toEqual({});
  });

  it("a crashing job is reported and does not block the next one", async () => {
    let first = true;
    const branchFlow = vi.fn<BranchFlow>(async (slug) => {
      if (first) {
        first = false;
        throw new Error("git exploded");
      }
      return okResult(slug);
    });
    const h = makeHarness({ deps: { branchFlow } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await h.send(textUpdate(MEMBER_ID, "/newpage First"));
    expect(h.texts().at(-1)).toMatch(/Failed: git exploded$/);
    await h.send(textUpdate(MEMBER_ID, "/newpage Second"));
    expect(h.texts().join("\n")).toContain('Preview for "second"');
  });

  it("Claude questions are relayed and a reply continues the same session", async () => {
    const branchFlow = vi
      .fn<BranchFlow>()
      .mockResolvedValueOnce(okResult("rti-batch", { questions: ["What is the price?"], previewUrl: undefined }))
      .mockImplementation(async (slug, job) => okResult(slug, { claudeSessionId: job.resumeSessionId }));
    const h = makeHarness({ deps: { branchFlow } });
    await h.send(textUpdate(MEMBER_ID, "/newpage RTI batch"));
    const q = h.sent().find((c) => String(c.payload.text).startsWith("Claude has questions"))!;
    expect(q.payload.text).toContain("- What is the price?");
    const qId = 500 + h.sent().indexOf(q);
    await h.send(textUpdate(MEMBER_ID, "Rs 2999", { replyTo: { message_id: qId, fromId: BOT_ID } }));
    expect(branchFlow.mock.calls[1][1]).toMatchObject({ kind: "edit", slug: "rti-batch", text: "Rs 2999", resumeSessionId: "sess-rti-batch" });
  });
});

describe("owner-only commands", () => {
  function deps() {
    return {
      branchFlow: previewFlow(),
      deployToProd: vi.fn<DeployToProd>(async (slug) => ({
        ok: true as const,
        liveUrl: `https://focasedu.com/${slug}`,
        successUrl: `https://focasedu.com/${slug}-success`,
        commit: "abc1234",
      })),
      rollback: vi.fn<Rollback>(async () => ({ ok: true as const, liveCommit: "def5678" })),
    };
  }

  it("refuses ok, /deploy and /rollback from an allowlisted non-owner", async () => {
    const d = deps();
    const h = makeHarness({ deps: d });
    const { slug, messageId } = await createPage(h, MEMBER_ID, "Audit masterclass");
    const before = h.sent().length;
    await h.send(textUpdate(MEMBER_ID, "ok"));
    await h.send(textUpdate(MEMBER_ID, "OK", { replyTo: { message_id: messageId, fromId: BOT_ID } }));
    await h.send(textUpdate(MEMBER_ID, `/deploy ${slug}`));
    await h.send(textUpdate(MEMBER_ID, "/rollback"));
    expect(h.sent().slice(before).map((c) => c.payload.text)).toEqual([
      "Only Sandy can deploy.",
      "Only Sandy can deploy.",
      "Only Sandy can deploy.",
      "Only Sandy can roll back.",
    ]);
    expect(d.deployToProd).not.toHaveBeenCalled();
    expect(d.rollback).not.toHaveBeenCalled();
  });

  it("owner /deploy <slug> reaches deployToProd", async () => {
    const d = deps();
    const h = makeHarness({ deps: d });
    await h.send(textUpdate(OWNER_ID, "/deploy audit-masterclass"));
    expect(d.deployToProd).toHaveBeenCalledWith("audit-masterclass", "@user1001", expect.objectContaining({ config: h.config }));
    expect(h.texts().at(-1)).toBe(
      '"audit-masterclass" is live:\nhttps://focasedu.com/audit-masterclass\nSuccess page: https://focasedu.com/audit-masterclass-success\nCommit: abc1234',
    );
  });

  it("owner ok deploys the last previewed page, or the one replied to", async () => {
    const d = deps();
    const h = makeHarness({ deps: d });
    const first = await createPage(h, OWNER_ID, "First launch");
    const second = await createPage(h, OWNER_ID, "Second launch");
    await h.send(textUpdate(OWNER_ID, "ok"));
    expect(d.deployToProd).toHaveBeenLastCalledWith(second.slug, expect.any(String), expect.anything());
    await h.send(textUpdate(OWNER_ID, "ok", { replyTo: { message_id: first.messageId, fromId: BOT_ID } }));
    expect(d.deployToProd).toHaveBeenLastCalledWith(first.slug, expect.any(String), expect.anything());
  });

  it("owner ok works on a page a team member previewed in a group", async () => {
    const d = deps();
    const h = makeHarness({ deps: d });
    const group = -1234;
    await h.send(textUpdate(MEMBER_ID, "/newpage Group page", { chatId: group }));
    await h.send(textUpdate(OWNER_ID, "ok", { chatId: group }));
    expect(d.deployToProd).toHaveBeenCalledWith("group", expect.any(String), expect.anything());
  });

  it("owner ok with nothing to deploy asks which page", async () => {
    const d = deps();
    const h = makeHarness({ deps: d });
    await h.send(textUpdate(OWNER_ID, "ok"));
    expect(h.texts()).toEqual([expect.stringMatching(/^Which page\?/)]);
    expect(d.deployToProd).not.toHaveBeenCalled();
  });

  it("the default deploy stub replies with a not-implemented message", async () => {
    const h = makeHarness();
    await h.send(textUpdate(OWNER_ID, "/deploy some-page"));
    expect(h.texts().at(-1)).toBe('Deploy of "some-page" failed:\nDeploying "some-page" is not implemented yet (task 11).');
  });

  it("a failed deploy that was rolled back says so", async () => {
    const h = makeHarness({
      deps: { deployToProd: async () => ({ ok: false, error: "og:title missing", rolledBack: true }) },
    });
    await h.send(textUpdate(OWNER_ID, "/deploy x"));
    expect(h.texts().at(-1)).toBe('Deploy of "x" failed:\nog:title missing\nThe previous build was restored automatically.');
  });

  it("owner /rollback reaches rollback (and the default stub replies)", async () => {
    const d = deps();
    const h = makeHarness({ deps: d });
    await h.send(textUpdate(OWNER_ID, "/rollback"));
    expect(d.rollback).toHaveBeenCalledWith("@user1001", expect.anything());
    expect(h.texts().at(-1)).toBe("Rolled back. Live commit: def5678");

    const h2 = makeHarness();
    await h2.send(textUpdate(OWNER_ID, "/rollback"));
    expect(h2.texts().at(-1)).toBe("Rollback failed:\nRollback is not implemented yet (task 11).");
  });
});

describe("queueing", () => {
  it("two concurrent /newpage requests run one after another; the second user sees their place", async () => {
    const gate = deferred();
    const order: string[] = [];
    const branchFlow = vi.fn<BranchFlow>(async (slug) => {
      order.push(`start ${slug}`);
      if (slug === "alpha") await gate.promise;
      order.push(`end ${slug}`);
      return okResult(slug);
    });
    const h = makeHarness({ deps: { branchFlow } });

    await h.send(textUpdate(MEMBER_ID, "/newpage Alpha"), { waitForJobs: false });
    await h.send(textUpdate(MEMBER2_ID, "/newpage Beta"), { waitForJobs: false });
    await flush();

    expect(order).toEqual(["start alpha"]);
    expect(h.texts(MEMBER_ID)[0]).toBe("New page: alpha\nStarting...");
    expect(h.texts(MEMBER2_ID)[0]).toBe("New page: beta\nYou're #1 in queue. I'll start when the jobs ahead finish.");

    // A third request queues behind both.
    await h.send(textUpdate(OWNER_ID, "/newpage Gamma"), { waitForJobs: false });
    expect(h.texts(OWNER_ID)[0]).toContain("You're #2 in queue");

    gate.resolve();
    await h.queue.onIdle();
    expect(order).toEqual(["start alpha", "end alpha", "start beta", "end beta", "start gamma", "end gamma"]);
    // The queued user's status message is edited once their job starts, then finished.
    const beta = h.texts(MEMBER2_ID);
    expect(beta).toContain("New page: beta\nStarting...");
    expect(beta.some((t) => t.startsWith('Preview for "beta"'))).toBe(true);
  });

  it("deploys share the same queue as page jobs", async () => {
    const gate = deferred();
    const branchFlow = vi.fn<BranchFlow>(async (slug) => {
      await gate.promise;
      return okResult(slug);
    });
    const deployToProd = vi.fn<DeployToProd>(async () => ({ ok: true, liveUrl: "u", successUrl: "s", commit: "c" }));
    const h = makeHarness({ deps: { branchFlow, deployToProd } });
    await h.send(textUpdate(MEMBER_ID, "/newpage Busy"), { waitForJobs: false });
    await h.send(textUpdate(OWNER_ID, "/deploy other"), { waitForJobs: false });
    await flush();
    expect(deployToProd).not.toHaveBeenCalled();
    expect(h.texts(OWNER_ID)[0]).toContain("You're #1 in queue");
    gate.resolve();
    await h.queue.onIdle();
    expect(deployToProd).toHaveBeenCalledTimes(1);
  });
});

describe("reply to a preview message", () => {
  it("routes to /edit for that slug", async () => {
    const branchFlow = previewFlow();
    const h = makeHarness({ deps: { branchFlow } });
    const a = await createPage(h, MEMBER_ID, "Alpha offer");
    const b = await createPage(h, MEMBER_ID, "Beta offer");
    expect(h.state.getPage(MEMBER_ID, a.slug)?.lastMessageId).toBe(a.messageId);

    await h.send(textUpdate(MEMBER_ID, "make the CTA green", { replyTo: { message_id: a.messageId, fromId: BOT_ID } }));
    expect(branchFlow).toHaveBeenCalledTimes(3);
    expect(branchFlow.mock.calls[2][0]).toBe(a.slug);
    expect(branchFlow.mock.calls[2][1]).toMatchObject({ kind: "edit", text: "make the CTA green", resumeSessionId: `sess-${a.slug}` });

    // The new preview message becomes the reply target for that slug.
    const newId = h.state.getPage(MEMBER_ID, a.slug)!.lastMessageId!;
    expect(newId).not.toBe(a.messageId);
    await h.send(textUpdate(MEMBER_ID, "now bigger", { replyTo: { message_id: newId, fromId: BOT_ID } }));
    expect(branchFlow.mock.calls[3][0]).toBe(a.slug);
    expect(b.slug).not.toBe(a.slug);
  });

  it("ignores replies to non-preview messages or to other users", async () => {
    const branchFlow = previewFlow();
    const h = makeHarness({ deps: { branchFlow } });
    const a = await createPage(h, MEMBER_ID, "Alpha offer");
    await h.send(textUpdate(MEMBER_ID, "make it red", { replyTo: { message_id: 99999, fromId: BOT_ID } }));
    // Same message id, but the replied-to message was not sent by the bot.
    await h.send(textUpdate(MEMBER_ID, "make it red", { replyTo: { message_id: a.messageId, fromId: MEMBER2_ID } }));
    // Same message id in a different chat.
    await h.send(textUpdate(MEMBER_ID, "make it red", { replyTo: { message_id: a.messageId, fromId: BOT_ID }, chatId: -77 }));
    expect(branchFlow).toHaveBeenCalledTimes(1);
  });
});
