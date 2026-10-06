import { Reveal } from "../ui";
import { ConfigIcon, hasText, resolveSection, SectionIntro } from "./shared";

/**
 * Compact icon/stat highlight grid.
 * @param {object} props
 * @param {object} [props.section] Alternative to spreading the section as props.
 * @param {string} [props.id] Navigation anchor.
 * @param {string} [props.label] Optional eyebrow.
 * @param {string} [props.title] Optional section heading.
 * @param {string} [props.sub] Optional supporting copy.
 * @param {Array<{icon?:React.ReactNode,value?:string,stat?:string,label?:string,text?:string,desc?:string}>} [props.items]
 * @param {() => void} [props.onRegister] Accepted for the common block interface.
 */
export function HighlightsBlock({ section, ...props }) {
  const config = resolveSection(section, props);
  const items = Array.isArray(config.items) ? config.items.filter(Boolean) : [];
  const hasIntro = hasText(config.label) || hasText(config.title) || hasText(config.sub);
  if (!hasIntro && items.length === 0) return null;

  return (
    <section id={config.id} className="border-y border-gray-100 bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {hasIntro && (
          <Reveal className="mb-8">
            <SectionIntro label={config.label} title={config.title} sub={config.sub} />
          </Reveal>
        )}
        {items.length > 0 && (
          <div className={`grid gap-4 ${items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {items.map((item, index) => {
              const value = item.value ?? item.stat;
              const copy = item.text ?? item.label;
              if (!item.icon && !hasText(value) && !hasText(copy) && !hasText(item.desc)) return null;
              return (
                <Reveal key={`${copy ?? value ?? "highlight"}-${index}`} delay={index * 0.06} className="h-full">
                  <div
                    className="flex h-full items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                    style={{ borderColor: "color-mix(in srgb,var(--lp-accent) 18%,white)" }}
                  >
                    {item.icon && (
                      <span
                        className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-xl"
                        style={{
                          background: "color-mix(in srgb,var(--lp-accent) 12%,white)",
                          color: "var(--lp-accent)",
                        }}
                      >
                        <ConfigIcon icon={item.icon} className="h-5 w-5" />
                      </span>
                    )}
                    <div>
                      {hasText(value) && <div className="text-2xl font-black" style={{ color: "var(--lp-accent)" }}>{value}</div>}
                      {hasText(copy) && <div className="font-bold text-slate-800">{copy}</div>}
                      {hasText(item.desc) && <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default HighlightsBlock;
