// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { createRegistry, listSlugs, loadConfig } from "../registry.js";

const fakeModules = () => ({
  "../landing-pages/webinar.js": vi.fn(async () => ({ default: { slug: "webinar" } })),
  "../landing-pages/audit-2.js": vi.fn(async () => ({ default: { slug: "audit-2" } })),
  "../landing-pages/_template.js": vi.fn(async () => ({ default: { slug: "_template" } })),
  "../landing-pages/_draft.js": vi.fn(async () => ({ default: { slug: "_draft" } })),
});

describe("createRegistry", () => {
  it("lists slugs, ignoring _-prefixed files", () => {
    expect(createRegistry(fakeModules()).listSlugs()).toEqual(["audit-2", "webinar"]);
  });

  it("lazy-loads: no config module is imported until loadConfig is called", async () => {
    const modules = fakeModules();
    const registry = createRegistry(modules);
    registry.listSlugs();
    for (const load of Object.values(modules)) expect(load).not.toHaveBeenCalled();

    await expect(registry.loadConfig("webinar")).resolves.toEqual({ slug: "webinar" });
    expect(modules["../landing-pages/webinar.js"]).toHaveBeenCalledTimes(1);
    expect(modules["../landing-pages/audit-2.js"]).not.toHaveBeenCalled();
  });

  it("returns null for unknown and _-prefixed slugs", async () => {
    const modules = fakeModules();
    const registry = createRegistry(modules);
    await expect(registry.loadConfig("nope")).resolves.toBeNull();
    await expect(registry.loadConfig("_template")).resolves.toBeNull();
    await expect(registry.loadConfig("__proto__")).resolves.toBeNull();
    expect(modules["../landing-pages/_template.js"]).not.toHaveBeenCalled();
  });

  it("returns null when a module has no default export", async () => {
    const registry = createRegistry({ "../landing-pages/empty.js": async () => ({}) });
    await expect(registry.loadConfig("empty")).resolves.toBeNull();
  });
});

describe("registry module (import.meta.glob of src/landing-pages)", () => {
  it("exports listSlugs and loadConfig", async () => {
    expect(Array.isArray(listSlugs())).toBe(true);
    expect(listSlugs().some((s) => s.startsWith("_"))).toBe(false);
    await expect(loadConfig("definitely-not-a-page")).resolves.toBeNull();
  });
});
