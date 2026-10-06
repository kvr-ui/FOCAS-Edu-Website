import { createElement, isValidElement } from "react";

export function resolveSection(section, props) {
  return section && typeof section === "object" ? section : props;
}

export function hasText(value) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function textValue(value) {
  if (typeof value === "string" || typeof value === "number") return value;
  return value?.text ?? value?.label ?? "";
}

export function ConfigIcon({ icon, className = "", decorative = true }) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;

  const isComponent =
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null && "$$typeof" in icon);

  if (isComponent) {
    return createElement(icon, {
      className,
      "aria-hidden": decorative ? true : undefined,
    });
  }

  return (
    <span className={className} aria-hidden={decorative ? true : undefined}>
      {String(icon)}
    </span>
  );
}

export function SectionIntro({ label, title, sub, align = "center" }) {
  if (!hasText(label) && !hasText(title) && !hasText(sub)) return null;

  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {hasText(label) && (
        <span
          className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{
            background: "color-mix(in srgb, var(--lp-accent) 12%, white)",
            color: "var(--lp-accent)",
          }}
        >
          {label}
        </span>
      )}
      {hasText(title) && (
        <h2 className="whitespace-pre-line text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
          {title}
        </h2>
      )}
      {hasText(sub) && (
        <p className={`mt-3 text-lg leading-relaxed text-gray-500 ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
