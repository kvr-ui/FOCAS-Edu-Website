import { useEffect } from "react";

export default function RtiSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}>
      <div className="max-w-md w-full text-center">
        <div className="rounded-2xl p-12 bg-white border-2 border-green-100 shadow-lg">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Registration Successful!</h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            Your payment has been processed successfully.
          </p>
          <p className="text-gray-500 text-base mb-8">
            You'll receive a confirmation email and WhatsApp message shortly with your registration details and QR code.
          </p>

          <div className="space-y-3 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">📅 Event Date</p>
              <p className="text-lg font-black text-gray-900 mt-1">2nd August, Sunday</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">📍 Venue</p>
              <p className="text-lg font-black text-gray-900 mt-1">Bharathiya Vidhya Bhavan, Mylapore, Chennai</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">⏰ Time</p>
              <p className="text-lg font-black text-gray-900 mt-1">10:00 AM – 6:00 PM</p>
            </div>
          </div>

          <a
            href="/"
            className="inline-block px-8 py-3 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "#1D9E75" }}
          >
            Back to Home
          </a>

          <p className="text-xs text-gray-400 mt-6">
            Redirecting in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}