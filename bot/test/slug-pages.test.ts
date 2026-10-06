import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { listPages } from "../src/pages.js";
import { deriveSlug, isValidSlug, slugify } from "../src/slug.js";
import { tmpDir } from "./helpers.js";

describe("slugs", () => {
  it("slugify", () => {
    expect(slugify("  CA Inter — May 2026!! ")).toBe("ca-inter-may-2026");
    expect(slugify("Café Déjà")).toBe("cafe-deja");
  });

  it("deriveSlug keeps a few meaningful words", () => {
    expect(deriveSlug("Landing page for the CA Final revision batch starting June")).toBe("ca-final-revision-batch");
    expect(deriveSlug("!!!")).toBe("page");
  });

  it("deriveSlug avoids taken and reserved slugs", () => {
    expect(deriveSlug("RTI", [])).toBe("rti-2");
    expect(deriveSlug("Audit course", ["audit-course", "audit-course-2"])).toBe("audit-course-3");
    expect(deriveSlug("Batch success")).toBe("batch");
  });

  it("isValidSlug", () => {
    expect(isValidSlug("manual-v2")).toBe(true);
    expect(isValidSlug("Manual")).toBe(false);
    expect(isValidSlug("a--b")).toBe(false);
    expect(isValidSlug("thing-success")).toBe(false);
  });
});

describe("listPages", () => {
  it("lists <slug>.js files, skipping _ files and non-js", async () => {
    const repo = tmpDir();
    const dir = path.join(repo, "src/landing-pages");
    mkdirSync(dir, { recursive: true });
    for (const f of ["zeta.js", "_template.js", "alpha.js", "README.md"]) writeFileSync(path.join(dir, f), "");
    expect(await listPages(repo)).toEqual(["alpha", "zeta"]);
  });

  it("returns [] when the folder does not exist", async () => {
    expect(await listPages(tmpDir())).toEqual([]);
  });
});
