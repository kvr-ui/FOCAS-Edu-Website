import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Update, UserFromGetMe } from "grammy/types";
import type { Config } from "../src/config.js";
import { createBot, type BotDeps } from "../src/router.js";

export const OWNER_ID = 1001;
export const MEMBER_ID = 2002;
export const MEMBER2_ID = 2003;
export const STRANGER_ID = 9009;
export const BOT_ID = 4242;

export const BOT_INFO = {
  id: BOT_ID,
  is_bot: true,
  first_name: "FOCAS LP",
  username: "focas_lp_bot",
  can_join_groups: true,
  can_read_all_group_messages: false,
  supports_inline_queries: false,
  can_connect_to_business: false,
  has_main_web_app: false,
} as UserFromGetMe;

export function tmpDir(prefix = "lpbot-"): string {
  return mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function testConfig(overrides: Partial<Config> = {}): Config {
  const dir = tmpDir();
  return {
    telegramBotToken: "123456:TEST-TOKEN-xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    allowedIds: new Set([OWNER_ID, MEMBER_ID, MEMBER2_ID]),
    ownerId: OWNER_ID,
    ownerName: "Sandy",
    anthropicApiKey: "sk-ant-test",
    claudeModel: "claude-sonnet-5-5",
    claudeMaxTurns: 40,
    claudeMaxCostUsd: 2,
    claudeTimeoutMs: 20 * 60_000,
    vercelToken: "vt",
    vercelProjectId: "prj_test",
    repoDir: path.join(dir, "repo"),
    webRoot: path.join(dir, "www"),
    siteUrl: "https://focasedu.com",
    stateDir: path.join(dir, "state"),
    ...overrides,
  };
}

export interface ApiCall {
  method: string;
  payload: Record<string, any>;
}

let updateId = 1;
let incomingMessageId = 1;

/** A text message update; `/commands` get a bot_command entity like real Telegram sends. */
export function textUpdate(
  fromId: number,
  text: string,
  opts: { chatId?: number; replyTo?: { message_id: number; fromId: number } } = {},
): Update {
  const chatId = opts.chatId ?? fromId;
  const cmd = text.match(/^\/\S+/);
  return {
    update_id: updateId++,
    message: {
      message_id: incomingMessageId++,
      date: Math.floor(Date.now() / 1000),
      chat: chatId > 0 ? { id: chatId, type: "private", first_name: `U${fromId}` } : { id: chatId, type: "group", title: "Team" },
      from: { id: fromId, is_bot: false, first_name: `U${fromId}`, username: `user${fromId}` },
      text,
      ...(cmd ? { entities: [{ type: "bot_command", offset: 0, length: cmd[0].length }] } : {}),
      ...(opts.replyTo
        ? {
            reply_to_message: {
              message_id: opts.replyTo.message_id,
              date: 0,
              chat: { id: chatId, type: "private", first_name: "x" },
              from: { id: opts.replyTo.fromId, is_bot: opts.replyTo.fromId === BOT_ID, first_name: "bot" },
              text: "preview",
            },
          }
        : {}),
    },
  } as Update;
}

/**
 * A bot built by the real router, with Telegram's API replaced by a recorder:
 * no token or network needed. `calls` holds every outgoing API call.
 */
export function makeHarness(opts: { config?: Config; deps?: Partial<BotDeps> } = {}) {
  const config = opts.config ?? testConfig();
  const app = createBot({ config, deps: opts.deps, botConfig: { botInfo: BOT_INFO } });
  const calls: ApiCall[] = [];
  let nextMessageId = 500;

  app.bot.api.config.use(async (_prev, method, payload) => {
    const p = (payload ?? {}) as Record<string, any>;
    calls.push({ method, payload: p });
    if (method === "sendMessage") {
      return {
        ok: true,
        result: { message_id: nextMessageId++, date: 0, chat: { id: p.chat_id, type: "private" }, text: p.text },
      } as any;
    }
    return { ok: true, result: true } as any;
  });

  const sent = () => calls.filter((c) => c.method === "sendMessage");
  /** Texts of sent messages and edits, in order, for chat `chatId` (default: all). */
  const texts = (chatId?: number) =>
    calls
      .filter((c) => c.method === "sendMessage" || c.method === "editMessageText")
      .filter((c) => chatId === undefined || c.payload.chat_id === chatId)
      .map((c) => String(c.payload.text));

  return {
    ...app,
    config,
    calls,
    sent,
    texts,
    /** Feed an update and wait for any queued jobs it started to finish. */
    async send(update: Update, { waitForJobs = true } = {}) {
      await app.bot.handleUpdate(update);
      if (waitForJobs) await app.queue.onIdle();
    },
  };
}

/** A promise you can resolve from outside. */
export function deferred<T = void>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

/** Let pending microtasks / promise chains run. */
export const flush = () => new Promise((r) => setImmediate(r));
