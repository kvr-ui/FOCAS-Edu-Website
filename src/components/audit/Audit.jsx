import { useState, useEffect, useRef } from "react";
import logo from "../../../public/logo.png";
import React from "react";
import SuccessStories from "../SuccessStories";

const GREEN = "#1D9E75";
const ORANGE = "#FFA500";

const TNC_PDF = "/pdf/FOCAS-Crash-Tutoring-TnC.pdf";

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Why Join", href: "#why" },
  { label: "Schedule", href: "#schedule" },
  { label: "Refund Policy", href: "#refund" },
  { label: "Stories", href: "#stories" },
  { label: "FAQs", href: "#faq" },
];

// Audit success stories shown on this page, in display order.
const AUDIT_STORIES = [
  { name: "Harini Aiswariya", video: "https://da3m0k666tznr.cloudfront.net/Successful_stories/HariniAiswariya.mp4" },
  { name: "Gayathri",         video: "https://da3m0k666tznr.cloudfront.net/Successful_stories/Gayathri.mp4" },
  { name: "Jeshurun",         video: "https://da3m0k666tznr.cloudfront.net/Successful_stories/Jeshurun.mp4" },
];

const SCHEDULE = [
  { day: "Day 1", date: "Mon, 17 Aug", emoji: "🚀", label: "Kick-off — Live Audit Session · 8:00 PM to 10:00 PM" },
  { day: "Day 2", date: "Tue, 18 Aug", emoji: "📚", label: "Live Audit Session · 8:00 PM to 10:00 PM" },
  { day: "Day 3", date: "Wed, 19 Aug", emoji: "📝", label: "Live Audit Session · 8:00 PM to 10:00 PM" },
  { day: "Day 4", date: "Thu, 20 Aug", emoji: "🎯", label: "Live Audit Session · 8:00 PM to 10:00 PM" },
  { day: "Day 5", date: "Fri, 21 Aug", emoji: "📊", label: "Live Audit Session · 8:00 PM to 10:00 PM" },
  { day: "Day 6", date: "Sat, 22 Aug", emoji: "🔥", label: "Live Audit Session · 8:00 PM to 10:00 PM" },
  { day: "Day 7", date: "Sun, 23 Aug", emoji: "🏁", label: "Final Session + Challenge Wrap-up · 8:00 PM to 10:00 PM" },
];

const CHALLENGE_STEPS = [
  { emoji: "💳", title: "Register with ₹99", text: "A refundable deposit to book your seat and confirm your commitment." },
  { emoji: "🎥", title: "Camera ON, always", text: "Your camera must stay ON throughout every session — it's a non-negotiable condition." },
  { emoji: "⏱️", title: "Attend 90% of hours", text: "Attend at least 90% of the total session hours (~12.6 of ~14 hours). Partial attendance counts proportionally." },
  { emoji: "🙋", title: "Participate actively", text: "Logging in and leaving the session unattended doesn't count as valid attendance." },
  { emoji: "📩", title: "Request refund by 30th Aug", text: "Submit your refund request within 7 days of the programme ending — before 30th August 2026." },
  { emoji: "💸", title: "Get your ₹99 back", text: "Refunded to your original payment method within 7–10 working days of approval." },
];

