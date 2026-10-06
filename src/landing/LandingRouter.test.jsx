// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

vi.mock("@/components/bigin/formKit", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, captureUtms: vi.fn(() => ({})), trackLead: vi.fn() };
});
vi.mock("@/components/fs/FsForm", () => ({ sendToZohoFlow: vi.fn() }));

import { trackLead } from "@/components/bigin/formKit";
import { sendToZohoFlow } from "@/components/fs/FsForm";
import LandingRouter, { parseLandingPath } from "./LandingRouter";
import LandingPage from "./LandingPage";
import { createRegistry } from "./registry";
import { variantStorageKey } from "./useVariant";
import testConfig from "./__tests__/fixtures/pages/test.js";

// The "test" page comes from a fixture registry (same createRegistry the app
// uses over src/landing-pages/), so no real /test page ships to production.
const registry = createRegistry(import.meta.glob("./__tests__/fixtures/pages/*.js"));

const PAST = "2020-01-01T00:00:00+05:30";
const EXTRA = {
  "test-waitlist": {
    ...testConfig,
    slug: "test-waitlist",
    expiresAt: PAST,
    afterExpiry: { mode: "waitlist", message: "Registrations for the May batch are closed." },
  },
  "test-redirect": {
    ...testConfig,
    slug: "test-redirect",
    expiresAt: PAST,
    afterExpiry: { mode: "redirect", redirectTo: "/focas" },
  },
  "test-future": {
    ...testConfig,
    slug: "test-future",
    expiresAt: "2999-01-01T00:00:00+05:30",
    afterExpiry: { mode: "redirect", redirectTo: "/focas" },
  },
  "test-broken": { slug: "test-broken", sections: [] },
};
const loadConfig = async (slug) => EXTRA[slug] ?? registry.loadConfig(slug);

function Where() {
  const { pathname, search } = useLocation();
  return <output data-testid="where">{pathname + search}</output>;
}

const renderAt = (url, { dev = false } = {}) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Where />
      <Routes>
        <Route path="/" element={<div>HOME PAGE</div>} />
        <Route path="/focas" element={<div>FOCAS PAGE</div>} />
        <Route path="/rti" element={<div>RTI PAGE</div>} />
        <Route path="/fs/book" element={<div>FS BOOK PAGE</div>} />
        <Route path="*" element={<LandingRouter loadConfig={loadConfig} dev={dev} />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (el, value) => fireEvent.change(el, { target: { value } });
const submitLeadForm = () => {
  const dialog = within(screen.getByRole("dialog"));
  type(dialog.getByLabelText("Full Name"), "Asha Kumar");
  type(dialog.getByLabelText("Phone Number"), "9876543210");
  fireEvent.click(dialog.getByRole("button", { name: /^(Submit|Join the waitlist)$/ }));
};

beforeEach(() => {
  sessionStorage.clear();
  window.dataLayer = [];
  window.fbq = vi.fn();
  trackLead.mockClear();
  sendToZohoFlow.mockClear();
});

afterEach(() => {
  cleanup();
  delete window.fbq;
  delete window.dataLayer;
  vi.restoreAllMocks();
});

describe("parseLandingPath", () => {
  it("accepts a single segment, with or without a trailing slash", () => {
    expect(parseLandingPath("/test")).toEqual({ slug: "test", success: false });
    expect(parseLandingPath("/test/")).toEqual({ slug: "test", success: false });
    expect(parseLandingPath("/test-success")).toEqual({ slug: "test", success: true });
  });

  it("rejects multi-segment, empty and bare-suffix paths", () => {
    expect(parseLandingPath("/")).toBeNull();
    expect(parseLandingPath("/test/extra")).toBeNull();
    expect(parseLandingPath("/a/b/c")).toBeNull();
    expect(parseLandingPath("//test")).toBeNull();
    expect(parseLandingPath("/-success")).toBeNull();
  });
});

describe("LandingRouter", () => {
  it("renders /test from its config", async () => {
    renderAt("/test");
    expect(await screen.findByRole("heading", { level: 1, name: "Default hero" })).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(document.title).toBe("Test landing page");
  });

  it("renders /test-success from config.success", async () => {
    renderAt("/test-success");
    expect(await screen.findByRole("heading", { name: "You're registered!" })).toBeInTheDocument();
    expect(screen.getByText("We'll call you within 24 hours.")).toBeInTheDocument();
    expect(screen.getByText("Mentor call")).toBeInTheDocument();
    expect(screen.getByText("Join the group")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WhatsApp group/ })).toHaveAttribute(
      "href",
      "https://chat.whatsapp.com/example",
    );
  });

  it.each(["/unknown", "/unknown-success", "/test/extra", "/foo/bar/baz", "/rti/unknown"])(
    "renders NotFound for %s",
    async (url) => {
      renderAt(url);
      expect(await screen.findByText("HOME PAGE")).toBeInTheDocument();
    },
  );

  it("leaves explicit routes alone", () => {
    renderAt("/rti");
    expect(screen.getByText("RTI PAGE")).toBeInTheDocument();
    cleanup();
    renderAt("/fs/book");
    expect(screen.getByText("FS BOOK PAGE")).toBeInTheDocument();
  });

  it("shows validator errors on screen in dev", async () => {
    renderAt("/test-broken", { dev: true });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent('Landing page "test-broken" has an invalid config');
    expect(alert).toHaveTextContent("meta: required object");
  });

  it("renders NotFound for an unloadable config in production", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = () => Promise.reject(new Error("chunk failed"));
    render(
      <MemoryRouter initialEntries={["/test"]}>
        <Routes>
          <Route path="/" element={<div>HOME PAGE</div>} />
          <Route path="*" element={<LandingRouter loadConfig={failing} dev={false} />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("HOME PAGE")).toBeInTheDocument();
  });
});

