// Field library for the config-driven landing-page lead form.
//
// Pure logic (no React): normalising `form.fields` entries, initial values,
// validation, and turning the entered values into
//   - the backend payload (keyed by each field's `key`), and
//   - the canonical tracking fields handed to trackLead (caStatus, city, …).
//
// A `form.fields` entry is either a field name ("phone") or an override
// object: { field, key?, label?, options?, required? }.

import { CA_STATUS_OPTIONS } from "@/components/bigin/formKit";

export const LANGUAGE_OPTIONS = ["English", "Tamil", "Hindi"];

export const PHONE_ERROR = "Phone number must be exactly 10 digits.";
export const PINCODE_ERROR = "Pincode must be exactly 6 digits.";
export const REQUIRED_ERROR = "This field is required.";
export const SELECT_ERROR = "Please select an option.";
export const EMAIL_ERROR = "Enter a valid email address.";

// type: how the field renders/validates. `options` turns a text field into a
// select. `state`/`city` are dependent selects (city follows the chosen state).
export const FIELD_LIBRARY = {
  name: { type: "text", label: "Full Name", placeholder: "Your full name" },
  phone: { type: "phone", label: "Phone Number", placeholder: "10 digit phone number" },
  email: { type: "email", label: "Email", placeholder: "you@example.com" },
  caStatus: { type: "select", label: "CA Status", options: CA_STATUS_OPTIONS },
  attempt: { type: "text", label: "Attempt", placeholder: "e.g. May 2027" },
  language: { type: "select", label: "Preferred Language", options: LANGUAGE_OPTIONS },
  state: { type: "state", label: "State" },
  city: { type: "city", label: "City" },
  address: { type: "address", label: "Shipping Address" },
};

// Sub-inputs of the address field, in the order they render and are sent.
export const ADDRESS_PARTS = [
  { part: "line1", placeholder: "Address Line 1 (House no., Street)", required: true },
  { part: "line2", placeholder: "Address Line 2 (optional)", required: false },
  { part: "city", placeholder: "City", required: true },
  { part: "state", placeholder: "State", required: true },
  { part: "pincode", placeholder: "Pincode", required: true },
];

// Canonical names trackLead understands (see TRACKED_FIELDS in formKit).
const TRACKED = ["name", "phone", "email", "caStatus", "attempt", "language", "city", "state"];

/** Normalise `form.fields` into full field specs; unknown names are dropped. */
export function normalizeFields(entries = []) {
  const seen = new Set();
  const out = [];
  for (const entry of entries) {
    const override = typeof entry === "string" ? { field: entry } : entry || {};
    const name = override.field;
    const base = FIELD_LIBRARY[name];
    if (!base || seen.has(name)) {
      if (!base && typeof console !== "undefined") {
        console.warn(`[LeadForm] Unknown form field "${name}" ignored.`);
      }
      continue;
    }
    seen.add(name);
    const options = override.options || base.options;
    let type = base.type;
    if (type === "text" && override.options) type = "select";
    out.push({
      ...base,
      name,
      type,
      key: override.key || name,
      label: override.label || base.label,
      options,
      required: override.required !== undefined ? !!override.required : true,
    });
  }
  return out;
}

/** Initial form state for the given normalised specs. */
export function initialValues(specs) {
  const v = { company: "" }; // honeypot — must stay empty for real users
  for (const f of specs) {
    if (f.type === "phone") {
      v.dialCode = "+91";
      v.phone = "";
    } else if (f.type === "address") {
      v.address = { line1: "", line2: "", city: "", state: "", pincode: "" };
    } else {
      v[f.name] = "";
    }
  }
  return v;
}

const str = (x) => (x == null ? "" : String(x)).trim();

/**
 * Validate values against specs. Returns an errors object keyed by field name
 * (address parts as "address.<part>"); empty object = valid.
 */
export function validateValues(specs, values) {
  const e = {};
  for (const f of specs) {
    if (f.type === "address") {
      const a = values.address || {};
      for (const { part, required } of ADDRESS_PARTS) {
        const val = str(a[part]);
        if (required && f.required && !val) e[`address.${part}`] = REQUIRED_ERROR;
      }
      const pin = str(a.pincode);
      if (pin && !/^\d{6}$/.test(pin)) e["address.pincode"] = PINCODE_ERROR;
      continue;
    }

    const val = str(values[f.name]);
    if (!val) {
      if (f.required) {
        const isSelect = f.type === "select" || f.type === "state" || f.type === "city";
        e[f.name] = isSelect ? SELECT_ERROR : REQUIRED_ERROR;
      }
      continue;
    }
    if (f.type === "phone" && !/^\d{10}$/.test(val)) e.phone = PHONE_ERROR;
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) e.email = EMAIL_ERROR;
    if (f.name === "name" && /\d/.test(val)) e.name = "Only letters are allowed.";
  }
  return e;
}

/**
 * Build { payload, tracked } from values.
 *  - payload: backend body, keyed by each field's `key`. The address expands
 *    to { line1, line2, city, state, pincode } nested under its key (default
 *    "address") — the shape /api/manual-class/register expects.
 *  - tracked: canonical names for trackLead (address city/state map to
 *    city/state unless standalone city/state fields are present).
 */
export function buildSubmission(specs, values) {
  const payload = {};
  const tracked = {};
  for (const f of specs) {
    if (f.type === "address") {
      const a = values.address || {};
      const addr = {};
      for (const { part } of ADDRESS_PARTS) addr[part] = str(a[part]);
      payload[f.key] = addr;
      if (!tracked.city && addr.city) tracked.city = addr.city;
      if (!tracked.state && addr.state) tracked.state = addr.state;
      continue;
    }
    let val = str(values[f.name]);
    if (f.type === "phone") val = val ? `${values.dialCode || "+91"}${val}` : "";
    payload[f.key] = val;
    if (TRACKED.includes(f.name)) tracked[f.name] = val;
  }
  return { payload, tracked };
}
