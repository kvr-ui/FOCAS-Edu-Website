import { Reveal } from "../ui";

/**
 * Agenda timeline block.
 * @param {{ section?: { id?: string, eyebrow?: string, label?: string, title?: string, sub?: string, items?: Array<{ time?: string, title?: string, item?: string, label?: string }> }, id?: string, eyebrow?: string, label?: string, title?: string, sub?: string, items?: Array<{ time?: string, title?: string, item?: string, label?: string }>, onRegister?: () => void }} props
 */
export function Agenda({ section, id, ...props }) {
  const config = section ?? { id, ...props };
  const items = Array.isArray(config.items) ? config.items : [];
  const eyebrow = config.eyebrow ?? config.label;
  if (!eyebrow && !config.title && !config.sub && items.length === 0) return null;

  return (
    <section id={config.id ?? id} className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          {eyebrow && (
            <p
              className="mb-3 text-xs font-black uppercase tracking-[0.22em]"
              style={{ color: "var(--lp-accent)" }}
            >
              {eyebrow}
            </p>
          )}
          {config.title && (
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {config.title}
            </h2>
          )}
          {config.sub && <p className="mt-4 text-lg leading-relaxed text-slate-600">{config.sub}</p>}
        </Reveal>

        {items.length > 0 && (
          <Reveal>
            <ol className="divide-y divide-slate-200 border-y border-slate-200">
              {items.map((item, index) => {
                const text = item?.title ?? item?.item ?? item?.label;
                if (!item?.time && !text) return null;
                return (
                  <li
                    key={`${item?.time ?? "agenda"}-${index}`}
                    className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-5 sm:grid-cols-[10rem_1fr]"
                  >
                    {item?.time && (
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color: "var(--lp-accent)" }}
                      >
                        {item.time}
                      </span>
                    )}
                    {text && <span className="text-xl font-semibold text-slate-900 sm:text-2xl">{text}</span>}
                  </li>
                );
              })}
            </ol>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default Agenda;
