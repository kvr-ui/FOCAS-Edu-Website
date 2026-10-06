// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/components/bigin/formKit", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, captureUtms: vi.fn(() => ({ utmSource: "meta" })), trackLead: vi.fn() };
});

import { trackLead } from "@/components/bigin/formKit";
import LeadForm from "./LeadForm";
import { PHONE_ERROR, normalizeFields, validateValues, buildSubmission, initialValues } from "./fields";

const MANUAL_FORM = {
  fields: [
    "name",
    "phone",
    "address",
    { field: "caStatus", key: "groupSelection", label: "Group Selection", options: ["Group 1", "Group 2"] },
  ],
  submit: {
    kind: "razorpay",
    source: "manual-class",
    amount: 299,
    register: "/api/manual-class/register",
    verify: "/api/manual-class/payment-success",
  },
  events: { ga: "manual_form_submit", pixelName: "Manual ₹299" },
};

const LEAD_SERVER_FORM = {
  ...MANUAL_FORM,
  submit: { kind: "leadServer", source: "manual-class", endpoint: "/api/leads" },
};

const renderForm = (props = {}) =>
  render(
    <MemoryRouter initialEntries={["/manual"]}>
      <Routes>
        <Route
          path="/manual"
          element={<LeadForm form={MANUAL_FORM} slug="manual" variant={null} mode="normal" onClose={() => {}} {...props} />}
        />
        <Route path="/manual-success" element={<div>SUCCESS PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

const type = (el, value) => fireEvent.change(el, { target: { value } });

const fillManual = ({ phone = "9876543210" } = {}) => {
  type(screen.getByLabelText("Full Name"), "Asha Kumar");
  type(screen.getByLabelText("Phone Number"), phone);
  type(screen.getByLabelText("Group Selection"), "Group 2");
  type(screen.getByLabelText("Address Line 1 (House no., Street)"), "1 Main St");
  type(screen.getByLabelText("City"), "Chennai");
  type(screen.getByLabelText("State"), "Tamil Nadu");
  type(screen.getByLabelText("Pincode"), "600001");
};

const submitBtn = () => screen.getByRole("button", { name: /Pay ₹299|Submit|Join the waitlist|Processing/ });

beforeEach(() => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
  );
  trackLead.mockClear();
});

afterEach(() => {
  cleanup();
  delete window.Razorpay;
});

