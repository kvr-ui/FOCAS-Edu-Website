// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { LandingTheme } from "../ui";
import { BLOCKS_B, Compare, Custom, Faq, FinalCta, Footer, Testimonials, VideoTestimonials } from "./blocksB";

afterEach(cleanup);

const themed = (node) => <LandingTheme theme={{ accent: "#123456" }}>{node}</LandingTheme>;

describe("BLOCKS_B", () => {
  it("exports every set B section type", () => {
    expect(Object.keys(BLOCKS_B)).toEqual([
      "agenda",
      "compare",
      "testimonials",
      "videoTestimonials",
      "gallery",
      "faq",
      "finalCta",
      "footer",
      "custom",
    ]);
  });

  it("renders configured comparison headings in mobile and desktop layouts", () => {
    const { getAllByText } = render(themed(
      <Compare
        id="compare"
        headings={{ feature: "Benefit", others: "Typical", us: "FOCAS" }}
        rows={[{ label: "Mentoring", others: "No", us: "Yes" }]}
      />,
    ));
    expect(getAllByText("Benefit")).toHaveLength(2);
    expect(getAllByText("Typical")).toHaveLength(2);
    expect(getAllByText("FOCAS")).toHaveLength(2);
  });

  it("moves the testimonial carousel one card at a time", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 500 });
    const items = [
      { name: "One", quote: "First" },
      { name: "Two", quote: "Second" },
      { name: "Three", quote: "Third" },
    ];
    const { getByLabelText } = render(themed(<Testimonials items={items} />));
    fireEvent.click(getByLabelText("Next testimonial"));
    const track = getByLabelText("Next testimonial").closest("div").previousElementSibling.firstElementChild;
    expect(track.style.transform).toBe("translateX(-100%)");
  });

  it("opens and closes FAQ answers", () => {
    const { getByRole } = render(themed(<Faq id="faq" items={[{ q: "Question?", a: "Answer." }]} />));
    const button = getByRole("button", { name: /Question/ });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("fires the final CTA and gives the footer FOCAS defaults", () => {
    const onRegister = vi.fn();
    const { getByRole, getByText, getByAltText } = render(themed(
      <>
        <FinalCta title="Ready?" cta="Register" onRegister={onRegister} />
        <Footer />
      </>,
    ));
    fireEvent.click(getByRole("button", { name: "Register" }));
    expect(onRegister).toHaveBeenCalledOnce();
    expect(getByAltText("FOCAS Edu").getAttribute("src")).toBe("/fs-assets/logo-white.webp");
    expect(getByText(/FOCAS Edu. All rights reserved/)).toBeTruthy();
  });

  it("turns Bunny IDs into shared VideoCarousel sources", () => {
    const { container } = render(themed(
      <VideoTestimonials bunnyBaseUrl="https://video.example" videos={[{ id: "abc", poster: "thumb.jpg" }]} />,
    ));
    const video = container.querySelector("video");
    expect(video.getAttribute("src")).toBe("https://video.example/abc/playlist.m3u8");
    expect(video.getAttribute("poster")).toBe("https://video.example/abc/thumb.jpg");
  });

  it("lazy-loads a custom human-authored section", async () => {
    const component = vi.fn(async () => ({ default: () => <p>One-off content</p> }));
    const { getByText } = render(themed(<Custom component={component} />));
    await waitFor(() => expect(getByText("One-off content")).toBeTruthy());
    expect(component).toHaveBeenCalledOnce();
  });
});