const FAQS = [
  { q: "Who is this programme for?", a: "CA Inter students preparing for the Sep 2026 attempt who want a focused, exam-oriented crash revision of Audit's high-priority topics." },
  { q: "What is the 7-Day Audit Crash Tutoring?", a: "7 days of live tutoring sessions conducted by FOCAS Edu from 17th to 23rd August 2026, every day from 8 PM to 10 PM, covering exam-oriented high-priority Audit topics." },
  { q: "Is it really free?", a: "You pay a ₹99 refundable deposit at registration. Complete the challenge — attend 90%+ of the session hours with your camera ON — and the full ₹99 is refunded. Effectively free for committed students." },
  { q: "How do I get my ₹99 back?", a: "Meet all the refund conditions (90% attendance, camera-on policy, active participation) and submit your refund request before 30th August 2026. Refunds are processed to your original payment method within 7–10 working days of approval." },
  { q: "What if my camera is switched off during a session?", a: "Sessions where your camera is found switched off — even temporarily — will not be counted towards refund-eligible attendance, as per the Terms & Conditions. No exceptions are made for technical issues, so please ensure a working camera and stable internet." },
  { q: "Where do the classes happen?", a: "The sessions are conducted live online. Joining details will be shared on WhatsApp and email after registration." },
  { q: "What language will the sessions be in?", a: "Primarily in English and Tamil. A bilingual approach is adopted to make the students feel comfortable." },
  { q: "Who is conducting the programme?", a: "The programme is brought to you by FOCAS Edu — an institute which has guided 300+ students in their journey to realizing their CA dreams." },
  { q: "How do I register?", a: "Click on Register Now, fill in your details, read and accept the Terms & Conditions, and pay the ₹99 refundable deposit. That's it — you're enrolled!" },
];

// ─── Attribution helper ──────────────────────────────────────────────────────
// URL-only: the source is whatever utm_source is on the current link. No memory,
// so a plain link (no UTM) is always "direct".
function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    source:   params.get("utm_source")   || "direct",
    campaign: params.get("utm_campaign") || "audit_crash_2026",
  };
}

// Retries transient failures (network drop, 502/503/504 from a server blip)
// before giving up, so a few-second backend hiccup doesn't fail a registration.
async function fetchWithRetry(url, options, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, options);
      if ([502, 503, 504].includes(res.status) && i < attempts - 1) {
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastErr ?? new Error("Network error");
}

function Navbar({ scrolled, menuOpen, setMenuOpen, onRegister }) {
  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-100" : "bg-white/90"}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scroll("home")}>
          <img src={logo} alt="Focus Edu" className="h-10" />
        </div>
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => scroll(l.href.slice(1))} className="text-sm font-semibold text-gray-600 hover:text-[#1D9E75] transition-colors">{l.label}</button>
          ))}
          <button onClick={onRegister} className="text-sm font-bold text-white px-5 py-2 rounded-full shadow-md transition-all hover:scale-105 hover:shadow-lg uppercase tracking-widest" style={{ background: GREEN }}>
            REGISTER NOW
          </button>
        </div>
        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(o => !o)}>
          <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-t border-gray-100 flex flex-col px-6 py-4 gap-1 md:hidden">
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => scroll(l.href.slice(1))} className="text-left py-3 text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0 hover:text-[#1D9E75] transition-colors">{l.label}</button>
          ))}
          <button onClick={onRegister} className="mt-3 w-full py-3 rounded-full text-white font-bold text-sm uppercase tracking-widest" style={{ background: GREEN }}>REGISTER NOW</button>
        </div>
      )}
    </>
  );
}

