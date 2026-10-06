/**
 * Single-concurrency job queue. The bot works in ONE shared git checkout (REPO_DIR),
 * so page builds, edits, deploys and rollbacks must never overlap.
 */

export interface EnqueuedJob<T> {
  /**
   * How many jobs must finish before this one starts:
   * 0 = starts right away; N > 0 = "You're #N in queue".
   */
  position: number;
  /** Resolves/rejects with the job's own result. A failing job never stalls the queue. */
  done: Promise<T>;
}

interface Pending {
  label: string;
  run: () => Promise<void>;
}

export class JobQueue {
  private readonly waiting: Pending[] = [];
  private running: string | null = null;
  private idleWaiters: Array<() => void> = [];

  /** Label of the job currently running, if any. */
  get current(): string | null {
    return this.running;
  }

  /** Number of jobs waiting (not counting the running one). */
  get waitingCount(): number {
    return this.waiting.length;
  }

  /** Running + waiting. */
  get size(): number {
    return this.waiting.length + (this.running ? 1 : 0);
  }

  enqueue<T>(label: string, task: () => Promise<T>): EnqueuedJob<T> {
    let resolve!: (v: T) => void;
    let reject!: (e: unknown) => void;
    const done = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const run = async () => {
      try {
        resolve(await task());
      } catch (err) {
        reject(err);
      }
    };

    const busy = this.running !== null;
    this.waiting.push({ label, run });
    const position = busy ? this.waiting.length : 0;
    if (!busy) void this.drain();
    return { position, done };
  }

  /** Resolves once nothing is running or waiting. */
  onIdle(): Promise<void> {
    if (this.size === 0) return Promise.resolve();
    return new Promise((res) => this.idleWaiters.push(res));
  }

  private async drain(): Promise<void> {
    let next: Pending | undefined;
    while ((next = this.waiting.shift())) {
      this.running = next.label;
      await next.run();
    }
    this.running = null;
    const waiters = this.idleWaiters;
    this.idleWaiters = [];
    for (const w of waiters) w();
  }
}
