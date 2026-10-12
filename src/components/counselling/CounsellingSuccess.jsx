import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Check, MessageCircle, Phone, PhoneCall } from "lucide-react";
import { CONVERSION_KEY, FONTS_HREF, LEXEND, MANROPE, PHONE_DISPLAY, PHONE_TEL } from "./Counselling";
import { SLOT_KEY } from "./CounsellingBook";

/**
 * /counselling-success — thank-you page at the end of the /counselling flow
 * (form → /counselling/book → paid or skipped → here).
 *
 * Lead fires on form submit and Purchase on the book page; this page fires
 * Meta CompleteRegistration + the GTM dataLayer event, so ads can also optimise
 * on this URL. They only fire when the flow just set CONVERSION_KEY — a refresh
 * or a direct visit isn't counted. PageView is sent by the router (App.jsx).
 */

const stepsFor = (booking) =>
  booking
    ? [
        { icon: Calendar, text: `Your counselling call is booked for ${booking.slot}.` },
        { icon: MessageCircle, text: "You'll get a confirmation on WhatsApp shortly." },
        { icon: PhoneCall, text: "A FOCAS mentor will call you at the booked time." },
      ]
    : [
        { icon: Check, text: "We've received your details." },
        { icon: PhoneCall, text: "Our counselling team will call you within one working day to book your slot." },
        { icon: MessageCircle, text: "Keep WhatsApp handy — we'll share the details there." },
      ];

export default function CounsellingSuccess() {
  const [booking] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SLOT_KEY) || "null");
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
      converted = sessionStorage.getItem(CONVERSION_KEY) === "1";
      sessionStorage.removeItem(CONVERSION_KEY);
    } catch {
      /* storage blocked — skip conversions rather than risk double counting */
    }
    if (!converted) return;

    window.fbq?.("track", "CompleteRegistration", { content_name: "Counselling Call", content_category: "Counselling" });
    window.dataLayer?.push({ event: "counselling_success", page_path: "/counselling-success", paid: Boolean(booking) });
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
          {booking ? "You're all set!" : "Thank you!"}
        </h1>
        <p className="mt-2 text-sm text-[#696969]">
          The first step towards clearing CA Inter in your last attempt is done.
        </p>

        <ul className="mt-7 space-y-3 text-left">
          {stepsFor(booking).map(({ icon: Icon, text }) => (
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
        <Link
          to="/counselling"
          className="mt-4 inline-block text-sm font-semibold text-[#0f6e56] underline-offset-4 hover:underline"
        >
          ← Back to the page
        </Link>
      </div>
    </div>
  );
}
