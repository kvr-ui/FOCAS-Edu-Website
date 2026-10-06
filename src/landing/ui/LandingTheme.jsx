import { LANDING_CSS, themeVars } from "./theme";

/**
 * Root wrapper for a landing page. Sets --lp-accent / --lp-accent-2 from
 * `theme` (i.e. config.theme; `config` is accepted as a convenience) and
 * injects the shared keyframes (ticker, ping) once.
 */
export function LandingTheme({ theme, config, className = "", children }) {
  const vars = themeVars(theme ?? config?.theme);
  return (
    <div className={`font-sans overflow-x-hidden ${className}`.trim()} style={vars}>
      <style>{LANDING_CSS}</style>
      {children}
    </div>
  );
}

export default LandingTheme;
