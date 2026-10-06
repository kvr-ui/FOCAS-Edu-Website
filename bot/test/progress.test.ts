import { Api } from "grammy";
import { describe, expect, it, vi } from "vitest";
import { Progress } from "../src/progress.js";

function fakeApi() {
  const api = new Api("123:fake");
  const calls: Array<{ method: string; payload: any }> = [];
  let fail = false;
  api.config.use(async (_prev, method, payload) => {
    calls.push({ method, payload });
    if (fail && method === "editMessageText") throw new Error("Bad Request: message to edit not found");
    return { ok: true, result: method === "sendMessage" ? { message_id: 77, date: 0, chat: { id: 1, type: "private" } } : true } as any;
  });
  return { api, calls, setFail: (v: boolean) => (fail = v) };
}

describe("Progress", () => {
  it("sends one message and edits it as the job advances", async () => {
    const { api, calls } = fakeApi();
    const p = await Progress.start(api, 1, "New page: x", "Starting...", { replyTo: 5 });
    expect(p.messageId).toBe(77);
    await p.step("Collecting images");
    await p.step("Running Claude");
    await p.step("Running Claude"); // repeated steps are kept (they accumulate)
    await p.finish("Done.");
    expect(calls[0]).toMatchObject({ method: "sendMessage", payload: { chat_id: 1, text: "New page: x\nStarting..." } });
    expect(calls[0].payload.reply_parameters.message_id).toBe(5);
    const edits = calls.filter((c) => c.method === "editMessageText");
    expect(edits.every((e) => e.payload.message_id === 77)).toBe(true);
    expect(edits[0].payload.text).toBe("New page: x\n- Collecting images");
    expect(edits.at(-1)!.payload.text).toBe("New page: x\n- Collecting images\n- Running Claude\n- Running Claude\nDone.");
  });

  it("skips edits that would not change the text", async () => {
    const { api, calls } = fakeApi();
    const p = await Progress.start(api, 1, "T", "Starting...");
    await p.set("Starting...");
    await p.set("Working");
    await p.set("Working");
    expect(calls.filter((c) => c.method === "editMessageText")).toHaveLength(1);
  });

  it("never throws when Telegram rejects an edit", async () => {
    const { api, setFail } = fakeApi();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const p = await Progress.start(api, 1, "T", "s");
    setFail(true);
    await expect(p.set("next")).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});
