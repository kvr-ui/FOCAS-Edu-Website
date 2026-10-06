import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import type { Context, MiddlewareFn } from "grammy";
import sharp from "sharp";
import { slugify } from "./slug.js";
import type { ServiceEnv } from "./types.js";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;
const FOLLOW_UP_WINDOW_MS = 1_000;
const ALBUM_QUIET_MS = 250;
const MAX_COLLECTION_WINDOW_MS = 3_000;

export interface SavedImage {
  /** Public path as referenced by the page config, e.g. `/lp/<slug>/hero.webp`. */
  path: string;
  width: number;
  height: number;
}

export interface RejectedImage {
  /** File name (or a description like "photo 2") shown to the user. */
  name: string;
  reason: string;
}

export interface ImageIntakeResult {
  images: SavedImage[];
  rejected: RejectedImage[];
  /** Photo captions, to be appended to the brief. Empty string if none. */
  captionText: string;
}

export type IntakeImages = (ctx: Context, slug: string, env: ServiceEnv) => Promise<ImageIntakeResult>;

interface BufferedImage {
  triggerId: number;
  messageId: number;
  fileId: string;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
  caption?: string;
  mediaGroupId?: string;
  kind: "photo" | "document";
  ctx: Context;
}

interface Trigger {
  createdAt: number;
  lastMediaAt?: number;
}

interface ChatBuffer {
  currentTriggerId?: number;
  triggers: Map<number, Trigger>;
  items: BufferedImage[];
  waiters: Set<() => void>;
}

const buffers = new Map<number, ChatBuffer>();

function getBuffer(chatId: number): ChatBuffer {
  let buffer = buffers.get(chatId);
  if (!buffer) {
    buffer = { triggers: new Map(), items: [], waiters: new Set() };
    buffers.set(chatId, buffer);
  }
  return buffer;
}

function isPageCommand(ctx: Context): boolean {
  const text = (ctx.msg?.text ?? ctx.msg?.caption ?? "").trim();
  return /^\/(?:newpage|edit)(?:@[a-z0-9_]+)?(?:\s|$)/i.test(text);
}

function registerTrigger(chatId: number, messageId: number): { buffer: ChatBuffer; trigger: Trigger } {
  const buffer = getBuffer(chatId);
  let trigger = buffer.triggers.get(messageId);
  if (!trigger) {
    trigger = { createdAt: Date.now() };
    buffer.triggers.set(messageId, trigger);
  }
  if (buffer.currentTriggerId === undefined || messageId >= buffer.currentTriggerId) {
    buffer.currentTriggerId = messageId;
  }
  return { buffer, trigger };
}

function mediaFromContext(ctx: Context, triggerId: number): BufferedImage | undefined {
  const msg = ctx.msg;
  if (!msg) return undefined;

  const photo = msg.photo?.at(-1);
  if (photo) {
    return {
      triggerId,
      messageId: msg.message_id,
      fileId: photo.file_id,
      fileSize: photo.file_size,
      caption: msg.caption?.trim() || undefined,
      mediaGroupId: msg.media_group_id,
      kind: "photo",
      ctx,
    };
  }

  if (msg.document) {
    return {
      triggerId,
      messageId: msg.message_id,
      fileId: msg.document.file_id,
      fileSize: msg.document.file_size,
      fileName: msg.document.file_name,
      mimeType: msg.document.mime_type,
      caption: msg.caption?.trim() || undefined,
      mediaGroupId: msg.media_group_id,
      kind: "document",
      ctx,
    };
  }
  return undefined;
}

function addMedia(buffer: ChatBuffer, item: BufferedImage): void {
  const duplicate = buffer.items.find((candidate) => candidate.messageId === item.messageId && candidate.fileId === item.fileId);
  if (duplicate) {
    // `intakeImages` sees the command context again after middleware. Reassigning
    // here is important for a reply-based edit that did not look like a command.
    duplicate.triggerId = item.triggerId;
    return;
  }
  buffer.items.push(item);
  const trigger = buffer.triggers.get(item.triggerId);
  if (trigger) trigger.lastMediaAt = Date.now();
  for (const wake of buffer.waiters) wake();
  buffer.waiters.clear();
}

function waitForActivity(buffer: ChatBuffer, milliseconds: number): Promise<void> {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      buffer.waiters.delete(done);
      resolve();
    };
    const timer = setTimeout(done, milliseconds);
    buffer.waiters.add(done);
  });
}

async function finishCollection(buffer: ChatBuffer, triggerId: number, trigger: Trigger): Promise<void> {
  const startedWithMedia = buffer.items.some((item) => item.triggerId === triggerId);
  const minimumDeadline = startedWithMedia ? trigger.createdAt : trigger.createdAt + FOLLOW_UP_WINDOW_MS;
  const hardDeadline = trigger.createdAt + MAX_COLLECTION_WINDOW_MS;

  // An attached standalone image is already complete. Albums need a small quiet
  // period; a text command gets a longer window for photos sent right after it.
  if (startedWithMedia && !buffer.items.some((item) => item.triggerId === triggerId && item.mediaGroupId)) return;

  while (Date.now() < hardDeadline) {
    const target = trigger.lastMediaAt
      ? Math.max(minimumDeadline, trigger.lastMediaAt + ALBUM_QUIET_MS)
      : minimumDeadline;
    const remaining = Math.min(target, hardDeadline) - Date.now();
    if (remaining <= 0) return;
    await waitForActivity(buffer, remaining);
  }
}

