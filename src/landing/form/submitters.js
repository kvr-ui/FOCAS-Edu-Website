// Submit logic for the config-driven landing-page lead form.
//
// Pure (no React): LeadForm builds the payload and hands it here together with
// an injected `navigate`. Every real submission first runs the five tracking
// steps — unconditionally, before any backend call — so no landing page can
// "forget to track" again — then dispatches on `form.submit.kind`.

import { LEAD_API_BASE, captureUtms, trackLead } from "@/components/bigin/formKit";
import { sendToZohoFlow } from "@/components/fs/FsForm";

export const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const VERIFY_ERROR = "Payment verification failed. Please contact support.";
export const DISMISS_ERROR = "Payment was cancelled. You can try again whenever you're ready.";
export const GENERIC_ERROR = "Something went wrong. Please try again.";

/** "manual-class" → "manual-class - parents - WAITLIST" (suffixes optional). */
export function buildSource(source, variant, waitlist) {
  return (source || "") + (variant ? " - " + variant : "") + (waitlist ? " - WAITLIST" : "");
}

/**
 * The five tracking steps. Always run, in this order, before any backend call.
 * Returns the captured UTMs.
 */
export function runTracking({ form, variant, waitlist, tracked }) {
  const submit = form.submit || {};
  const events = form.events || {};

  // 1. UTMs (persists first-touch values).
  const utms = captureUtms();

  // 2. Follow-up dashboard lead.
  trackLead(buildSource(submit.source, variant, waitlist), tracked);

  // 3. Meta Pixel Lead.
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead", {
      content_name: events.pixelName,
      value: submit.amount ?? 0,
      currency: "INR",
    });
  }

  // 4. GA4 event.
  if (typeof window !== "undefined" && typeof window.gtag === "function" && events.ga) {
    window.gtag("event", events.ga, { variant });
  }

  // 5. Tell the success page this Lead is already counted.
  try {
    sessionStorage.setItem("focas_lead_tracked", "1");
  } catch {
    /* sessionStorage unavailable (private mode) — non-fatal */
  }

  return utms;
}

/** Load Razorpay checkout.js unless window.Razorpay already exists. */
export function loadRazorpay() {
  if (typeof window.Razorpay === "function") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const fail = () => reject(new Error("Could not load the payment gateway. Please try again."));
    let script = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", () =>
      typeof window.Razorpay === "function" ? resolve() : fail()
    );
    script.addEventListener("error", fail);
  });
}

const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
};

const successPath = (slug) => `/${slug}-success`;

async function submitZoho({ submit, source, payload, utms, slug, navigate }) {
  // Exactly the FS webhook call: form-encoded, no-cors, keepalive, UTMs merged.
  sendToZohoFlow({ ...flatten(payload), utm: utms }, { source: submit.source, leadSource: source });
  navigate(successPath(slug));
  return { status: "success" };
}

async function submitLeadServer({ submit, payload, utms, honeypot, slug, navigate, env }) {
  const base = (submit.backend && env[submit.backend]) || LEAD_API_BASE;
  const { res, data } = await postJson(`${base}${submit.endpoint || ""}`, {
    ...payload,
    company: honeypot,
    utm: utms,
  });
  if (!res.ok || data.ok === false) {
    return { status: "error", error: data.error || data.message || "Submission failed. Please try again." };
  }
  navigate(successPath(slug));
  return { status: "success" };
}

async function submitRazorpay({ form, submit, payload, tracked, slug, navigate, env }) {
  const events = form.events || {};
  const base = env[submit.backend || "VITE_BACKEND_URL"] || "";

  const { res, data } = await postJson(`${base}${submit.register}`, payload);
  if (!res.ok || !data.order) {
    return { status: "error", error: data.message || data.error || "Registration failed. Please try again." };
  }
  const { registration, order } = data;
  const registrationId = registration?._id ?? registration?.id ?? data.registrationId;

  await loadRazorpay();

  return new Promise((resolve) => {
    const options = {
      key: env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "FOCAS Edu",
      description: submit.description || events.pixelName || "",
      order_id: order.id,
      prefill: { name: tracked.name, contact: tracked.phone, email: tracked.email },
      theme: { color: submit.themeColor || "#1D9E75" },
      handler: async (response) => {
        try {
          const { data: verifyData } = await postJson(`${base}${submit.verify}`, {
            registrationId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (!verifyData.success) return resolve({ status: "error", error: VERIFY_ERROR });
          if (typeof window.fbq === "function") {
            window.fbq("track", "Purchase", {
              content_name: events.pixelName,
              currency: "INR",
              value: submit.amount ?? order.amount / 100,
            });
          }
          navigate(successPath(slug));
          resolve({ status: "success" });
        } catch {
          resolve({ status: "error", error: VERIFY_ERROR });
        }
      },
      modal: { ondismiss: () => resolve({ status: "error", error: DISMISS_ERROR }) },
    };
    new window.Razorpay(options).open();
  });
}

// Zoho's form-encoded body can't hold nested objects — spread them (address).
function flatten(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v && typeof v === "object") Object.assign(out, v);
    else out[k] = v;
  }
  return out;
}

const KINDS = { zoho: submitZoho, leadServer: submitLeadServer, razorpay: submitRazorpay };

/**
 * Submit a lead.
 *
 * @param {object} args
 * @param {object} args.form       the page's `form` config
 * @param {string} args.slug       landing page slug (success = /<slug>-success)
 * @param {string|null} args.variant
 * @param {"normal"|"waitlist"} args.mode
 * @param {object} args.payload    backend body (keyed by field `key`)
 * @param {object} args.tracked    canonical fields for trackLead
 * @param {string} [args.honeypot] honeypot value; non-empty = bot
 * @param {function} args.navigate injected router navigate
 * @param {object} [args.env]      env vars (defaults to import.meta.env)
 * @returns {Promise<{status: "success"|"waitlist"|"error", error?: string}>}
 */
export async function submitLead({
  form,
  slug,
  variant = null,
  mode = "normal",
  payload,
  tracked,
  honeypot = "",
  navigate,
  env = import.meta.env,
}) {
  const waitlist = mode === "waitlist";

  // Bots that filled the honeypot get the normal-looking outcome but nothing
  // is tracked or sent (same as FsForm skipping its webhook + trackLead).
  if (honeypot) {
    if (waitlist) return { status: "waitlist" };
    navigate(successPath(slug));
    return { status: "success" };
  }

  const utms = runTracking({ form, variant, waitlist, tracked });
  if (waitlist) return { status: "waitlist" };

  const submit = form.submit || {};
  const handler = KINDS[submit.kind];
  if (!handler) return { status: "error", error: `Unknown submit kind "${submit.kind}".` };

  try {
    return await handler({
      form,
      submit,
      source: buildSource(submit.source, variant, false),
      payload,
      tracked,
      utms,
      honeypot,
      slug,
      navigate,
      env: env || {},
    });
  } catch (err) {
    return { status: "error", error: err?.message || GENERIC_ERROR };
  }
}
