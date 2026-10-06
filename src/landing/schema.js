// Landing-page config contract.
//
// Plain JS on purpose: no JSX, no `import.meta`, no browser globals, so this
// module imports unchanged from the browser bundle (registry, renderer) and
// from Node scripts (validate-landing, meta-html generation).

/** Section block types the renderer knows about. */
export const BLOCK_TYPES = Object.freeze([
  "hero",
  "ticker",
  "countdown",
  "highlights",
  "whatYouGet",
  "howItWorks",
  "agenda",
  "compare",
  "testimonials",
  "videoTestimonials",
  "gallery",
  "faq",
  "finalCta",
  "footer",
  "custom",
]);

/** Form fields a config may use (by name, or as `{ field: <name>, ... }`). */
export const FIELD_LIBRARY = Object.freeze([
  "name",
  "phone",
  "email",
  "caStatus",
  "attempt",
  "language",
  "city",
  "state",
  "address",
]);

export const SUBMIT_KINDS = Object.freeze(["zoho", "leadServer", "razorpay"]);

export const AFTER_EXPIRY_MODES = Object.freeze(["waitlist", "redirect"]);

/** Keys a `variants.<name>` entry is allowed to override. */
export const VARIANT_KEYS = Object.freeze(["hero", "sourceSuffix"]);

/** Keys allowed on a form-field override object. */
const FIELD_OVERRIDE_KEYS = Object.freeze(["field", "key", "label", "options", "required"]);

/**
 * Top-level explicit routes in src/App.jsx. A landing page slug may not take
 * one of these (or its `-success` form), since explicit routes win over the
 * catch-all and the page would be unreachable.
 */
export const RESERVED_ROUTES = Object.freeze([
  "focas",
  "links",
  "meet",
  "payment",
  "success",
  "counselling",
  "rti",
  "career-guidance",
  "audit",
  "manual",
  "workout-batch",
  "fs",
  "course",
  "privacy-policy",
]);

/**
 * Top-level paths used for static files: Vite's build output (`/assets/...`)
 * and per-page landing assets (`/lp/<slug>/...`).
 */
export const RESERVED_STATIC_PATHS = Object.freeze(["assets", "lp"]);

/** Every slug a landing page may not use. Pass to `validateConfig`. */
export const RESERVED_PATHS = Object.freeze([
  ...RESERVED_ROUTES,
  ...RESERVED_ROUTES.map((r) => `${r}-success`),
  ...RESERVED_STATIC_PATHS,
]);

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
const quote = (v) => JSON.stringify(v);
const list = (values) => values.map((v) => `"${v}"`).join(", ");

/** `"src/landing-pages/foo.js"` -> `"foo"` */
export function slugFromFilename(filename) {
  const base = String(filename).split(/[\\/]/).pop();
  return base.replace(/\.m?js$/, "");
}

