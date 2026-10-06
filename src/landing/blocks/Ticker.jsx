import { Reveal } from "../ui";
import { hasText, resolveSection, textValue } from "./shared";

/**
 * Continuously scrolling announcement strip.
 * @param {object} props
 * @param {object} [props.section] Alternative to spreading the section as props.
 * @param {string} [props.id] Navigation anchor.
 * @param {Array<string|{text?:string,label?:string}>} [props.items] Marquee items.
 * @param {string|number} [props.duration="22s"] CSS animation duration.
 * @param {() => void} [props.onRegister] Accepted for the common block interface.
 */
export function TickerBlock({ section, ...props }) {
  const config = resolveSection(section, props);
  const items = Array.isArray(config.items)
    ? config.items.map(textValue).filter(hasText)
    : [];
  if (items.length === 0) return null;

  const duration =
    typeof config.duration === "number" ? `${config.duration}s` : config.duration || "22s";
  const repeated = [...items, ...items];

  return (
    <section id={config.id} className="overflow-hidden" style={{ background: "var(--lp-accent)" }}>
      <Reveal>
        <div
          className="flex w-max py-3 motion-reduce:transform-none motion-reduce:animate-none"
          style={{ animation: `ticker ${duration} linear infinite` }}
        >
          {repeated.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-2 whitespace-nowrap px-6 text-sm font-bold text-white"
              aria-hidden={index >= items.length ? true : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default TickerBlock;
