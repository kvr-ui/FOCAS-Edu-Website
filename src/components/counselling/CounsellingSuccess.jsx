import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, MessageCircle, Phone, PhoneCall } from "lucide-react";
import { CONVERSION_KEY, FONTS_HREF, LEXEND, MANROPE, PHONE_DISPLAY, PHONE_TEL } from "./Counselling";

/**
 * /counselling-success — thank-you page after a /counselling lead form submit.
 *
 * Ad conversions (Meta Lead + CompleteRegistration, GA4 generate_lead, GTM
 * dataLayer event) fire here, so ads can also optimise on this URL. They only
 * fire when the form just set CONVERSION_KEY — a refresh or a direct visit to
 * this URL isn't counted as a lead. PageView is sent by the router (App.jsx).
 */

const STEPS = [
  { icon: Check, text: "We've received your details and reserved your counselling slot." },
  { icon: PhoneCall, text: "Our counselling team will call you within one working day." },
  { icon: MessageCircle, text: "Keep WhatsApp handy — we'll share the Last Attempt Community access there." },
];

export default function CounsellingSuccess() {
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
      converted = sessionStorage.getItem(CONVERSION_KEY) === "1";
      sessionStorage.removeItem(CONVERSION_KEY);
    } catch {
      /* storage blocked — skip conversions rather than risk double counting */
    }
    if (!converted) return;

    const content = { content_name: "Last Attempt Community Starter Kit", content_category: "Counselling" };
    window.fbq?.("track", "Lead", content);
    window.fbq?.("track", "CompleteRegistration", content);
    window.gtag?.("event", "generate_lead", { event_category: "counselling", event_label: content.content_name });
    window.dataLayer?.push({ event: "counselling_success", page_path: "/counselling-success" });
  }, []);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10 text-[#1c232d]"
      style={MANROPE}
    >
      <div className="w-full max-w-md rounded-[20px] bg-white p-7 text-center shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.05)] sm:p-10">
        <img src="/fs-assets/logo.webp" alt="FOCAS Edu" className="mx-auto mb-6 h-10 w-auto" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffbd3b] shadow-[0_8px_20px_-6px_rgba(255,189,59,0.7)]">
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl" style={LEXEND}>
          Thank you! Your slot is reserved.
        </h1>
        <p className="mt-2 text-sm text-[#696969]">
          The first step towards clearing CA Inter in your last attempt is done.
        </p>

        <ul className="mt-7 space-y-3 text-left">
          {STEPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl bg-[#f7f8fa] p-4">
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d99a1c]" />
              <span className="text-sm font-medium">{text}</span>
            </li>
          ))}
        </ul>

        <a
          href={PHONE_TEL}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#425673] to-[#1C232D] py-3 font-medium text-white transition-all duration-300 hover:from-[#1C232D] hover:to-[#425673]"
        >
          <Phone className="h-4 w-4" />
          Call us now: {PHONE_DISPLAY}
        </a>
        <Link
          to="/counselling"
          className="mt-4 inline-block text-sm font-semibold text-[#425673] underline-offset-4 hover:underline"
        >
          ← Back to the page
        </Link>
      </div>
    </div>
  );
}
