import { Bot, type BotConfig, type Context, type MiddlewareFn } from "grammy";
import { accessGuard, createAccessPolicy, type AccessPolicy } from "./access.js";
import type { Config } from "./config.js";
import { JobQueue } from "./queue.js";
import { StateStore } from "./state.js";
import { Progress } from "./progress.js";
import { deriveSlug, isValidSlug } from "./slug.js";
import { listPages as listPagesImpl, type ListPages } from "./pages.js";
import { branchFlow as branchFlowImpl, type BranchFlow, type BranchFlowResult } from "./branch.js";
import {
  deployToProd as deployToProdImpl,
  rollback as rollbackImpl,
  type DeployToProd,
  type Rollback,
} from "./deploy.js";
import { imageMiddleware as imageMiddlewareImpl } from "./images.js";
import type { PageJob, ServiceEnv } from "./types.js";

/** The services the router wires together. Tests (and later tasks) swap these out. */
export interface BotDeps {
  branchFlow: BranchFlow;
  deployToProd: DeployToProd;
  rollback: Rollback;
  listPages: ListPages;
  imageMiddleware: () => MiddlewareFn<Context>;
}

export const defaultDeps: BotDeps = {
  branchFlow: branchFlowImpl,
  deployToProd: deployToProdImpl,
  rollback: rollbackImpl,
  listPages: listPagesImpl,
  imageMiddleware: imageMiddlewareImpl,
};

export interface CreateBotOptions {
  config: Config;
  deps?: Partial<BotDeps>;
  state?: StateStore;
  queue?: JobQueue;
  /** Passed to grammY; tests set `botInfo` so no network call is needed. */
  botConfig?: BotConfig<Context>;
}

export interface BotApp {
  bot: Bot;
  queue: JobQueue;
  state: StateStore;
  access: AccessPolicy;
}

export const COMMANDS = [
  { command: "newpage", description: "Create a landing page from an ad brief" },
  { command: "edit", description: "Change a page: /edit <slug> <instruction>" },
  { command: "deploy", description: "Owner: put a page live: /deploy <slug>" },
  { command: "rollback", description: "Owner: restore the previous live build" },
  { command: "list", description: "List landing pages" },
  { command: "help", description: "How to use this bot" },
] as const;

export function helpText(ownerName: string): string {
  return [
    "FOCAS landing-page bot",
    "",
    "/newpage <brief> - create a page from an ad brief (attach photos to the same message or right after).",
    "/edit <slug> <instruction> - change an existing page. Replying to a preview message does the same for that page.",
    `ok - deploy the page you just previewed (reply to its preview to pick a specific one). ${ownerName} only.`,
    `/deploy <slug> - deploy a specific page. ${ownerName} only.`,
    `/rollback - restore the previous live build. ${ownerName} only.`,
    "/list - pages in the repo and previews in this chat.",
    "/help - this message.",
    "",
    "Jobs run one at a time; if someone else's job is running you'll see your place in the queue.",
  ].join("\n");
}

const OK_RE = /^ok[.!]*$/i;

function displayName(ctx: Context): string {
  const f = ctx.from;
  if (!f) return "unknown";
  return f.username ? `@${f.username}` : [f.first_name, f.last_name].filter(Boolean).join(" ") || String(f.id);
}

function replyParams(ctx: Context) {
  const id = ctx.msg?.message_id;
  return id ? { reply_parameters: { message_id: id, allow_sending_without_reply: true } } : {};
}

export function formatPreview(slug: string, r: Extract<BranchFlowResult, { ok: true }>): string {
  const lines: string[] = [];
  if (r.questions.length) {
    lines.push(`Claude has questions about "${slug}":`, ...r.questions.map((q) => `- ${q}`));
    lines.push("", "Reply to this message with your answers.");
    return lines.join("\n");
  }
  lines.push(`Preview for "${slug}" (branch ${r.branch}):`);
  if (r.links.length) lines.push(...r.links);
  else if (r.previewUrl) lines.push(`${r.previewUrl.replace(/\/+$/, "")}/${slug}`);
  else lines.push("(no preview URL yet)");
  if (r.summary) lines.push("", r.summary);
  if (r.couldntDo.length) lines.push("", "Couldn't do:", ...r.couldntDo.map((c) => `- ${c}`));
  lines.push("", 'Reply to this message to request changes. Send "ok" to deploy (owner only).');
  return lines.join("\n");
}

