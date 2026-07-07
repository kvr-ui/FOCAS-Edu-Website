import { useEffect } from "react";

export default function ManualSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}
    >
      <div className="max-w-md w-full text-center">
        <div className="rounded-2xl p-10 bg-white border-2 border-green-100 shadow-lg">

          <div className="text-6xl mb-6">🎉</div>

          <h1 className="text-3xl font-black text-gray-900 mb-3">You're all set!</h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            Payment received. Here's what happens next.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            You'll receive a confirmation on WhatsApp shortly.
          </p>

          {/* What happens next */}
          <div className="flex flex-col gap-4 mb-8 text-left">

            {/* Step 1 */}
            <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 font-black text-white"
                style={{ background: "#1D9E75" }}
              >
                1
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-1">📞 Mentor will call you</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A CA mentor will reach out within <span className="font-black text-gray-900">24 hours</span> to schedule your personalized 1:1 tutor session.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 font-black text-white"
                style={{ background: "#0ea5e9" }}
              >
                2
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-1">📦 Manual will be shipped</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your physical study manual will be dispatched to the address you provided. Expect delivery within <span className="font-black text-gray-900">3–5 working days</span>.
                </p>
              </div>
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
            Redirecting in 8 seconds…
          </p>

        </div>
      </div>
    </div>
  );
}