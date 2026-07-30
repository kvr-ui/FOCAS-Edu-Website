import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowRight,
  Phone,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  UserCheck,
  Loader2,
} from "lucide-react";

/**
 * MeetSchedule — full page for the 1:1 Mentor Consultation (route: /meet).
 *
 * Flow (in-app slot picker — no third-party "Enter Details" page):
 *   1. Describe the 1:1 mentor consultation.
 *   2. Student picks a date & time from an in-app picker.
 *   3. "Pay ₹9 to confirm" → Razorpay (prefilled with the name & phone we already
 *      captured on the registration form — nothing is asked twice).
 *   4. Payment success → meeting confirmed → /success.
 */
const AMOUNT_RUPEES = 9;

// Consultation API lives on the RTI backend. Configured via .env — no hardcoded URL.
const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL;

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM",
];

const BENEFITS = [
  { icon: UserCheck, text: "1-on-1 with a senior CA mentor" },
  { icon: Calendar, text: "Personalised attempt & study plan" },
  { icon: Clock, text: "Doubt clearing + subject prioritisation" },
];

// Next 6 selectable days (starting tomorrow).
// Sundays are skipped — mentors don't take consultations that day — so we keep
// walking the calendar forward until 6 bookable days are collected.
const buildDays = () => {
  const days = [];
  const base = new Date();
  for (let i = 1; days.length < 6; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() === 0) continue; // 0 = Sunday
    days.push({
      key: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      label: d.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    });
  }
  return days;
};

const MeetSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fbq = globalThis.fbq;

  // Lead details from the form (router state → sessionStorage fallback).
  const [lead] = useState(() => {
    if (location.state && location.state.name) return location.state;
    try {
      return JSON.parse(sessionStorage.getItem("focas_lead") || "{}");
    } catch {
      return {};
    }
  });

  const days = useMemo(buildDays, []);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const slotChosen = Boolean(selectedDay && selectedTime);
  const selectedDayLabel =
    days.find((d) => d.key === selectedDay)?.label || "";

  // 🔖 Tracking on page load.
  useEffect(() => {
    fbq?.("track", "PageView");
    fbq?.("track", "CompleteRegistration");
    fbq?.("track", "Lead");
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: "meet_schedule_view" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip → the lead was already captured on form submit, so just continue.
  const handleSkip = () => {
    fbq?.("trackCustom", "MeetSchedule_Skip");
    navigate("/success");
  };

  const pickTime = (t) => {
    setSelectedTime(t);
    fbq?.("trackCustom", "MeetSchedule_SlotPicked");
    setTimeout(() => {
      document
        .getElementById("pay-step")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const firePurchaseTracking = (paymentId, slotText) => {
    fbq?.("track", "Purchase", {
      content_name: "1:1 Mentor Consultation",
      content_type: "product",
      currency: "INR",
      value: AMOUNT_RUPEES,
    });
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        currency: "INR",
        value: AMOUNT_RUPEES,
        items: [{ item_name: "1:1 Mentor Consultation" }],
      });
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "counselling_payment_success",
        payment_id: paymentId,
        slot: slotText,
      });
    }
    try {
      sessionStorage.setItem(
        "focas_meet_slot",
        JSON.stringify({ slot: slotText, payment_id: paymentId })
      );
    } catch {
      /* ignore */
    }
  };

  // 💳 Pay ₹9 to confirm — server-verified Razorpay flow:
  //    create-order (backend) → Checkout → payment-success (verify + capture).
  const handlePay = async () => {
    setError("");
    if (!slotChosen) {
      setError("Please choose a date and time first.");
      return;
    }
    if (typeof window.Razorpay !== "function") {
      setError("Payment library failed to load. Please refresh and try again.");
      return;
    }
    setProcessing(true);

    const slotText = `${selectedDayLabel}, ${selectedTime}`;

    try {
      // 1️⃣ Create the ₹9 order on the backend (amount is fixed server-side).
      const orderRes = await fetch(`${BACKEND}/api/consultations/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name || "",
          firstName: lead.firstName || "",
          lastName: lead.lastName || "",
          phone: lead.phone || "",
          email: lead.email || "",
          caStatus: lead.caStatus,
          attempt: lead.attempt,
          city: lead.city,
          state: lead.state,
          language: lead.language,
          utm: lead.utm,
          slotDate: selectedDay,
          slotTime: selectedTime,
          slotLabel: slotText,
        }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !orderData.success) {
        throw new Error(
          orderData.message || orderData.error || "Could not start payment. Please try again."
        );
      }

      const { consultation, order } = orderData;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "FOCAS Edu",
        description: `1:1 Mentor Consultation — ${slotText}`,
        image: "/logo.png",
        order_id: order.id,
        prefill: { name: lead.name || "", contact: lead.phone || "" },
        notes: { slot: slotText },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          // 2️⃣ Verify the payment server-side before confirming.
          try {
            const verifyRes = await fetch(
              `${BACKEND}/api/consultations/payment-success`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  consultationId: consultation._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyData.success) {
              firePurchaseTracking(response.razorpay_payment_id, slotText);
              navigate("/success");
            } else {
              setError(
                verifyData.message ||
                  "Payment verification failed. Please contact support."
              );
              setProcessing(false);
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setProcessing(false);
        setError(resp?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      setProcessing(false);
      setError(err.message || "Could not start payment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50">
      {/* Top bar */}
      <header className="w-full border-b border-black/5 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <img
            src="/Focus-logo-tag.png"
            alt="FOCAS Edu"
            className="h-8 w-auto object-contain sm:h-10"
          />
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
          >
            Skip for now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* 1️⃣ Description */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            <Sparkles className="h-3.5 w-3.5" /> 1:1 Mentor Consultation
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            Book your personal mentor session
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 sm:text-base">
            Talk one-on-one with a senior FOCAS mentor about your CA journey —
            get a clear, personalised roadmap for your next attempt. Pick a slot
            below and confirm your session for just{" "}
            <span className="font-bold text-gray-800">₹9</span>.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-blue-600" /> {text}
              </span>
            ))}
          </div>
        </div>

        {/* 2️⃣ Slot picker */}
        <div className="mt-9 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5 sm:p-7">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="h-4 w-4 text-blue-600" />
            Step 1 — Choose your date
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {days.map((d) => {
              const active = d.key === selectedDay;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className={`flex flex-col items-center rounded-xl border py-2.5 transition-all ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-md"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <span className="text-[11px] font-medium uppercase opacity-80">
                    {d.weekday}
                  </span>
                  <span className="text-lg font-bold leading-none">{d.day}</span>
                  <span className="text-[11px] opacity-80">{d.month}</span>
                </button>
              );
            })}
          </div>

          <p className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Clock className="h-4 w-4 text-blue-600" />
            Choose your time
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((t) => {
              const active = t === selectedTime;
              const disabled = !selectedDay;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => pickTime(t)}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-md"
                      : disabled
                      ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3️⃣ Pay ₹9 to confirm */}
        <div id="pay-step" className="mt-8">
          {slotChosen ? (
            <div className="overflow-hidden rounded-2xl border-2 border-blue-600 bg-white shadow-xl">
              <div className="flex items-center gap-2 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700">
                <CheckCircle className="h-5 w-5" />
                {selectedDayLabel}, {selectedTime}
              </div>
              <div className="px-5 py-6 sm:px-7">
                <div className="mb-5 flex items-end justify-center gap-2">
                  <span className="text-4xl font-black text-gray-900">₹9</span>
                  <span className="mb-1 text-base font-medium text-gray-400 line-through">
                    ₹499
                  </span>
                  <span className="mb-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    98% OFF
                  </span>
                </div>

                {error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={processing}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-base font-semibold text-white transition-all ${
                    processing
                      ? "cursor-not-allowed bg-blue-400"
                      : "bg-blue-600 shadow-lg hover:bg-blue-700 active:scale-[.99]"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>Pay ₹9 &amp; Confirm My Session</>
                  )}
                </button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  100% secure payment via Razorpay
                </p>

                {/* Skip below the pay button */}
                <button
                  type="button"
                  onClick={handleSkip}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                >
                  Skip for now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-5 py-4 text-center text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              Step 2 — Pick a date &amp; time above, then pay ₹9 to confirm.
            </p>
          )}
        </div>

        {/* Support note */}
        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <Phone className="h-3.5 w-3.5" />
          Need help? Call us at
          <a href="tel:+916383514285" className="font-medium text-blue-600">
            +91 63835 14285
          </a>
        </p>
      </main>
    </div>
  );
};

export default MeetSchedule;
