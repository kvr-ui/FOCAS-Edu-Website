// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { LandingTheme, Navbar, StickyCTA, WhatsAppButton, Reveal, resolveTheme, LANDING_CSS } from "./index";

afterEach(cleanup);

describe("resolveTheme / LandingTheme", () => {
  it("defaults when theme missing or partial", () => {
    expect(resolveTheme(undefined)).toEqual({ accent: "#1D9E75", accent2: "#FFA500" });
    expect(resolveTheme({ accent: "#123456" })).toEqual({ accent: "#123456", accent2: "#FFA500" });
  });
  it("sets CSS variables and injects keyframes", () => {
    const { container } = render(<LandingTheme theme={{ accent2: "#abcdef" }}><p>x</p></LandingTheme>);
    const root = container.firstChild;
    expect(root.style.getPropertyValue("--lp-accent")).toBe("#1D9E75");
    expect(root.style.getPropertyValue("--lp-accent-2")).toBe("#abcdef");
    expect(container.querySelector("style").textContent).toContain("@keyframes ticker");
    expect(LANDING_CSS).toContain("@keyframes ping");
  });
});

describe("Navbar", () => {
  it("smooth-scrolls to section ids, toggles mobile menu, uses CTA label", () => {
    const section = document.createElement("section");
    section.id = "faq";
    section.scrollIntoView = vi.fn();
    document.body.appendChild(section);
    const onRegister = vi.fn();
    const { getAllByText, getByLabelText, queryByLabelText } = render(
      <Navbar logo="/logo.png" nav={[{ label: "FAQs", target: "faq" }]} ctaLabel="Join now" onRegister={onRegister} />
    );
    fireEvent.click(getAllByText("FAQs")[0]);
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    fireEvent.click(getByLabelText("Open menu"));
    expect(getAllByText("FAQs")).toHaveLength(2);
    fireEvent.click(getAllByText("FAQs")[1]);
    expect(getAllByText("FAQs")).toHaveLength(1);
    expect(queryByLabelText("Open menu")).not.toBeNull();

    fireEvent.click(getAllByText("Join now")[0]);
    expect(onRegister).toHaveBeenCalled();
    section.remove();
  });
});

describe("StickyCTA / WhatsAppButton", () => {
  it("StickyCTA is mobile-only", () => {
    const { container, getByText } = render(<StickyCTA label="Register" onRegister={() => {}} showAfter={0} />);
    expect(container.firstChild.className).toContain("md:hidden");
    expect(getByText("Register")).toBeTruthy();
  });
  it("WhatsAppButton renders nothing without a number", () => {
    expect(render(<WhatsAppButton />).container.firstChild).toBeNull();
    const { container } = render(<WhatsAppButton number="+91 63835 14285" />);
    expect(container.querySelector("a").getAttribute("href")).toBe("https://wa.me/916383514285");
  });
});

describe("Reveal", () => {
  it("renders children hidden until in view", () => {
    const { getByText } = render(<Reveal className="c"><span>hi</span></Reveal>);
    const el = getByText("hi").parentElement;
    expect(el.className).toBe("c");
  });
});
