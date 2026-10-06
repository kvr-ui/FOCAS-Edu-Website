/**
 * Vercel preview lookup — STUB. Implemented by task 10 (issue #11).
 *
 * Contract: poll the Vercel API for the deployment of `commitSha` on `branch` until it
 * is READY / ERROR / CANCELED or a timeout elapses. Expected outcomes are returned as a
 * discriminated union, never thrown.
 */
import type { ServiceEnv } from "./types.js";

export type PreviewResult =
  | { status: "ready"; url: string; inspectorUrl?: string }
  | { status: "error"; logTail: string; inspectorUrl?: string }
  | { status: "timeout"; message: string; inspectorUrl?: string };

export type GetPreviewUrl = (commitSha: string, branch: string, env: ServiceEnv) => Promise<PreviewResult>;

export const getPreviewUrl: GetPreviewUrl = async () => ({
  status: "timeout",
  message: "Vercel preview lookup is not implemented yet (task 10).",
});
