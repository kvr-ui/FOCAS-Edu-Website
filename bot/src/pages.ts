import { readdir } from "node:fs/promises";
import path from "node:path";

/** Folder (relative to the repo root) holding one config file per landing page. */
export const LANDING_PAGES_DIR = "src/landing-pages";

/**
 * Slugs of the landing pages present in `<repoDir>/src/landing-pages` (`<slug>.js`),
 * sorted. Files starting with `_` (e.g. `_template.js`) are not pages.
 * A missing folder means "no pages yet".
 */
export async function listPages(repoDir: string): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(path.join(repoDir, LANDING_PAGES_DIR));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return names
    .filter((n) => n.endsWith(".js") && !n.startsWith("_") && !n.startsWith("."))
    .map((n) => n.slice(0, -".js".length))
    .sort();
}

export type ListPages = typeof listPages;
