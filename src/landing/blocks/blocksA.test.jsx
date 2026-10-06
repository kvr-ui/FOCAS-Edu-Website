// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { LandingTheme } from "../ui";
import { BLOCKS_A } from "./blocksA";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const withinTheme = (node) => render(<LandingTheme>{node}</LandingTheme>);

describe("BLOCKS_A", () => {
  it("exports every set A config type", () => {
    expect(Object.keys(BLOCKS_A)).toEqual([
      "hero",
      "ticker",
      "countdown",
      "highlights",
      "whatYouGet",
      "howItWorks",
    ]);
  });

  it("renders the full hero config and opens registration", () => {
    const onRegister = vi.fn();
    const { container, getByRole, getByText } = withinTheme(
      <BLOCKS_A.hero
        id="home"
        badge={{ text: "Limited", emphasis: "today" }}
        headline="Know what to study next"
        highlight="what to study"
        sub="A clear plan"
        emphasis="Start with confidence"
        priceTable={{ headers: ["Session", "Delivery"], values: ["₹299", "Included"] }}
        cta="Register now"
        stats={[{ value: "1:1", label: "Mentoring" }]}
        video="https://video.example/playlist.m3u8"
        mediaCta="Watch and join"
        revealMedia={false}
        onRegister={onRegister}
      />,
    );

    expect(container.querySelector("#home video")?.getAttribute("src")).toBe(
      "https://video.example/playlist.m3u8",
    );
    expect(container.querySelectorAll("#home video")[1]?.parentElement?.parentElement?.style.opacity).toBe("");
    expect(container.querySelectorAll("#home video")[1]?.parentElement?.className).toContain("absolute inset-0");
    expect(getByText("A clear plan")).toBeTruthy();
    fireEvent.click(getByRole("button", { name: /register now/i }));
    expect(onRegister).toHaveBeenCalledOnce();
  });

  it("supports section props and renders the remaining blocks", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const { getByText, getByRole } = withinTheme(
      <>
        <BLOCKS_A.ticker section={{ id: "news", items: ["One", "Two"] }} />
        <BLOCKS_A.countdown section={{ id: "clock", date: future, label: "Begins in" }} />
        <BLOCKS_A.highlights section={{ id: "proof", items: [{ icon: "✓", stat: "100+", label: "Learners" }] }} />
        <BLOCKS_A.whatYouGet section={{ id: "offer", cards: [{ icon: "🎯", title: "Guidance", desc: "A practical plan" }] }} />
        <BLOCKS_A.howItWorks section={{ id: "how", steps: [{ step: "Step 1", icon: "📞", title: "Book" }], features: [{ title: "Support" }] }} />
      </>,
    );

    expect(getByText("Begins in")).toBeTruthy();
    expect(getByRole("timer")).toBeTruthy();
    expect(getByText("100+")).toBeTruthy();
    expect(getByText("Guidance")).toBeTruthy();
    expect(getByText("Book")).toBeTruthy();
  });

  it("hides an elapsed countdown and safely omits optional content", () => {
    const { container } = withinTheme(
      <>
        <BLOCKS_A.hero />
        <BLOCKS_A.ticker />
        <BLOCKS_A.countdown date="2000-01-01T00:00:00Z" />
        <BLOCKS_A.highlights />
        <BLOCKS_A.whatYouGet />
        <BLOCKS_A.howItWorks />
      </>,
    );
    expect(container.querySelector("[role='timer']")).toBeNull();
    expect(container.querySelector("section")).toBeNull();
  });
});
