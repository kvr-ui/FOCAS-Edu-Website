// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  BLOCK_TYPES,
  FIELD_LIBRARY,
  RESERVED_PATHS,
  isIsoDate,
  slugFromFilename,
  validateConfig,
} from "../schema.js";

const validConfig = () => ({
  slug: "manual-v2",
  meta: { title: "Manual class", description: "Live manual class", ogImage: "/lp/manual-v2/og.jpg" },
  theme: { accent: "#1D9E75", accent2: "#FFA500" },
  nav: [{ label: "Benefits", target: "offer" }],
  sections: [
    { type: "hero", id: "home", headline: "H", sub: "S", image: "/lp/manual-v2/hero.jpg", cta: "Register" },
    { type: "faq", id: "faq", items: [{ q: "Q", a: "A" }] },
    { type: "custom", component: () => import("./fixtures/valid/custom/Hello.jsx") },
  ],
  form: {
    fields: [
      "name",
      "phone",
      "address",
      { field: "caStatus", key: "groupSelection", label: "Group", options: ["Group 1", "Group 2"], required: true },
    ],
    submit: {
      kind: "razorpay",
      source: "manual-class",
      amount: 299,
      register: "/api/manual-class/register",
      verify: "/api/manual-class/payment-success",
      backend: "VITE_BACKEND_URL",
    },
    events: { ga: "manual_form_submit", pixelName: "Manual ₹299" },
  },
  success: { heading: "You're in!", message: "See you", whatsappGroup: "https://chat.whatsapp.com/x", steps: [] },
  expiresAt: "2026-11-30T23:59:00+05:30",
  afterExpiry: { mode: "waitlist", message: "Closed" },
  variants: { parents: { hero: { headline: "Parents", sub: "S", image: "/x.jpg" }, sourceSuffix: "parents" } },
});

const opts = { reservedPaths: RESERVED_PATHS };
const errorsFor = (mutate, extra = {}) => {
  const cfg = validConfig();
  mutate(cfg);
  return validateConfig(cfg, { ...opts, ...extra });
};

describe("exports", () => {
  it("exports BLOCK_TYPES with every block", () => {
    expect(BLOCK_TYPES).toEqual([
      "hero", "ticker", "countdown", "highlights", "whatYouGet", "howItWorks", "agenda", "compare",
      "testimonials", "videoTestimonials", "gallery", "faq", "finalCta", "footer", "custom",
    ]);
  });

  it("exports the field library", () => {
    expect(FIELD_LIBRARY).toEqual(["name", "phone", "email", "caStatus", "attempt", "language", "city", "state", "address"]);
  });

  it("reserves every explicit App.jsx route and its -success form", () => {
    for (const r of ["focas", "links", "meet", "payment", "success", "counselling", "rti", "career-guidance",
      "audit", "workout-batch", "fs", "course", "privacy-policy"]) {
      expect(RESERVED_PATHS).toContain(r);
      expect(RESERVED_PATHS).toContain(`${r}-success`);
    }
  });

  it("helpers", () => {
    expect(slugFromFilename("src/landing-pages/foo-bar.js")).toBe("foo-bar");
    expect(slugFromFilename("foo")).toBe("foo");
    expect(isIsoDate("2026-11-30")).toBe(true);
    expect(isIsoDate("2026-11-30T23:59:00Z")).toBe(true);
    expect(isIsoDate("2026-13-45T99:00:00Z")).toBe(false);
    expect(isIsoDate("next tuesday")).toBe(false);
  });
});

describe("validateConfig: valid configs", () => {
  it("accepts a full valid config", () => {
    expect(validateConfig(validConfig(), { ...opts, filename: "manual-v2.js" })).toEqual([]);
  });

  it("accepts a minimal zoho config without optional keys", () => {
    const cfg = {
      slug: "mini",
      meta: { title: "T", description: "D" },
      sections: [{ type: "hero" }],
      form: { fields: ["name"], submit: { kind: "zoho", source: "mini" } },
      success: { heading: "Thanks" },
    };
    expect(validateConfig(cfg)).toEqual([]);
  });

  it("accepts leadServer with an endpoint and redirect expiry with redirectTo", () => {
    expect(
      errorsFor((c) => {
        c.form.submit = { kind: "leadServer", source: "x", endpoint: "/api/lead" };
        c.afterExpiry = { mode: "redirect", redirectTo: "/focas" };
      }),
    ).toEqual([]);
  });

  it("returns an error for a non-object config", () => {
    expect(validateConfig(undefined)).toEqual(["config: must be an object (the file's default export)"]);
  });
});

