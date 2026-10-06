// Fixture: valid razorpay config with expiry and a variant.
export default {
  slug: "paid-page",
  meta: { title: "Paid page", description: "A paid landing page" },
  sections: [{ type: "hero", headline: "Pay", sub: "Now" }],
  form: {
    fields: ["name", "phone", "address"],
    submit: { kind: "razorpay", source: "paid-page", amount: 299, register: "/api/paid/register", verify: "/api/paid/payment-success", backend: "VITE_BACKEND_URL" },
  },
  success: { heading: "Paid!" },
  expiresAt: "2026-11-30T23:59:00+05:30",
  afterExpiry: { mode: "redirect", redirectTo: "/focas" },
  variants: { parents: { hero: { headline: "For parents" }, sourceSuffix: "parents" } },
};
