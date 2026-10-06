/**
 * Image intake — STUB. Implemented by task 9 (issue #10).
 *
 * Contract: collect the photos / image documents sent with or right after `/newpage`
 * (albums included) or with `/edit`, convert them to webp and save them to
 * `<REPO_DIR>/public/lp/<slug>/`. Expected failures (too big, not an image) go in
 * `rejected`; they must not fail the rest of the batch.
 */
import type { Context, MiddlewareFn } from "grammy";
import type { ServiceEnv } from "./types.js";

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

export const intakeImages: IntakeImages = async () => ({ images: [], rejected: [], captionText: "" });

/**
 * Middleware installed by the router right after access control, before commands.
 * Task 9 can use it to buffer photos/albums per chat until a job picks them up.
 * The stub just passes everything through.
 */
export function imageMiddleware(): MiddlewareFn<Context> {
  return (_ctx, next) => next();
}