describe("validateConfig: slug", () => {
  it("is required", () => {
    expect(errorsFor((c) => delete c.slug)).toEqual(["slug: required string"]);
  });

  it("must be kebab-case", () => {
    for (const bad of ["Manual", "manual_v2", "-x", "x--y", "x-", "a b"]) {
      expect(errorsFor((c) => (c.slug = bad))).toEqual([
        `slug: "${bad}" must be kebab-case (lowercase letters, digits and single hyphens)`,
      ]);
    }
  });

  it("must equal the file name when given", () => {
    expect(errorsFor(() => {}, { filename: "other.js" })).toEqual([
      'slug: "manual-v2" must equal the file name "other"',
    ]);
    expect(errorsFor(() => {}, { filename: "/abs/src/landing-pages/manual-v2.js" })).toEqual([]);
  });

  it("no longer reserves manual (served by the engine)", () => {
    expect(RESERVED_PATHS).not.toContain("manual");
    expect(RESERVED_PATHS).not.toContain("manual-success");
  });

  it("must not collide with the reserved rti route", () => {
    expect(errorsFor((c) => (c.slug = "rti"))).toEqual(['slug: "rti" collides with an existing route /rti']);
  });

  it("is not checked against reserved paths unless they are passed", () => {
    const cfg = validConfig();
    cfg.slug = "rti";
    expect(validateConfig(cfg)).toEqual([]);
  });

  it("must not end with -success", () => {
    expect(errorsFor((c) => (c.slug = "webinar-success"))).toEqual([
      'slug: "webinar-success" must not end with "-success" (reserved for the success page)',
    ]);
    expect(errorsFor((c) => (c.slug = "rti-success"))).toEqual([
      'slug: "rti-success" collides with an existing route /rti-success',
      'slug: "rti-success" must not end with "-success" (reserved for the success page)',
    ]);
  });
});

describe("validateConfig: meta", () => {
  it("requires meta", () => {
    expect(errorsFor((c) => delete c.meta)).toEqual(["meta: required object with title and description"]);
  });

  it("requires title and description strings", () => {
    expect(errorsFor((c) => (c.meta = { title: "", description: 5 }))).toEqual([
      "meta.title: required string",
      "meta.description: required string",
    ]);
  });
});

describe("validateConfig: sections", () => {
  it("must be a non-empty array", () => {
    expect(errorsFor((c) => (c.sections = []))).toEqual(["sections: required non-empty array"]);
    expect(errorsFor((c) => delete c.sections)).toEqual(["sections: required non-empty array"]);
  });

  it("rejects unknown block types", () => {
    expect(errorsFor((c) => (c.sections[2] = { type: "foo" }))).toEqual(['sections[2].type: unknown block "foo"']);
  });

  it("requires a type", () => {
    expect(errorsFor((c) => (c.sections[0] = { id: "home" }))[0]).toMatch(/^sections\[0\]\.type: required; one of "hero"/);
  });

  it("honours knownBlockTypes", () => {
    expect(errorsFor(() => {}, { knownBlockTypes: ["hero", "custom"] })).toEqual(['sections[1].type: unknown block "faq"']);
  });

  it("requires custom sections to have a component function", () => {
    expect(errorsFor((c) => (c.sections[2] = { type: "custom", component: "./X.jsx" }))).toEqual([
      'sections[2].component: custom sections need component: () => import("./custom/X.jsx")',
    ]);
  });
});

describe("validateConfig: form fields", () => {
  it("must be a non-empty array", () => {
    expect(errorsFor((c) => (c.form.fields = []))).toEqual(["form.fields: required non-empty array"]);
  });

  it("rejects unknown field names", () => {
    expect(errorsFor((c) => c.form.fields.push("pincode"))[0]).toMatch(/^form\.fields\[4\]: unknown field "pincode"/);
  });

  it("accepts override objects for every library field", () => {
    expect(errorsFor((c) => (c.form.fields = FIELD_LIBRARY.map((field) => ({ field, label: field }))))).toEqual([]);
  });

  it("rejects an override with an unknown field", () => {
    expect(errorsFor((c) => (c.form.fields[3].field = "colour"))[0]).toMatch(/^form\.fields\[3\]\.field: unknown field "colour"/);
  });

  it("rejects an override with non-array options", () => {
    expect(errorsFor((c) => (c.form.fields[3].options = "Group 1, Group 2"))).toEqual([
      "form.fields[3].options: must be an array of strings",
    ]);
    expect(errorsFor((c) => (c.form.fields[3].options = ["ok", 2]))).toEqual([
      "form.fields[3].options: must be an array of strings",
    ]);
  });

  it("rejects bad override keys and value types", () => {
    expect(
      errorsFor((c) => (c.form.fields[3] = { field: "city", key: "", label: 3, required: "yes", placeholder: "x" })),
    ).toEqual([
      'form.fields[3].placeholder: unknown override key; allowed: "field", "key", "label", "options", "required"',
      "form.fields[3].key: must be a non-empty string",
      "form.fields[3].label: must be a non-empty string",
      "form.fields[3].required: must be true or false",
    ]);
  });

  it("rejects entries that are neither strings nor objects", () => {
    expect(errorsFor((c) => (c.form.fields[0] = 42))[0]).toMatch(/^form\.fields\[0\]: must be a field name or an override object/);
  });
});

