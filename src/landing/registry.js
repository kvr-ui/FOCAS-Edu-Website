// Registry of landing-page configs in src/landing-pages/<slug>.js.
// Configs are lazy-loaded (one chunk each); files starting with `_`
// (e.g. `_template.js`) are never treated as pages.

/**
 * Build a registry from an `import.meta.glob` result
 * (`{ "<path>/<slug>.js": () => Promise<module> }`). Exported for tests.
 */
export function createRegistry(modules) {
  const loaders = new Map();
  for (const [path, load] of Object.entries(modules)) {
    const file = path.split("/").pop();
    if (file.startsWith("_") || !file.endsWith(".js")) continue;
    loaders.set(file.slice(0, -".js".length), load);
  }

  return {
    /** Slugs of every available page, sorted. */
    listSlugs: () => [...loaders.keys()].sort(),
    /** Resolve the config for `slug`, or `null` if there is no such page. */
    async loadConfig(slug) {
      const load = loaders.get(slug);
      if (!load) return null;
      const mod = await load();
      return mod?.default ?? null;
    },
  };
}

const registry = createRegistry(import.meta.glob("../landing-pages/*.js"));

export const listSlugs = registry.listSlugs;
export const loadConfig = registry.loadConfig;
