import { useState, useEffect, useRef } from "react";
import logo from "../../../public/logo.png";
import React from "react";

const GREEN = "#1D9E75";
const ORANGE = "#FFA500";

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
  { label: "Why RTI", href: "#why" },
  { label: "What to Expect", href: "#curriculum" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQs", href: "#faq" },
];

const SCHEDULE = [
  { time: "9:30 AM",  emoji: "📍", label: "Students requested to arrive at venue for registration confirmation" },
  { time: "10:00 AM", emoji: "🎯", label: "Welcome and brief instructions to go about the day" },
  { time: "10:30 AM", emoji: "📄", label: "Personalized exam paper review & performance feedback at dedicated booths with CA Mentors (1:1) commences" },
  { time: "1:00 PM",  emoji: "🍽️", label: "Lunch Break" },
  { time: "2:00 PM",  emoji: "📊", label: "Paper review and performance feedback continues (1:1)" },
  { time: "4:00 PM",  emoji: "🚀", label: "Sep 2026 Strategy Session — Expert Panel led by CA K Venkat Ramanan" },
  { time: "5:30 PM",  emoji: "🏆", label: "Q&A with the Expert Panel" },
];

const COMPARE_ROWS = [
  { label: "1:1 Personalized Paper Review", other: "❌", rti: "✅" },
  { label: "CA Mentor Performance Feedback", other: "❌", rti: "✅" },
  { label: "Score & Gap Analysis", other: "❌", rti: "✅" },
  { label: "Attempt-specific Action Plan", other: "❌", rti: "✅" },
  { label: "Guidance & Strategy for Sep 26", other: "Generic", rti: "PERSONALIZED" },
  { label: "Access to Expert CA Mentors", other: "❌", rti: "✅" },
  { label: "Post-event Study Resources", other: "✅", rti: "✅" },
];

const FAQS = [
  { q: "Who is this event for?", a: "CA Inter students who appeared in the May 2026 attempt and are targeting Sep 2026. This event helps you understand the reason behind your result being UNSUCCESSFUL." },
  { q: "What is RTI Day?", a: "RTI stands for Right To Information Act, through which you can apply for your exam answer sheets. RTI Day is a full-day event where CA Mentors personally review your exam paper, give performance feedback and help you strategize for Sep 26." },
  { q: "What is the entry fee?", a: "₹799 per group. ₹1499 if you opt for both groups. For a full day of mentoring, personalized guidance and feedback." },
  { q: "Do I need to submit my exam papers beforehand?", a: "Yes. You will be sent a link for uploading your evaluated answer sheets, which will be the basis of our assessment." },
  { q: "What language will the event be held in?", a: "Primarily in English and Tamil. A bilingual approach is adopted to make the students feel comfortable." },
  { q: "Who is conducting the event?", a: "The event is being brought to you by FOCAS Edu — an institute which has guided 300+ students in their journey to realizing their CA dreams." },
  { q: "Where is the venue exactly?", a: "Bharathiya Vidhya Bhavan , Mylapore Chennai. Here's the Google Maps link: https://share.google/13I896gB9ftR3hOI5" },
  { q: "How do I register?", a: "Simply click on Register Now, pay the fee, and that's it. You're enrolled!" },
];

