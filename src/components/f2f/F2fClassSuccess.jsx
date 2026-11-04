import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Check, MapPin, MessageCircle, Navigation, Phone, PhoneCall } from "lucide-react";
import { FONTS_HREF, LEXEND, MANROPE, PHONE_DISPLAY, PHONE_TEL } from "@/components/counselling/Counselling";
import { F2F_CONVERSION_KEY, F2F_LEAD_KEY, PRIVACY_HREF, TERMS_HREF } from "./F2fClass";

/**
 * /f2f-class-success — thank-you page at the end of the /f2f-class form.
 *
 * Lead fires on form submit; this page fires Meta CompleteRegistration and the
 * GA / GTM events, so ads can optimise on this URL. They only fire when
 * the form just set F2F_CONVERSION_KEY — a refresh or a direct visit isn't
 * counted. PageView is sent by the router (App.jsx).
 */

const PRODUCT = "F2F Class Mylapore";
// No money changes hands on this form, so the conversion carries no revenue —
// a real fee here would inflate ROAS in Ads Manager.
const PURCHASE_VALUE = 0;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "TSV Kovil Street, Alamelumanga Puram, Mylapore, Chennai 600004"
)}`;

const STEPS = [
  { icon: PhoneCall, text: "Our admissions team will call you shortly with the batch details." },
  { icon: MapPin, text: "Call us to book an appointment to visit us at the FOCAS Mylapore centre." },
  { icon: CalendarDays, text: "Batch starts December 16, 2026 — only 10 students per tutor." },
  { icon: MessageCircle, text: "Keep WhatsApp handy — we'll share the details there." },
];

export default function F2fClassSuccess() {
  const location = useLocation();
  const [lead] = useState(() => {
    if (location.state) return location.state;
    try {
      return JSON.parse(sessionStorage.getItem(F2F_LEAD_KEY) || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONTS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONTS_HREF;
      document.head.appendChild(link);
    }
    document.title = "Thank you – FOCAS Edu";

    let converted = false;
    try {
      converted = sessionStorage.getItem(F2F_CONVERSION_KEY) === "1";
      sessionStorage.removeItem(F2F_CONVERSION_KEY);
    } catch {
      /* storage blocked — skip conversions rather than risk double counting */
    }
    if (!converted) return;

    const eventId = lead?.eventId;
    // Meta conversion for this flow is CompleteRegistration only (no Purchase —
    // nothing is paid on the F2F form).
    window.fbq?.(
      "track",
      "CompleteRegistration",
      {
        content_name: PRODUCT,
        content_category: "F2F Class",
        content_ids: [lead?.group || "F2F"],
        currency: "INR",
        value: PURCHASE_VALUE,
      },
      eventId ? { eventID: `${eventId}-registration` } : undefined
    );
    window.gtag?.("event", "purchase", {
      transaction_id: eventId || `f2f-${Date.now()}`,
      currency: "INR",
      value: PURCHASE_VALUE,
      items: [{ item_name: PRODUCT, item_variant: lead?.group || "" }],
    });
    window.dataLayer?.push({
      event: "f2f_class_success",
      page_path: "/f2f-class-success",
      group: lead?.group || "",
      ca_status: lead?.caStatus || "",
      city: lead?.city || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#e8f8f2] to-white px-4 py-10 text-[#1c232d]"
      style={MANROPE}
    >
      <div className="w-full max-w-md rounded-[20px] bg-white p-7 text-center shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.05)] sm:p-10">
        <img src="/fs-assets/logo.webp" alt="FOCAS Edu" className="mx-auto mb-6 h-10 w-auto" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1D9E75] shadow-[0_8px_20px_-6px_rgba(29,158,117,0.6)]">
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl" style={LEXEND}>
          {lead?.firstName ? `Thank you, ${lead.firstName}!` : "Thank you!"}
        </h1>
        <p className="mt-2 text-sm text-[#696969]">
          Your seat request for the Face to Face Regular Batch (CA Inter Sep 2027) is received.
        </p>

        {lead?.group && (
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-[#e8f8f2] px-3 py-1 text-[#0f6e56]">{lead.group}</span>
            {lead.city && <span className="rounded-full bg-[#fff4e0] px-3 py-1 text-[#9a5b00]">{lead.city}</span>}
          </div>
        )}

        <ul className="mt-7 space-y-3 text-left">
          {STEPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl bg-[#e8f8f2] p-4">
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1D9E75]" />
              <span className="text-sm font-medium">{text}</span>
            </li>
          ))}
        </ul>

        <a
          href={PHONE_TEL}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#1D9E75] to-[#0f6e56] py-3 font-medium text-white transition-all duration-300 hover:from-[#0f6e56] hover:to-[#1D9E75]"
        >
          <Phone className="h-4 w-4" />
          Call us now: {PHONE_DISPLAY}
        </a>
        <a
          href={MAP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#1D9E75] py-3 font-medium text-[#0f6e56] transition hover:bg-[#e8f8f2]"
        >
          <Navigation className="h-4 w-4" />
          Directions to FOCAS Mylapore
        </a>
        <Link
          to="/f2f-class"
          className="mt-5 inline-block text-sm font-semibold text-[#0f6e56] underline-offset-4 hover:underline"
        >
          ← Back to the page
        </Link>
        <p className="mt-6 text-xs text-black/40">
          <a href={TERMS_HREF} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Terms &amp; Conditions
          </a>{" "}
          ·{" "}
          <a href={PRIVACY_HREF} className="hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
