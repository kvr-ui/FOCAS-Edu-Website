import { useScrolledPast } from "./useScrollY";

/**
 * Mobile-only floating register button (hidden from md breakpoint up).
 * Appears after the user scrolls past `showAfter` px (0 = always visible).
 */
export function StickyCTA({ label, onRegister, showAfter = 400 }) {
  const past = useScrolledPast(showAfter);
  if (!label) return null;
  const show = showAfter <= 0 || past;
  return (
    <div
      className={`md:hidden fixed bottom-7 right-7 z-50 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={() => onRegister?.()}
        className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl hover:-translate-y-0.5 transition-all"
        style={{ background: "var(--lp-accent)" }}
      >
        <span className="w-2 h-2 rounded-full bg-white" style={{ animation: "ping 1.2s ease infinite" }} />
        {label}
      </button>
    </div>
  );
}

export default StickyCTA;
