import { memo } from "react";
import {
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaTelegram,
  FaGlobe,
} from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";
import { MdVerified, MdQuiz } from "react-icons/md";

/**
 * FOCAS Edu — Link-in-bio page (Linktree style)
 * Matches the main site: Poppins, emerald/teal + blue accents,
 * glossy white cards with a thick black bottom border.
 *
 * 👉 To edit: change the `href` values in PRIMARY_LINKS / SOCIALS below.
 */

const PRIMARY_LINKS = [
  {
    label: "Visit Our Website",
    sub: "focasedu.com",
    href: "https://focasedu.com",
    icon: FaGlobe,
    color: "#2563eb", // blue
  },
  {
    label: "Join CA Coaching on WhatsApp",
    sub: "Talk to our team",
    href: "https://wa.me/916383514285",
    icon: FaWhatsapp,
    color: "#22c55e", // green
  },
  {
    label: "CA Guru.AI",
    sub: "Your AI study companion",
    href: "https://caguru.ai",
    icon: HiSparkles,
    color: "#0e9166", // brand teal
  },
  {
    label: "MCQ Practice Bot",
    sub: "Practice CA MCQs on WhatsApp",
    href: "https://wa.me/918946089717?text=MCQ",
    icon: MdQuiz,
    color: "#7c3aed", // violet
  },
  {
    label: "Last Attempt Kit",
    sub: "Crack it in your final attempt",
    href: "https://kit.focasedu.com",
    icon: MdVerified,
    color: "#f59e0b", // amber
  },
];

const SOCIALS = [
  {
    name: "YouTube",
    href: "https://youtube.com/@focasedu?si=wnyUdMYnN43Jw9xM",
    icon: FaYoutube,
    color: "#ff0000",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/focasedu",
    icon: FaInstagram,
    color: "#e1306c",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/focasedu",
    icon: FaLinkedinIn,
    color: "#0a66c2",
  },
  {
    name: "Telegram",
    href: "https://t.me/focasedu",
    icon: FaTelegram,
    color: "#229ed9",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/916383514285",
    icon: FaWhatsapp,
    color: "#25d366",
  },
];

const Links = () => {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden px-4 py-12 sm:py-16"
      style={{
        fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif",
        background:
          "linear-gradient(135deg, #0e9166 0%, #0b7a56 25%, #0a3d4a 60%, #071b2e 100%)",
        backgroundSize: "300% 300%",
        animation: "gradientShift 18s ease infinite",
      }}
    >
      {/* Load Poppins to match the main site */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Subtle grid pattern (echoes the site footer) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Floating glow blobs */}
      <div
        className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        style={{ animation: "float 9s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/2 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
        style={{ animation: "float 11s ease-in-out infinite reverse" }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-[520px] flex-col items-center">
        {/* Profile */}
        <div className="animate-[fadeIn_.6s_ease-out] flex flex-col items-center text-center">
          {/* Full logo shown as a crisp banner on a white card */}
          <div
            className="relative rounded-2xl bg-white px-6 py-4 shadow-[0_10px_30px_rgba(0,0,0,.35)] ring-1 ring-white/40 transition-transform duration-500 hover:scale-105"
            style={{ animation: "floatLogo 6s ease-in-out infinite" }}
          >
            <img
              src="/Focus-logo-tag.png"
              alt="FOCAS Edu"
              className="h-14 w-auto object-contain sm:h-16"
            />
            <span
              className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white shadow-lg ring-2 ring-white"
              style={{ animation: "pulseBadge 2.4s ease-in-out infinite" }}
            >
              <MdVerified size={18} />
            </span>
          </div>

          <p className="mt-5 max-w-xs text-sm font-medium text-emerald-100/90">
            Learn Like Never Before — CA Coaching &amp; Mentorship for Your Last
            Attempt.
          </p>
        </div>

        {/* Primary link buttons */}
        <div className="mt-9 w-full space-y-4">
          {PRIMARY_LINKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  animationDelay: `${0.15 + i * 0.09}s`,
                  transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
                }}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-black bg-white/95 px-4 py-4 shadow-[0_5px_0_0_#000] transition-all duration-300 will-change-transform hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_0_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_0_#000] animate-[slideUp_.55s_both]"
              >
                {/* Shine sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <span
                  className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon size={20} />
                </span>
                <span className="flex flex-col text-left">
                  <span className="text-[15px] font-bold leading-tight text-gray-900">
                    {item.label}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {item.sub}
                  </span>
                </span>
                <span className="ml-auto text-gray-400 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-gray-900">
                  →
                </span>
              </a>
            );
          })}
        </div>

        {/* Social icons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {SOCIALS.map((s, i) => {
            const Icon = s.icon;
            return (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                title={s.name}
                style={{
                  animationDelay: `${0.6 + i * 0.08}s`,
                  transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
                }}
                className="grid h-12 w-12 animate-[popIn_.5s_both] place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:scale-110 hover:bg-white hover:shadow-lg hover:ring-white"
                onMouseEnter={(e) => (e.currentTarget.style.color = s.color)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
              >
                <Icon size={20} />
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-1 text-center">
          <a
            href="https://focasedu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white/90 hover:text-white"
          >
            www.focasedu.com
          </a>
          <p className="text-xs text-white/50">
            © {2026} FOCAS Edu. All rights reserved.
          </p>
        </footer>
      </main>

      {/* keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes slideUp { from { opacity: 0; transform: translateY(22px) scale(.98);} to { opacity: 1; transform: translateY(0) scale(1);} }
        @keyframes popIn { 0% { opacity: 0; transform: scale(.4) translateY(10px);} 60% { transform: scale(1.08);} 100% { opacity: 1; transform: scale(1) translateY(0);} }
        @keyframes gradientShift { 0% { background-position: 0% 50%;} 50% { background-position: 100% 50%;} 100% { background-position: 0% 50%;} }
        @keyframes float { 0%,100% { transform: translateY(0) translateX(0);} 50% { transform: translateY(-30px) translateX(15px);} }
        @keyframes floatLogo { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
        @keyframes pulseBadge { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.55);} 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0);} }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </div>
  );
};

export default memo(Links);
