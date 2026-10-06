/** Kebab-case slug, as required by the landing-page config schema. */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Paths that already belong to hand-written routes in src/App.jsx (plus their
 * `-success` forms). A generated landing page must never take one of these.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set(
  [
    "focas", "links", "meet", "payment", "success", "counselling", "rti", "career-guidance",
    "audit", "manual", "workout-batch", "fs", "course", "privacy-policy",
  ].flatMap((s) => [s, `${s}-success`]),
);

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "of", "to", "in", "on", "with", "at", "by", "from",
  "page", "landing", "lp", "new", "create", "make", "build", "please", "ad", "ads",
]);

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !slug.endsWith("-success");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Derive a short slug from a free-text brief: the first few meaningful words,
 * made unique against `taken` and the reserved routes by appending -2, -3, …
 */
export function deriveSlug(brief: string, taken: Iterable<string> = [], maxWords = 4): string {
  const words = slugify(brief).split("-").filter(Boolean);
  const meaningful = words.filter((w) => !STOP_WORDS.has(w));
  let base = (meaningful.length ? meaningful : words).slice(0, maxWords).join("-").slice(0, 40);
  base = base.replace(/-+$/g, "") || "page";
  if (base.endsWith("-success")) base = base.slice(0, -"-success".length) || "page";

  const used = new Set(taken);
  let slug = base;
  for (let n = 2; used.has(slug) || RESERVED_SLUGS.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}
