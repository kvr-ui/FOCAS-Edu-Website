// `?v=<name>` ad-angle variants for landing pages.
//
// A variant overrides the hero (deep-merged) and the lead-source suffix. The
// chosen variant is remembered in sessionStorage per slug, so it survives to
// form submit and to /<slug>-success (whose URL carries no `?v=`).

import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

export const VARIANT_PARAM = "v";

/** sessionStorage key holding the active variant of `slug`. */
export const variantStorageKey = (slug) => `focas_lp_variant:${slug}`;

const isPlainObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

/**
 * Deep-merge `override` over `base` without mutating either. Plain objects
 * merge recursively; arrays, functions and primitives in `override` replace.
 * `undefined` override values are ignored.
 */
export function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : override;
  }
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    out[key] = isPlainObject(value) && isPlainObject(base[key]) ? deepMerge(base[key], value) : value;
  }
  return out;
}

const knownVariant = (config, name) =>
  typeof name === "string" &&
  name !== "" &&
  isPlainObject(config?.variants) &&
  Object.prototype.hasOwnProperty.call(config.variants, name) &&
  isPlainObject(config.variants[name]);

function readStored(storage, slug) {
  try {
    return storage?.getItem(variantStorageKey(slug)) ?? null;
  } catch {
    return null; // sessionStorage unavailable (private mode)
  }
}

/**
 * Pick the active variant name: a known `?v=` wins, otherwise a known stored
 * value for this slug, otherwise `null`. Unknown names are ignored.
 *
 * @param {object} config landing-page config
 * @param {string} search location.search, e.g. "?v=parents"
 * @param {Storage} [storage] defaults to sessionStorage
 */
export function resolveVariant(config, search = "", storage = safeSessionStorage()) {
  if (!config) return null;
  const fromQuery = new URLSearchParams(search).get(VARIANT_PARAM);
  if (knownVariant(config, fromQuery)) return fromQuery;
  const stored = readStored(storage, config.slug);
  return knownVariant(config, stored) ? stored : null;
}

/** Remember `variant` for `slug` (no-op when storage is unavailable). */
export function persistVariant(slug, variant, storage = safeSessionStorage()) {
  if (!slug || !variant) return;
  try {
    storage?.setItem(variantStorageKey(slug), variant);
  } catch {
    /* non-fatal */
  }
}

/**
 * The config with `variants[variant].hero` deep-merged over every hero
 * section. Returns the original config when there is nothing to apply.
 */
export function applyVariant(config, variant) {
  if (!config || !knownVariant(config, variant)) return config;
  const hero = config.variants[variant].hero;
  if (!isPlainObject(hero) || !Array.isArray(config.sections)) return config;
  return {
    ...config,
    sections: config.sections.map((section) =>
      section?.type === "hero" ? { ...deepMerge(section, hero), type: "hero" } : section,
    ),
  };
}

/**
 * Suffix appended to the lead source (`<source> - <suffix>`): the variant's
 * `sourceSuffix` when set, else the variant name.
 */
export function variantSourceSuffix(config, variant) {
  if (!knownVariant(config, variant)) return null;
  const suffix = config.variants[variant].sourceSuffix;
  return typeof suffix === "string" && suffix.trim() ? suffix : variant;
}

function safeSessionStorage() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : undefined;
  } catch {
    return undefined;
  }
}

/**
 * @param {object} config landing-page config
 * @returns {{ variant: string|null, sourceSuffix: string|null, config: object }}
 *   `config` has the variant's hero applied.
 */
export function useVariant(config) {
  const { search } = useLocation();
  const variant = useMemo(() => resolveVariant(config, search), [config, search]);

  useEffect(() => {
    if (variant) persistVariant(config?.slug, variant);
  }, [config?.slug, variant]);

  const merged = useMemo(() => applyVariant(config, variant), [config, variant]);
  return { variant, sourceSuffix: variantSourceSuffix(config, variant), config: merged };
}

export default useVariant;
