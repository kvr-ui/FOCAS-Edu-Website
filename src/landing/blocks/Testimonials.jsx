import { useEffect, useState } from "react";
import { Reveal } from "../ui";

/**
 * Photo testimonial carousel with one mobile card and two desktop cards per view.
 * @param {{ section?: { id?: string, eyebrow?: string, label?: string, title?: string, sub?: string, items?: Array<{ photo?: string, img?: string, name?: string, student?: string, batch?: string, batchLabel?: string, quote?: string, feedback?: string, rating?: number }> }, id?: string, eyebrow?: string, label?: string, title?: string, sub?: string, items?: Array<object>, onRegister?: () => void }} props
 */
export function Testimonials({ section, id, ...props }) {
  const config = section ?? { id, ...props };
  const items = Array.isArray(config.items) ? config.items : [];
  const [index, setIndex] = useState(0);
  const [perPage, setPerPage] = useState(1);

  useEffect(() => {
    const update = () => setPerPage(window.innerWidth >= 1024 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, items.length - perPage);
  const current = Math.min(index, maxIndex);
  const eyebrow = config.eyebrow ?? config.label;
  if (!eyebrow && !config.title && !config.sub && items.length === 0) return null;

  return (
    <section id={config.id ?? id} className="bg-white px-6 py-10 md:py-24">
      <div className="mx-auto max-w-5xl">
        {(eyebrow || config.title || config.sub) && (
          <Reveal className="mb-8 text-center md:mb-12">
            {eyebrow && (
              <span
                className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  color: "var(--lp-accent)",
                  background: "color-mix(in srgb, var(--lp-accent) 11%, white)",
                }}
              >
                {eyebrow}
              </span>
            )}
            {config.title && (
              <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{config.title}</h2>
            )}
            {config.sub && <p className="mt-3 text-base text-slate-500 md:text-lg">{config.sub}</p>}
          </Reveal>
        )}

        {items.length > 0 && (
          <Reveal>
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${current * (100 / perPage)}%)` }}
              >
                {items.map((item, itemIndex) => {
                  const name = item?.name ?? item?.student;
                  const photo = item?.photo ?? item?.img ?? item?.image;
                  const quote = item?.quote ?? item?.feedback;
                  const rating = Math.max(0, Math.min(5, Number(item?.rating ?? 5) || 0));
                  const batch = item?.batchLabel ?? (item?.batch
                    ? `${item.batch}${String(item.batch).toLowerCase().includes("batch") ? "" : " Batch"}`
                    : "");
                  return (
                    <article key={`${name ?? "testimonial"}-${itemIndex}`} className="w-full flex-shrink-0 px-0 lg:w-1/2 lg:px-3">
                      <div className="flex h-full flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:p-7" style={{ borderColor: "color-mix(in srgb, var(--lp-accent) 20%, white)" }}>
                        {(photo || name || batch) && (
                          <div className="flex items-center gap-4">
                            {photo && (
                              <img
                                src={photo}
                                alt={name ?? ""}
                                loading="lazy"
                                className="h-14 w-14 flex-shrink-0 rounded-full border-2 object-cover md:h-16 md:w-16"
                                style={{ borderColor: "var(--lp-accent)" }}
                              />
                            )}
                            <div>
                              {name && <h3 className="text-base font-black leading-tight text-slate-900 md:text-lg">{name}</h3>}
                              {batch && <p className="text-xs font-semibold text-slate-400">{batch}</p>}
                              {rating > 0 && <div className="mt-0.5 text-sm text-amber-400" aria-label={`${rating} out of 5 stars`}>{"★".repeat(rating)}</div>}
                            </div>
                          </div>
                        )}
                        {quote && (
                          <p className="flex-grow text-sm leading-relaxed text-slate-600">
                            <span className="mr-1 align-top text-2xl font-black leading-none" style={{ color: "var(--lp-accent)" }}>“</span>
                            {quote}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {items.length > perPage && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIndex((value) => Math.max(0, Math.min(value, maxIndex) - 1))}
                  disabled={current === 0}
                  aria-label="Previous testimonial"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-black transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                  style={{ color: "var(--lp-accent)", background: "color-mix(in srgb, var(--lp-accent) 11%, white)" }}
                >
                  ‹
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
                    <button
                      type="button"
                      key={dotIndex}
                      onClick={() => setIndex(dotIndex)}
                      aria-label={`Show testimonial ${dotIndex + 1}`}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: current === dotIndex ? 24 : 8,
                        background: current === dotIndex ? "var(--lp-accent)" : "#cbd5e1",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIndex((value) => Math.min(maxIndex, value + 1))}
                  disabled={current === maxIndex}
                  aria-label="Next testimonial"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-black transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                  style={{ color: "var(--lp-accent)", background: "color-mix(in srgb, var(--lp-accent) 11%, white)" }}
                >
                  ›
                </button>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
