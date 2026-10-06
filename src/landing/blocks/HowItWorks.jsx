import { Reveal } from "../ui";
import { ConfigIcon, hasText, resolveSection, SectionIntro } from "./shared";

/**
 * Vertical process timeline with optional supporting feature cards.
 * @param {object} props
 * @param {object} [props.section] Alternative to spreading the section as props.
 * @param {string} [props.id] Navigation anchor.
 * @param {string} [props.label] Optional eyebrow.
 * @param {string} [props.title] Section heading.
 * @param {string} [props.sub] Supporting copy.
 * @param {Array<{time?:string,step?:string,icon?:React.ReactNode,emoji?:React.ReactNode,label?:string,title?:string,desc?:string}>} [props.steps]
 * @param {Array<{icon?:React.ReactNode,title?:string,desc?:string,color?:string,colour?:string,background?:string}>} [props.features]
 * @param {() => void} [props.onRegister] Accepted for the common block interface.
 */
export function HowItWorksBlock({ section, ...props }) {
  const config = resolveSection(section, props);
  const steps = Array.isArray(config.steps) ? config.steps.filter(Boolean) : [];
  const features = Array.isArray(config.features ?? config.featureCards)
    ? (config.features ?? config.featureCards).filter(Boolean)
    : [];
  const hasIntro = hasText(config.label) || hasText(config.title) || hasText(config.sub);
  if (!hasIntro && steps.length === 0 && features.length === 0) return null;

  return (
    <section
      id={config.id}
      className="px-6 py-10 md:py-24"
      style={{ background: "linear-gradient(160deg,white,color-mix(in srgb,var(--lp-accent) 8%,white))" }}
    >
      <div className="mx-auto max-w-2xl">
        {hasIntro && (
          <Reveal className="mb-14">
            <SectionIntro label={config.label} title={config.title} sub={config.sub} />
          </Reveal>
        )}

        {steps.length > 0 && (
          <div className="relative">
            <div
              className="absolute bottom-5 left-[76px] top-5 w-0.5 rounded-full"
              style={{ background: "linear-gradient(to bottom,var(--lp-accent),color-mix(in srgb,var(--lp-accent) 10%,transparent))" }}
              aria-hidden
            />
            <ol className="flex flex-col gap-4">
              {steps.map((step, index) => {
                const marker = step.time ?? step.step;
                const title = step.label ?? step.title;
                const icon = step.icon ?? step.emoji;
                if (!hasText(marker) && !icon && !hasText(title) && !hasText(step.desc)) return null;
                return (
                  <Reveal key={`${marker ?? title ?? "step"}-${index}`} delay={index * 0.07}>
                    <li className="group flex items-center">
                      <div className="w-20 flex-shrink-0 pr-4 text-right text-xs font-bold" style={{ color: "var(--lp-accent)" }}>
                        {marker}
                      </div>
                      <span
                        className="relative z-10 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125"
                        style={{ background: "var(--lp-accent)" }}
                        aria-hidden
                      />
                      <div className="ml-4 flex flex-1 items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all group-hover:translate-x-1 group-hover:shadow-md">
                        {icon && <ConfigIcon icon={icon} className="h-6 w-6 flex-none text-xl" />}
                        <div>
                          {hasText(title) && <div className="text-sm font-bold text-gray-800">{title}</div>}
                          {hasText(step.desc) && <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.desc}</p>}
                        </div>
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        )}

        {features.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((feature, index) => {
              const colour = feature.background ?? feature.colour ?? feature.color;
              if (!feature.icon && !hasText(feature.title) && !hasText(feature.desc)) return null;
              return (
                <Reveal key={`${feature.title ?? "feature"}-${index}`} delay={0.1 + index * 0.08} className="h-full">
                  <article
                    className="h-full rounded-2xl p-7 text-white"
                    style={{
                      background:
                        colour ??
                        (index % 2 === 0
                          ? "linear-gradient(135deg,var(--lp-accent),color-mix(in srgb,var(--lp-accent) 75%,black))"
                          : "linear-gradient(135deg,var(--lp-accent-2),color-mix(in srgb,var(--lp-accent-2) 70%,black))"),
                    }}
                  >
                    {feature.icon && <ConfigIcon icon={feature.icon} className="mb-3 h-8 w-8 text-3xl" />}
                    {hasText(feature.title) && <h3 className="mb-2 text-lg font-black">{feature.title}</h3>}
                    {hasText(feature.desc) && <p className="text-sm leading-relaxed opacity-85">{feature.desc}</p>}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default HowItWorksBlock;