describe("variants", () => {
  it("?v=parents swaps the hero, suffixes the lead source, and survives to the success page", async () => {
    renderAt("/test?v=parents");
    expect(await screen.findByRole("heading", { level: 1, name: "Parents hero" })).toBeInTheDocument();
    expect(screen.getByText("For parents")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Join today/ }));
    submitLeadForm();

    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/test-success"));
    expect(trackLead).toHaveBeenCalledTimes(1);
    expect(trackLead.mock.calls[0][0]).toBe("test-page - parents");
    expect(sendToZohoFlow.mock.calls[0][1]).toEqual({ source: "test-page", leadSource: "test-page - parents" });

    const page = await screen.findByRole("main");
    expect(page).toHaveAttribute("data-variant", "parents");
    expect(sessionStorage.getItem(variantStorageKey("test"))).toBe("parents");
  });

  it("ignores an unknown ?v=", async () => {
    renderAt("/test?v=bogus");
    expect(await screen.findByRole("heading", { level: 1, name: "Default hero" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Join today/ }));
    submitLeadForm();
    await waitFor(() => expect(trackLead).toHaveBeenCalledTimes(1));
    expect(trackLead.mock.calls[0][0]).toBe("test-page");
  });
});

describe("expiry", () => {
  it("waitlist mode shows only hero + closed message + waitlist form", async () => {
    renderAt("/test-waitlist");
    expect(await screen.findByRole("heading", { level: 1, name: "Default hero" })).toBeInTheDocument();
    expect(screen.getByText("Registrations for the May batch are closed.")).toBeInTheDocument();
    expect(screen.queryByText("Questions")).toBeNull();
    expect(screen.queryByText("Why join")).toBeNull();
    expect(screen.queryByRole("button", { name: "FAQ" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Join today/ })).toBeNull();

    const sections = document.querySelectorAll("main > section");
    expect([...sections].map((s) => s.id)).toEqual(["home", "registrations-closed"]);

    fireEvent.click(screen.getAllByRole("button", { name: "Join the waitlist" }).at(-1));
    expect(screen.getByRole("dialog")).toHaveTextContent("Registrations closed");
    submitLeadForm();

    expect(await screen.findByText(/You're on the waitlist/)).toBeInTheDocument();
    expect(trackLead.mock.calls[0][0]).toBe("test-page - WAITLIST");
    expect(sendToZohoFlow).not.toHaveBeenCalled();
    expect(screen.getByTestId("where")).toHaveTextContent("/test-waitlist");
  });

  it("redirect mode redirects with replace", async () => {
    renderAt("/test-redirect");
    expect(await screen.findByText("FOCAS PAGE")).toBeInTheDocument();
    expect(window.dataLayer).toEqual([]);
  });

  it("a future expiresAt renders the normal page", async () => {
    renderAt("/test-future");
    expect(await screen.findByText("Questions")).toBeInTheDocument();
  });
});

describe("page-view tracking", () => {
  it("pushes <slug>_page_view and Pixel ViewContent exactly once per mount", async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={["/test"]}>
        <LandingPage config={testConfig} />
      </MemoryRouter>,
    );
    // Re-render and open/close the form: no repeats.
    rerender(
      <MemoryRouter initialEntries={["/test"]}>
        <LandingPage config={testConfig} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Join today/ }));
    fireEvent.click(screen.getByRole("button", { name: /Back/ }));

    expect(window.dataLayer).toEqual([{ event: "test_page_view" }]);
    const viewContent = window.fbq.mock.calls.filter(([, name]) => name === "ViewContent");
    expect(viewContent).toHaveLength(1);
  });

  it("the success page fires no Lead and consumes the focas_lead_tracked flag", async () => {
    sessionStorage.setItem("focas_lead_tracked", "1");
    renderAt("/test-success");
    await screen.findByRole("heading", { name: "You're registered!" });
    expect(window.fbq).not.toHaveBeenCalled();
    expect(trackLead).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("focas_lead_tracked")).toBeNull();
    expect(window.dataLayer).toEqual([]);
  });
});
