/**
 * Production deploy & rollback — STUBS. Implemented by task 11 (issue #12).
 *
 * Contract: `deployToProd` merges `origin/lp/<slug>` into main in REPO_DIR, pushes, builds,
 * atomically swaps the build into WEB_ROOT, verifies SITE_URL/<slug> and auto-rolls back on
 * failure. `rollback` swaps WEB_ROOT and `${WEB_ROOT}-prev` back. Both record deploy history
 * via `env.state.appendDeployHistory`. Owner-only checks are done by the router before
 * these are called; both run inside the single job queue.
 */
import type { ServiceEnv } from "./types.js";

export type DeployResult =
  | { ok: true; liveUrl: string; successUrl: string; commit: string }
  | { ok: false; error: string; /** True if a failed verification was rolled back automatically. */ rolledBack?: boolean };

export type RollbackResult =
  | { ok: true; /** Commit that is live after the rollback, if known. */ liveCommit?: string }
  | { ok: false; error: string };

/** `by` identifies who triggered the deploy (for history), e.g. the owner's name or id. */
export type DeployToProd = (slug: string, by: string, env: ServiceEnv) => Promise<DeployResult>;
export type Rollback = (by: string, env: ServiceEnv) => Promise<RollbackResult>;

export const deployToProd: DeployToProd = async (slug) => ({
  ok: false,
  error: `Deploying "${slug}" is not implemented yet (task 11).`,
});

export const rollback: Rollback = async () => ({
  ok: false,
  error: "Rollback is not implemented yet (task 11).",
});
