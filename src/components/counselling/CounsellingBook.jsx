import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import { sendToZohoFlow } from "@/components/fs/FsForm";
import {
  CONVERSION_KEY,
  FONTS_HREF,
  LEAD_KEY,
  LEXEND,
  MANROPE,
  PHONE_DISPLAY,
  PHONE_TEL,
  SUBMITTED_KEY,
} from "./Counselling";

/**
 * CounsellingBook — slot picker + ₹9 payment for the /counselling lead
 * (route: /counselling/book). Same flow as /fs/book:
 *
 *   1. Student picks a date & time for the counselling call.
 *   2. "Pay ₹9 to confirm" → Razorpay (prefilled from the /counselling form).
 *   3. Payment verified server-side → Zoho Flow webhook (→ Bigin) →
 *      /counselling-success.
 *
 * Payment is mandatory — there is no skip, so only paid students reach Bigin.
 * Uses the consultation endpoints on the RTI backend; the ₹9 amount is fixed
 * server-side, and that backend also sends the paid booking (WhatsApp
 * confirmation + its own Zoho Flow webhook).
 */
const AMOUNT_RUPEES = 9;
const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL;
const PRODUCT = "CA Inter Counselling Call";
// SESSION key the success page reads to show the booked slot.
export const SLOT_KEY = "focas_counselling_slot";

const TIME_SLOTS = ["10:00 AM", "11:30 AM", "01:00 PM", "03:00 PM", "04:30 PM", "06:00 PM"];

const BENEFITS = [
  { icon: UserCheck, text: "1:1 call with a FOCAS mentor" },
  { icon: Target, text: "A plan for your Jan 2027 attempt" },
  { icon: Users, text: "Know how 1:10 tutor sessions work" },
];

// Next 6 selectable days (starting tomorrow), skipping Sundays.
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
      label: d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }),
    });
  }
  return days;
};