describe("validateConfig: form submit", () => {
  it("requires form and submit", () => {
    expect(errorsFor((c) => delete c.form)).toEqual(["form: required object with fields and submit"]);
    expect(errorsFor((c) => delete c.form.submit)[0]).toMatch(/^form\.submit: required object/);
  });

  it("requires a known kind", () => {
    expect(errorsFor((c) => (c.form.submit = { kind: "stripe", source: "x" }))).toEqual([
      'form.submit.kind: must be one of "zoho", "leadServer", "razorpay"',
    ]);
  });

  it("requires source for every kind", () => {
    for (const kind of ["zoho", "leadServer", "razorpay"]) {
      const errors = errorsFor((c) => {
        c.form.submit.kind = kind;
        c.form.submit.endpoint = "/api/lead";
        delete c.form.submit.source;
      });
      expect(errors).toEqual(["form.submit.source: required string"]);
    }
  });

  it("leadServer requires endpoint", () => {
    expect(errorsFor((c) => (c.form.submit = { kind: "leadServer", source: "x" }))).toEqual([
      'form.submit.endpoint: required when kind is "leadServer"',
    ]);
  });

  it("razorpay requires amount, register and verify", () => {
    expect(errorsFor((c) => (c.form.submit = { kind: "razorpay", source: "x" }))).toEqual([
      'form.submit.amount: required positive number when kind is "razorpay"',
      'form.submit.register: required when kind is "razorpay"',
      'form.submit.verify: required when kind is "razorpay"',
    ]);
    expect(errorsFor((c) => (c.form.submit.amount = "299"))).toEqual([
      'form.submit.amount: required positive number when kind is "razorpay"',
    ]);
  });
});

describe("validateConfig: success", () => {
  it("requires success.heading", () => {
    expect(errorsFor((c) => delete c.success)).toEqual(["success: required object with a heading"]);
    expect(errorsFor((c) => delete c.success.heading)).toEqual(["success.heading: required string"]);
  });
});

describe("validateConfig: expiry", () => {
  it("expiresAt must be a valid ISO date", () => {
    expect(errorsFor((c) => (c.expiresAt = "30/11/2026"))).toEqual([
      'expiresAt: "30/11/2026" is not a valid ISO date (e.g. "2026-11-30T23:59:00+05:30")',
    ]);
  });

  it("expiresAt requires afterExpiry", () => {
    expect(errorsFor((c) => delete c.afterExpiry)).toEqual(["afterExpiry: required when expiresAt is set"]);
  });

  it("afterExpiry.mode must be waitlist or redirect", () => {
    expect(errorsFor((c) => (c.afterExpiry.mode = "hide"))).toEqual([
      'afterExpiry.mode: must be one of "waitlist", "redirect"',
    ]);
  });

  it("redirect mode requires redirectTo", () => {
    expect(errorsFor((c) => (c.afterExpiry = { mode: "redirect" }))).toEqual([
      'afterExpiry.redirectTo: required when mode is "redirect"',
    ]);
  });

  it("expiresAt is optional", () => {
    expect(
      errorsFor((c) => {
        delete c.expiresAt;
        delete c.afterExpiry;
      }),
    ).toEqual([]);
  });
});

describe("validateConfig: variants", () => {
  it("variant names must be kebab-case", () => {
    expect(errorsFor((c) => (c.variants.Parents_A = { sourceSuffix: "a" }))).toEqual([
      'variants.Parents_A: variant name "Parents_A" must be kebab-case',
    ]);
  });

  it("variants may only override hero and sourceSuffix", () => {
    expect(errorsFor((c) => (c.variants.parents.form = { fields: [] }))).toEqual([
      'variants.parents.form: variants may only override "hero", "sourceSuffix"',
    ]);
  });

  it("variant values must have the right types", () => {
    expect(errorsFor((c) => (c.variants.students = { hero: "x", sourceSuffix: "" }))).toEqual([
      "variants.students.hero: must be an object",
      "variants.students.sourceSuffix: must be a non-empty string",
    ]);
  });
});
