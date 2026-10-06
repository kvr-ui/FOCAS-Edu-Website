import { Reveal } from "../ui";

/**
 * Responsive image gallery block.
 * @param {{ section?: { id?: string, eyebrow?: string, title?: string, sub?: string, images?: Array<string | { src?: string, image?: string, alt?: string, caption?: string }>, items?: Array<string | object> }, id?: string, eyebrow?: string, title?: string, sub?: string, images?: Array<string | object>, items?: Array<string | object>, onRegister?: () => void }} props
 */
export function Gallery({ section, id, ...props }) {
  const config = section ?? { id, ...props };
  const images = Array.isArray(config.images)
    ? config.images
    : Array.isArray(config.items)
      ? config.items
      : [];
  if (!config.eyebrow && !config.title && !config.sub && images.length === 0) return null;

  return (
    <section id={config.id ?? id} className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {(config.eyebrow || config.title || config.sub) && (
          <Reveal className="mb-10 text-center">
            {config.eyebrow && (
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: "var(--lp-accent)" }}>
                {config.eyebrow}
              </p>
            )}
            {config.title && <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{config.title}</h2>}
            {config.sub && <p className="mt-3 text-lg text-slate-500">{config.sub}</p>}
          </Reveal>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((entry, index) => {
              const image = typeof entry === "string" ? { src: entry } : entry ?? {};
              const src = image.src ?? image.image;
              if (!src) return null;
              return (
                <Reveal key={`${src}-${index}`} delay={index * 0.04}>
                  <figure className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <img
                      src={src}
                      alt={image.alt ?? ""}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {image.caption && (
                      <figcaption className="border-t border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
                        <span className="mr-2" style={{ color: "var(--lp-accent)" }}>●</span>
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Gallery;
