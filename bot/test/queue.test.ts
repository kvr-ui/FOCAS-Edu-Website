import { describe, expect, it } from "vitest";
import { JobQueue } from "../src/queue.js";
import { deferred, flush } from "./helpers.js";

describe("JobQueue", () => {
  it("runs a job immediately when idle (position 0)", async () => {
    const q = new JobQueue();
    const job = q.enqueue("a", async () => 42);
    expect(job.position).toBe(0);
    await expect(job.done).resolves.toBe(42);
  });

  it("runs jobs one at a time, in order, and reports queue positions", async () => {
    const q = new JobQueue();
    const log: string[] = [];
    const gates = [deferred(), deferred(), deferred()];
    const jobs = ["a", "b", "c"].map((name, i) =>
      q.enqueue(name, async () => {
        log.push(`start ${name}`);
        await gates[i].promise;
        log.push(`end ${name}`);
        return name;
      }),
    );

    expect(jobs.map((j) => j.position)).toEqual([0, 1, 2]);
    expect(q.current).toBe("a");
    expect(q.waitingCount).toBe(2);
    expect(q.size).toBe(3);

    await flush();
    expect(log).toEqual(["start a"]);

    // Finish out of order: c's gate opening first must not let c start early.
    gates[2].resolve();
    await flush();
    expect(log).toEqual(["start a"]);

    gates[0].resolve();
    await jobs[0].done;
    await flush();
    expect(log).toEqual(["start a", "end a", "start b"]);
    expect(q.current).toBe("b");

    gates[1].resolve();
    await expect(Promise.all(jobs.map((j) => j.done))).resolves.toEqual(["a", "b", "c"]);
    expect(log).toEqual(["start a", "end a", "start b", "end b", "start c", "end c"]);
    await q.onIdle();
    expect(q.size).toBe(0);
    expect(q.current).toBeNull();
  });

  it("never runs two jobs concurrently", async () => {
    const q = new JobQueue();
    let active = 0;
    let maxActive = 0;
    const jobs = Array.from({ length: 5 }, (_, i) =>
      q.enqueue(`j${i}`, async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 5));
        active--;
      }),
    );
    await Promise.all(jobs.map((j) => j.done));
    expect(maxActive).toBe(1);
  });

  it("a failing job rejects its own promise but does not stall the queue", async () => {
    const q = new JobQueue();
    const bad = q.enqueue("bad", async () => {
      throw new Error("boom");
    });
    const good = q.enqueue("good", async () => "ok");
    await expect(bad.done).rejects.toThrow("boom");
    await expect(good.done).resolves.toBe("ok");
  });

  it("positions restart after the queue drains", async () => {
    const q = new JobQueue();
    await q.enqueue("a", async () => undefined).done;
    await q.onIdle();
    expect(q.enqueue("b", async () => undefined).position).toBe(0);
    await q.onIdle();
  });

  it("onIdle resolves immediately when empty", async () => {
    await expect(new JobQueue().onIdle()).resolves.toBeUndefined();
  });
});
