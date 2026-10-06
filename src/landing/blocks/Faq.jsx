import { useState } from "react";
import { Reveal } from "../ui";

/**
 * FAQ accordion block.
 * @param {{ section?: { id?: string, eyebrow?: string, title?: string, sub?: string, items?: Array<{ q?: string, a?: string }> }, id?: string, eyebrow?: string, title?: string, sub?: string, items?: Array<{ q?: string, a?: string }>, onRegister?: () => void }} props
 */
export function Faq({ section, id, ...props }) {
  const config = section ?? { id, ...props };
  const items = Array.isArray(config.items) ? config.items : [];
  const [open, setOpen] = useState(null);
  if (!config.eyebrow && !config.title && !config.sub && items.length === 0) return null;

  return (
    <section id={config.id ?? id} className="bg-white px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        {(config.eyebrow || config.title || config.sub) && (
          <Reveal className="mb-12 text-center">
            {config.eyebrow && (
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: "var(--lp-accent)" }}>
                {config.eyebrow}
              </p>
            )}
            {config.title && <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{config.title}</h2>}
            {config.sub && <p className="mt-3 text-lg text-slate-500">{config.sub}</p>}
          </Reveal>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => {
              if (!item?.q && !item?.a) return null;
              const isOpen = open === index;
              const panelId = `${config.id ?? id ?? "faq"}-answer-${index}`;
              return (
                <Reveal key={`${item.q ?? "faq"}-${index}`} delay={index * 0.04}>
                  <div
                    className="overflow-hidden rounded-2xl border-2 transition-all"
                    style={{ borderColor: isOpen ? "var(--lp-accent)" : "#f1f5f9" }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      {item.q}
                      <span
                        aria-hidden="true"
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        style={{ color: "var(--lp-accent)", background: "color-mix(in srgb, var(--lp-accent) 11%, white)" }}
                      >
                        ▾
                      </span>
                    </button>
                    <div
                      id={panelId}
                      style={{ maxHeight: isOpen ? "300px" : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}
                    >
                      {item.a && <div className="border-t border-slate-100 px-6 pb-5 pt-4 text-sm leading-relaxed text-slate-600">{item.a}</div>}
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

export default Faq;
