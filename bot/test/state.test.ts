import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { StateStore } from "../src/state.js";
import { tmpDir } from "./helpers.js";

describe("StateStore", () => {
  it("returns empty state for an unknown chat", () => {
    const s = new StateStore(tmpDir());
    expect(s.getChat(1)).toEqual({ pages: {}, lastSlug: undefined });
    expect(s.getPage(1, "x")).toBeUndefined();
  });

  it("stores pages per chat in JSON files and merges patches", () => {
    const dir = tmpDir();
    const s = new StateStore(dir);
    s.setPage(1, "alpha", { lastPreviewUrl: "https://p1", claudeSessionId: "s1", lastMessageId: 10 });
    s.setPage(1, "alpha", { lastPreviewUrl: "https://p2" });
    s.setPage(2, "beta", { branch: "lp/beta", lastMessageId: 20 });

    const fresh = new StateStore(dir);
    expect(fresh.getPage(1, "alpha")).toMatchObject({
      branch: "lp/alpha",
      lastPreviewUrl: "https://p2",
      claudeSessionId: "s1",
      lastMessageId: 10,
    });
    expect(fresh.getPage(1, "beta")).toBeUndefined();
    expect(fresh.getPage(2, "beta")?.lastMessageId).toBe(20);
    const file = JSON.parse(readFileSync(path.join(dir, "chats", "1.json"), "utf8"));
    expect(Object.keys(file.pages)).toEqual(["alpha"]);
  });

  it("tracks the last slug and finds slugs by preview message id", () => {
    const s = new StateStore(tmpDir());
    s.setPage(-5, "a", { lastMessageId: 1 });
    s.setPage(-5, "b", { lastMessageId: 2 });
    expect(s.getLastSlug(-5)).toBe("b");
    expect(s.findSlugByMessageId(-5, 1)).toBe("a");
    expect(s.findSlugByMessageId(-5, 3)).toBeUndefined();
    expect(s.findSlugByMessageId(-6, 1)).toBeUndefined();
  });

  it("appends deploy history", () => {
    const dir = tmpDir();
    const s = new StateStore(dir);
    s.appendDeployHistory({ slug: "a", commit: "c1", by: "owner", action: "deploy" });
    s.appendDeployHistory({ slug: null, commit: "c0", by: "owner", action: "rollback", time: "2026-01-01T00:00:00.000Z" });
    const h = new StateStore(dir).getDeployHistory();
    expect(h).toHaveLength(2);
    expect(h[0]).toMatchObject({ slug: "a", action: "deploy" });
    expect(h[0].time).toMatch(/^\d{4}-/);
    expect(h[1].time).toBe("2026-01-01T00:00:00.000Z");
  });
});
