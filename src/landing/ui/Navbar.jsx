import { useState } from "react";
import { scrollToId, useScrolledPast } from "./useScrollY";

/**
 * Config-driven landing navbar (visual port of Manual's).
 * Props:
 *  - logo: image src (string) or a React node
 *  - logoAlt: alt text when `logo` is a src
 *  - nav: [{ label, target }] — target is a section id to smooth-scroll to
 *  - ctaLabel: register button label (button hidden when empty)
 *  - onRegister: CTA click handler
 *  - homeTarget: section id the logo scrolls to (default: first nav target, else top)
 */
export function Navbar({ logo, logoAlt = "", nav = [], ctaLabel, onRegister, homeTarget }) {
  const scrolled = useScrolledPast(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = Array.isArray(nav) ? nav.filter((l) => l && l.label) : [];

  const go = (id) => {
    scrollToId(id);
    setMenuOpen(false);
  };
  const goHome = () => {
    const id = homeTarget ?? links[0]?.target;
    if (id && document.getElementById(id)) go(id);
    else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMenuOpen(false);
    }
  };
  const register = () => {
    setMenuOpen(false);
    onRegister?.();
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-100" : "bg-white/90"
        }`}
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
          {typeof logo === "string" ? <img src={logo} alt={logoAlt} className="h-10" /> : logo}
        </div>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <button
              key={`${l.label}-${l.target}`}
              type="button"
              onClick={() => go(l.target)}
              className="text-sm font-semibold text-gray-600 hover:text-[var(--lp-accent)] transition-colors"
            >
              {l.label}
            </button>
          ))}
          {ctaLabel && (
            <button
              type="button"
              onClick={register}
              className="text-sm font-bold text-white px-5 py-2 rounded-full shadow-md transition-all hover:scale-105 hover:shadow-lg uppercase tracking-widest"
              style={{ background: "var(--lp-accent)" }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-t border-gray-100 flex flex-col px-6 py-4 gap-1 md:hidden">
          {links.map((l) => (
            <button
              key={`${l.label}-${l.target}`}
              type="button"
              onClick={() => go(l.target)}
              className="text-left py-3 text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0 hover:text-[var(--lp-accent)] transition-colors"
            >
              {l.label}
            </button>
          ))}
          {ctaLabel && (
            <button
              type="button"
              onClick={register}
              className="mt-3 w-full py-3 rounded-full text-white font-bold text-sm uppercase tracking-widest"
              style={{ background: "var(--lp-accent)" }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
