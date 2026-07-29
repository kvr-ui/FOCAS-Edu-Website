import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";

/**
 * PaymentPage — ₹9 "1:1 Mentor Counselling" checkout (route: /payment).
 *
 * The Razorpay Checkout script is already loaded globally in index.html,
 * so window.Razorpay is available here.
 *
 * ⚠️ This uses Razorpay's client-only (order-less) flow so it works without any
 *    backend changes. Auto-capture must be ON in your Razorpay dashboard.
 *    To upgrade to server-verified orders (recommended, like Rti.jsx), create the
 *    order on your backend and pass `order_id` in the options below, then verify
 *    the signature server-side in the handler. See the commented block.
 */

const AMOUNT_RUPEES = 9;
const AMOUNT_PAISE = AMOUNT_RUPEES * 100;

const BENEFITS = [
  "Dedicated 1-on-1 session with a senior CA mentor",
  "Personalised study & attempt strategy",
  "Doubt clearing + subject prioritisation",
  "Priority scheduling",
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fbq = globalThis.fbq;

  // Optional prefill passed from a previous page via navigate("/payment", { state })
  const prefill = location.state || {};
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fbq?.("track", "PageView");
    fbq?.("track", "InitiateCheckout", {
      content_name: "1:1 Mentor Counselling",
      currency: "INR",
      value: AMOUNT_RUPEES,
    });
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: "counselling_payment_view" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = () => {
    setError("");

    if (typeof window.Razorpay !== "function") {
      setError("Payment library failed to load. Please refresh and try again.");
      return;
    }

    setProcessing(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: AMOUNT_PAISE, // in paise
      currency: "INR",
      name: "FOCAS Edu",
      description: "1:1 Mentor Counselling Session",
      image: "/logo.png",

      // 🔐 To use server-verified orders instead, create an order on your backend
      //     and set: order_id: order.id,  (remove `amount`/`currency` above — they
      //     come from the order). Then verify razorpay_signature in the handler.

      prefill: {
        name: prefill.name || "",
        email: prefill.email || "",
        contact: prefill.phone || "",
      },
      notes: { product: "1:1 Mentor Counselling", amount_rs: AMOUNT_RUPEES },
      theme: { color: "#2563eb" },

      handler: (response) => {
        // ✅ Payment done (payment id: response.razorpay_payment_id)
        fbq?.("track", "Purchase", {
          content_name: "1:1 Mentor Counselling",
          content_type: "product",
          currency: "INR",
          value: AMOUNT_RUPEES,
        });
        if (typeof window.gtag === "function") {
          window.gtag("event", "purchase", {
            currency: "INR",
            value: AMOUNT_RUPEES,
            items: [{ item_name: "1:1 Mentor Counselling" }],
          });
        }
        if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push({
            event: "counselling_payment_success",
            payment_id: response.razorpay_payment_id,
          });
        }
        navigate("/success");
      },

      modal: {
        ondismiss: () => {
          setProcessing(false);
          fbq?.("trackCustom", "CounsellingPayment_Dismissed");
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setProcessing(false);
        setError(
          resp?.error?.description || "Payment failed. Please try again."
        );
      });
      rzp.open();
    } catch (err) {
      setProcessing(false);
      setError(err.message || "Could not start payment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 px-4 py-8 sm:py-12">
      {/* Back */}
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center text-white sm:px-10">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">
            1:1 Mentor Counselling
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            A personalised session to plan your CA success.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-7 sm:px-10">
          {/* Price */}
          <div className="mb-6 flex items-end justify-center gap-2">
            <span className="text-5xl font-black text-gray-900">₹9</span>
            <span className="mb-1.5 text-lg font-medium text-gray-400 line-through">
              ₹499
            </span>
            <span className="mb-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              98% OFF
            </span>
          </div>

          {/* Benefits */}
          <ul className="mb-7 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <span className="text-sm text-gray-700">{b}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Pay button */}
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
              <>Pay ₹9 &amp; Book My Session</>
            )}
          </button>

          {/* Trust note */}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            100% secure payment via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
