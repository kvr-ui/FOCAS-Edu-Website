// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  applyVariant,
  deepMerge,
  persistVariant,
  resolveVariant,
  useVariant,
  variantSourceSuffix,
  variantStorageKey,
} from "./useVariant";

const CONFIG = {
  slug: "demo",
  sections: [
    { type: "hero", id: "home", headline: "Students", sub: "Default", media: { type: "image", src: "/a.jpg", alt: "A" } },
    { type: "faq", id: "faq", items: [] },
  ],
  variants: {
    parents: { hero: { headline: "Parents", media: { src: "/p.jpg" } } },
    teachers: { hero: { sub: "Teach" }, sourceSuffix: "teach" },
  },
};

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
};

beforeEach(() => sessionStorage.clear());
afterEach(() => sessionStorage.clear());

describe("deepMerge", () => {
  it("merges nested objects, replaces arrays and primitives, and does not mutate", () => {
    const base = { a: 1, nested: { x: 1, y: 2 }, list: [1, 2] };
    const out = deepMerge(base, { nested: { y: 3 }, list: [9], b: undefined });
    expect(out).toEqual({ a: 1, nested: { x: 1, y: 3 }, list: [9] });
    expect(base).toEqual({ a: 1, nested: { x: 1, y: 2 }, list: [1, 2] });
  });
});

describe("resolveVariant", () => {
  it("uses a known ?v=", () => {
    expect(resolveVariant(CONFIG, "?v=parents", memoryStorage())).toBe("parents");
  });

  it("ignores an unknown ?v=", () => {
    expect(resolveVariant(CONFIG, "?v=bogus", memoryStorage())).toBeNull();
    expect(resolveVariant(CONFIG, "?v=toString", memoryStorage())).toBeNull();
    expect(resolveVariant({ slug: "x", sections: [] }, "?v=parents", memoryStorage())).toBeNull();
  });

  it("falls back to the stored variant for the same slug only", () => {
    const storage = memoryStorage();
    persistVariant("demo", "parents", storage);
    expect(resolveVariant(CONFIG, "", storage)).toBe("parents");
    expect(resolveVariant(CONFIG, "?v=bogus", storage)).toBe("parents");
    expect(resolveVariant(CONFIG, "?v=teachers", storage)).toBe("teachers");
    expect(resolveVariant({ ...CONFIG, slug: "other" }, "", storage)).toBeNull();
  });

  it("ignores a stored name that is no longer a variant", () => {
    const storage = memoryStorage();
    storage.setItem(variantStorageKey("demo"), "removed");
    expect(resolveVariant(CONFIG, "", storage)).toBeNull();
  });

  it("survives a throwing storage", () => {
    const broken = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } };
    expect(resolveVariant(CONFIG, "", broken)).toBeNull();
    expect(() => persistVariant("demo", "parents", broken)).not.toThrow();
  });
});

describe("applyVariant", () => {
  it("deep-merges the variant hero over the hero section only", () => {
    const out = applyVariant(CONFIG, "parents");
    expect(out.sections[0]).toEqual({
      type: "hero",
      id: "home",
      headline: "Parents",
      sub: "Default",
      media: { type: "image", src: "/p.jpg", alt: "A" },
    });
    expect(out.sections[1]).toBe(CONFIG.sections[1]);
    expect(CONFIG.sections[0].headline).toBe("Students");
  });

  it("returns the config untouched without a known variant", () => {
    expect(applyVariant(CONFIG, null)).toBe(CONFIG);
    expect(applyVariant(CONFIG, "bogus")).toBe(CONFIG);
  });
});

describe("variantSourceSuffix", () => {
  it("is the variant name unless sourceSuffix is set", () => {
    expect(variantSourceSuffix(CONFIG, "parents")).toBe("parents");
    expect(variantSourceSuffix(CONFIG, "teachers")).toBe("teach");
    expect(variantSourceSuffix(CONFIG, null)).toBeNull();
  });
});

describe("useVariant", () => {
  const run = (url, config = CONFIG) =>
    renderHook(() => useVariant(config), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>,
    });

  it("applies ?v= and persists it per slug in sessionStorage", () => {
    const { result } = run("/demo?v=parents");
    expect(result.current.variant).toBe("parents");
    expect(result.current.sourceSuffix).toBe("parents");
    expect(result.current.config.sections[0].headline).toBe("Parents");
    expect(sessionStorage.getItem(variantStorageKey("demo"))).toBe("parents");
  });

  it("restores the variant on a later page without ?v= (e.g. the success page)", () => {
    run("/demo?v=parents").unmount();
    const { result } = run("/demo-success");
    expect(result.current.variant).toBe("parents");
  });

  it("ignores an unknown ?v= and stores nothing", () => {
    const { result } = run("/demo?v=bogus");
    expect(result.current.variant).toBeNull();
    expect(result.current.config).toBe(CONFIG);
    expect(sessionStorage.getItem(variantStorageKey("demo"))).toBeNull();
  });
});
