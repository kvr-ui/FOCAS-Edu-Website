import { Fragment } from "react";
import { Reveal } from "../ui";
import { hasText, resolveSection, textValue } from "./shared";

function Badge({ badge }) {
  if (!badge) return null;
  const text = textValue(badge);
  const emphasis = typeof badge === "object" ? badge.emphasis : undefined;
  const colour = typeof badge === "object" ? badge.color ?? badge.colour : undefined;
  if (!hasText(text) && !hasText(emphasis)) return null;

  return (
    <div
      className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
      style={{
        background: badge.background ?? `color-mix(in srgb, ${colour ?? "var(--lp-accent-2)"} 9%, white)`,
        borderColor: badge.border ?? `color-mix(in srgb, ${colour ?? "var(--lp-accent-2)"} 30%, white)`,
        color: colour ?? "var(--lp-accent-2)",
      }}
    >
      <span
        className="h-2 w-2 flex-none rounded-full"
        style={{ background: colour ?? "var(--lp-accent-2)", animation: "ping 1.4s ease infinite" }}
      />
      <span>
        {text}
        {hasText(emphasis) && <strong className={hasText(text) ? "ml-1" : ""}>{emphasis}</strong>}
      </span>
    </div>
  );
}

function HighlightedHeadline({ headline, highlight, gradientFrom, gradientTo }) {
  if (!headline && !highlight) return null;

  const gradient = (text, key = "highlight") => (
    <span
      key={key}
      className="bg-clip-text text-transparent"
      style={{ backgroundImage: `linear-gradient(135deg,${gradientFrom ?? "var(--lp-accent)"},${gradientTo ?? "var(--lp-accent-2)"})` }}
    >
      {text}
    </span>
  );

  if (Array.isArray(headline)) {
    return headline.map((part, index) => {
      if (typeof part === "object" && part !== null) {
        const content = part.text ?? "";
        return (
          <Fragment key={`${content}-${index}`}>
            {part.highlight ? gradient(content, index) : content}
            {part.break && <br />}
          </Fragment>
        );
      }
      return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
    });
  }

  if (headline && typeof headline === "object") {
    return (
      <>
        {headline.before}
        {headline.before && headline.highlight && " "}
        {headline.highlight && gradient(headline.highlight)}
        {headline.after && <>{" "}{headline.after}</>}
      </>
    );
  }

  const plainHeadline = headline == null ? "" : String(headline);
  if (!hasText(highlight)) return plainHeadline;

  const matchAt = plainHeadline.indexOf(String(highlight));
  if (matchAt < 0) {
    return (
      <>
        {plainHeadline}
        {plainHeadline && " "}
        {gradient(highlight)}
      </>
    );
  }

  return (
    <>
      {plainHeadline.slice(0, matchAt)}
      {gradient(highlight)}
      {plainHeadline.slice(matchAt + String(highlight).length)}
    </>
  );
}

function normalizePriceRows(priceTable) {
  if (!priceTable) return [];
  if (Array.isArray(priceTable)) {
    if (priceTable.every((entry) => !Array.isArray(entry) && typeof entry === "object")) {
      return [
        priceTable.map((entry) => entry.label ?? entry.title ?? ""),
        priceTable.map((entry) => entry.value ?? ""),
      ];
    }
    return priceTable.map((row) => (Array.isArray(row) ? row : [row]));
  }

  if (Array.isArray(priceTable.rows)) return normalizePriceRows(priceTable.rows);
  const headers = Array.isArray(priceTable.headers) ? priceTable.headers : [];
  const values = Array.isArray(priceTable.values) ? priceTable.values : [];
  return [headers, values].filter((row) => row.length > 0);
}

