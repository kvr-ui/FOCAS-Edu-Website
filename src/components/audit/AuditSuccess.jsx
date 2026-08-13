import { useEffect } from "react";

export default function AuditSuccess() {
  useEffect(() => {
    // Meta Pixel
    if (window.fbq) {
      window.fbq("track", "CompleteRegistration", {
        content_name: "7-Day Audit Crash Tutoring",
        content_category: "Audit Crash Tutoring",
        status: true,
      });
    }
    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "audit_crash_registration_success",
        content_name: "7-Day Audit Crash Tutoring",
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}>
      <div className="max-w-md w-full text-center">
        <div className="rounded-2xl p-10 bg-white border-2 border-green-100 shadow-lg">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Registration Successful!</h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            Your ₹99 refundable deposit has been received.
          </p>
          <p className="text-gray-500 text-base mb-8">
            You'll receive the session joining details shortly on WhatsApp and email.
          </p>

          <div className="space-y-3 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">📅 Programme Dates</p>
              <p className="text-lg font-black text-gray-900 mt-1">17th – 23rd August 2026</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">🕗 Time</p>
              <p className="text-lg font-black text-gray-900 mt-1">Everyday · 8 PM to 10 PM</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">💻 Mode</p>
              <p className="text-lg font-black text-gray-900 mt-1">Live Online Sessions</p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm font-bold text-orange-800 mb-1">💸 Don't forget the ₹99 Challenge</p>
            <p className="text-xs text-orange-700 leading-relaxed">
              Attend 90%+ of the session hours with your camera ON, and request your refund before 30th August 2026 to get your full deposit back.
            </p>
          </div>

          <a
            href="/"
            className="inline-block px-8 py-3 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "#1D9E75" }}
          >
            Back to Home
          </a>

          <p className="text-xs text-gray-400 mt-6">
            Redirecting in 8 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
