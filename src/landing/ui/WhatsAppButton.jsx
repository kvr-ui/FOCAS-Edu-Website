import { FaWhatsapp } from "react-icons/fa";
import { useScrolledPast } from "./useScrollY";

// WhatsApp's own brand green (not a page brand colour); override via `color`.
const WHATSAPP_GREEN = "#25d366";

/**
 * Optional floating WhatsApp button. Renders nothing without a `number`.
 * `number` may contain spaces/+/dashes; only digits are kept for wa.me.
 */
export function WhatsAppButton({ number, message, showAfter = 400, color = WHATSAPP_GREEN, label = "Chat on WhatsApp" }) {
  const past = useScrolledPast(showAfter);
  const digits = String(number ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const show = showAfter <= 0 || past;
  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  return (
    <div
      className={`fixed bottom-7 left-7 z-50 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="rounded-full flex items-center justify-center text-white text-3xl shadow-xl hover:scale-110 transition-all"
        style={{ width: 52, height: 52, background: color }}
      >
        <FaWhatsapp />
      </a>
    </div>
  );
}

export default WhatsAppButton;