function takeItems(chatId: number, buffer: ChatBuffer, triggerId: number): BufferedImage[] {
  const items = buffer.items
    .filter((item) => item.triggerId === triggerId)
    .sort((a, b) => a.messageId - b.messageId);
  buffer.items = buffer.items.filter((item) => item.triggerId !== triggerId);
  buffer.triggers.delete(triggerId);
  if (buffer.currentTriggerId === triggerId) buffer.currentTriggerId = undefined;
  if (!buffer.items.length && !buffer.triggers.size && !buffer.waiters.size) buffers.delete(chatId);
  return items;
}

function availableName(base: string, used: Set<string>): string {
  let candidate = `${base}.webp`;
  for (let suffix = 2; used.has(candidate); suffix++) candidate = `${base}-${suffix}.webp`;
  return candidate;
}

function nextPhotoName(used: Set<string>): string {
  for (let number = 1; ; number++) {
    const candidate = `img-${number}.webp`;
    if (!used.has(candidate)) return candidate;
  }
}

async function downloadImage(item: BufferedImage): Promise<Buffer> {
  const telegramFile = await item.ctx.api.getFile(item.fileId);
  const reportedSize = item.fileSize ?? telegramFile.file_size;
  if (reportedSize !== undefined && reportedSize > MAX_FILE_BYTES) {
    throw new Error("over-limit");
  }
  if (!telegramFile.file_path) throw new Error("Telegram did not provide a download path");

  const safePath = telegramFile.file_path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`https://api.telegram.org/file/bot${item.ctx.api.token}/${safePath}`);
  if (!response.ok) throw new Error(`Telegram download failed (${response.status})`);
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_BYTES) throw new Error("over-limit");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_FILE_BYTES) throw new Error("over-limit");
  return bytes;
}

function displayName(item: BufferedImage, photoNumber: number): string {
  return item.fileName || `photo ${photoNumber}`;
}

async function tellUserAboutRejections(ctx: Context, rejected: RejectedImage[]): Promise<void> {
  if (!rejected.length || !ctx.chat) return;
  const text = ["Some images were skipped:", ...rejected.map(({ name, reason }) => `- ${name}: ${reason}`)].join("\n");
  try {
    await ctx.api.sendMessage(ctx.chat.id, text, {
      ...(ctx.msg?.message_id
        ? { reply_parameters: { message_id: ctx.msg.message_id, allow_sending_without_reply: true } }
        : {}),
    });
  } catch (error) {
    console.warn(`[images] could not report rejected images: ${(error as Error).message}`);
  }
}

export const intakeImages: IntakeImages = async (ctx, slug, env) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid landing-page slug: ${slug}`);
  const chatId = ctx.chat?.id;
  const triggerId = ctx.msg?.message_id;
  if (chatId === undefined || triggerId === undefined) return { images: [], rejected: [], captionText: "" };

  const { buffer, trigger } = registerTrigger(chatId, triggerId);
  const directMedia = mediaFromContext(ctx, triggerId);
  if (directMedia) addMedia(buffer, directMedia);
  await finishCollection(buffer, triggerId, trigger);
  const items = takeItems(chatId, buffer, triggerId);

  const outputDir = path.join(env.config.repoDir, "public", "lp", slug);
  await mkdir(outputDir, { recursive: true });
  const used = new Set(await readdir(outputDir));
  const images: SavedImage[] = [];
  const rejected: RejectedImage[] = [];
  let photoNumber = 0;

  for (const item of items) {
    if (item.kind === "photo") photoNumber++;
    const name = displayName(item, photoNumber);
    if (item.fileSize !== undefined && item.fileSize > MAX_FILE_BYTES) {
      rejected.push({ name, reason: "file is over the 20 MB limit" });
      continue;
    }
    if (item.kind === "document" && item.mimeType && !item.mimeType.toLowerCase().startsWith("image/")) {
      rejected.push({ name, reason: "document is not an image" });
      continue;
    }

    let bytes: Buffer;
    try {
      bytes = await downloadImage(item);
    } catch (error) {
      const message = (error as Error).message;
      rejected.push({
        name,
        reason: message === "over-limit" ? "file is over the 20 MB limit" : `could not download it: ${message}`,
      });
      continue;
    }

    const originalStem = item.fileName ? slugify(path.parse(item.fileName).name) : "";
    const fileName = originalStem ? availableName(originalStem, used) : nextPhotoName(used);
    const outputPath = path.join(outputDir, fileName);
    try {
      const info = await sharp(bytes, { failOn: "error" })
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);
      used.add(fileName);
      images.push({ path: `/lp/${slug}/${fileName}`, width: info.width, height: info.height });
    } catch {
      await unlink(outputPath).catch(() => undefined);
      rejected.push({ name, reason: "file could not be read as an image" });
    }
  }

  await tellUserAboutRejections(ctx, rejected);
  const captionText = items.map((item) => item.caption?.trim()).filter((caption): caption is string => Boolean(caption)).join("\n");
  return { images, rejected, captionText };
};

/**
 * Buffer page-command media before command handlers enqueue the job. Subsequent
 * photo/document updates are associated with the latest unconsumed command in
 * that chat, which preserves Telegram media groups and queued jobs separately.
 */
export function imageMiddleware(): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const chatId = ctx.chat?.id;
    const messageId = ctx.msg?.message_id;
    if (chatId !== undefined && messageId !== undefined) {
      if (isPageCommand(ctx)) registerTrigger(chatId, messageId);
      const buffer = buffers.get(chatId);
      const triggerId = isPageCommand(ctx) ? messageId : buffer?.currentTriggerId;
      if (buffer && triggerId !== undefined && buffer.triggers.has(triggerId)) {
        const media = mediaFromContext(ctx, triggerId);
        if (media) addMedia(buffer, media);
      }
    }
    await next();
  };
}
