// Fixture: invalid config (wrong slug, unknown block, unknown field, missing success).
export default {
  slug: "rti",
  meta: { title: "Broken" },
  sections: [{ type: "hero" }, { type: "foo" }],
  form: { fields: ["name", "favouriteColour"], submit: { kind: "zoho", source: "x" } },
};
