import { Reveal } from "../ui";

/**
 * Closing call-to-action banner.
 * @param {{ section?: { id?: string, eyebrow?: string, title?: string, sub?: string, cta?: string | { label?: string, disabled?: boolean }, note?: string }, id?: string, eyebrow?: string, title?: string, sub?: string, cta?: string | { label?: string, disabled?: boolean }, note?: string, onRegister?: () => void }} props
 */
export function FinalCta({ section, id, onRegister, ...props }) {
  const config = section ?? { id, ...props };
  const cta = typeof config.cta === "string" ? { label: config.cta } : config.cta ?? {};
  if (!config.eyebrow && !config.title && !config.sub && !cta.label && !config.note) return null;

  return (
    <section id={config.id ?? id} className="bg-white px-4 pb-16 sm:px-6 sm:pb-24">
      <Reveal>
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-14"
          style={{
            background: "linear-gradient(135deg, color-mix(in srgb, var(--lp-accent) 82%, #0f172a), var(--lp-accent))",
            boxShadow: "0 28px 70px -35px color-mix(in srgb, var(--lp-accent) 70%, transparent)",
          }}
        >
          {config.eyebrow && <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">{config.eyebrow}</p>}
          {config.title && <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{config.title}</h2>}
          {config.sub && <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{config.sub}</p>}
          {cta.label && (
            <button
              type="button"
              onClick={onRegister}
              disabled={cta.disabled || typeof onRegister !== "function"}
              className="mt-8 rounded-full bg-white px-7 py-3.5 text-sm font-black uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              style={{ color: "var(--lp-accent)" }}
            >
              {cta.label}
            </button>
          )}
          {config.note && <p className="mt-4 text-xs text-white/60">{config.note}</p>}
        </div>
      </Reveal>
    </section>
  );
}

export default FinalCta;
