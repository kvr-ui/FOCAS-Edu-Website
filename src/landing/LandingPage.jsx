import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { BLOCKS_A } from "./blocks/blocksA";
import { BLOCKS_B } from "./blocks/blocksB";
import { getExpiryState } from "./expiry";
import LeadForm from "./form/LeadForm";
import { LandingTheme, Navbar, StickyCTA } from "./ui";
import { useVariant } from "./useVariant";

/** Every block type the renderer can draw, keyed by `section.type`. */
export const BLOCKS = Object.freeze({ ...BLOCKS_A, ...BLOCKS_B });

const DEFAULT_LOGO = "/logo.png";
const DEFAULT_CTA = "Register Now";
const DEFAULT_WAITLIST_CTA = "Join the waitlist";
const DEFAULT_CLOSED_MESSAGE = "Registrations for this batch are closed. Join the waitlist and we'll reach out when the next one opens.";

const isAbsoluteUrl = (url) => /^[a-z][a-z\d+.-]*:\/\//i.test(url);

/** Fire the page-view analytics once per mount (StrictMode-safe via ref). */
function usePageView(slug, enabled) {
  const fired = useRef(false);
  useEffect(() => {
    if (!enabled || fired.current) return;
    fired.current = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `${slug}_page_view` });
    if (typeof window.fbq === "function") window.fbq("track", "ViewContent");
  }, [slug, enabled]);
}

/** Leaves the SPA for an absolute redirect URL (react-router can't). */
function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}

function ClosedNotice({ message, cta, onRegister }) {
  return (
    <section id="registrations-closed" className="bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div
        className="mx-auto max-w-2xl rounded-3xl border-2 p-8 text-center shadow-sm sm:p-10"
        style={{ borderColor: "color-mix(in srgb, var(--lp-accent) 30%, white)" }}
      >
        <span
          className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ background: "color-mix(in srgb, var(--lp-accent) 12%, white)", color: "var(--lp-accent)" }}
        >
          Registrations closed
        </span>
        <p className="whitespace-pre-line text-lg leading-relaxed text-gray-700">{message}</p>
        <button
          type="button"
          onClick={onRegister}
          className="mt-8 rounded-full px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background: "var(--lp-accent)" }}
        >
          {cta}
        </button>
      </div>
    </section>
  );
}

/**
 * Renders a landing page from its config: theme, navbar, sections (in order),
 * sticky CTA and the lead-form modal. Handles `?v=` variants and expiry.
 *
 * @param {{ config: object, now?: number }} props `now` is for tests.
 */
export default function LandingPage({ config: baseConfig, now }) {
  const { config, sourceSuffix } = useVariant(baseConfig);
  // Evaluate expiry once per page/config, not on every render.
  const expiry = useMemo(() => getExpiryState(baseConfig, now), [baseConfig, now]);
  const redirect = expiry?.mode === "redirect";
  const waitlist = expiry?.mode === "waitlist";

  const [formOpen, setFormOpen] = useState(false);
  const openForm = useCallback(() => setFormOpen(true), []);
  const closeForm = useCallback(() => setFormOpen(false), []);

  const { slug } = config;
  const title = config.meta?.title;

  useEffect(() => {
    if (!redirect && title) document.title = title;
  }, [redirect, title]);

  usePageView(slug, !redirect);

  // Waitlist mode reuses the closed message as the form's intro unless the
  // config sets its own.
  const form = useMemo(() => {
    const f = config.form || {};
    if (!waitlist || f.waitlistMessage || !expiry.message) return f;
    return { ...f, waitlistMessage: expiry.message };
  }, [config.form, waitlist, expiry]);

  const sections = useMemo(() => {
    const all = Array.isArray(config.sections) ? config.sections : [];
    if (!waitlist) return all;
    // Closed campaign: keep only the hero, with a waitlist CTA.
    const cta = expiry.cta || DEFAULT_WAITLIST_CTA;
    return all
      .filter((s) => s?.type === "hero")
      .map((s) => ({ ...s, cta, mediaCta: s.mediaCta ? cta : s.mediaCta }));
  }, [config.sections, waitlist, expiry]);

  if (redirect) {
    return isAbsoluteUrl(expiry.redirectTo) ? (
      <ExternalRedirect to={expiry.redirectTo} />
    ) : (
      <Navigate replace to={expiry.redirectTo} />
    );
  }

  const ctaLabel = waitlist ? expiry.cta || DEFAULT_WAITLIST_CTA : config.ctaLabel || DEFAULT_CTA;

  return (
    <LandingTheme theme={config.theme}>
      <Navbar
        logo={config.logo || DEFAULT_LOGO}
        logoAlt={config.logoAlt || "FOCAS Edu"}
        nav={waitlist ? [] : config.nav}
        ctaLabel={ctaLabel}
        onRegister={openForm}
      />
      <main>
        {sections.map((section, index) => {
          const Block = section && BLOCKS[section.type];
          if (!Block) {
            if (import.meta.env.DEV) {
              console.error(`[landing:${slug}] sections[${index}]: unknown block type "${section?.type}" — skipped`);
            }
            return null;
          }
          return <Block key={section.id ?? `${section.type}-${index}`} section={section} onRegister={openForm} />;
        })}
        {waitlist && (
          <ClosedNotice message={expiry.message || DEFAULT_CLOSED_MESSAGE} cta={ctaLabel} onRegister={openForm} />
        )}
      </main>
      <StickyCTA label={ctaLabel} onRegister={openForm} />
      {formOpen && (
        <LeadForm
          form={form}
          slug={slug}
          variant={sourceSuffix}
          mode={waitlist ? "waitlist" : "normal"}
          onClose={closeForm}
        />
      )}
    </LandingTheme>
  );
}