function Ticker() {
  const items = ["17th – 23rd August 2026", "FOCAS Edu", "7-Day Audit Crash Tutoring", "8 PM – 10 PM Every Evening", "₹99 — Fully Refundable*", "Exclusive for CA INTER Sep 26 students"];
  const all = [...items, ...items];
  return (
    <div className="overflow-hidden py-3" style={{ background: GREEN }}>
      <div className="flex w-max" style={{ animation: "ticker 22s linear infinite" }}>
        {all.map((t, i) => (
          <span key={i} className="flex items-center gap-2 px-6 text-sm font-bold text-white whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function OfferCard({ onRegister }) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl w-full" style={{ background: "#0f172a" }}>
      <div className="px-7 pt-7 pb-6">
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white mb-4" style={{ background: ORANGE }}>
          Refundable Deposit
        </span>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-5xl font-black text-white">₹99</span>
          <span className="text-sm font-bold text-slate-400 pb-1.5">one-time registration</span>
        </div>
        <p className="text-sm font-bold mb-5" style={{ color: "#4ade80" }}>
          Fully refundable if you complete the challenge!*
        </p>
        <ul className="flex flex-col gap-3 mb-6">
          {[
            ["📅", "17th – 23rd August 2026"],
            ["🕗", "Everyday · 8 PM to 10 PM"],
            ["🎯", "Exam-oriented high-priority topics"],
            ["💻", "Live online tutoring sessions"],
            ["💸", "₹99 back on completing the challenge"],
          ].map(([e, t]) => (
            <li key={t} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
              <span className="text-lg">{e}</span>{t}
            </li>
          ))}
        </ul>
        <button
          onClick={onRegister}
          className="w-full py-3.5 rounded-full font-black text-sm tracking-widest uppercase text-white transition-all hover:scale-[1.02]"
          style={{ background: "#41C9EB" }}
          onMouseOver={e => e.currentTarget.style.background = "#2bb8d9"}
          onMouseOut={e => e.currentTarget.style.background = "#41C9EB"}
        >
          REGISTER NOW — ₹99
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-3">*Terms and conditions apply</p>
      </div>
    </div>
  );
}

function Hero({ onRegister }) {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 lg:px-16 pt-24 pb-16"
      style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}
    >
      <div className="max-w-xl w-full text-center lg:text-left flex flex-col">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 mb-7 self-center lg:self-start"
          style={{ background: "#fff8ed", color: ORANGE }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Now Open for Registration. <span style={{ color: ORANGE, fontWeight: 900 }}>CA INTER Sep 26 Students</span></span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-gray-900 mb-3">
          7-Day Auditing<br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg,#1D9E75,#0ea5e9)" }}
          >
            Crash Tutoring
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-2 max-w-lg mx-auto lg:mx-0">
          7 days of live, exam-oriented tutoring on high-priority Audit topics — hosted by FOCAS Edu, exclusively for CA Inter Sep 26 students.
        </p>

        <p className="text-base md:text-lg font-bold mb-5 max-w-lg mx-auto lg:mx-0" style={{ color: GREEN }}>
          ₹99 to register — fully refundable if you complete the challenge!
        </p>

        <div className="lg:hidden mb-6">
          <OfferCard onRegister={onRegister} />
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-5">
          <button
            onClick={onRegister}
            className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: GREEN }}
          >
            Register Now — ₹99 <span>→</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
          <span
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{ background: GREEN }}
          >
            📅 17th – 23rd August 2026
          </span>
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm">
            🕗 Everyday · 8 PM to 10 PM
          </span>
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm">
            💻 Live Online Sessions
          </span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {[
            ["7 Days", "Live Tutoring"],
            ["2 Hrs", "Every Evening"],
            ["₹99", "Fully Refundable*"],
          ].map(([num, label]) => (
            <div
              key={label}
              className="bg-white border border-green-100 rounded-2xl px-5 py-3 text-center shadow-sm min-w-[120px]"
            >
              <div className="text-2xl font-black" style={{ color: GREEN }}>{num}</div>
              <div className="text-xs text-gray-500 font-semibold mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block w-full max-w-md lg:w-[420px] flex-shrink-0">
        <OfferCard onRegister={onRegister} />
      </div>
    </section>
  );
}

function WhyJoin() {
  const cards = [
    { title: "7 Days of Live Tutoring",     bg: "#FFF5F5", border: "#FED7D7", accent: "#E53E3E", dot: "#FC8181" },
    { title: "Exam-Oriented Coverage",      bg: "#F0FFF4", border: "#C6F6D5", accent: "#276749", dot: "#68D391" },
    { title: "High-Priority Topics Only",   bg: "#FFFFF0", border: "#FEFCBF", accent: "#975A16", dot: "#F6E05E" },
    { title: "₹99 Refundable Deposit",      bg: "#E6FFFA", border: "#B2F5EA", accent: "#234E52", dot: "#4FD1C5" },
  ];

  return (
    <section id="why" className="py-10 md:py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: "#e8f8f2", color: "#0f6e56" }}
          >
            Why Join?
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Audit, made exam-ready<br />in just 7 evenings.
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            2 hours a night. High-priority topics. Live and interactive. Complete the challenge and it costs you nothing.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div
                className="rounded-2xl px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col gap-2"
                style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: c.dot, boxShadow: `0 0 0 3px ${c.border}`, animation: "pulse 2s infinite" }}
                />
                <h3 className="text-sm font-black leading-snug" style={{ color: c.accent }}>
                  {c.title}
                </h3>
              </div>
            </Reveal>
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.55; transform: scale(1.35); }
          }
        `}</style>

        <Reveal>
          <p className="text-center text-gray-500 text-base mb-8">
            Backed by <span className="font-black text-gray-900">300+ students</span> who have placed their trust in us and made it their last attempt with FOCAS Edu.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-4 rounded-full px-8 py-5 flex flex-wrap gap-5 justify-center"
            style={{ background: "#0f172a" }}
          >
            <span className="text-white text-sm font-bold flex items-center gap-2">
              <span style={{ color: GREEN }}>✓</span> Book your slot today!{" "}
              <span className="text-gray-400">Limited seats only.</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Schedule() {
  return (
    <section id="schedule" className="py-10 md:py-24 px-6" style={{ background: "linear-gradient(160deg,#f8fffe,#f0fdf8)" }}>
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">7 Days. One Goal.</h2>
          <p className="text-gray-500 text-lg">Every evening from 8 PM to 10 PM — exam-oriented, high-priority Audit topics.</p>
          <p className="mt-4 text-sm text-orange-600 font-semibold italic">*Join on time with your camera ON — attendance and camera compliance decide your ₹99 refund.*</p>
        </Reveal>
        <div className="relative">
          <div className="absolute left-[76px] top-5 bottom-5 w-0.5 rounded-full" style={{ background: `linear-gradient(to bottom, ${GREEN}, rgba(29,158,117,0.1))` }} />
          <div className="flex flex-col gap-4">
            {SCHEDULE.map((s, i) => (
              <Reveal key={s.day} delay={i * 0.07}>
                <div className="flex items-center group">
                  <div className="w-20 text-right pr-4 flex-shrink-0">
                    <div className="text-xs font-black" style={{ color: GREEN }}>{s.day}</div>
                    <div className="text-[10px] font-semibold text-gray-400">{s.date}</div>
                  </div>
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm group-hover:scale-125 transition-transform" style={{ background: GREEN }} />
                  </div>
                  <div className="ml-4 flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm group-hover:translate-x-1 group-hover:shadow-md transition-all">
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-sm font-bold text-gray-800">{s.label}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.1} className="flex flex-wrap gap-2 justify-center mt-10">
          {[["Live Classes","bg-green-50 text-green-800 border-green-200"], ["High-Priority Topics","bg-orange-50 text-orange-800 border-orange-200"], ["Exam-Oriented","bg-blue-50 text-blue-800 border-blue-200"], ["Doubt Clearing","bg-purple-50 text-purple-800 border-purple-200"], ["₹99 Challenge","bg-yellow-50 text-yellow-800 border-yellow-200"]].map(([label, cls]) => (
            <span key={label} className={`px-4 py-2 rounded-full text-xs font-bold border ${cls}`}>{label}</span>
          ))}
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Reveal delay={0.1}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#1D9E75,#0ea47a)" }}>
              <div className="text-3xl mb-3">📚</div>
              <div className="font-black text-lg mb-2">Live Tutoring Block</div>
              <div className="text-sm opacity-85 leading-relaxed">2 hours every evening — concepts, exam-oriented questions and doubt-clearing on the highest-priority Audit topics.</div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
              <div className="text-3xl mb-3">🏆</div>
              <div className="font-black text-lg mb-2">The ₹99 Challenge</div>
              <div className="text-sm opacity-85 leading-relaxed">Attend 90%+ of the hours with your camera ON, and your full deposit comes right back to you.</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function RefundPolicy() {
  return (
    <section id="refund" className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>The ₹99 Refund Challenge</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">Complete the challenge.<br />Get every rupee back.</h2>
          <p className="text-gray-500 text-lg">The deposit exists only to ensure genuine commitment. Here's exactly how to earn it back.</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHALLENGE_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="h-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-5 flex gap-4 hover:border-[#1D9E75] hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "#e8f8f2" }}>{s.emoji}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: GREEN }}>{i + 1}</span>
                    <h3 className="text-sm font-black text-gray-900">{s.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-8 rounded-2xl border-2 border-orange-200 bg-orange-50 px-6 py-5 text-center">
            <p className="text-sm font-bold text-orange-800 mb-2">
              ⚠️ Missing any one condition makes the deposit non-refundable — no exceptions.
            </p>
            <a href={TNC_PDF} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm font-black underline underline-offset-4 transition-colors" style={{ color: "#0f6e56" }}>
              📄 Read the full Terms &amp; Conditions (PDF)
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RegisterPage({ onClose, campaignPhone }) {
  const [form, setForm] = useState({
    name: "",
    phone: campaignPhone || "", // pre-fill phone from campaign URL
    email: "",
    appearingForSep: "",
  });
  const [agreedTnc, setAgreedTnc] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL || "http://localhost:8000";

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!form.name || !form.phone || !form.email || !form.appearingForSep) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (form.phone.length !== 10) {
      setErrorMsg("Valid phone number must be exactly 10 digits.");
      return;
    }
    if (!agreedTnc) {
      setErrorMsg("Please read and accept the Terms & Conditions to continue.");
      return;
    }

    const { source, campaign } = getAttribution();

    const payload = {
      name:            form.name,
      phone:           `+91${form.phone}`,
      email:           form.email,
      appearingForSep: form.appearingForSep,
      acceptedTerms:   true,
      source,
      campaign,
    };

    setStatus("loading");

    try {
      const regRes = await fetchWithRetry(`${BACKEND}/api/audit-crash/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const regData = await regRes.json();
      console.log("Register response:", { status: regRes.status, data: regData });

      if (!regRes.ok) {
        setErrorMsg(regData.message || "Registration failed. Please try again.");
        setStatus("idle");
        return;
      }

      const { registration, order } = regData;

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    order.currency,
        name:        "FOCAS Edu",
        description: "7-Day Audit Crash Tutoring — ₹99 Refundable Deposit",
        order_id:    order.id,
        prefill:     { name: payload.name, email: payload.email, contact: payload.phone },
        theme:       { color: "#1D9E75" },
        handler: async (response) => {
          const verifyRes = await fetchWithRetry(`${BACKEND}/api/audit-crash/payment-success`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              registrationId:      registration._id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            if (window.fbq) {
              // Only fires after the backend confirmed the payment is CAPTURED.
              window.fbq("track", "Purchase", {
                content_name: "7-Day Audit Crash Tutoring Registration",
                content_type: "product",
                currency: "INR",
                value: 99,
              }, { eventID: response.razorpay_payment_id });
            }
            // Google Tag Manager
            if (window.dataLayer) {
              window.dataLayer.push({
                event: "audit_crash_purchase",
                content_name: "7-Day Audit Crash Tutoring Registration",
                currency: "INR",
                value: 99,
                transaction_id: response.razorpay_payment_id,
              });
            }
            window.location.href = "/audit-success";
          } else {
            setErrorMsg(verifyData.message || "Payment verification failed. Please contact support.");
            setStatus("idle");
          }
        },
        modal: { ondismiss: () => setStatus("idle") },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg(err instanceof TypeError
        ? "Couldn't reach the server. Please check your connection and try again in a moment."
        : err.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-16">
        <button onClick={onClose} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">← Back</button>
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Get Started</span>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Register for the 7-Day Audit Crash Tutoring</h2>
          <p className="text-gray-500">17th – 23rd August 2026 · 8 PM to 10 PM · ₹99 refundable deposit</p>
        </div>
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Your Full Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400" />

          <div>
            <div className="relative flex items-center">
              <span className="absolute left-5 text-sm font-bold text-gray-700">+91</span>
              <input type="tel" placeholder="10 digit phone number" value={form.phone}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm(f => ({ ...f, phone: digits }));
                }}
                maxLength="10"
                className={`w-full pl-12 pr-5 py-3.5 border-2 rounded-2xl text-sm font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 ${form.phone.length === 10 ? "border-[#1D9E75]" : "border-gray-200 focus:border-red-400"}`} />
            </div>
            {form.phone && form.phone.length < 10 && (
              <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits ({form.phone.length}/10)</p>
            )}
            {form.phone.length === 10 && (
              <p className="text-xs text-green-600 mt-1">✓ Valid phone number</p>
            )}
          </div>

          <input type="email" placeholder="Email ID" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400" />

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Appearing for CA Inter Sep 2026 attempt?</p>
            <div className="flex gap-3">
              {["Yes", "No"].map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, appearingForSep: opt }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${form.appearingForSep === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 text-gray-500"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Refund summary */}
          <div className="rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-black text-gray-900 mb-2">💸 How the ₹99 refund works</p>
            <ul className="text-xs text-gray-600 leading-relaxed flex flex-col gap-1.5">
              <li>• Attend at least <strong>90% of the total session hours</strong> (~12.6 of ~14 hrs)</li>
              <li>• Keep your <strong>camera ON</strong> throughout every session</li>
              <li>• Request your refund <strong>before 30th August 2026</strong></li>
              <li>• Refund reaches you within <strong>7–10 working days</strong> of approval</li>
            </ul>
          </div>

          {/* T&C acceptance — required before payment */}
          <label className={`flex items-start gap-3 px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all ${agreedTnc ? "border-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 bg-white"}`}>
            <input
              type="checkbox"
              checked={agreedTnc}
              onChange={e => { setAgreedTnc(e.target.checked); setErrorMsg(""); }}
              className="mt-0.5 w-4 h-4 flex-shrink-0 accent-[#1D9E75]"
            />
            <span className="text-xs text-gray-700 leading-relaxed">
              I have read and agree to the{" "}
              <a href={TNC_PDF} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} className="font-black underline underline-offset-2" style={{ color: "#0f6e56" }}>
                Terms &amp; Conditions (PDF)
              </a>{" "}
              of the 7-Day CA Inter Audit Crash Tutoring Sessions, including the refund eligibility conditions (90% attendance, camera-on policy) for the ₹99 refundable deposit.
            </span>
          </label>

          {errorMsg && <p className="text-center text-sm font-semibold text-red-500">{errorMsg}</p>}

          <button onClick={handleSubmit} disabled={status === "loading" || !agreedTnc}
            className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: GREEN }}>
            {status === "loading" ? "Processing..." : "Pay Now — ₹99 (Refundable) →"}
          </button>
          {!agreedTnc && <p className="text-center text-xs text-gray-400">Accept the Terms &amp; Conditions to enable payment.</p>}
          {agreedTnc && <p className="text-center text-xs text-gray-400">You'll be redirected to the payment gateway.</p>}
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">Questions CA Students Ask Us</h2>
          <p className="text-gray-500 text-lg">We believe informed students make confident decisions.</p>
        </Reveal>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className={`border-2 rounded-2xl overflow-hidden transition-all ${open === i ? "border-[#1D9E75]" : "border-gray-100"}`}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-bold text-gray-900 text-sm hover:bg-gray-50 transition-colors">
                  {f.q}
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} style={{ background: "#e8f8f2", color: GREEN }}>▾</span>
                </button>
                <div style={{ maxHeight: open === i ? "300px" : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
                  <div className="px-6 pb-5 pt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">{f.a}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="py-16 px-6" style={{ background: "#0f172a" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img src={logo} alt="FOCAS Edu" className="h-8 brightness-0 invert" />
            </div>
            <p className="text-xs text-slate-400 mb-1 mt-2">Presents</p>
            <p className="text-white font-black text-lg">7-Day Audit Crash Tutoring</p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">₹99. Refundable. Exam-oriented.<br />A CA Inter live tutoring programme.</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Quick Links</div>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Why Join", id: "why" },
                { label: "Schedule", id: "schedule" },
                { label: "Refund Policy", id: "refund" },
                { label: "FAQs", id: "faq" },
              ].map(l => (
                <li key={l.label}><button onClick={() => scroll(l.id)} className="text-sm text-slate-300 hover:text-[#1D9E75] capitalize transition-colors">{l.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Contact Us</div>
            <ul className="flex flex-col gap-4 text-sm text-slate-400">
              <li className="flex gap-3"><span>📞</span><a href="tel:+916383514285" className="hover:text-[#1D9E75] transition-colors">+91 63835 14285</a></li>
              <li className="flex gap-3"><span>🌐</span><a href="https://www.focasedu.com/audit" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">www.focasedu.com/audit</a></li>
              <li className="flex gap-3"><span>💻</span><span>Live Online Sessions</span></li>
              <li className="flex gap-3"><span>⏰</span><span>17th – 23rd Aug 2026, 8 PM – 10 PM</span></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6">
          <span className="text-xs text-slate-500">© 2026 FOCAS Edu. All rights reserved.</span>
          <div className="flex gap-5">
            <a href={TNC_PDF} target="_blank" rel="noopener" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Crash Tutoring T&amp;C</a>
            <a href="/pdf/Privacy%20Policy%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="/pdf/Terms%20and%20Condition%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Audit() {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [showFloat, setShowFloat]       = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [campaignPhone, setCampaignPhone] = useState(""); // store phone from URL

  // Campaign tracking — runs once on page load
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const phone    = params.get("phone");
    const source   = params.get("utm_source")   || "whatsapp";
    const campaign = params.get("utm_campaign") || "audit_crash_2026";

    if (!phone) return; // organic visit, nothing to track

    // Store phone to pre-fill register form
    setCampaignPhone(phone.replace(/^\+91/, "")); // strip +91 if present, keep 10 digits

    const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL || "http://localhost:8000";
    const payload = { phone, source, campaign, page: "audit", timestamp: new Date().toISOString() };

    fetch(`${BACKEND}/api/rti/track`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => console.log("✅ [Campaign Track] Success! DB response:", data))
      .catch(err => console.error("❌ [Campaign Track] Failed:", err.message));
  }, []);

  // Scroll listener
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 40);
      setShowFloat(window.scrollY > 400);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const openRegister = () => {
    setShowRegister(true);
    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_name: "7-Day Audit Crash Tutoring Registration",
        content_type: "product",
      });
    }
    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "audit_crash_register_open",
        content_name: "7-Day Audit Crash Tutoring Registration",
      });
    }
  };

  return (
    <div className="font-sans overflow-x-hidden">
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes ping { 0%,100% { transform:scale(1);opacity:1 } 50% { transform:scale(1.7);opacity:.4 } }
      `}</style>

      {showRegister && <RegisterPage onClose={() => setShowRegister(false)} campaignPhone={campaignPhone} />}

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onRegister={openRegister} />
      <Hero onRegister={openRegister} />
      <Ticker />
      <WhyJoin />
      <Schedule />
      <RefundPolicy />
      <section id="stories" className="py-16 md:py-24" style={{ background: "linear-gradient(160deg,#f8fffe,#f0fdf8)" }}>
        <SuccessStories titleClassName="text-gray-900" stories={AUDIT_STORIES} centered />
      </section>
      <FAQ />
      <Footer />

      {/* Floating CTA */}
      <div className={`fixed bottom-7 right-7 z-50 transition-all duration-300 ${showFloat ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
        <button onClick={openRegister}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl hover:-translate-y-0.5 hover:shadow-3xl transition-all"
          style={{ background: GREEN }}>
          <span className="w-2 h-2 rounded-full bg-white" style={{ animation: "ping 1.2s ease infinite" }} />
          Register — ₹99
        </button>
      </div>

      {/* WhatsApp */}
      <div className={`fixed bottom-7 left-7 z-50 transition-all duration-300 ${showFloat ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
        <a href="https://wa.me/916383514285" target="_blank" rel="noopener">
          <button className="rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-all" style={{ width: 52, height: 52, background: "#25d366" }}>💬</button>
        </a>
      </div>
    </div>
  );
}
