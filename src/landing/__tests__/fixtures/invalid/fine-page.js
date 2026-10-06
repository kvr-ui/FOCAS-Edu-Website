// Fixture: a valid config sitting next to an invalid one.
export default {
  slug: "fine-page",
  meta: { title: "Fine", description: "Fine page" },
  sections: [{ type: "hero" }],
  form: { fields: ["name", "phone"], submit: { kind: "leadServer", source: "fine", endpoint: "/api/lead" } },
  success: { heading: "Done" },
};
