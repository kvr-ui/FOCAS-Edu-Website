// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Shared, ordered log of every side effect, so tests can assert sequencing.
const log = [];
const UTMS = { utmSource: "meta", utmMedium: "cpc", utmCampaign: "c1", utmContent: "", utmTerm: "" };

vi.mock("@/components/bigin/formKit", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    captureUtms: vi.fn(() => {
      log.push("captureUtms");
      return { ...UTMS };
    }),
    trackLead: vi.fn((source) => log.push(`trackLead:${source}`)),
  };
});

import { LEAD_API_BASE, captureUtms, trackLead } from "@/components/bigin/formKit";
import {
  DISMISS_ERROR,
  RAZORPAY_SCRIPT_SRC,
  VERIFY_ERROR,
  buildSource,
  submitLead,
} from "./submitters";

const ZOHO_URL_PREFIX = "https://flow.zoho.in/";

const baseForm = (submit, events = { ga: "manual_form_submit", pixelName: "Manual ₹299" }) => ({
  fields: ["name", "phone"],
  submit,
  events,
});

const ZOHO = { kind: "zoho", source: "fs-lead" };
const LEAD_SERVER = {
  kind: "leadServer",
  source: "counselling",
  backend: "VITE_TEST_LEADS",
  endpoint: "/api/counseling",
};
const RAZORPAY = {
  kind: "razorpay",
  source: "manual-class",
  amount: 299,
  register: "/api/manual-class/register",
  verify: "/api/manual-class/payment-success",
  backend: "VITE_TEST_BACKEND",
};
const ENV = {
  VITE_TEST_LEADS: "https://leads.test",
  VITE_TEST_BACKEND: "https://api.test",
  VITE_RAZORPAY_KEY_ID: "rzp_test_key",
};

const PAYLOAD = {
  name: "Asha",
  phone: "+919876543210",
  groupSelection: "Group 1",
  address: { line1: "1 Main St", line2: "", city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
};
const TRACKED = { name: "Asha", phone: "+919876543210", caStatus: "Group 1", city: "Chennai", state: "Tamil Nadu" };

const jsonResponse = (data, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(data) });

// Default fetch: register → order, verify → success, everything else → ok.
let fetchImpl;
const defaultFetch = (url) => {
  if (String(url).includes("/register"))
    return jsonResponse({ registration: { _id: "reg_1" }, order: { id: "order_1", amount: 29900, currency: "INR" } });
  if (String(url).includes("/payment-success")) return jsonResponse({ success: true });
  return jsonResponse({ ok: true });
};

// Razorpay mock: `rzpBehavior(options)` decides what the checkout "does".
let rzpBehavior;
let rzpOptions;
class RazorpayMock {
  constructor(options) {
    rzpOptions = options;
    log.push("Razorpay:new");
  }
  open() {
    log.push("Razorpay:open");
    queueMicrotask(() => rzpBehavior(rzpOptions));
  }
}
const pay = (o) =>
  o.handler({ razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "sig_1" });

let navigate;

beforeEach(() => {
  log.length = 0;
  fetchImpl = defaultFetch;
  rzpBehavior = pay;
  rzpOptions = undefined;
  navigate = vi.fn((path) => log.push(`navigate:${path}`));
  globalThis.fetch = vi.fn((url, init) => {
    log.push(`fetch:${url}`);
    return fetchImpl(url, init);
  });
  window.fbq = vi.fn((cmd, name) => log.push(`fbq:${name}`));
  window.gtag = vi.fn((cmd, name) => log.push(`gtag:${name}`));
  window.Razorpay = RazorpayMock;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (key) {
    log.push(`sessionStorage:${key}`);
  });
  captureUtms.mockClear();
  trackLead.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete window.fbq;
  delete window.gtag;
  delete window.Razorpay;
  document.querySelectorAll(`script[src="${RAZORPAY_SCRIPT_SRC}"]`).forEach((s) => s.remove());
});

const run = (submit, extra = {}) =>
  submitLead({
    form: baseForm(submit),
    slug: "manual",
    variant: null,
    mode: "normal",
    payload: PAYLOAD,
    tracked: TRACKED,
    navigate,
    env: ENV,
    ...extra,
  });

const TRACKING_STEPS = (source) => [
  "captureUtms",
  `trackLead:${source}`,
  "fbq:Lead",
  "gtag:manual_form_submit",
  "sessionStorage:focas_lead_tracked",
];

