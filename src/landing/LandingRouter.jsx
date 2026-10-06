import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import LandingPage from "./LandingPage";
import LandingSuccess from "./LandingSuccess";
import { loadConfig as registryLoadConfig } from "./registry";
import { RESERVED_PATHS, validateConfig } from "./schema";

const SUCCESS_SUFFIX = "-success";

/**
 * Map a pathname to a landing route. Only a single segment qualifies
 * (`/<slug>` or `/<slug>-success`, one optional trailing slash); anything
 * else returns `null`. Slugs can never end in "-success" (validator rule), so
 * the suffix unambiguously marks the success page.
 *
 * @returns {{ slug: string, success: boolean } | null}
 */
export function parseLandingPath(pathname) {
  const match = /^\/([^/]+)\/?$/.exec(pathname || "");
  if (!match) return null;
  let segment;
  try {
    segment = decodeURIComponent(match[1]);
  } catch {
    return null;
  }
  if (segment.endsWith(SUCCESS_SUFFIX)) {
    const slug = segment.slice(0, -SUCCESS_SUFFIX.length);
    return slug ? { slug, success: true } : null;
  }
  return { slug: segment, success: false };
}

function DevConfigErrors({ slug, errors }) {
  return (
    <div role="alert" style={{ fontFamily: "ui-monospace, monospace", padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ color: "#b91c1c", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
        Landing page &quot;{slug}&quot; has an invalid config
      </h1>
      <p style={{ marginBottom: 12, color: "#374151" }}>
        Fix <code>src/landing-pages/{slug}.js</code> (this screen only shows in dev):
      </p>
      <ul style={{ listStyle: "disc", paddingLeft: 24, color: "#111827" }}>
        {errors.map((e) => (
          <li key={e} style={{ marginBottom: 4 }}>
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Catch-all route: renders `/<slug>` and `/<slug>-success` from
 * `src/landing-pages/<slug>.js`, or NotFound.
 *
 * @param {{ loadConfig?: (slug: string) => Promise<object|null>, dev?: boolean }} props
 *   both injectable for tests.
 */
export default function LandingRouter({ loadConfig = registryLoadConfig, dev = import.meta.env.DEV }) {
  const { pathname } = useLocation();
  const route = parseLandingPath(pathname);
  const slug = route?.slug ?? null;
  const [state, setState] = useState({ slug: null, status: "loading" });

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setState({ slug, status: "loading" });
    Promise.resolve()
      .then(() => loadConfig(slug))
      .then((config) => {
        if (cancelled) return;
        if (!config) return setState({ slug, status: "missing" });
        if (dev) {
          const errors = validateConfig(config, { reservedPaths: RESERVED_PATHS, filename: `${slug}.js` });
          if (errors.length) return setState({ slug, status: "invalid", errors });
        }
        setState({ slug, status: "ready", config });
      })
      .catch((error) => {
        if (cancelled) return;
        if (dev) {
          setState({ slug, status: "invalid", errors: [`import: failed to load config: ${error?.message ?? error}`] });
        } else {
          setState({ slug, status: "missing" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, loadConfig, dev]);

  if (!route) return <NotFound />;
  // Results for a previous slug are stale until the effect above catches up.
  if (state.slug !== slug || state.status === "loading") return null;
  if (state.status === "missing") return <NotFound />;
  if (state.status === "invalid") return <DevConfigErrors slug={slug} errors={state.errors} />;

  return route.success ? (
    <LandingSuccess key={`${slug}-success`} config={state.config} />
  ) : (
    <LandingPage key={slug} config={state.config} />
  );
}
