---
task: 3
name: lead-form-submitters
parallel_group: 1
depends_on: []
issue: 4
---

# Task 3: Config-driven lead form & submitters

## What to build

**`src/landing/form/LeadForm.jsx`** — a full-screen modal form (same feel as RegisterPage in Manual.jsx and the forms in FsForm.jsx) rendering `form.fields` from a field library: name; phone (DIAL_CODES selector + 10-digit validation `/^\d{10}$/`, "Phone number must be exactly 10 digits."); email; caStatus (CA_STATUS_OPTIONS); attempt; language; city/state (dependent selects from `src/data/indiaStatesCities.js`); address (line1, line2, city, state, 6-digit pincode, for shipped products). Reuse `DIAL_CODES`, `CA_STATUS_OPTIONS`, `captureUtms`, `trackLead`, `LEAD_API_BASE`, `Honeypot` from `src/components/bigin/formKit.jsx`. Each `form.fields` entry is a field name or an override `{ field, key?, label?, options?, required? }` (e.g. Manual's CA group: `{ field: "caStatus", key: "groupSelection", label: "Group Selection", options: ["Group 1", "Group 2"] }`). The backend payload uses `key` (default = field name; address expands to line1, line2, city, state, pincode); `trackLead` always receives canonical field names (caStatus, city, …). Props: `form` (config), `slug`, `variant` (string|null), `mode` ("normal"|"waitlist"), `onClose`. Shows inline validation errors, a submitting state, and an inline error on failure.

**`src/landing/form/submitters.js`** — pure logic, testable without React. On submit, ALWAYS and BEFORE any backend call:
1. `captureUtms()`
2. `trackLead(source + (variant ? " - " + variant : "") + (waitlist ? " - WAITLIST" : ""), fields)`
3. `fbq('track','Lead',{content_name: events.pixelName, value, currency:'INR'})` (guarded for missing `window.fbq`)
4. `gtag('event', events.ga, {variant})` (guarded)
5. `sessionStorage.setItem('focas_lead_tracked','1')` (try/catch)

Then dispatch by `submit.kind`:
- `zoho` — form-encoded, `mode:"no-cors"`, `keepalive` POST to the Zoho Flow webhook exactly as `sendToZohoFlow` in FsForm.jsx does (UTMs merged, `leadSource` = source) → navigate `/<slug>-success`.
- `leadServer` — JSON POST to `(import.meta.env[submit.backend] || LEAD_API_BASE) + submit.endpoint` → navigate `/<slug>-success`.
- `razorpay` — POST `submit.register` (base `import.meta.env[submit.backend]`, default VITE_BACKEND_URL) → load `https://checkout.razorpay.com/v1/checkout.js` if `window.Razorpay` is absent → open Razorpay with `VITE_RAZORPAY_KEY_ID` and the order from the response → on success POST `submit.verify` (registrationId + razorpay_order_id/payment_id/signature) → Pixel `Purchase` → navigate `/<slug>-success`. Dismiss, register failure and verify failure show an inline error and re-enable the form.

In `waitlist` mode, skip the backend entirely (tracking steps still fire) and show an inline thank-you.

Does NOT render pages or routes — that is task 12. Does not modify any existing form.

## Acceptance criteria

- [ ] Vitest tests with mocked fetch/fbq/gtag/Razorpay verify the five tracking steps fire for every kind (zoho, leadServer, razorpay) and in waitlist mode, before the backend call.
- [ ] Tests verify source suffixes: plain, `- <variant>`, `- WAITLIST`, and both combined.
- [ ] Tests verify the razorpay sequence register → open → verify → Purchase → navigation, and the dismiss/failure paths.
- [ ] Waitlist mode makes no backend request.
- [ ] Field overrides: custom label/options render, backend payload uses `key`, trackLead receives the canonical name.
- [ ] Phone validation rejects non-10-digit input; fields not listed in `form.fields` are not rendered.
- [ ] No existing form or file outside `src/landing/form/` is modified.

## Commit convention

Your commit message MUST include `Closes #4` so the task's GitHub issue closes when the commit lands on the default branch.