describe("buildSource", () => {
  it("builds plain, variant, waitlist and combined sources", () => {
    expect(buildSource("manual-class", null, false)).toBe("manual-class");
    expect(buildSource("manual-class", "parents", false)).toBe("manual-class - parents");
    expect(buildSource("manual-class", null, true)).toBe("manual-class - WAITLIST");
    expect(buildSource("manual-class", "parents", true)).toBe("manual-class - parents - WAITLIST");
  });
});

describe("tracking runs first, for every kind", () => {
  it.each([
    ["zoho", ZOHO, "fs-lead"],
    ["leadServer", LEAD_SERVER, "counselling"],
    ["razorpay", RAZORPAY, "manual-class"],
  ])("%s: five tracking steps fire, in order, before the first backend call", async (_k, submit, source) => {
    const res = await run(submit);
    expect(res.status).toBe("success");
    expect(log.slice(0, 5)).toEqual(TRACKING_STEPS(source));
    expect(log[5]).toMatch(/^fetch:/);
    expect(trackLead).toHaveBeenCalledWith(source, TRACKED);
  });

  it("sends the Pixel Lead and GA event with the configured params", async () => {
    await run(RAZORPAY, { variant: "parents" });
    expect(window.fbq).toHaveBeenCalledWith("track", "Lead", {
      content_name: "Manual ₹299",
      value: 299,
      currency: "INR",
    });
    expect(window.gtag).toHaveBeenCalledWith("event", "manual_form_submit", { variant: "parents" });
  });

  it.each([
    ["zoho", ZOHO, "fs-lead"],
    ["leadServer", LEAD_SERVER, "counselling"],
    ["razorpay", RAZORPAY, "manual-class"],
  ])("%s waitlist: tracking fires with - WAITLIST and no backend request is made", async (_k, submit, source) => {
    const res = await run(submit, { mode: "waitlist" });
    expect(res).toEqual({ status: "waitlist" });
    expect(log).toEqual(TRACKING_STEPS(`${source} - WAITLIST`));
    expect(fetch).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([
    [null, "normal", "manual-class"],
    ["parents", "normal", "manual-class - parents"],
    [null, "waitlist", "manual-class - WAITLIST"],
    ["parents", "waitlist", "manual-class - parents - WAITLIST"],
  ])("variant=%s mode=%s → trackLead source %s", async (variant, mode, expected) => {
    await run(RAZORPAY, { variant, mode });
    expect(trackLead).toHaveBeenCalledWith(expected, TRACKED);
  });

  it("does not throw when fbq, gtag and sessionStorage are unavailable", async () => {
    delete window.fbq;
    delete window.gtag;
    Storage.prototype.setItem.mockImplementation(() => {
      throw new Error("blocked");
    });
    const res = await run(LEAD_SERVER);
    expect(res.status).toBe("success");
    expect(trackLead).toHaveBeenCalled();
  });

  it("honeypot submissions are neither tracked nor sent", async () => {
    const res = await run(LEAD_SERVER, { honeypot: "bot inc" });
    expect(res.status).toBe("success");
    expect(trackLead).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("zoho", () => {
  it("posts form-encoded, no-cors, keepalive to the Zoho Flow webhook, then navigates", async () => {
    await run(ZOHO, { variant: "parents" });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url.startsWith(ZOHO_URL_PREFIX)).toBe(true);
    expect(init).toMatchObject({ method: "POST", mode: "no-cors", keepalive: true });
    expect(init.body).toBeInstanceOf(URLSearchParams);
    const body = Object.fromEntries(init.body);
    expect(body).toMatchObject({
      name: "Asha",
      phone: "+919876543210",
      groupSelection: "Group 1",
      line1: "1 Main St",
      pincode: "600001",
      utmSource: "meta",
      utmCampaign: "c1",
      source: "fs-lead",
      leadSource: "fs-lead - parents",
    });
    expect(navigate).toHaveBeenCalledWith("/manual-success");
  });
});

describe("leadServer", () => {
  it("POSTs JSON to env[backend] + endpoint, then navigates", async () => {
    await run(LEAD_SERVER);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://leads.test/api/counseling");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ ...PAYLOAD, company: "", utm: UTMS });
    expect(navigate).toHaveBeenCalledWith("/manual-success");
  });

  it("falls back to LEAD_API_BASE when the backend env var is unset", async () => {
    await run(LEAD_SERVER, { env: {} });
    expect(fetch.mock.calls[0][0]).toBe(`${LEAD_API_BASE}/api/counseling`);
  });

  it("returns an inline error and does not navigate on failure", async () => {
    fetchImpl = () => jsonResponse({ ok: false, error: "Duplicate lead" }, false);
    const res = await run(LEAD_SERVER);
    expect(res).toEqual({ status: "error", error: "Duplicate lead" });
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("razorpay", () => {
  it("register → open → verify → Purchase → navigate", async () => {
    const res = await run(RAZORPAY);
    expect(res).toEqual({ status: "success" });
    expect(log.slice(5)).toEqual([
      "fetch:https://api.test/api/manual-class/register",
      "Razorpay:new",
      "Razorpay:open",
      "fetch:https://api.test/api/manual-class/payment-success",
      "fbq:Purchase",
      "navigate:/manual-success",
    ]);

    const registerInit = fetch.mock.calls[0][1];
    expect(JSON.parse(registerInit.body)).toEqual(PAYLOAD);

    expect(rzpOptions).toMatchObject({
      key: "rzp_test_key",
      amount: 29900,
      currency: "INR",
      order_id: "order_1",
      prefill: { name: "Asha", contact: "+919876543210" },
    });

    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      registrationId: "reg_1",
      razorpay_order_id: "order_1",
      razorpay_payment_id: "pay_1",
      razorpay_signature: "sig_1",
    });
    expect(window.fbq).toHaveBeenCalledWith("track", "Purchase", {
      content_name: "Manual ₹299",
      currency: "INR",
      value: 299,
    });
  });

  it("defaults the backend to VITE_BACKEND_URL", async () => {
    const { backend: _omit, ...submit } = RAZORPAY;
    await run(submit, { env: { ...ENV, VITE_BACKEND_URL: "https://default.test" } });
    expect(fetch.mock.calls[0][0]).toBe("https://default.test/api/manual-class/register");
  });

  it("loads checkout.js when window.Razorpay is absent", async () => {
    delete window.Razorpay;
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const p = run(RAZORPAY);
    await vi.waitFor(() => {
      expect(document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)).not.toBeNull();
    });
    expect(appendSpy).toHaveBeenCalled();
    window.Razorpay = RazorpayMock;
    document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`).dispatchEvent(new Event("load"));
    expect(await p).toEqual({ status: "success" });
    expect(navigate).toHaveBeenCalledWith("/manual-success");
  });

  it("returns an error when checkout.js fails to load", async () => {
    delete window.Razorpay;
    const p = run(RAZORPAY);
    await vi.waitFor(() => {
      expect(document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)).not.toBeNull();
    });
    document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`).dispatchEvent(new Event("error"));
    const res = await p;
    expect(res.status).toBe("error");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("dismiss → inline error, no verify, no Purchase, no navigation", async () => {
    rzpBehavior = (o) => o.modal.ondismiss();
    const res = await run(RAZORPAY);
    expect(res).toEqual({ status: "error", error: DISMISS_ERROR });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(log).not.toContain("fbq:Purchase");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("register failure → inline error, Razorpay never opens", async () => {
    fetchImpl = () => jsonResponse({ message: "Already registered" }, false);
    const res = await run(RAZORPAY);
    expect(res).toEqual({ status: "error", error: "Already registered" });
    expect(log).not.toContain("Razorpay:open");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("register network error → inline error", async () => {
    fetchImpl = () => Promise.reject(new Error("Failed to fetch"));
    const res = await run(RAZORPAY);
    expect(res).toEqual({ status: "error", error: "Failed to fetch" });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("verify failure → inline error, no Purchase, no navigation", async () => {
    fetchImpl = (url) =>
      String(url).includes("/payment-success") ? jsonResponse({ success: false }) : defaultFetch(url);
    const res = await run(RAZORPAY);
    expect(res).toEqual({ status: "error", error: VERIFY_ERROR });
    expect(log).not.toContain("fbq:Purchase");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("verify network error → inline error", async () => {
    fetchImpl = (url) =>
      String(url).includes("/payment-success") ? Promise.reject(new Error("offline")) : defaultFetch(url);
    const res = await run(RAZORPAY);
    expect(res).toEqual({ status: "error", error: VERIFY_ERROR });
    expect(navigate).not.toHaveBeenCalled();
  });
});
