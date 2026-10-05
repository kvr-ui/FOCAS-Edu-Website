import { useEffect } from "react";

/**
 * Theme shared by /career-guidance and its success page. The audience is parents
 * arriving from ads, so it's deliberately calm: ivory paper, deep navy ink and a
 * muted gold accent, with Fraunces headings and Plus Jakarta Sans body text.
 */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Plus+Jakarta+Sans:wght@400..800&display=swap";

// Loaded only on these pages, so the rest of the site keeps its fonts and payload.
export function useCareerFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}

export const NAVY = "#13294b";
export const GOLD = "#a87b2a";

export const CG_CSS = `
.cg-root { font-family: "Plus Jakarta Sans", system-ui, sans-serif; color: #1f2a3d; }
.cg-root ::selection { background: #13294b; color: #fff; }
.cg-display { font-family: "Fraunces", Georgia, serif; font-optical-sizing: auto; letter-spacing: -0.015em; color: #13294b; }
.cg-label { font-size: .9rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #a87b2a; }

.cg-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  border-radius: .75rem; padding: 1.1rem 2rem;
  font-weight: 700; font-size: 1.2rem; color: #fff; background: #13294b;
  box-shadow: 0 10px 24px -12px rgba(19,41,75,.55);
  transition: background .2s ease, transform .2s ease;
}
.cg-btn:hover { background: #0c1d38; transform: translateY(-1px); }
.cg-btn:active { transform: none; }

.cg-card { background: #fff; border: 1px solid #e7e2d8; border-radius: 1rem; }

@keyframes cg-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.cg-rise { animation: cg-rise .7s cubic-bezier(.2,.7,.2,1) both; }
@media (prefers-reduced-motion: reduce) { .cg-rise { animation: none; } }
`;
