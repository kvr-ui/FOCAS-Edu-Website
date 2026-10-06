import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

/** What the bot remembers about one landing page within one chat. */
export interface PageState {
  /** Git branch holding the page, normally `lp/<slug>`. */
  branch: string;
  /** Last Vercel preview URL sent for this page (if any). */
  lastPreviewUrl?: string;
  /** Claude Agent SDK session id, so `/edit` resumes the same conversation. */
  claudeSessionId?: string;
  /** True while Claude's questions for this page are unanswered (the next message continues the session). */
  awaitingAnswers?: boolean;
  /** Telegram message id of the last preview message; replying to it means "edit this slug". */
  lastMessageId?: number;
  /** ISO time of the last update. */
  updatedAt?: string;
}

export interface ChatState {
  pages: Record<string, PageState>;
  /** Slug most recently previewed in this chat — the target of a bare `ok`. */
  lastSlug?: string;
}

export type DeployAction = "deploy" | "rollback" | "auto-rollback";

export interface DeployHistoryEntry {
  slug: string | null;
  commit: string | null;
  time: string;
  /** Who triggered it (Telegram user id or name). */
  by: string;
  action: DeployAction;
}

/**
 * Small JSON-file store: one file per chat (`<dir>/chats/<chatId>.json`) plus a global
 * deploy history (`<dir>/deploy-history.json`). Writes are synchronous and atomic
 * (temp file + rename), which is plenty for a single bot process.
 */
export class StateStore {
  constructor(private readonly dir: string) {}

  private chatFile(chatId: number): string {
    return path.join(this.dir, "chats", `${chatId}.json`);
  }

  private historyFile(): string {
    return path.join(this.dir, "deploy-history.json");
  }

  getChat(chatId: number): ChatState {
    const data = readJson<ChatState>(this.chatFile(chatId));
    return { pages: data?.pages ?? {}, lastSlug: data?.lastSlug };
  }

  getPage(chatId: number, slug: string): PageState | undefined {
    return this.getChat(chatId).pages[slug];
  }

  /** Merge `patch` into the page's state (creating it) and mark it as the chat's last slug. */
  setPage(chatId: number, slug: string, patch: Partial<PageState>): PageState {
    const chat = this.getChat(chatId);
    const prev = chat.pages[slug] ?? { branch: `lp/${slug}` };
    const next: PageState = { ...prev, ...patch, updatedAt: new Date().toISOString() };
    chat.pages[slug] = next;
    chat.lastSlug = slug;
    writeJson(this.chatFile(chatId), chat);
    return next;
  }

  /** Find which slug (if any) a bot message in this chat was the latest preview for. */
  findSlugByMessageId(chatId: number, messageId: number): string | undefined {
    const { pages } = this.getChat(chatId);
    return Object.keys(pages).find((slug) => pages[slug].lastMessageId === messageId);
  }

  getLastSlug(chatId: number): string | undefined {
    return this.getChat(chatId).lastSlug;
  }

  appendDeployHistory(entry: Omit<DeployHistoryEntry, "time"> & { time?: string }): DeployHistoryEntry {
    const full: DeployHistoryEntry = { ...entry, time: entry.time ?? new Date().toISOString() };
    const history = this.getDeployHistory();
    history.push(full);
    writeJson(this.historyFile(), history);
    return full;
  }

  getDeployHistory(): DeployHistoryEntry[] {
    return readJson<DeployHistoryEntry[]>(this.historyFile()) ?? [];
  }
}

function readJson<T>(file: string): T | undefined {
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
  return JSON.parse(raw) as T;
}

function writeJson(file: string, data: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  renameSync(tmp, file);
}