function PriceTable({ priceTable }) {
  const rows = normalizePriceRows(priceTable);
  if (rows.length === 0) return null;
  const columns = Math.max(...rows.map((row) => row.length), 1);

  return (
    <div className="inline-grid overflow-hidden rounded-2xl border border-gray-200 text-sm font-bold shadow-sm" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {rows.flatMap((row, rowIndex) =>
        Array.from({ length: columns }, (_, columnIndex) => {
          const value = row[columnIndex];
          if (!hasText(value)) return <span key={`${rowIndex}-${columnIndex}`} aria-hidden />;
          return (
            <span
              key={`${rowIndex}-${columnIndex}`}
              className={`px-4 py-3 ${rowIndex === 0 ? "bg-gray-50 text-gray-500" : "bg-white text-gray-900"}`}
              style={{
                borderRight: columnIndex < columns - 1 ? "1px solid rgb(229 231 235)" : undefined,
                borderBottom: rowIndex < rows.length - 1 ? "1px solid rgb(229 231 235)" : undefined,
              }}
            >
              {value}
            </span>
          );
        }),
      )}
    </div>
  );
}

function MediaPanel({ media, mediaCta, onRegister, mobile = false }) {
  if (!media) return null;
  const kind = media.kind;
  const src = media.src;
  if (!hasText(src)) return null;

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl shadow-2xl ${mobile ? "mb-5 lg:hidden" : "absolute inset-0"}`}>
      {kind === "video" ? (
        <video
          src={src}
          poster={media.poster}
          autoPlay={media.autoPlay !== false}
          muted={media.muted !== false}
          loop={media.loop !== false}
          playsInline
          controls={media.controls === true}
          className={mobile ? "w-full object-cover" : "absolute inset-0 h-full w-full object-cover"}
          style={mobile ? { height: media.mobileHeight ?? "calc(100dvh - 380px)", minHeight: "200px" } : undefined}
        />
      ) : (
        <img
          src={src}
          alt={media.alt ?? ""}
          className={mobile ? "w-full object-cover" : "absolute inset-0 h-full w-full object-cover"}
          style={mobile ? { maxHeight: media.mobileHeight ?? "520px" } : undefined}
        />
      )}
      {media.overlay !== false && <div className="pointer-events-none absolute inset-0 bg-black/20" />}
      {hasText(mediaCta) && (
        <button
          type="button"
          onClick={() => onRegister?.()}
          className="absolute bottom-0 left-0 right-0 z-10 py-3 text-center text-sm font-black uppercase tracking-widest text-white transition-[filter] hover:brightness-90 lg:py-4"
          style={{ background: media.ctaColor ?? "var(--lp-accent-2)" }}
        >
          {mediaCta}
        </button>
      )}
    </div>
  );
}

function mediaFromConfig(config) {
  if (config.media && typeof config.media === "object") {
    return { ...config.media, kind: config.media.type ?? config.media.kind ?? (config.media.video ? "video" : "image"), src: config.media.src ?? config.media.video ?? config.media.image };
  }
  if (config.video) {
    return typeof config.video === "string"
      ? { kind: "video", src: config.video }
      : { kind: "video", ...config.video, src: config.video.src ?? config.video.url };
  }
  if (config.image) {
    return typeof config.image === "string"
      ? { kind: "image", src: config.image, alt: config.imageAlt }
      : { kind: "image", ...config.image, src: config.image.src ?? config.image.url };
  }
  return null;
}

/**
 * Config-driven landing hero.
 * @param {object} props
 * @param {object} [props.section] Alternative to spreading the section as props.
 * @param {string} [props.id] Navigation anchor.
 * @param {string|{text:string,emphasis?:string,color?:string,background?:string,border?:string}} [props.badge]
 * @param {string|Array<string|{text:string,highlight?:boolean,break?:boolean}>|{before?:string,highlight?:string,after?:string}} [props.headline]
 * @param {string} [props.highlight] Substring of a string headline to render as a gradient.
 * @param {string} [props.highlightFrom] Optional gradient start; defaults to `var(--lp-accent)`.
 * @param {string} [props.highlightTo] Optional gradient end; defaults to `var(--lp-accent-2)`.
 * @param {string} [props.sub] Supporting copy.
 * @param {string} [props.emphasis] Accent-coloured supporting line.
 * @param {Array|{headers?:string[],values?:string[],rows?:Array}} [props.priceTable]
 * @param {string|{label:string}} [props.cta] Primary registration button.
 * @param {{value?:string,stat?:string,label?:string}[]} [props.stats]
 * @param {string|object} [props.image] Image URL or `{src,alt,overlay}`.
 * @param {string|object} [props.video] Bunny HLS URL or `{src,poster,controls,autoPlay,muted,loop}`.
 * @param {{type?:"image"|"video",src:string,alt?:string,poster?:string,ctaColor?:string}} [props.media]
 * @param {string} [props.mediaCta] Optional CTA over the media.
 * @param {() => void} [props.onRegister]
 */
export function HeroBlock({ section, onRegister, ...props }) {
  const config = resolveSection(section, props);
  const {
    id,
    badge,
    headline,
    highlight,
    sub,
    emphasis,
    priceTable,
    stats,
    mediaCta,
  } = config;
  const cta = typeof config.cta === "object" ? config.cta?.label : config.cta;
  const media = mediaFromConfig(config);
  const statItems = Array.isArray(stats) ? stats.filter(Boolean) : [];
  const hasContent =
    badge || headline || highlight || sub || emphasis || priceTable || cta || statItems.length > 0 || media;
  if (!hasContent) return null;

  return (
    <section
      id={id}
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pb-16 pt-16 lg:flex-row lg:px-16 lg:pt-24"
      style={{ background: "linear-gradient(160deg,color-mix(in srgb,var(--lp-accent) 12%,white) 0%,white 50%,color-mix(in srgb,var(--lp-accent) 12%,white) 100%)" }}
    >
      <Reveal className="flex w-full max-w-2xl flex-col text-center lg:text-left">
        {badge && <div className="mb-7 hidden self-start lg:block"><Badge badge={badge} /></div>}

        {(headline || highlight) && (
          <h1 className="mb-3 mt-4 whitespace-pre-line text-3xl font-black leading-[1.1] tracking-tight text-gray-900 md:text-5xl lg:mt-0 lg:text-6xl">
            <HighlightedHeadline
              headline={headline}
              highlight={highlight}
              gradientFrom={config.highlightFrom}
              gradientTo={config.highlightTo}
            />
          </h1>
        )}
        {hasText(sub) && <p className="mx-auto mb-2 max-w-lg whitespace-pre-line text-base leading-relaxed text-gray-500 md:text-lg lg:mx-0">{sub}</p>}
        {hasText(emphasis) && <p className="mx-auto mb-4 max-w-lg text-base font-bold md:text-lg lg:mx-0" style={{ color: "var(--lp-accent)" }}>{emphasis}</p>}

        {badge && <div className="mb-5 w-full lg:hidden"><Badge badge={badge} /></div>}
        <MediaPanel media={media} mediaCta={mediaCta} onRegister={onRegister} mobile />

        {priceTable && <div className="mb-5 flex flex-wrap justify-center gap-3 lg:justify-start"><PriceTable priceTable={priceTable} /></div>}
        {hasText(cta) && (
          <div className="mb-5 flex flex-wrap justify-center gap-3 lg:justify-start">
            <button
              type="button"
              onClick={() => onRegister?.()}
              className="flex items-center gap-2 rounded-full px-7 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: "var(--lp-accent)" }}
            >
              {cta} <span aria-hidden>→</span>
            </button>
          </div>
        )}
        {statItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {statItems.map((item, index) => (
              <div key={`${item.label ?? "stat"}-${index}`} className="min-w-[120px] rounded-2xl border bg-white px-5 py-3 text-center shadow-sm" style={{ borderColor: "color-mix(in srgb,var(--lp-accent) 20%,white)" }}>
                {hasText(item.value ?? item.stat) && <div className="text-2xl font-black" style={{ color: "var(--lp-accent)" }}>{item.value ?? item.stat}</div>}
                {hasText(item.label) && <div className="mt-1 text-xs font-semibold text-gray-500">{item.label}</div>}
              </div>
            ))}
          </div>
        )}
      </Reveal>

      {media && (
        <Reveal delay={0.12} className="relative hidden h-[560px] w-full max-w-lg flex-shrink-0 lg:block lg:w-[520px] xl:w-[580px]">
          <MediaPanel media={media} mediaCta={mediaCta} onRegister={onRegister} />
        </Reveal>
      )}
    </section>
  );
}

export default HeroBlock;
