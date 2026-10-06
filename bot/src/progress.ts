import type { Api } from "grammy";

/**
 * One status message per job, edited in place as the job advances
 * ("Queued…" → "Running Claude…" → "Pushing…" → "Done").
 *
 * Edits are serialized, identical texts are skipped, and Telegram errors are
 * logged instead of thrown — a failed status edit must never fail the job.
 */
export class Progress {
  private text: string;
  private chain: Promise<void> = Promise.resolve();
  private steps: string[] = [];

  private constructor(
    private readonly api: Api,
    readonly chatId: number,
    readonly messageId: number,
    private readonly title: string,
    initial: string,
  ) {
    this.text = initial;
  }

  /** Send the status message. `title` is kept as the first line of every later edit. */
  static async start(
    api: Api,
    chatId: number,
    title: string,
    status: string,
    opts: { replyTo?: number } = {},
  ): Promise<Progress> {
    const text = `${title}\n${status}`;
    const msg = await api.sendMessage(chatId, text, {
      ...(opts.replyTo ? { reply_parameters: { message_id: opts.replyTo, allow_sending_without_reply: true } } : {}),
      link_preview_options: { is_disabled: true },
    });
    return new Progress(api, chatId, msg.message_id, title, text);
  }

  /** Append a step line ("- Running Claude…"); earlier steps stay visible above it. */
  step(line: string): Promise<void> {
    this.steps.push(line);
    return this.render(this.steps.map((s) => `- ${s}`).join("\n"));
  }

  /** Replace everything below the title with `status`. */
  set(status: string): Promise<void> {
    return this.render(status);
  }

  /** Final edit: keeps the step log and adds a closing line. */
  finish(status: string): Promise<void> {
    const log = this.steps.map((s) => `- ${s}`);
    return this.render([...log, status].join("\n"));
  }

  private render(body: string): Promise<void> {
    const text = `${this.title}\n${body}`.slice(0, 4096);
    this.chain = this.chain.then(async () => {
      if (text === this.text) return;
      try {
        await this.api.editMessageText(this.chatId, this.messageId, text, {
          link_preview_options: { is_disabled: true },
        });
        this.text = text;
      } catch (err) {
        console.warn(`[progress] could not edit status message: ${(err as Error).message}`);
      }
    });
    return this.chain;
  }
}
