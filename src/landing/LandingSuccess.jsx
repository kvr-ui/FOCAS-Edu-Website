import { useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { LandingTheme } from "./ui";
import { useVariant } from "./useVariant";

export const LEAD_TRACKED_KEY = "focas_lead_tracked";

/**
 * Consume the "Lead already counted" flag set by the form's tracking step.
 *
 * The landing form fires Pixel `Lead` (and the dashboard lead) itself, before
 * navigating here, so this page never sends a Lead: with the flag set it was
 * already counted, and without it (direct visit / refresh) there was no
 * submission to count. The flag is cleared so it can't suppress a genuine
 * Lead on a legacy success page later in the session.
 */
export function consumeLeadTrackedFlag(storage) {
  try {
    const s = storage ?? window.sessionStorage;
    const tracked = s.getItem(LEAD_TRACKED_KEY) === "1";
    s.removeItem(LEAD_TRACKED_KEY);
    return tracked;
  } catch {
    return false;
  }
}

function normalizeStep(step) {
  if (step == null) return null;
  if (typeof step === "string" || typeof step === "number") return { text: String(step) };
  if (typeof step === "object") {
    return { title: step.title ?? step.heading, text: step.text ?? step.body ?? step.description, icon: step.icon };
  }
  return null;
}

function whatsappLink(group) {
  if (!group) return null;
  if (typeof group === "string") return { url: group, label: "Join the WhatsApp group" };
  if (typeof group === "object" && group.url) return { url: group.url, label: group.label || "Join the WhatsApp group" };
  return null;
}

/**
 * Thank-you page at /<slug>-success, rendered from `config.success`
 * ({ heading, message, steps, whatsappGroup }).
 */
export default function LandingSuccess({ config }) {
  const { variant } = useVariant(config);
  const success = config.success || {};
  const steps = (Array.isArray(success.steps) ? success.steps : []).map(normalizeStep).filter(Boolean);
  const whatsapp = whatsappLink(success.whatsappGroup);
  const title = config.meta?.title;

  useEffect(() => {
    if (title) document.title = title;
    consumeLeadTrackedFlag();
  }, [title]);

  return (
    <LandingTheme theme={config.theme}>
      <main
        data-variant={variant ?? undefined}
        className="flex min-h-screen items-center justify-center px-6 py-12"
        style={{
          background:
            "linear-gradient(160deg,color-mix(in srgb,var(--lp-accent) 12%,white) 0%,white 50%,color-mix(in srgb,var(--lp-accent) 12%,white) 100%)",
        }}
      >
        <div className="w-full max-w-md text-center">
          <div
            className="rounded-2xl border-2 bg-white p-8 shadow-lg sm:p-10"
            style={{ borderColor: "color-mix(in srgb, var(--lp-accent) 20%, white)" }}
          >
            <div className="mb-6 text-6xl" aria-hidden>
              🎉
            </div>
            <h1 className="mb-3 text-3xl font-black text-gray-900">{success.heading}</h1>
            {success.message && (
              <p className="mb-8 whitespace-pre-line text-lg leading-relaxed text-gray-600">{success.message}</p>
            )}

            {steps.length > 0 && (
              <ol className="mb-8 flex flex-col gap-4 text-left">
                {steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 rounded-2xl border p-5"
                    style={{
                      background: "color-mix(in srgb, var(--lp-accent) 6%, white)",
                      borderColor: "color-mix(in srgb, var(--lp-accent) 25%, white)",
                    }}
                  >
                    <span
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
                      style={{ background: "var(--lp-accent)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      {step.title && (
                        <p className="mb-1 text-sm font-black text-gray-900">
                          {step.icon && <span aria-hidden>{step.icon} </span>}
                          {step.title}
                        </p>
                      )}
                      {step.text && <p className="text-sm leading-relaxed text-gray-600">{step.text}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {whatsapp && (
              <a
                href={whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                style={{ background: "#25d366" }}
              >
                <FaWhatsapp aria-hidden /> {whatsapp.label}
              </a>
            )}

            <a
              href="/"
              className="inline-block rounded-full px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: "var(--lp-accent)" }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    </LandingTheme>
  );
}
