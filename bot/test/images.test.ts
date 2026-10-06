import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Context } from "grammy";
import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";
import { imageMiddleware, intakeImages } from "../src/images.js";
import { StateStore } from "../src/state.js";
import type { ServiceEnv } from "../src/types.js";
import { testConfig } from "./helpers.js";

const wideFixture = await readFile(new URL("./fixtures/wide.svg", import.meta.url));
const smallFixture = await readFile(new URL("./fixtures/small.svg", import.meta.url));

interface FakeApi {
  token: string;
  getFile: ReturnType<typeof vi.fn>;
  sendMessage: ReturnType<typeof vi.fn>;
}

function fakeApi(): FakeApi {
  return {
    token: "123456:TEST-TOKEN-xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getFile: vi.fn(async (fileId: string) => ({
      file_id: fileId,
      file_unique_id: `unique-${fileId}`,
      file_path: `fixtures/${fileId}`,
    })),
    sendMessage: vi.fn(async () => ({ message_id: 999 })),
  };
}

function fakeContext(
  api: FakeApi,
  opts: {
    chatId: number;
    messageId: number;
    text?: string;
    caption?: string;
    mediaGroupId?: string;
    photo?: { fileId: string; fileSize?: number };
    document?: { fileId: string; fileName: string; mimeType?: string; fileSize?: number };
  },
): Context {
  const chat = { id: opts.chatId, type: "private", first_name: "Tester" };
  const msg = {
    message_id: opts.messageId,
    date: 0,
    chat,
    from: { id: opts.chatId, is_bot: false, first_name: "Tester" },
    ...(opts.text ? { text: opts.text } : {}),
    ...(opts.caption ? { caption: opts.caption } : {}),
    ...(opts.mediaGroupId ? { media_group_id: opts.mediaGroupId } : {}),
    ...(opts.photo
      ? {
          photo: [
            {
              file_id: opts.photo.fileId,
              file_unique_id: `unique-${opts.photo.fileId}`,
              width: 2000,
              height: 1000,
              file_size: opts.photo.fileSize,
            },
          ],
        }
      : {}),
    ...(opts.document
      ? {
          document: {
            file_id: opts.document.fileId,
            file_unique_id: `unique-${opts.document.fileId}`,
            file_name: opts.document.fileName,
            mime_type: opts.document.mimeType,
            file_size: opts.document.fileSize,
          },
        }
      : {}),
  };
  return { api, chat, msg } as unknown as Context;
}

function env(): ServiceEnv {
  const config = testConfig();
  return { config, state: new StateStore(config.stateDir), report: vi.fn(async () => undefined) };
}

