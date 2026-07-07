import { useEffect } from "react";
import logo from "../../../public/logo.png";

const GREEN = "#1D9E75";

export default function WorkoutBatchSuccess() {
  useEffect(() => {
    // Meta Pixel — enrollment completed (conversion)
    if (window.fbq) {
      window.fbq("track", "CompleteRegistration", {
        content_name: "Workout Batch Enrollment",
        content_category: "Workout Batch",
        status: true,
      });
    }
    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "workout_batch_enrollment_success",
        content_name: "Workout Batch Enrollment",
      });
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)",
      }}
    >
      <div className="max-w-md w-full text-center">
        <div className="rounded-3xl p-8 md:p-12 bg-white border-2 border-green-100 shadow-lg">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img src={logo} alt="FOCAS Edu" className="h-8" />
          </div>

          {/* Success Icon */}
          <div className="text-6xl mb-6 animate-bounce">✅</div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Enrollment Successful!
          </h1>

          {/* Subheading */}
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-2">
            Your Last Attempt Workout Batch enrollment is confirmed.
          </p>
          <p className="text-gray-500 text-sm md:text-base mb-8">
            Check your email and WhatsApp for enrollment details, session schedule, and login credentials.
          </p>

          {/* Key Details */}
          <div className="space-y-3 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 md:p-5">
              <p className="text-xs md:text-sm font-semibold text-green-800">🎯 Batch Type</p>
              <p className="text-lg md:text-xl font-black text-gray-900 mt-1">
                CA Intermediate Workout Batch
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 md:p-5">
              <p className="text-xs md:text-sm font-semibold text-green-800">👥 Tutor Ratio</p>
              <p className="text-lg md:text-xl font-black text-gray-900 mt-1">
                1:10 Personalized Attention
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 md:p-5">
              <p className="text-xs md:text-sm font-semibold text-green-800">⏱️ Duration</p>
              <p className="text-lg md:text-xl font-black text-gray-900 mt-1">
                1-Month Full Workout
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 md:p-5">
              <p className="text-xs md:text-sm font-semibold text-green-800">🗣️ Languages</p>
              <p className="text-lg md:text-xl font-black text-gray-900 mt-1">
                English + हिंदी
              </p>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-5 mb-8 border border-green-200">
            <h3 className="font-black text-gray-900 mb-3 text-sm">What Happens Next?</h3>
            <ul className="text-left space-y-2 text-xs md:text-sm text-gray-700">
              <li className="flex gap-2">
                <span style={{ color: GREEN }}>✓</span>
                <span>
                  <strong>Login Access:</strong> WhatsApp + Email with portal credentials
                </span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: GREEN }}>✓</span>
                <span>
                  <strong>Batch Schedule:</strong> Session timings and class links
                </span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: GREEN }}>✓</span>
                <span>
                  <strong>Last Attempt Kit:</strong> Access to question banks, tests, and marathons
                </span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: GREEN }}>✓</span>
                <span>
                  <strong>Community:</strong> Join the Last Attempt Batch community
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <a
            href="/"
            className="inline-block px-8 py-3 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: GREEN }}
          >
            Back to Home
          </a>

          {/* Contact */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">Need immediate help?</p>
            <div className="flex justify-center gap-4">
              <a
                href="https://wa.me/916383514285"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-xs md:text-sm font-bold border-2 transition-all"
                style={{ color: GREEN, borderColor: GREEN }}
              >
                💬 WhatsApp
              </a>
              <a
                href="tel:+916383514285"
                className="px-4 py-2 rounded-full text-xs md:text-sm font-bold border-2 transition-all"
                style={{ color: GREEN, borderColor: GREEN }}
              >
                📞 Call Us
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}