export default function CounsellingBook() {
  const navigate = useNavigate();
  const location = useLocation();

  const [lead] = useState(() => {
    if (location.state && location.state.phone) return location.state;
    try {
      return JSON.parse(sessionStorage.getItem(LEAD_KEY) || "{}");
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
  const selectedDayLabel = days.find((d) => d.key === selectedDay)?.label || "";

  useEffect(() => {
    // No lead captured (direct visit) → send them to the form first.
    if (!lead.phone) {
      navigate("/counselling#register", { replace: true });
      return;
    }
    if (!document.querySelector(`link[href="${FONTS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONTS_HREF;
      document.head.appendChild(link);
    }
    document.title = "Book your counselling call – FOCAS Edu";
    window.fbq?.("track", "InitiateCheckout", { content_name: PRODUCT, currency: "INR", value: AMOUNT_RUPEES });
    window.dataLayer?.push({ event: "counselling_book_view", page_path: "/counselling/book" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToSuccess = () => navigate("/counselling-success", { replace: true });

  const pickTime = (t) => {
    setSelectedTime(t);
    window.fbq?.("trackCustom", "CounsellingBook_SlotPicked");
    setTimeout(() => {
      document.getElementById("pay-step")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const firePurchaseTracking = (paymentId, slotText) => {
    window.fbq?.("track", "Purchase", {
      content_name: PRODUCT,
      content_type: "product",
      currency: "INR",
      value: AMOUNT_RUPEES,
    });
    window.gtag?.("event", "purchase", {
      transaction_id: paymentId,
      currency: "INR",
      value: AMOUNT_RUPEES,
      items: [{ item_name: PRODUCT }],
    });
    window.dataLayer?.push({ event: "counselling_payment_success", payment_id: paymentId, slot: slotText });
    try {
      sessionStorage.setItem(SLOT_KEY, JSON.stringify({ slot: slotText, payment_id: paymentId }));
      sessionStorage.setItem(CONVERSION_KEY, "1");
      localStorage.setItem(SUBMITTED_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Server-verified Razorpay flow: create-order → Checkout → payment-success.
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
      const orderRes = await fetch(`${BACKEND}/api/consultations/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name || "",
          firstName: lead.firstName || "",
          lastName: lead.lastName || "",
          phone: lead.phone || "",
          caStatus: lead.caStatus,
          attempt: lead.attempt,
          city: lead.city,
          state: lead.state,
          language: lead.language,
          utm: lead.utm,
          slotDate: selectedDay,
          slotTime: selectedTime,
          slotLabel: slotText,
          source: "counselling",
          campaign: lead.utm?.utm_campaign || "counselling",
        }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || orderData.error || "Could not start payment. Please try again.");
      }

      const { consultation, order } = orderData;

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "FOCAS Edu",
        description: `${PRODUCT} — ${slotText}`,
        image: "/logo.png",
        order_id: order.id,
        prefill: { name: lead.name || "", contact: lead.phone || "" },
        notes: { slot: slotText, program: PRODUCT },
        theme: { color: "#0f6e56" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${BACKEND}/api/consultations/payment-success`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                consultationId: consultation._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyData.success) {
              firePurchaseTracking(response.razorpay_payment_id, slotText);
              // Paid booking → Zoho Flow webhook (→ Bigin). This is the only
              // place a /counselling lead reaches Bigin.
              // The Flow maps `source` to Bigin's Lead Source, so set both.
              sendToZohoFlow(lead, {
                source: "Counselling - PAID",
                leadSource: "Counselling - PAID",
                paymentStatus: "Paid",
                amount: String(AMOUNT_RUPEES),
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                slotDate: selectedDay,
                slotTime: selectedTime,
                slotLabel: slotText,
              });
              goToSuccess();
            } else {
              setError(verifyData.message || "Payment verification failed. Please contact support.");
              setProcessing(false);
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
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

  const tileCls = (active, disabled) =>
    active
      ? "border-[#0f6e56] bg-[#0f6e56] text-white shadow-md"
      : disabled
      ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
      : "border-gray-200 bg-white text-gray-700 hover:border-[#1D9E75]/50 hover:bg-[#e8f8f2]";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f8f2] via-[#f8fffe] to-white text-[#1c232d]" style={MANROPE}>
      <header className="w-full border-b border-[#0f6e56]/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/counselling">
            <img src="/fs-assets/logo.webp" alt="FOCAS Edu" className="h-8 w-auto sm:h-10" />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f6e56]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0f6e56]">
            <Sparkles className="h-3.5 w-3.5" /> CA Inter Counselling
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={LEXEND}>
            {lead.firstName ? `${lead.firstName}, book your counselling call` : "Book your counselling call"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#1c232d]/70">
            A one-on-one call with a FOCAS mentor on how to clear CA Inter in your Jan 2027 attempt. Pick a
            slot and confirm it for just <span className="font-bold text-[#1c232d]">₹9</span>.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-[#0f6e56]/10 bg-white px-3.5 py-1.5 text-sm font-medium text-[#1c232d]/80 shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-[#1D9E75]" /> {text}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-9 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5 sm:p-7">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-[#1D9E75]" />
            Step 1 — Choose a date
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDay(d.key)}
                className={`flex flex-col items-center rounded-xl border py-2.5 transition-all ${tileCls(d.key === selectedDay, false)}`}
              >
                <span className="text-[11px] font-medium uppercase opacity-80">{d.weekday}</span>
                <span className="text-lg font-bold leading-none">{d.day}</span>
                <span className="text-[11px] opacity-80">{d.month}</span>
              </button>
            ))}
          </div>

          <p className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-[#1D9E75]" />
            Choose a time
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                disabled={!selectedDay}
                onClick={() => pickTime(t)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${tileCls(t === selectedTime, !selectedDay)}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div id="pay-step" className="mt-8">
          {slotChosen ? (
            <div className="overflow-hidden rounded-2xl border-2 border-[#0f6e56] bg-white shadow-xl">
              <div className="flex items-center gap-2 bg-[#e8f8f2] px-5 py-3 text-sm font-semibold text-[#0f6e56]">
                <CheckCircle className="h-5 w-5" />
                {selectedDayLabel}, {selectedTime}
              </div>
              <div className="px-5 py-6 sm:px-7">
                <div className="mb-5 flex items-end justify-center gap-2">
                  <span className="text-4xl font-extrabold" style={LEXEND}>₹9</span>
                  <span className="mb-1 text-base font-medium text-gray-400 line-through">₹499</span>
                  <span className="mb-1.5 rounded-full bg-[#fff8ed] px-2 py-0.5 text-xs font-bold text-[#975A16]">
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
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-base font-bold text-white transition-all ${
                    processing
                      ? "cursor-not-allowed bg-[#1D9E75]/60"
                      : "bg-gradient-to-b from-[#1D9E75] to-[#0f6e56] shadow-lg hover:from-[#0f6e56] hover:to-[#1D9E75] active:scale-[.99]"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>Pay ₹9 &amp; Confirm the Call</>
                  )}
                </button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#1D9E75]" />
                  100% secure payment via Razorpay
                </p>
              </div>
            </div>
          ) : (
            <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-5 py-4 text-center text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Step 2 — Pick a date &amp; time above, then pay ₹9 to confirm.
            </p>
          )}
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-sm text-gray-500">
          <Phone className="h-3.5 w-3.5" />
          Need help? Call us at
          <a href={PHONE_TEL} className="font-semibold text-[#0f6e56]">
            {PHONE_DISPLAY}
          </a>
        </p>
      </main>
    </div>
  );
}
