import React, { Suspense, useMemo } from "react";
import { Reveal } from "../ui";

/**
 * Human-authored escape hatch that lazy-loads a one-off section component.
 * @param {{ section?: { id?: string, component?: () => Promise<{ default: React.ComponentType }>, props?: object, fallback?: React.ReactNode }, id?: string, component?: () => Promise<{ default: React.ComponentType }>, props?: object, fallback?: React.ReactNode, onRegister?: () => void }} props
 */
export function Custom({ section, id, component, fallback, onRegister, ...props }) {
  const config = section ?? { id, component, fallback, ...props };
  const loader = config.component ?? component;
  const LazyComponent = useMemo(() => (typeof loader === "function" ? React.lazy(loader) : null), [loader]);
  if (!LazyComponent) return null;

  return (
    <section id={config.id ?? id}>
      <Reveal>
        <Suspense
          fallback={config.fallback ?? fallback ?? (
            <div className="flex min-h-32 items-center justify-center text-sm font-semibold" style={{ color: "var(--lp-accent)" }}>
              Loading…
            </div>
          )}
        >
          <LazyComponent {...(config.props ?? {})} onRegister={onRegister} />
        </Suspense>
      </Reveal>
    </section>
  );
}

export default Custom;
