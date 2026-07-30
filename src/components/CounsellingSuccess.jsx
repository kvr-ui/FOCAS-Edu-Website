import { useEffect } from "react";

const GREEN = "#1D9E75";

export default function CounsellingSuccess() {
  // Conversion tracking — this page is only ever reached after a successful
  // slot booking, so it doubles as the conversion event for GTM / GA4 / Meta.
  useEffect(() => {
    let booking = {};
    try {
      booking = JSON.parse(sessionStorage.getItem("focas_counselling") || "{}");
    } catch {
      /* sessionStorage may be unavailable (private mode) — non-fatal */
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "counselling_booking_success",
      page_path: "/counselling-success",
      page_title: "Free Counselling — Slot Booked",
      ca_level: booking.caStatus,
      ca_route: booking.route,
      student_type: booking.studentType,
      attempt: booking.attempt,
      value: 0,
      currency: "INR",
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "counselling_booking_success", {
        event_category: "conversion",
        event_label: "Free 1:1 Counselling — 2nd August",
        value: 0,
      });
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "CompleteRegistration", {
        content_name: "Free Counselling Session 2026",
        content_type: "product",
        currency: "INR",
        value: 0,
      });
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}
    >
      <div className="max-w-md w-full text-center">
        <div className="rounded-2xl p-10 md:p-12 bg-white border-2 border-green-100 shadow-lg">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Your Free Slot is Booked!</h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            Thank you for registering for the free 1:1 mentor counselling session.
          </p>
          <p className="text-gray-500 text-base mb-8">
            Our team will call you shortly to confirm your exact slot timing. No payment is required at any stage.
          </p>

          <div className="space-y-3 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">📅 Date</p>
              <p className="text-lg font-black text-gray-900 mt-1">2nd August, Sunday</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">⏰ Time</p>
              <p className="text-lg font-black text-gray-900 mt-1">10:00 AM – 12:00 PM</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">📍 Venue</p>
              <p className="text-lg font-black text-gray-900 mt-1">Bharathiya Vidhya Bhavan, Mylapore, Chennai</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://wa.me/916383514285"
              target="_blank"
              rel="noopener"
              className="inline-block px-8 py-3 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: "#25d366" }}
            >
              💬 Chat with us on WhatsApp
            </a>
            <a
              href="/counselling"
              className="inline-block px-8 py-3 rounded-full font-bold text-base border-2 border-gray-200 text-gray-600 transition-all hover:bg-gray-50"
            >
              Back to the page
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Bring your doubts, study plan or marksheet for sharper guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
