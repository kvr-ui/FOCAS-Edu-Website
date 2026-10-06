import { describe, expect, it, vi } from "vitest";
import { createAccessPolicy } from "../src/access.js";
import { BOT_ID, MEMBER_ID, OWNER_ID, STRANGER_ID, makeHarness, textUpdate } from "./helpers.js";

describe("createAccessPolicy", () => {
  const policy = createAccessPolicy({ allowedIds: [MEMBER_ID], ownerId: OWNER_ID });

  it("allows allowlisted users and the owner", () => {
    expect(policy.isAllowed(MEMBER_ID)).toBe(true);
    expect(policy.isAllowed(OWNER_ID)).toBe(true);
  });

  it("rejects everyone else, including missing ids", () => {
    expect(policy.isAllowed(STRANGER_ID)).toBe(false);
    expect(policy.isAllowed(undefined)).toBe(false);
  });

  it("isOwner is true only for the owner", () => {
    expect(policy.isOwner(OWNER_ID)).toBe(true);
    expect(policy.isOwner(MEMBER_ID)).toBe(false);
    expect(policy.isOwner(STRANGER_ID)).toBe(false);
    expect(policy.isOwner(undefined)).toBe(false);
  });
});

describe("access guard in the bot", () => {
  it("never replies to an unknown user and never runs a job for them", async () => {
    const branchFlow = vi.fn();
    const deployToProd = vi.fn();
    const rollback = vi.fn();
    const listPages = vi.fn(async () => []);
    const h = makeHarness({ deps: { branchFlow, deployToProd, rollback, listPages } });

    for (const text of [
      "/help",
      "/start",
      "/newpage A page for CA Inter",
      "/edit manual make it red",
      "/deploy manual",
      "/rollback",
      "/list",
      "ok",
      "hello",
    ]) {
      await h.send(textUpdate(STRANGER_ID, text));
    }
    await h.send(textUpdate(STRANGER_ID, "make it blue", { replyTo: { message_id: 1, fromId: BOT_ID } }));
    // Also in a group chat the bot is in.
    await h.send(textUpdate(STRANGER_ID, "/help", { chatId: -100 }));

    expect(h.calls).toEqual([]);
    expect(branchFlow).not.toHaveBeenCalled();
    expect(deployToProd).not.toHaveBeenCalled();
    expect(rollback).not.toHaveBeenCalled();
    expect(listPages).not.toHaveBeenCalled();
  });

  it("answers an allowed user", async () => {
    const h = makeHarness();
    await h.send(textUpdate(MEMBER_ID, "/help"));
    expect(h.sent()).toHaveLength(1);
    expect(h.sent()[0].payload.chat_id).toBe(MEMBER_ID);
  });
});
