// Fixture: the "test" landing page used by the renderer/router tests.
// Lives outside src/landing-pages/ so it never ships as a real /test page.
export default {
  slug: "test",
  meta: { title: "Test landing page", description: "Renderer test fixture" },
  theme: { accent: "#1D9E75" },
  nav: [{ label: "FAQ", target: "faq" }],
  ctaLabel: "Register Now",
  sections: [
    { type: "hero", id: "home", headline: "Default hero", sub: "For students", cta: "Join today" },
    { type: "highlights", id: "highlights", title: "Why join", items: [{ title: "Live classes", text: "Weekly" }] },
    { type: "faq", id: "faq", title: "Questions", items: [{ q: "Is it free?", a: "Yes." }] },
  ],
  form: {
    fields: ["name", "phone"],
    submit: { kind: "zoho", source: "test-page" },
    events: { ga: "test_form_submit", pixelName: "Test page" },
  },
  success: {
    heading: "You're registered!",
    message: "We'll call you within 24 hours.",
    whatsappGroup: "https://chat.whatsapp.com/example",
    steps: [{ title: "Mentor call", text: "A mentor will call you." }, "Join the group"],
  },
  variants: {
    parents: { hero: { headline: "Parents hero", sub: "For parents" } },
  },
};