async function buffer(ctx: Context): Promise<void> {
  await imageMiddleware()(ctx, async () => undefined);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("intakeImages", () => {
  it("collects a three-photo album sent after /newpage, including its caption", async () => {
    const api = fakeApi();
    const serviceEnv = env();
    const command = fakeContext(api, { chatId: 7101, messageId: 10, text: "/newpage exam revision batch" });
    await buffer(command);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(wideFixture)));

    const pending = intakeImages(command, "exam-revision", serviceEnv);
    await Promise.all([
      buffer(fakeContext(api, { chatId: 7101, messageId: 11, photo: { fileId: "a" }, mediaGroupId: "album-1", caption: "Use these in the hero" })),
      buffer(fakeContext(api, { chatId: 7101, messageId: 12, photo: { fileId: "b" }, mediaGroupId: "album-1" })),
      buffer(fakeContext(api, { chatId: 7101, messageId: 13, photo: { fileId: "c" }, mediaGroupId: "album-1" })),
    ]);
    const result = await pending;

    expect(result.captionText).toBe("Use these in the hero");
    expect(result.rejected).toEqual([]);
    expect(result.images).toEqual([
      { path: "/lp/exam-revision/img-1.webp", width: 1600, height: 800 },
      { path: "/lp/exam-revision/img-2.webp", width: 1600, height: 800 },
      { path: "/lp/exam-revision/img-3.webp", width: 1600, height: 800 },
    ]);
    for (const image of result.images) {
      const metadata = await sharp(path.join(serviceEnv.config.repoDir, "public", image.path)).metadata();
      expect(metadata).toMatchObject({ format: "webp", width: 1600, height: 800 });
    }
  });

  it("slugifies document stems, caps width, and never upscales", async () => {
    const api = fakeApi();
    const serviceEnv = env();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => new Response(url.endsWith("/small") ? smallFixture : wideFixture)),
    );
    const command = fakeContext(api, {
      chatId: 7102,
      messageId: 20,
      caption: "/newpage images",
      mediaGroupId: "docs-1",
      document: { fileId: "wide", fileName: "My Hero FINAL.PNG", mimeType: "image/png" },
    });
    const small = fakeContext(api, {
      chatId: 7102,
      messageId: 21,
      mediaGroupId: "docs-1",
      document: { fileId: "small", fileName: "Course Card.jpg", mimeType: "image/jpeg" },
    });
    await buffer(command);
    await buffer(small);

    const result = await intakeImages(command, "named-images", serviceEnv);
    expect(result.images).toEqual([
      { path: "/lp/named-images/my-hero-final.webp", width: 1600, height: 800 },
      { path: "/lp/named-images/course-card.webp", width: 320, height: 180 },
    ]);
  });

  it("rejects oversized and non-image documents while keeping valid images", async () => {
    const api = fakeApi();
    const serviceEnv = env();
    const command = fakeContext(api, { chatId: 7103, messageId: 30, text: "/newpage mixed files" });
    await buffer(command);
    await buffer(fakeContext(api, {
      chatId: 7103,
      messageId: 31,
      document: { fileId: "valid", fileName: "Valid Image.png", mimeType: "image/png" },
    }));
    await buffer(fakeContext(api, {
      chatId: 7103,
      messageId: 32,
      document: { fileId: "huge", fileName: "Huge.png", mimeType: "image/png", fileSize: 20 * 1024 * 1024 + 1 },
    }));
    await buffer(fakeContext(api, {
      chatId: 7103,
      messageId: 33,
      document: { fileId: "notes", fileName: "notes.pdf", mimeType: "application/pdf" },
    }));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(smallFixture)));

    const result = await intakeImages(command, "mixed-files", serviceEnv);
    expect(result.images).toEqual([{ path: "/lp/mixed-files/valid-image.webp", width: 320, height: 180 }]);
    expect(result.rejected).toEqual([
      { name: "Huge.png", reason: "file is over the 20 MB limit" },
      { name: "notes.pdf", reason: "document is not an image" },
    ]);
    expect(api.getFile).toHaveBeenCalledTimes(1);
    expect(api.sendMessage).toHaveBeenCalledWith(
      7103,
      expect.stringMatching(/Huge\.png: file is over the 20 MB limit[\s\S]*notes\.pdf: document is not an image/),
      expect.anything(),
    );
  });

  it("adds /edit images without overwriting existing named or unnamed files", async () => {
    const api = fakeApi();
    const serviceEnv = env();
    const outputDir = path.join(serviceEnv.config.repoDir, "public/lp/existing-page");
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "hero.webp"), "keep hero");
    await writeFile(path.join(outputDir, "img-1.webp"), "keep photo");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(smallFixture)));

    const edit = fakeContext(api, {
      chatId: 7104,
      messageId: 40,
      caption: "/edit existing-page replace imagery",
      mediaGroupId: "edit-album",
      document: { fileId: "hero", fileName: "Hero.png", mimeType: "image/png" },
    });
    const photo = fakeContext(api, {
      chatId: 7104,
      messageId: 41,
      mediaGroupId: "edit-album",
      photo: { fileId: "photo" },
    });
    await buffer(edit);
    await buffer(photo);

    const result = await intakeImages(edit, "existing-page", serviceEnv);
    expect(result.images.map((image) => image.path)).toEqual([
      "/lp/existing-page/hero-2.webp",
      "/lp/existing-page/img-2.webp",
    ]);
    expect(await readFile(path.join(outputDir, "hero.webp"), "utf8")).toBe("keep hero");
    expect(await readFile(path.join(outputDir, "img-1.webp"), "utf8")).toBe("keep photo");
  });
});
