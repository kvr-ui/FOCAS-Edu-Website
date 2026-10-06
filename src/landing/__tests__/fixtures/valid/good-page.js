// Fixture: valid zoho config with a `custom` lazy component (never called by the validator).
export default {
  slug: "good-page",
  meta: { title: "Good page", description: "A valid landing page", ogImage: "/lp/good-page/og.jpg" },
  theme: { accent: "#1D9E75" },
  nav: [{ label: "FAQ", target: "faq" }],
  sections: [
    { type: "hero", id: "home", headline: "Hello", sub: "World", cta: "Register" },
    { type: "custom", component: () => import("./custom/Hello.jsx") },
    { type: "faq", id: "faq", items: [{ q: "Q?", a: "A." }] },
  ],
  form: {
    fields: ["name", "phone", { field: "caStatus", key: "groupSelection", label: "Group", options: ["Group 1", "Group 2"] }],
    submit: { kind: "zoho", source: "good-page" },
    events: { ga: "good_form_submit" },
  },
  success: { heading: "Thanks!", steps: [] },
};
