export const DEFAULT_ACCENT = "#1D9E75";
export const DEFAULT_ACCENT_2 = "#FFA500";

/** Keyframes shared by landing blocks (same definitions Manual uses). */
export const LANDING_CSS = `
@keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
@keyframes ping   { 0%,100% { transform:scale(1);opacity:1 } 50% { transform:scale(1.7);opacity:.4 } }
`;

/** Resolve accent colours from a (possibly missing or partial) config.theme. */
export function resolveTheme(theme) {
  const t = theme && typeof theme === "object" ? theme : {};
  const pick = (v, d) => (typeof v === "string" && v.trim() ? v.trim() : d);
  return {
    accent: pick(t.accent, DEFAULT_ACCENT),
    accent2: pick(t.accent2, DEFAULT_ACCENT_2),
  };
}

export function themeVars(theme) {
  const { accent, accent2 } = resolveTheme(theme);
  return { "--lp-accent": accent, "--lp-accent-2": accent2 };
}