export function createBot(opts: CreateBotOptions): BotApp {
  const { config } = opts;
  const deps: BotDeps = { ...defaultDeps, ...opts.deps };
  const state = opts.state ?? new StateStore(config.stateDir);
  const queue = opts.queue ?? new JobQueue();
  const access = createAccessPolicy({ allowedIds: config.allowedIds, ownerId: config.ownerId });
  const bot = new Bot(config.telegramBotToken, opts.botConfig);

  const deployRefusal = `Only ${config.ownerName} can deploy.`;
  const rollbackRefusal = `Only ${config.ownerName} can roll back.`;

  /**
   * Put `work` on the single job queue. Sends ONE status message right away
   * ("You're #N in queue" or "Starting…") that the job then edits as it advances.
   * Returns without waiting for the job, so the bot keeps answering other users.
   */
  function enqueueJob(
    ctx: Context,
    label: string,
    title: string,
    work: (env: ServiceEnv, progress: Progress) => Promise<void>,
  ): void {
    const chatId = ctx.chat!.id;
    let progressReady!: (p: Progress) => void;
    let progressFailed!: (e: unknown) => void;
    const progressP = new Promise<Progress>((res, rej) => {
      progressReady = res;
      progressFailed = rej;
    });

    const { position, done } = queue.enqueue(label, async () => {
      const progress = await progressP;
      if (position > 0) await progress.set("Starting...");
      const env: ServiceEnv = { config, state, report: (line) => progress.step(line) };
      try {
        await work(env, progress);
      } catch (err) {
        const msg = (err as Error)?.message ?? String(err);
        console.error(`[job ${label}] failed:`, err);
        await progress.finish(`Failed: ${msg}`);
      }
    });

    const status = position > 0 ? `You're #${position} in queue. I'll start when the jobs ahead finish.` : "Starting...";
    Progress.start(ctx.api, chatId, title, status, { replyTo: ctx.msg?.message_id }).then(
      progressReady,
      (err) => {
        console.error(`[job ${label}] could not send status message:`, err);
        progressFailed(err);
      },
    );

    void done.catch(() => {
      /* already logged above */
    });
  }

  /** Queue a /newpage or /edit job; on success send the preview message and remember it. */
  function enqueuePageJob(ctx: Context, kind: PageJob["kind"], slug: string, text: string): void {
    const chatId = ctx.chat!.id;
    const job: PageJob = {
      kind,
      slug,
      text,
      chatId,
      userId: ctx.from!.id,
      userName: displayName(ctx),
      resumeSessionId: state.getPage(chatId, slug)?.claudeSessionId,
      ctx,
    };
    const title = kind === "new" ? `New page: ${slug}` : `Editing: ${slug}`;
    enqueueJob(ctx, `${kind}:${slug}`, title, async (env, progress) => {
      const result = await deps.branchFlow(slug, job, env);
      if (!result.ok) {
        if (result.claudeSessionId && state.getPage(chatId, slug)) {
          state.setPage(chatId, slug, { claudeSessionId: result.claudeSessionId });
        }
        await progress.finish("Failed.");
        await ctx.api.sendMessage(chatId, `Could not ${kind === "new" ? "create" : "update"} "${slug}":\n${result.error}`, replyParams(ctx));
        return;
      }
      const msg = await ctx.api.sendMessage(chatId, formatPreview(slug, result), {
        ...replyParams(ctx),
        link_preview_options: { is_disabled: true },
      });
      state.setPage(chatId, slug, {
        branch: result.branch,
        ...(result.previewUrl ? { lastPreviewUrl: result.previewUrl } : {}),
        ...(result.claudeSessionId ? { claudeSessionId: result.claudeSessionId } : {}),
        lastMessageId: msg.message_id,
      });
      await progress.finish(result.questions.length ? "Waiting for your answers." : "Done.");
    });
  }

  async function startDeploy(ctx: Context, slug: string | undefined): Promise<void> {
    if (!access.isOwner(ctx.from?.id)) {
      await ctx.reply(deployRefusal, replyParams(ctx));
      return;
    }
    if (!slug) {
      await ctx.reply("Which page? Use /deploy <slug>, or reply \"ok\" to its preview message.", replyParams(ctx));
      return;
    }
    if (!isValidSlug(slug)) {
      await ctx.reply(`"${slug}" is not a valid page slug.`, replyParams(ctx));
      return;
    }
    const chatId = ctx.chat!.id;
    const by = displayName(ctx);
    enqueueJob(ctx, `deploy:${slug}`, `Deploying: ${slug}`, async (env, progress) => {
      const r = await deps.deployToProd(slug, by, env);
      if (r.ok) {
        await progress.finish("Done.");
        await ctx.api.sendMessage(
          chatId,
          [`"${slug}" is live:`, r.liveUrl, `Success page: ${r.successUrl}`, `Commit: ${r.commit}`].join("\n"),
          { ...replyParams(ctx), link_preview_options: { is_disabled: true } },
        );
      } else {
        await progress.finish("Failed.");
        await ctx.api.sendMessage(
          chatId,
          [`Deploy of "${slug}" failed:`, r.error, ...(r.rolledBack ? ["The previous build was restored automatically."] : [])].join("\n"),
          replyParams(ctx),
        );
      }
    });
  }

  async function startEdit(ctx: Context, slug: string, instruction: string): Promise<void> {
    const chatId = ctx.chat!.id;
    if (!isValidSlug(slug)) {
      await ctx.reply(`"${slug}" is not a valid page slug. Use /list to see pages.`, replyParams(ctx));
      return;
    }
    const known = state.getPage(chatId, slug) !== undefined || (await deps.listPages(config.repoDir)).includes(slug);
    if (!known) {
      await ctx.reply(`I don't know a page called "${slug}". Use /list to see pages.`, replyParams(ctx));
      return;
    }
    enqueuePageJob(ctx, "edit", slug, instruction);
  }

  bot.catch((err) => {
    console.error(`[bot] error while handling update ${err.ctx.update.update_id}:`, err.error);
  });

  // Access control first: unknown users are dropped silently, before anything else runs.
  bot.use(accessGuard(access));
  bot.use(deps.imageMiddleware());

  bot.command(["start", "help"], (ctx) => ctx.reply(helpText(config.ownerName)));

  bot.command("newpage", async (ctx) => {
    const brief = ctx.match.trim();
    if (!brief) {
      await ctx.reply("Usage: /newpage <ad brief>\nAttach photos to the same message or send them right after.", replyParams(ctx));
      return;
    }
    const chatId = ctx.chat.id;
    const taken = [...(await deps.listPages(config.repoDir)), ...Object.keys(state.getChat(chatId).pages)];
    const slug = deriveSlug(brief, taken);
    enqueuePageJob(ctx, "new", slug, brief);
  });

  bot.command("edit", async (ctx) => {
    const m = ctx.match.trim().match(/^(\S+)\s+([\s\S]+)$/);
    if (!m) {
      await ctx.reply("Usage: /edit <slug> <instruction>\nOr reply to a preview message with the change you want.", replyParams(ctx));
      return;
    }
    await startEdit(ctx, m[1].toLowerCase(), m[2].trim());
  });

  bot.command("deploy", async (ctx) => {
    const slug = ctx.match.trim().split(/\s+/)[0]?.toLowerCase() || undefined;
    await startDeploy(ctx, slug);
  });

  bot.command("rollback", async (ctx) => {
    if (!access.isOwner(ctx.from?.id)) {
      await ctx.reply(rollbackRefusal, replyParams(ctx));
      return;
    }
    const chatId = ctx.chat.id;
    const by = displayName(ctx);
    enqueueJob(ctx, "rollback", "Rolling back", async (env, progress) => {
      const r = await deps.rollback(by, env);
      await progress.finish(r.ok ? "Done." : "Failed.");
      await ctx.api.sendMessage(
        chatId,
        r.ok ? `Rolled back. Live commit: ${r.liveCommit ?? "unknown"}` : `Rollback failed:\n${r.error}`,
        replyParams(ctx),
      );
    });
  });

  bot.command("list", async (ctx) => {
    const pages = await deps.listPages(config.repoDir);
    const previews = state.getChat(ctx.chat.id).pages;
    const lines: string[] = [];
    lines.push(pages.length ? `Pages in the repo (${pages.length}):` : "No pages in the repo yet.");
    for (const slug of pages) lines.push(`- ${slug}: ${config.siteUrl}/${slug}`);
    const previewSlugs = Object.keys(previews).sort();
    if (previewSlugs.length) {
      lines.push("", "Previews in this chat:");
      for (const slug of previewSlugs) {
        lines.push(`- ${slug}${previews[slug].lastPreviewUrl ? `: ${previews[slug].lastPreviewUrl}` : ""}`);
      }
    }
    await ctx.reply(lines.join("\n"), { link_preview_options: { is_disabled: true } });
  });

  // Non-command messages: "ok", replies to preview messages, everything else.
  bot.on("message", async (ctx) => {
    const text = (ctx.msg.text ?? ctx.msg.caption ?? "").trim();
    const replyTo = ctx.msg.reply_to_message;
    const repliedSlug =
      replyTo && replyTo.from?.id === ctx.me.id ? state.findSlugByMessageId(ctx.chat.id, replyTo.message_id) : undefined;

    if (OK_RE.test(text)) {
      await startDeploy(ctx, repliedSlug ?? state.getLastSlug(ctx.chat.id));
      return;
    }
    if (repliedSlug && text) {
      await startEdit(ctx, repliedSlug, text);
      return;
    }
    if (ctx.chat.type === "private" && text) {
      await ctx.reply("I didn't understand that. Send /help to see what I can do.");
    }
  });

  return { bot, queue, state, access };
}