/** True for a valid ISO-8601 date / date-time string. */
export function isIsoDate(value) {
  return typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * Validate a landing-page config.
 *
 * @param {object} cfg the config's default export
 * @param {object} [opts]
 * @param {readonly string[]} [opts.knownBlockTypes] allowed section types
 * @param {readonly string[]} [opts.reservedPaths] slugs that may not be used (see RESERVED_PATHS)
 * @param {string} [opts.filename] config file name; its basename (sans .js) must equal the slug
 * @returns {string[]} human-readable `"<path>: <message>"` errors; empty = valid
 */
export function validateConfig(
  cfg,
  { knownBlockTypes = BLOCK_TYPES, reservedPaths = [], filename } = {},
) {
  const errors = [];
  const err = (path, message) => errors.push(`${path}: ${message}`);

  if (!isObject(cfg)) {
    err("config", "must be an object (the file's default export)");
    return errors;
  }

  // --- slug -------------------------------------------------------------
  const { slug } = cfg;
  if (!isNonEmptyString(slug)) {
    err("slug", "required string");
  } else {
    if (!KEBAB_CASE.test(slug)) {
      err("slug", `${quote(slug)} must be kebab-case (lowercase letters, digits and single hyphens)`);
    }
    if (filename !== undefined) {
      const expected = slugFromFilename(filename);
      if (slug !== expected) {
        err("slug", `${quote(slug)} must equal the file name "${expected}"`);
      }
    }
    if (reservedPaths.includes(slug)) {
      err("slug", `${quote(slug)} collides with an existing route /${slug}`);
    }
    if (slug.endsWith("-success")) {
      err("slug", `${quote(slug)} must not end with "-success" (reserved for the success page)`);
    }
  }

  // --- meta -------------------------------------------------------------
  if (!isObject(cfg.meta)) {
    err("meta", "required object with title and description");
  } else {
    if (!isNonEmptyString(cfg.meta.title)) err("meta.title", "required string");
    if (!isNonEmptyString(cfg.meta.description)) err("meta.description", "required string");
    if (cfg.meta.ogImage !== undefined && !isNonEmptyString(cfg.meta.ogImage)) {
      err("meta.ogImage", "must be a string path or URL");
    }
  }

  // --- sections ---------------------------------------------------------
  if (!Array.isArray(cfg.sections) || cfg.sections.length === 0) {
    err("sections", "required non-empty array");
  } else {
    cfg.sections.forEach((section, i) => {
      const path = `sections[${i}]`;
      if (!isObject(section)) {
        err(path, "must be an object with a type");
        return;
      }
      if (!isNonEmptyString(section.type)) {
        err(`${path}.type`, `required; one of ${list(knownBlockTypes)}`);
      } else if (!knownBlockTypes.includes(section.type)) {
        err(`${path}.type`, `unknown block ${quote(section.type)}`);
      } else if (section.type === "custom" && typeof section.component !== "function") {
        err(`${path}.component`, 'custom sections need component: () => import("./custom/X.jsx")');
      }
      if (section.id !== undefined && !isNonEmptyString(section.id)) {
        err(`${path}.id`, "must be a non-empty string");
      }
    });
  }

  // --- form -------------------------------------------------------------
  if (!isObject(cfg.form)) {
    err("form", "required object with fields and submit");
  } else {
    validateFields(cfg.form.fields, err);
    validateSubmit(cfg.form.submit, err);
    if (cfg.form.events !== undefined && !isObject(cfg.form.events)) {
      err("form.events", "must be an object");
    }
  }

  // --- success ----------------------------------------------------------
  if (!isObject(cfg.success)) {
    err("success", "required object with a heading");
  } else {
    if (!isNonEmptyString(cfg.success.heading)) err("success.heading", "required string");
    if (cfg.success.steps !== undefined && !Array.isArray(cfg.success.steps)) {
      err("success.steps", "must be an array");
    }
  }

  // --- expiry -----------------------------------------------------------
  if (cfg.expiresAt !== undefined) {
    if (!isIsoDate(cfg.expiresAt)) {
      err("expiresAt", `${quote(cfg.expiresAt)} is not a valid ISO date (e.g. "2026-11-30T23:59:00+05:30")`);
    }
    if (cfg.afterExpiry === undefined) {
      err("afterExpiry", "required when expiresAt is set");
    }
  }
  if (cfg.afterExpiry !== undefined) {
    const ae = cfg.afterExpiry;
    if (!isObject(ae)) {
      err("afterExpiry", "must be an object");
    } else if (!AFTER_EXPIRY_MODES.includes(ae.mode)) {
      err("afterExpiry.mode", `must be one of ${list(AFTER_EXPIRY_MODES)}`);
    } else if (ae.mode === "redirect" && !isNonEmptyString(ae.redirectTo)) {
      err("afterExpiry.redirectTo", 'required when mode is "redirect"');
    }
  }

  // --- variants ---------------------------------------------------------
  if (cfg.variants !== undefined) {
    if (!isObject(cfg.variants)) {
      err("variants", "must be an object keyed by variant name");
    } else {
      for (const [name, variant] of Object.entries(cfg.variants)) {
        const path = `variants.${name}`;
        if (!KEBAB_CASE.test(name)) {
          err(path, `variant name ${quote(name)} must be kebab-case`);
        }
        if (!isObject(variant)) {
          err(path, `must be an object overriding only ${list(VARIANT_KEYS)}`);
          continue;
        }
        for (const key of Object.keys(variant)) {
          if (!VARIANT_KEYS.includes(key)) {
            err(`${path}.${key}`, `variants may only override ${list(VARIANT_KEYS)}`);
          }
        }
        if (variant.hero !== undefined && !isObject(variant.hero)) {
          err(`${path}.hero`, "must be an object");
        }
        if (variant.sourceSuffix !== undefined && !isNonEmptyString(variant.sourceSuffix)) {
          err(`${path}.sourceSuffix`, "must be a non-empty string");
        }
      }
    }
  }

  return errors;
}

function validateFields(fields, err) {
  if (!Array.isArray(fields) || fields.length === 0) {
    err("form.fields", "required non-empty array");
    return;
  }
  fields.forEach((entry, i) => {
    const path = `form.fields[${i}]`;
    if (typeof entry === "string") {
      if (!FIELD_LIBRARY.includes(entry)) {
        err(path, `unknown field ${quote(entry)}; allowed: ${list(FIELD_LIBRARY)}`);
      }
      return;
    }
    if (!isObject(entry)) {
      err(path, "must be a field name or an override object { field, key?, label?, options?, required? }");
      return;
    }
    if (!FIELD_LIBRARY.includes(entry.field)) {
      err(`${path}.field`, `unknown field ${quote(entry.field)}; allowed: ${list(FIELD_LIBRARY)}`);
    }
    for (const key of Object.keys(entry)) {
      if (!FIELD_OVERRIDE_KEYS.includes(key)) {
        err(`${path}.${key}`, `unknown override key; allowed: ${list(FIELD_OVERRIDE_KEYS)}`);
      }
    }
    if (entry.key !== undefined && !isNonEmptyString(entry.key)) {
      err(`${path}.key`, "must be a non-empty string");
    }
    if (entry.label !== undefined && !isNonEmptyString(entry.label)) {
      err(`${path}.label`, "must be a non-empty string");
    }
    if (entry.options !== undefined) {
      if (!Array.isArray(entry.options) || entry.options.some((o) => typeof o !== "string")) {
        err(`${path}.options`, "must be an array of strings");
      } else if (entry.options.length === 0) {
        err(`${path}.options`, "must not be empty");
      }
    }
    if (entry.required !== undefined && typeof entry.required !== "boolean") {
      err(`${path}.required`, "must be true or false");
    }
  });
}

function validateSubmit(submit, err) {
  if (!isObject(submit)) {
    err("form.submit", `required object with kind (${list(SUBMIT_KINDS)}) and source`);
    return;
  }
  if (!SUBMIT_KINDS.includes(submit.kind)) {
    err("form.submit.kind", `must be one of ${list(SUBMIT_KINDS)}`);
  }
  if (!isNonEmptyString(submit.source)) {
    err("form.submit.source", "required string");
  }
  if (submit.kind === "leadServer" && !isNonEmptyString(submit.endpoint)) {
    err("form.submit.endpoint", 'required when kind is "leadServer"');
  }
  if (submit.kind === "razorpay") {
    if (typeof submit.amount !== "number" || !Number.isFinite(submit.amount) || submit.amount <= 0) {
      err("form.submit.amount", 'required positive number when kind is "razorpay"');
    }
    if (!isNonEmptyString(submit.register)) {
      err("form.submit.register", 'required when kind is "razorpay"');
    }
    if (!isNonEmptyString(submit.verify)) {
      err("form.submit.verify", 'required when kind is "razorpay"');
    }
  }
  if (submit.backend !== undefined && !isNonEmptyString(submit.backend)) {
    err("form.submit.backend", "must be an env var name string, e.g. \"VITE_BACKEND_URL\"");
  }
}
