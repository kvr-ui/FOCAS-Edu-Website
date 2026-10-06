import { Reveal } from "../ui";
import { ConfigIcon, hasText, resolveSection, SectionIntro } from "./shared";

function cardColours(card) {
  const colour = card.colour ?? card.color;
  const palette = typeof colour === "object" && colour !== null ? colour : {};
  const accent = card.accent ?? palette.accent ?? palette.text ?? (typeof colour === "string" ? colour : "var(--lp-accent)");
  return {
    accent,
    background: card.bg ?? card.background ?? palette.bg ?? palette.background ?? `color-mix(in srgb, ${accent} 8%, white)`,
    border: card.border ?? palette.border ?? `color-mix(in srgb, ${accent} 24%, white)`,
  };
}

function BottomCta({ content, onRegister }) {
  if (!content) return null;
  const config = typeof content === "string" ? { text: content } : content;
  const label = config.label ?? config.cta;
  if (!hasText(config.text) && !hasText(config.note) && !hasText(label)) return null;

  return (
    <Reveal delay={0.1}>
      <div className="flex flex-wrap items-center justify-center gap-5 rounded-3xl bg-slate-900 px-8 py-5 sm:rounded-full">
        {(hasText(config.text) || hasText(config.note)) && (
          <span className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-bold text-white">
            {config.icon !== false && <span style={{ color: "var(--lp-accent)" }} aria-hidden>✓</span>}
            {config.text}
            {hasText(config.note) && <span className="text-gray-400">{config.note}</span>}
          </span>
        )}
        {hasText(label) && (
          <button
            type="button"
            onClick={() => onRegister?.()}
            className="rounded-full px-6 py-2 text-sm font-black text-white transition-transform hover:scale-105"
            style={{ background: "var(--lp-accent)" }}
          >
            {label}
          </button>
        )}
      </div>
    </Reveal>
  );
}

/**
 * Benefit cards followed by an optional registration bar.
 * @param {object} props
 * @param {object} [props.section] Alternative to spreading the section as props.
 * @param {string} [props.id] Navigation anchor.
 * @param {string} [props.label] Optional eyebrow.
 * @param {string} [props.title] Section heading.
 * @param {string} [props.sub] Supporting copy.
 * @param {Array<{icon?:React.ReactNode,title?:string,desc?:string,colour?:string|{background?:string,border?:string,text?:string},color?:string,bg?:string,border?:string,accent?:string}>} [props.cards]
 * @param {{text?:string,note?:string,label?:string,cta?:string,icon?:boolean}|string} [props.bottomCta]
 * @param {{text?:string,note?:string,label?:string}|string} [props.ctaBar] Alias for `bottomCta`.
 * @param {() => void} [props.onRegister]
 */
export function WhatYouGetBlock({ section, onRegister, ...props }) {
  const config = resolveSection(section, props);
  const cards = Array.isArray(config.cards ?? config.items) ? (config.cards ?? config.items).filter(Boolean) : [];
  const bottomCta = config.bottomCta ?? config.ctaBar;
  const hasIntro = hasText(config.label) || hasText(config.title) || hasText(config.sub);
  if (!hasIntro && cards.length === 0 && !bottomCta) return null;

  return (
    <section id={config.id} className="bg-white px-6 py-10 md:py-24">
      <div className="mx-auto max-w-5xl">
        {hasIntro && (
          <Reveal className="mb-8">
            <SectionIntro label={config.label} title={config.title} sub={config.sub} />
          </Reveal>
        )}

        {cards.length > 0 && (
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {cards.map((card, index) => {
              const colours = cardColours(card);
              if (!card.icon && !hasText(card.title) && !hasText(card.desc)) return null;
              return (
                <Reveal key={`${card.title ?? "benefit"}-${index}`} delay={index * 0.08} className="h-full">
                  <article
                    className="flex h-full flex-col gap-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{ background: colours.background, border: `1.5px solid ${colours.border}` }}
                  >
                    {card.icon && <ConfigIcon icon={card.icon} className="h-8 w-8 text-3xl" />}
                    {hasText(card.title) && <h3 className="text-base font-black leading-snug" style={{ color: colours.accent }}>{card.title}</h3>}
                    {hasText(card.desc) && <p className="text-sm leading-relaxed text-gray-600">{card.desc}</p>}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        <BottomCta content={bottomCta} onRegister={onRegister} />
      </div>
    </section>
  );
}

export default WhatYouGetBlock;
