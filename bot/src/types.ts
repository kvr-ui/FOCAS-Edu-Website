import type { Context } from "grammy";
import type { Config } from "./config.js";
import type { StateStore } from "./state.js";

/**
 * Everything a service (images, Claude, git, Vercel, deploy) needs from the bot,
 * passed explicitly so services stay testable without Telegram.
 */
export interface ServiceEnv {
  config: Config;
  state: StateStore;
  /** Report a progress step to the user (edits the job's single status message). */
  report: (line: string) => Promise<void>;
}

/** A `/newpage` or `/edit` request, as handed to `branchFlow`. */
export interface PageJob {
  kind: "new" | "edit";
  slug: string;
  /** The ad brief (new) or the change instruction (edit). */
  text: string;
  chatId: number;
  userId: number;
  /** Display name of the requester, for commit messages / logs. */
  userName: string;
  /** Claude session to resume (edits / answers to Claude's questions). */
  resumeSessionId?: string;
  /** The Telegram context of the triggering message (image intake reads photos from it). */
  ctx: Context;
}