describe("LeadForm rendering", () => {
  it("renders only the fields listed in form.fields", () => {
    renderForm();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByLabelText("Pincode")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).toBeNull();
    expect(screen.queryByLabelText("Preferred Language")).toBeNull();
    expect(screen.queryByLabelText("Attempt")).toBeNull();
    expect(screen.queryByLabelText("CA Status")).toBeNull();
  });

  it("renders override label and options instead of the library defaults", () => {
    renderForm();
    const select = screen.getByLabelText("Group Selection");
    const opts = within(select).getAllByRole("option").map((o) => o.textContent);
    expect(opts).toEqual(["-Select-", "Group 1", "Group 2"]);
    expect(opts).not.toContain("Foundation");
  });

  it("renders the DIAL_CODES selector for phone", () => {
    renderForm();
    const dial = screen.getByLabelText("Country code");
    expect(dial).toHaveValue("+91");
    expect(within(dial).getAllByRole("option").length).toBeGreaterThan(1);
  });

  it("state/city are dependent selects", () => {
    renderForm({ form: { ...LEAD_SERVER_FORM, fields: ["state", "city"] } });
    const city = screen.getByLabelText("City");
    expect(city).toBeDisabled();
    type(screen.getByLabelText("State"), "Tamil Nadu");
    expect(city).toBeEnabled();
    expect(within(city).getAllByRole("option").map((o) => o.textContent)).toContain("Chennai");
  });

  it("Back button calls onClose", () => {
    const onClose = vi.fn();
    renderForm({ onClose });
    fireEvent.click(screen.getByRole("button", { name: /Back/ }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("LeadForm validation", () => {
  it("rejects a non-10-digit phone and sends nothing", async () => {
    renderForm();
    fillManual({ phone: "98765" });
    fireEvent.click(submitBtn());
    expect(await screen.findByText(PHONE_ERROR)).toBeInTheDocument();
    expect(trackLead).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("strips non-digits from the phone input", () => {
    renderForm();
    const phone = screen.getByLabelText("Phone Number");
    type(phone, "98a76-54");
    expect(phone).toHaveValue("987654");
  });

  it("shows inline errors for missing required fields", async () => {
    renderForm();
    fireEvent.click(submitBtn());
    expect(await screen.findAllByText("This field is required.")).not.toHaveLength(0);
    expect(screen.getByText("Please select an option.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("LeadForm submit", () => {
  it("backend payload uses the override key; trackLead gets canonical names", async () => {
    renderForm({ form: LEAD_SERVER_FORM });
    fillManual();
    fireEvent.click(submitBtn());
    expect(await screen.findByText("SUCCESS PAGE")).toBeInTheDocument();

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/leads$/);
    expect(body).toMatchObject({
      name: "Asha Kumar",
      phone: "+919876543210",
      groupSelection: "Group 2",
      address: { line1: "1 Main St", line2: "", city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
    });
    expect(body.caStatus).toBeUndefined();

    expect(trackLead).toHaveBeenCalledWith("manual-class", {
      name: "Asha Kumar",
      phone: "+919876543210",
      caStatus: "Group 2",
      city: "Chennai",
      state: "Tamil Nadu",
    });
  });

  it("passes the variant suffix through to trackLead", async () => {
    renderForm({ form: LEAD_SERVER_FORM, variant: "parents" });
    fillManual();
    fireEvent.click(submitBtn());
    await screen.findByText("SUCCESS PAGE");
    expect(trackLead.mock.calls[0][0]).toBe("manual-class - parents");
  });

  it("waitlist mode: shows an inline thank-you and makes no backend request", async () => {
    renderForm({ mode: "waitlist" });
    fillManual();
    fireEvent.click(screen.getByRole("button", { name: "Join the waitlist" }));
    expect(await screen.findByText(/You're on the waitlist/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(trackLead.mock.calls[0][0]).toBe("manual-class - WAITLIST");
  });

  it("shows a submitting state, then an inline error and re-enables on failure", async () => {
    let resolveFetch;
    globalThis.fetch = vi.fn(
      () => new Promise((r) => (resolveFetch = r))
    );
    renderForm();
    fillManual();
    fireEvent.click(submitBtn());
    expect(await screen.findByRole("button", { name: "Processing..." })).toBeDisabled();
    resolveFetch({ ok: false, json: () => Promise.resolve({ message: "Registration failed. Try later." }) });
    expect(await screen.findByText("Registration failed. Try later.")).toBeInTheDocument();
    expect(submitBtn()).toBeEnabled();
  });

  it("razorpay dismiss shows an inline error and re-enables the form", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ registration: { _id: "r1" }, order: { id: "o1", amount: 29900, currency: "INR" } }),
      })
    );
    window.Razorpay = class {
      constructor(o) {
        this.o = o;
      }
      open() {
        queueMicrotask(() => this.o.modal.ondismiss());
      }
    };
    renderForm();
    fillManual();
    fireEvent.click(submitBtn());
    expect(await screen.findByText(/Payment was cancelled/)).toBeInTheDocument();
    await waitFor(() => expect(submitBtn()).toBeEnabled());
  });
});

describe("fields library", () => {
  it("normalises overrides, defaulting key to the field name", () => {
    const specs = normalizeFields(MANUAL_FORM.fields);
    expect(specs.map((f) => [f.name, f.key])).toEqual([
      ["name", "name"],
      ["phone", "phone"],
      ["address", "address"],
      ["caStatus", "groupSelection"],
    ]);
  });

  it("phone validation accepts exactly 10 digits only", () => {
    const specs = normalizeFields(["phone"]);
    for (const bad of ["123", "12345678901", "12345abcde", "98765 43210"]) {
      expect(validateValues(specs, { phone: bad }).phone).toBe(PHONE_ERROR);
    }
    expect(validateValues(specs, { phone: "9876543210" })).toEqual({});
  });

  it("required:false makes a field optional; pincode must be 6 digits", () => {
    const specs = normalizeFields([{ field: "email", required: false }, "address"]);
    const v = initialValues(specs);
    v.address = { line1: "x", line2: "", city: "c", state: "s", pincode: "123" };
    expect(validateValues(specs, v)).toEqual({ "address.pincode": "Pincode must be exactly 6 digits." });
  });

  it("buildSubmission keys payload by `key` and tracked by canonical name", () => {
    const specs = normalizeFields([{ field: "language", key: "Language" }, "phone"]);
    const { payload, tracked } = buildSubmission(specs, { language: "Tamil", phone: "9876543210", dialCode: "+1" });
    expect(payload).toEqual({ Language: "Tamil", phone: "+19876543210" });
    expect(tracked).toEqual({ language: "Tamil", phone: "+19876543210" });
  });
});