// ─── Campaign Tracking Utility ───────────────────────────────────────────────
async function trackCampaignVisit() {
  const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL || "http://localhost:8000";
  const params = new URLSearchParams(window.location.search);

  const phone    = params.get("phone");
  const source   = params.get("utm_source")   || "whatsapp";
  const campaign = params.get("utm_campaign") || "rti_2026";

  console.log("📊 [Campaign Track] URL Params:", {
    phone,
    source,
    campaign,
    fullURL: window.location.href,
  });

  if (!phone) {
    console.log("📊 [Campaign Track] No phone param found — skipping track.");
    return;
  }

  const payload = {
    phone,
    source,
    campaign,
    page: "rti",
    timestamp: new Date().toISOString(),
  };

  console.log("📊 [Campaign Track] Sending payload →", payload);

  try {
    const res = await fetch(`${BACKEND}/api/rti/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("✅ [Campaign Track] Successfully tracked! Response:", data);
    } else {
      console.warn("⚠️ [Campaign Track] Server returned error:", res.status, data);
    }
  } catch (err) {
    console.error("❌ [Campaign Track] Fetch failed:", err.message);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const items = ["Chennai — 2nd August", "FOCAS Edu", "RTI Day 2026", "Restart. Transform. Succeed.", "Exclusive for CA INTER Sep 26 students", "Expert CA Mentors"];
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

function Hero({ onRegister }) {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 lg:px-16 pt-16 lg:pt-24 pb-16"
      style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}
    >
      <div className="max-w-xl w-full text-center lg:text-left flex flex-col">
        <div
          className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 mb-7 self-start"
          style={{ background: "#fff8ed", color: ORANGE }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Now Open for Registration. <span style={{ color: ORANGE, fontWeight: 900 }}>CA INTER Sep 26</span></span>
        </div>

        <h1 className="mt-4 lg:mt-0 text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-gray-900 mb-3">
          Expected 60.<br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg,#1D9E75,#0ea5e9)" }}
          >
            Ended up with 39? Let's Analyze.
          </span><br />
          RTI Day 2026
        </h1>

        <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-2 max-w-lg mx-auto lg:mx-0">
          A full day paper review &amp; preparation strategy event hosted by FOCAS Edu — exclusively for CA Inter students.
        </p>

        <p className="text-base md:text-lg font-bold mb-4 max-w-lg mx-auto lg:mx-0" style={{ color: GREEN }}>
          Make Sep 2026 your last attempt.
        </p>

        <div className="lg:hidden w-full rounded-3xl overflow-hidden shadow-2xl relative mb-5">
          <video
            src="https://vz-1b4abbd6-5f1.b-cdn.net/81846c0c-1809-40fb-b30d-bb90d7069642/playlist.m3u8"
            autoPlay
            muted
            loop
            playsInline
            className="w-full object-cover"
            style={{ height: "calc(100dvh - 340px)", minHeight: "200px" }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onRegister}
            className="absolute bottom-0 left-0 right-0 py-3 font-black text-sm tracking-widest uppercase text-center z-10"
            style={{ background: "#41C9EB", color: "#ffffff" }}
            onMouseOver={e => e.currentTarget.style.background = "#2bb8d9"}
            onMouseOut={e => e.currentTarget.style.background = "#41C9EB"}
          >
            REGISTER NOW
          </button>
        </div>

        <div
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 mb-5 w-full justify-center"
          style={{ background: "#fff8ed", color: ORANGE }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Now Open for Registration. <span style={{ color: ORANGE, fontWeight: 900 }}>CA INTER Sep 26</span></span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-5">
          <div className="inline-grid grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden shadow-sm text-sm font-bold">
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-r border-gray-200">Group 1 or 2</div>
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-gray-200">Both Groups</div>
            <div className="px-5 py-3 text-gray-900 border-r border-gray-100">₹799 / group</div>
            <div className="px-5 py-3 text-gray-900">₹1499</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-5">
          <button
            onClick={onRegister}
            className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: GREEN }}
          >
            Register Now — ₹799/Group <span>→</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
          <span
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{ background: GREEN }}
          >
            📅 2nd August, Sunday
          </span>
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm">
            📍 Bharathiya Vidhya Bhavan, Mylapore, Chennai
          </span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {[
            ["10AM – 6PM", "Full Day Event"],
            ["1:1", "Paper Review"],
            ["CA Mentor", "Strategy session"],
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

      <div className="hidden lg:block relative w-full max-w-md lg:w-[460px] h-80 md:h-[460px] rounded-3xl overflow-hidden shadow-2xl flex-shrink-0">
        <video
          src="https://vz-1b4abbd6-5f1.b-cdn.net/81846c0c-1809-40fb-b30d-bb90d7069642/playlist.m3u8"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <button
          onClick={onRegister}
          className="absolute bottom-0 left-0 right-0 py-3 font-black text-sm tracking-widest uppercase text-center transition-all z-10"
          style={{ background: "#41C9EB", color: "#ffffff" }}
          onMouseOver={e => e.currentTarget.style.background = "#2bb8d9"}
          onMouseOut={e => e.currentTarget.style.background = "#41C9EB"}
        >
          REGISTER NOW
        </button>
      </div>
    </section>
  );
}

function WhyRTI() {
  const cards = [
    { title: "1:1 Paper Review",    bg: "#FFF5F5", border: "#FED7D7", accent: "#E53E3E", dot: "#FC8181" },
    { title: "CA Mentor Feedback",  bg: "#F0FFF4", border: "#C6F6D5", accent: "#276749", dot: "#68D391" },
    { title: "Sep 2026 Strategy",   bg: "#FFFFF0", border: "#FEFCBF", accent: "#975A16", dot: "#F6E05E" },
    { title: "FOCAS Edu's Trust",   bg: "#E6FFFA", border: "#B2F5EA", accent: "#234E52", dot: "#4FD1C5" },
  ];

  return (
    <section id="why" className="py-10 md:py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: "#e8f8f2", color: "#0f6e56" }}
          >
            Why RTI Day?
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            A solution for CA students<br />who are wondering what went wrong.
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            1 day. Personalized review. Guided strategy. Clarity on how to FOCAS ahead.
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

function Curriculum() {
  return (
    <section id="curriculum" className="py-10 md:py-24 px-6" style={{ background: "linear-gradient(160deg,#f8fffe,#f0fdf8)" }}>
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">What can you expect on RTI Day 2026?</h2>
          <p className="text-gray-500 text-lg">Every hour is planned to give you value-addition.</p>
          <p className="mt-4 text-sm text-orange-600 font-semibold italic">*Students are requested to be present at the venue by 9:30 AM to ensure that the registration confirmation process is carried out properly.*</p>
        </Reveal>
        <div className="relative">
          <div className="absolute left-[76px] top-5 bottom-5 w-0.5 rounded-full" style={{ background: `linear-gradient(to bottom, ${GREEN}, rgba(29,158,117,0.1))` }} />
          <div className="flex flex-col gap-4">
            {SCHEDULE.map((s, i) => (
              <Reveal key={s.time} delay={i * 0.07}>
                <div className="flex items-center group">
                  <div className="w-20 text-right pr-4 text-xs font-bold flex-shrink-0" style={{ color: GREEN }}>{s.time}</div>
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
          {[["Paper Review","bg-green-50 text-green-800 border-green-200"], ["Mentorship","bg-orange-50 text-orange-800 border-orange-200"], ["Strategy","bg-blue-50 text-blue-800 border-blue-200"], ["Analysis","bg-purple-50 text-purple-800 border-purple-200"], ["Q&A","bg-yellow-50 text-yellow-800 border-yellow-200"]].map(([label, cls]) => (
            <span key={label} className={`px-4 py-2 rounded-full text-xs font-bold border ${cls}`}>{label}</span>
          ))}
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Reveal delay={0.1}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#1D9E75,#0ea47a)" }}>
              <div className="text-3xl mb-3">📋</div>
              <div className="font-black text-lg mb-2">Paper Review Block</div>
              <div className="text-sm opacity-85 leading-relaxed">Mentors sit with you 1:1 and go through your exam answers. Personal attention only.</div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
              <div className="text-3xl mb-3">🗺️</div>
              <div className="font-black text-lg mb-2">Strategy Block</div>
              <div className="text-sm opacity-85 leading-relaxed">Expert CA Panel with a strategy session — syllabus planning, areas to concentrate and last-attempt mindset.</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HowToApply() {
  return (
    <section id="how-to-apply" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <Reveal>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Step-by-Step</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">How to Apply for RTI</h2>
          <p className="text-gray-500 text-lg italic mb-8">But how do you get your answer sheets? Watch this video to learn how.</p>
          <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm mx-auto" style={{ maxWidth: "800px" }}>
            <video
              src="https://vz-1b4abbd6-5f1.b-cdn.net/f931b325-d947-4757-8f70-98d2efcef184/playlist.m3u8"
              poster="https://vz-1b4abbd6-5f1.b-cdn.net/f931b325-d947-4757-8f70-98d2efcef184/thumbnail_207d2a98.jpg"
              controls
              className="w-full object-contain"
              style={{ height: "auto", aspectRatio: "16/9", minHeight: "300px" }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Compare() {
  return (
    <section id="compare" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Why RTI Day is Different
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Not all revision events offer you the same features.
          </p>
        </Reveal>

        <Reveal>
          <div className="md:hidden flex flex-col gap-3">
            <div className="grid grid-cols-[1fr_72px_100px] rounded-2xl overflow-hidden">
              <div className="px-3 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600">Feature</div>
              <div className="px-2 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 text-center">Others</div>
              <div className="px-2 py-2.5 text-xs font-black uppercase tracking-wider text-white text-center" style={{ background: GREEN }}>RTI Day ✓</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_72px_100px] items-center bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-3 py-4 text-xs font-semibold text-gray-700 leading-snug">{row.label}</div>
                <div className="px-2 py-4 text-center text-base text-red-400 border-l border-gray-100">{row.other}</div>
                <div
                  className="px-2 py-4 text-center font-black border-l border-gray-100 whitespace-nowrap overflow-hidden"
                  style={{ color: GREEN, background: "rgba(29,158,117,0.06)", fontSize: row.rti === "PERSONALIZED" ? "9px" : "14px" }}
                >
                  {row.rti}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-3xl overflow-hidden border border-gray-200 shadow-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Feature</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">Other Motivational CA Events</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border-b text-white" style={{ background: GREEN }}>RTI Day ✓</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{row.label}</td>
                    <td className="px-6 py-4 text-center text-lg text-red-400">{row.other}</td>
                    <td className="px-6 py-4 text-center text-lg font-black" style={{ color: GREEN, background: "rgba(29,158,117,0.04)" }}>{row.rti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Gallery() {
  const videos = [
    "https://vz-1b4abbd6-5f1.b-cdn.net/aab871ce-29fb-4305-b3b0-93b66237cb2b/playlist.m3u8",
    "https://vz-1b4abbd6-5f1.b-cdn.net/6e25a31d-9cb1-4cf5-b90c-09cd488072b0/playlist.m3u8",
    "https://vz-1b4abbd6-5f1.b-cdn.net/1945e8e1-88c8-48af-8728-ef4be26cace2/playlist.m3u8",
    "https://vz-1b4abbd6-5f1.b-cdn.net/af30ec55-2c19-48cd-a06a-8c16b4f76e56/playlist.m3u8",
    "https://vz-1b4abbd6-5f1.b-cdn.net/29c32588-ccb0-4ae0-acd8-9a6570e840af/playlist.m3u8",
    "https://vz-1b4abbd6-5f1.b-cdn.net/a67d22f5-f1fa-4f2d-9df7-42c6a26488af/playlist.m3u8"
  ];
  const thumbnails = [
    "https://vz-1b4abbd6-5f1.b-cdn.net/aab871ce-29fb-4305-b3b0-93b66237cb2b/thumbnail_2dcfa6d5.jpg",
    "https://vz-1b4abbd6-5f1.b-cdn.net/6e25a31d-9cb1-4cf5-b90c-09cd488072b0/thumbnail_185e988f.jpg",
    "https://vz-1b4abbd6-5f1.b-cdn.net/1945e8e1-88c8-48af-8728-ef4be26cace2/thumbnail_e3b573ac.jpg",
    "https://vz-1b4abbd6-5f1.b-cdn.net/af30ec55-2c19-48cd-a06a-8c16b4f76e56/thumbnail_7129b5a0.jpg",
    "https://vz-1b4abbd6-5f1.b-cdn.net/29c32588-ccb0-4ae0-acd8-9a6570e840af/thumbnail_38f87620.jpg",
    "https://vz-1b4abbd6-5f1.b-cdn.net/a67d22f5-f1fa-4f2d-9df7-42c6a26488af/thumbnail_ec588370.jpg"
  ];

  const [current, setCurrent] = React.useState(0);
  const trackRef = React.useRef(null);

  const scrollTo = (index) => {
    if (trackRef.current) {
      trackRef.current.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const prev = () => { const n = (current - 1 + videos.length) % videos.length; setCurrent(n); scrollTo(n); };
  const next = () => { const n = (current + 1) % videos.length; setCurrent(n); scrollTo(n); };

  return (
    <section id="gallery" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Event Highlights</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">What RTI Day looks like</h2>
        </Reveal>

        <style>{`
          .gallery-track { display:flex; overflow-x:auto; gap:16px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-bottom:4px; }
          .gallery-track::-webkit-scrollbar { display:none; }
          .gallery-slide { flex:0 0 85vw; max-width:400px; scroll-snap-align:center; min-height:550px; }
          @media (min-width:768px) { .gallery-slide { flex:0 0 calc(40% - 10px); max-width:none; min-height:550px; } }
          .gallery-nav-btn { width:44px; height:44px; border-radius:50%; border:none; background:#0f6e56; color:white; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s,transform 0.15s; }
          .gallery-nav-btn:hover { background:#0a5240; transform:scale(1.08); }
          .gallery-nav-btn:active { transform:scale(0.95); }
        `}</style>

        <Reveal>
          <div ref={trackRef} className="gallery-track">
            {videos.map((src, i) => (
              <div key={i} className="gallery-slide rounded-2xl overflow-hidden border border-gray-200 shadow-md flex-shrink-0" style={{ background: "#111" }}>
                <video src={src} poster={thumbnails[i]} controls className="w-full object-cover block" style={{ aspectRatio: "16/6", minHeight: "550px" }} />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-5">
            <button className="gallery-nav-btn" onClick={prev} aria-label="Previous">‹</button>
            <button className="gallery-nav-btn" onClick={next} aria-label="Next">›</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RegisterPage({ onClose, campaignPhone }) {
  const [form, setForm] = useState({
    name: "",
    phone: campaignPhone || "", // ✅ pre-fill phone from campaign URL
    email: "",
    appliedForSep: "",
    appliedForRTI: "",
    groupSelection: [],
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL || "http://localhost:8000";

  const toggleGroup = (g) => {
    setForm(f => ({
      ...f,
      groupSelection: f.groupSelection.includes(g)
        ? f.groupSelection.filter(x => x !== g)
        : [...f.groupSelection, g],
    }));
  };

  const price = () => {
    if (form.groupSelection.length === 2) return "₹1499";
    return "₹799";
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!form.name || !form.phone || !form.email || !form.appliedForSep || !form.appliedForRTI || form.groupSelection.length === 0) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (form.phone.length !== 10) {
      setErrorMsg("Valid phone number must be exactly 10 digits.");
      return;
    }

    const payload = {
      name:           form.name,
      phone:          `+91${form.phone}`,
      email:          form.email,
      appliedForSep:  form.appliedForSep,
      appliedForRTI:  form.appliedForRTI,
      groupSelection: form.groupSelection.length === 2 ? "Both Group" : form.groupSelection[0],
    };

    setStatus("loading");

    try {
      const regRes = await fetch(`${BACKEND}/api/attendees/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const regData = await regRes.json();
      console.log("Register response:", { status: regRes.status, data: regData });

      if (!regRes.ok) {
        setErrorMsg(regRes.status === 409
          ? "This email is already registered. Please use a different email or contact support."
          : regData.message || "Registration failed. Please try again.");
        setStatus("idle");
        return;
      }

      const { attendee, order } = regData;

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    order.currency,
        name:        "FOCAS Edu",
        description: `RTI Day 2026 — ${payload.groupSelection}`,
        order_id:    order.id,
        prefill:     { name: payload.name, email: payload.email, contact: payload.phone },
        theme:       { color: "#1D9E75" },
        handler: async (response) => {
          const verifyRes = await fetch(`${BACKEND}/api/attendees/payment-success`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              attendeeId:          attendee._id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            const amount = payload.groupSelection === "Both Group" ? 1499 : 799;
            if (window.fbq) {
              window.fbq("track", "Purchase", {
                content_name: "RTI Day 2026 Registration",
                content_type: "product",
                currency: "INR",
                value: amount,
              });
            }
            window.location.href = "/rti-success";
          } else {
            setErrorMsg("Payment verification failed. Please contact support.");
            setStatus("idle");
          }
        },
        modal: { ondismiss: () => setStatus("idle") },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-16">
        <button onClick={onClose} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">← Back</button>
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Get Started</span>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Register for RTI Day 2026</h2>
          <p className="text-gray-500">Takes only 5 minutes.</p>
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
                <button key={opt} onClick={() => setForm(f => ({ ...f, appliedForSep: opt }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${form.appliedForSep === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 text-gray-500"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Applied for RTI?</p>
            <div className="flex gap-3">
              {["Yes", "Not yet"].map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, appliedForRTI: opt }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${form.appliedForRTI === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 text-gray-500"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Select Groups Joining for Personalized Review</p>
            <div className="flex gap-3">
              {["Group 1", "Group 2"].map(g => (
                <button key={g} onClick={() => toggleGroup(g)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${form.groupSelection.includes(g) ? "border-[#1D9E75] text-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 text-gray-500"}`}>
                  {form.groupSelection.includes(g) ? "✓ " : ""}{g}
                </button>
              ))}
            </div>
            {form.groupSelection.length === 2 && <p className="text-xs text-gray-500 mt-2 text-center">Both groups selected — <strong>₹1499</strong></p>}
            {form.groupSelection.length === 1 && <p className="text-xs text-gray-500 mt-2 text-center">{form.groupSelection[0]} selected — <strong>₹799</strong></p>}
          </div>

          {errorMsg && <p className="text-center text-sm font-semibold text-red-500">{errorMsg}</p>}

          <button onClick={handleSubmit} disabled={status === "loading"}
            className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-70"
            style={{ background: GREEN }}>
            {status === "loading" ? "Processing..." : `Pay Now — ${price()} →`}
          </button>
          <p className="text-center text-xs text-gray-400">You'll be redirected to the payment gateway.</p>
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
            <p className="text-white font-black text-lg">RTI Day 2026</p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">Restart. Transform. Succeed.<br />A CA Inter strategy event.</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Quick Links</div>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Testimonials", id: "why" },
                { label: "What to Expect", id: "curriculum" },
                { label: "How to Apply for RTI", id: "how-to-apply" },
                { label: "Gallery", id: "gallery" },
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
              <li className="flex gap-3"><span>🌐</span><a href="https://www.focasedu.com/rti" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">www.focasedu.com/rti</a></li>
              <li className="flex gap-3">
                <span>📍</span>
                <a href="https://share.google/13I896gB9ftR3hOI5" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">
                  Bharathiya Vidhya Bhavan, Mylapore, Chennai
                </a>
              </li>
              <li className="flex gap-3"><span>⏰</span><span>Event: 2nd Aug, 10 AM – 6 PM</span></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6">
          <span className="text-xs text-slate-500">© 2026 FOCAS Edu. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="/pdf/Privacy%20Policy%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="/pdf/Terms%20and%20Condition%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Rti() {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [showFloat, setShowFloat]       = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [campaignPhone, setCampaignPhone] = useState(""); // ✅ store phone from URL

  // ✅ Campaign tracking — runs once on page load
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const phone    = params.get("phone");
    const source   = params.get("utm_source")   || "whatsapp";
    const campaign = params.get("utm_campaign") || "rti_2026";

    console.log("📊 [Campaign Track] Page loaded");
    console.log("📊 [Campaign Track] Full URL:", window.location.href);
    console.log("📊 [Campaign Track] Params → phone:", phone, "| source:", source, "| campaign:", campaign);

    if (!phone) {
      console.log("📊 [Campaign Track] No ?phone= in URL — organic visit, skipping track.");
      return;
    }

    // Store phone to pre-fill register form
    setCampaignPhone(phone.replace(/^\+91/, "")); // strip +91 if present, keep 10 digits

    const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL || "http://localhost:8000";
    const payload = { phone, source, campaign, page: "rti", timestamp: new Date().toISOString() };

    console.log("📊 [Campaign Track] Sending to backend →", `${BACKEND}/api/rti/track`);
    console.log("📊 [Campaign Track] Payload:", payload);

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
        content_name: "RTI Day 2026 Registration",
        content_type: "product",
      });
    }
  };

  return (
    <div className="font-sans overflow-x-hidden">
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes ping { 0%,100% { transform:scale(1);opacity:1 } 50% { transform:scale(1.7);opacity:.4 } }
      `}</style>

      {/* ✅ Pass campaignPhone to pre-fill register form */}
      {showRegister && <RegisterPage onClose={() => setShowRegister(false)} campaignPhone={campaignPhone} />}

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onRegister={openRegister} />
      <Hero onRegister={openRegister} />
      <Ticker />
      <WhyRTI />
      <Curriculum />
      <HowToApply />
      <Compare />
      <Gallery />
      <FAQ />
      <Footer />

      {/* Floating CTA */}
      <div className={`fixed bottom-7 right-7 z-50 transition-all duration-300 ${showFloat ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
        <button onClick={openRegister}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl hover:-translate-y-0.5 hover:shadow-3xl transition-all"
          style={{ background: GREEN }}>
          <span className="w-2 h-2 rounded-full bg-white" style={{ animation: "ping 1.2s ease infinite" }} />
          Register — ₹799
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