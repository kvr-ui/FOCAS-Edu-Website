import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import template from "../../landing-pages/_template.js";
import { BLOCK_TYPES, FIELD_LIBRARY, SUBMIT_KINDS, validateConfig } from "../schema.js";

const source = readFileSync(new URL("../../landing-pages/_template.js", import.meta.url), "utf8");

describe("_template.js reference config", () => {
  it("passes the validator", () => {
    expect(validateConfig(template, { filename: "template.js" })).toEqual([]);
  });

  it("shows every block type except custom (documented in a comment)", () => {
    const used = new Set(template.sections.map((s) => s.type));
    for (const type of BLOCK_TYPES.filter((t) => t !== "custom")) expect(used).toContain(type);
    expect(source).toContain('type: "custom"');
  });

  it("lists every form field and every submit kind", () => {
    const used = new Set(template.form.fields.map((f) => (typeof f === "string" ? f : f.field)));
    for (const field of FIELD_LIBRARY) expect(used).toContain(field);
    for (const kind of SUBMIT_KINDS) expect(source).toContain(`kind: "${kind}"`);
  });

  it("shows expiry (both modes) and variants", () => {
    expect(template.expiresAt).toBeTruthy();
    expect(template.afterExpiry.mode).toBe("waitlist");
    expect(source).toContain('mode: "redirect"');
    expect(Object.keys(template.variants).length).toBeGreaterThan(0);
  });
});
