import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Calendar, MessageCircle, Phone } from "lucide-react";

/**
 * Confirmation page for the Foundation for School Students flow (/fs/success).
 * Reached after a verified ₹9 payment on /fs/book, or via "Skip for now".
 */
const FsSuccess = () => {
  const [booking] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("focas_meet_slot") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    globalThis.fbq?.("track", "CompleteRegistration");
  }, []);

  const steps = booking
    ? [
        { icon: Calendar, text: `Your counselling call is booked for ${booking.slot}.` },
        { icon: MessageCircle, text: "You'll get a confirmation on WhatsApp shortly." },
        { icon: Phone, text: "CA K Venkat Ramanan's team will call you and your child at the booked time." },
      ]
    : [
        { icon: MessageCircle, text: "We've received your registration." },
        { icon: Phone, text: "Our team will call you on WhatsApp to explain the program and book a counselling slot." },
      ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7f0] px-4 py-10 font-urbanist text-[#0b3d33]">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-xl ring-1 ring-black/5 sm:p-10">
        <img src="/Focus-logo-tag.png" alt="FOCAS Edu" className="mx-auto mb-6 h-10 w-auto" />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f8f2]">
          <CheckCircle className="h-8 w-8 text-[#0f6e56]" />
        </div>
        <h1 className="font-sora text-2xl font-extrabold sm:text-3xl">
          {booking ? "You're all set!" : "Thank you!"}
        </h1>
        <p className="mt-2 text-base text-[#0b3d33]/70">
          The first step towards CA at 21 is done.
        </p>

        <ul className="mt-7 space-y-3 text-left">
          {steps.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl bg-[#faf7f0] p-4">
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1D9E75]" />
              <span className="text-sm font-medium">{text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-7 text-sm text-gray-500">
          Questions? Call{" "}
          <a href="tel:+916383514285" className="font-semibold text-[#0f6e56]">
            +91 63835 14285
          </a>
        </p>
        <Link to="/fs" className="mt-4 inline-block text-sm font-semibold text-[#0f6e56] underline-offset-4 hover:underline">
          ← Back to the program
        </Link>
      </div>
    </div>
  );
};

export default FsSuccess;
