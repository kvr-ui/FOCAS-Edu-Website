import { useState, useEffect, useRef } from "react";
import logo from "../../public/logo.png";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CA_STATUS_OPTIONS, DIAL_CODES, captureUtms } from "@/components/bigin/formKit";

// Counselling bookings are saved on the RTI backend (RTI-Backend/server.js).
const BACKEND = import.meta.env.VITE_RTI_BACKEND_URL || "http://localhost:8000";

// URL-only attribution: the source is whatever utm_source is on the current
// link. A plain link (no UTM) is always "direct".
function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    source:   params.get("utm_source")   || "direct",
    campaign: params.get("utm_campaign") || "counselling_2026",
  };
}

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
  { label: "Why Counselling", href: "#why" },
  { label: "What to Expect", href: "#curriculum" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQs", href: "#faq" },
];

const SCHEDULE = [
  { time: "9:45 AM",  emoji: "📍", label: "Students requested to arrive at the venue for slot confirmation at the counselling desk" },
  { time: "10:00 AM", emoji: "🎯", label: "Welcoming & Briefing by CA K Venkat Ramanan" },
  { time: "10:20 AM", emoji: "🤝", label: "The Counselling session begins" },
  { time: "11:00 AM", emoji: "❓", label: "Doubt clarification along with a small Q&A" },
  { time: "11:30 AM", emoji: "🗺️", label: "Sep 26, Jan 27 and May 27 — Strategy session" },
  { time: "12:00 PM", emoji: "✅", label: "Wrap-up — walk out with a personalized action plan for your Sep 26 attempt" },
];

const COMPARE_ROWS = [
  { label: "1:1 Counselling with a CA Mentor", other: "❌", rti: "✅" },
  { label: "Personal Doubt Clarification", other: "❌", rti: "✅" },
  { label: "Sep 26, Jan 27 and May 27 Strategy", other: "Generic", rti: "PERSONALIZED" },
  { label: "Subject Priority & Study Plan", other: "❌", rti: "✅" },
  { label: "Career & Attempt Guidance", other: "❌", rti: "✅" },
  { label: "Access to Expert CA Mentors", other: "❌", rti: "✅" },
  { label: "Entry Fee", other: "Paid", rti: "FREE" },
];

const FAQS = [
  { q: "Is this really free?", a: "Yes. The 1:1 counselling, doubt clarification and Sep 2026 strategy session is completely FREE. There is no entry fee and no payment at any stage. We only ask you to register so we can reserve a mentor slot for you." },
  { q: "Who is this session for?", a: "CA Inter Students looking to attempt in Sep 2026, Jan 2027 and May 2027 — whether you're unsure where to start, stuck with doubts or need a clear direction." },
  { q: "When exactly is the free counselling?", a: "On 2nd August (Sunday), between 10 AM to 12 PM, at Bharatiya Vidya Bhavan, Mylapore, Chennai. We run it on the same day as our RTI Day event, in a dedicated counselling zone." },
  { q: "How is this different from RTI Day?", a: "RTI Day is our full-day paid event where our expert CA Mentors review the Certified Copies of your previous attempt, 1:1. This free session, from 10 AM to 12 PM does not include paper review or a dedicated actionable plan. It covers counselling, clarification of doubts and Exam Strategy." },
  { q: "Do I need to bring anything?", a: "Nothing mandatory. If you have your study plan, a list of doubts or your marksheet — bring it. The mentor will have more context to give better guidance." },
  { q: "How long is my 1:1 slot?", a: "Each student gets a dedicated 10-15 minutes slot with our expert Mentors within the 10 AM to 12 PM time frame. Slots are allotted on a first-registered first-served basis. So register early." },
  { q: "What language will the session be held in?", a: "Primarily in English and Tamil. A bilingual approach is adopted to make the students feel comfortable." },
  { q: "Where is the venue exactly?", a: "Bharathiya Vidhya Bhavan, Mylapore, Chennai. Here's the Google Maps link: https://share.google/13I896gB9ftR3hOI5" },
];

const ROUTE_OPTIONS = ["Direct Entry", "Foundation Entry"];
const STUDENT_TYPE_OPTIONS = ["Full Time CA Student", "College Goer", "Working Professional"];
const ATTEMPT_OPTIONS = ["Sep 2026", "Jan 2027", "May 2027"];

// The counselling event — stored with every booking so the DB carries the
// date and slot window the student registered for.
const COUNSELLING_DATE = "2026-08-02"; // 2nd Aug 2026 (Sunday)
const SLOT_WINDOW = "10:00 AM - 12:00 PM";

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
            BOOK FREE SLOT
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
          <button onClick={onRegister} className="mt-3 w-full py-3 rounded-full text-white font-bold text-sm uppercase tracking-widest" style={{ background: GREEN }}>BOOK FREE SLOT</button>
        </div>
      )}
    </>
  );
}

function Ticker() {
  const items=["1:1 Mentor Counselling", "Chennai - 2nd August", "Sep 26, Jan 27, May 27 Strategy", "FREE Session","10 AM to 12 PM","Expert CA Mentors", "FOCAS Edu"]
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
      <div className="max-w-xl w-full text-center lg:text-left flex flex-col space-y-5">
        <div
          className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 self-start"
          style={{ background: "#fff8ed", color: ORANGE }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Slots Open — <span style={{ color: ORANGE, fontWeight: 900 }}>100% FREE</span> for CA Students</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-gray-900">
          What to study next?<br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg,#1D9E75,#0ea5e9)" }}
          >
            How to study next?
          </span><br />
          Let’s talk. Free 1:1 Mentor Counselling
        </h1>

        <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
         Join us for 1:1 personalized counselling and mentoring to clarify all your doubts and get go back home with clarity on how to approach CA Inter Sep 2026 exams — hosted by FOCAS Edu.
        </p>

        <p className="text-base md:text-lg font-bold max-w-lg mx-auto lg:mx-0" style={{ color: GREEN }}>
          2 hours with a CA Mentor. Zero fee.
        </p>

        <div className="lg:hidden w-full rounded-3xl overflow-hidden shadow-2xl relative">
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
            BOOK FREE SLOT
          </button>
        </div>

        <div
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 w-full justify-center"
          style={{ background: "#fff8ed", color: ORANGE }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Slots Open — <span style={{ color: ORANGE, fontWeight: 900 }}>100% FREE</span></span>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white" style={{ background: ORANGE }}>
            🎁 Zero Fee. Zero Payment.
          </span>
          <span className="text-xs font-semibold text-gray-500">just register to reserve your mentor slot</span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          <div className="inline-grid grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden shadow-sm text-sm font-bold">
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-r border-gray-200">Session Fee</div>
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-gray-200">Slot Timing</div>
            <div className="px-5 py-3 text-gray-900 border-r border-gray-100"><span className="text-gray-400 font-semibold mr-1.5" style={{ textDecoration: "line-through" }}>₹499</span>FREE</div>
            <div className="px-5 py-3 text-gray-900">10 AM – 12 PM</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          <button
            onClick={onRegister}
            className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: GREEN }}
          >
            Book My Free Slot <span>→</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
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
            ["10AM – 12PM", "Free Session"],
            ["1:1", "Mentor Counselling"],
            ["Sep 26, Jan 27, May 27", "Strategy & Guidance"],
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
          BOOK FREE SLOT
        </button>
      </div>
    </section>
  );
}

function WhyCounselling() {
  const cards = [
    { title: "Free 1:1 Counselling",   bg: "#FFF5F5", border: "#FED7D7", accent: "#E53E3E", dot: "#FC8181" },
    { title: "Doubt Clarification",    bg: "#F0FFF4", border: "#C6F6D5", accent: "#276749", dot: "#68D391" },
    { title: "Sep 2026 Strategy",      bg: "#FFFFF0", border: "#FEFCBF", accent: "#975A16", dot: "#F6E05E" },
    { title: "FOCAS Edu's Trust",      bg: "#E6FFFA", border: "#B2F5EA", accent: "#234E52", dot: "#4FD1C5" },
  ];

  return (
    <section id="why" className="py-10 md:py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: "#e8f8f2", color: "#0f6e56" }}
          >
            Why this session?
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            For every CA student who is<br />studying hard but planning blind.
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
One mentor dedicated for you, to clarify all your doubts. Walk away with clarity and direction.
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
            Backed by the trust of <span className="font-black text-gray-900">1000+ students</span>  who have made it their LAST ATTEMPT with FOCAS Edu.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-4 rounded-full px-8 py-5 flex flex-wrap gap-5 justify-center"
            style={{ background: "#0f172a" }}
          >
            <span className="text-white text-sm font-bold flex items-center gap-2">
              <span style={{ color: GREEN }}>✓</span> Book your free slot today!{" "}
              <span className="text-gray-400">Limited mentor slots only.</span>
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
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">What happens between 10 AM and 12 PM?</h2>
          <p className="text-gray-500 text-lg">Two hours, fully planned around you.</p>
          <p className="mt-4 text-sm text-orange-600 font-semibold italic">*Students are requested to be present at the venue by 9:45 AM so that your mentor slot is confirmed at the counselling desk.*</p>
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
          {[["Counselling","bg-green-50 text-green-800 border-green-200"], ["Mentorship","bg-orange-50 text-orange-800 border-orange-200"], ["Clarification","bg-blue-50 text-blue-800 border-blue-200"], ["Strategy","bg-purple-50 text-purple-800 border-purple-200"], ["Q&A","bg-yellow-50 text-yellow-800 border-yellow-200"]].map(([label, cls]) => (
            <span key={label} className={`px-4 py-2 rounded-full text-xs font-bold border ${cls}`}>{label}</span>
          ))}
        </Reveal>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Reveal delay={0.1}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#1D9E75,#0ea47a)" }}>
              <div className="text-3xl mb-3">🤝</div>
              <div className="font-black text-lg mb-2">Counselling &amp; Doubt Block</div>
              <div className="text-sm opacity-85 leading-relaxed">A CA Mentor sits with you 1:1 — bring your doubts, your confusion and your questions. Personal attention only.</div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
              <div className="text-3xl mb-3">🗺️</div>
              <div className="font-black text-lg mb-2">Sep 2026 Strategy Block</div>
              <div className="text-sm opacity-85 leading-relaxed">Subject priority, syllabus planning, revision cycles and the last-attempt mindset — mapped to your current preparation level.</div>
            </div>
          </Reveal>
        </div> */}
      </div>
    </section>
  );
}

function SameDayNote() {
  return (
    <section id="same-day" className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <Reveal>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Same Day as RTI Day</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">Already coming for RTI Day?</h2>
  
          <p className="text-gray-500 text-lg mb-8">
            We conduct RTI Day 2026 on the very same day. Between  <strong className="text-gray-800">10 AM and 12 PM</strong>,
            we will be running this FREE Mentorship session in a dedicated Counselling Zone — open to every CA Inter student, whether or not you registered for RTI Day.

          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="rounded-2xl border-2 border-gray-100 p-6 bg-white shadow-sm">
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: GREEN }}>Free Counselling</div>
              <div className="font-black text-gray-900 text-lg mb-2">10 AM – 12 PM · ₹0</div>
              <ul className="text-sm text-gray-600 leading-relaxed flex flex-col gap-1.5">
                <li>✓ 1:1 counselling with a CA Mentor</li>
                <li>✓ Personal doubt clarification</li>
                <li>✓ Sep 26, Jan 27, May 27 Exam Strategy</li>
                <li className="text-gray-400">✗ Answer sheet review</li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 p-6 shadow-sm" style={{ borderColor: "#C6F6D5", background: "#F0FFF4" }}>
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#975A16" }}>RTI Day 2026</div>
              <div className="font-black text-gray-900 text-lg mb-2">10 AM – 6 PM · Paid</div>
              <ul className="text-sm text-gray-600 leading-relaxed flex flex-col gap-1.5">
                <li>✓ 1:1 Paper Review with Counselling</li>
                <li>✓ Score &amp; gap detailed analysis</li>
                <li>✓ Expert panel strategy session</li>
                <li>✓ Attempt-specific personalized Action Plan</li>
              </ul>
              <a href="/rti" className="inline-block mt-4 text-sm font-bold underline underline-offset-2" style={{ color: GREEN }}>
                See RTI Day details →
              </a>
            </div>
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
            Why this counselling is different
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Not all guidance sessions offer you the same attention.
          </p>
        </Reveal>

        <Reveal>
          <div className="md:hidden flex flex-col gap-3">
            <div className="grid grid-cols-[1fr_72px_100px] rounded-2xl overflow-hidden">
              <div className="px-3 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600">Feature</div>
              <div className="px-2 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 text-center">Others</div>
              <div className="px-2 py-2.5 text-xs font-black uppercase tracking-wider text-white text-center" style={{ background: GREEN }}>FOCAS ✓</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_72px_100px] items-center bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-3 py-4 text-xs font-semibold text-gray-700 leading-snug">{row.label}</div>
                <div className="px-2 py-4 text-center text-xs text-red-400 border-l border-gray-100">{row.other}</div>
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">Other Guidance Sessions</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border-b text-white" style={{ background: GREEN }}>FOCAS Counselling ✓</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{row.label}</td>
                    <td className="px-6 py-4 text-center text-sm text-red-400">{row.other}</td>
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
    "https://da3m0k666tznr.cloudfront.net/Successful_stories/Gayathri.mp4",
    "https://da3m0k666tznr.cloudfront.net/Successful_stories/HariniAiswariya.mp4",
    "https://da3m0k666tznr.cloudfront.net/Successful_stories/Sridevi.mp4",
    "https://da3m0k666tznr.cloudfront.net/Successful_stories/Saishruthi.mp4",
    "https://da3m0k666tznr.cloudfront.net/Successful_stories/Marimuthu.mp4",
    "https://da3m0k666tznr.cloudfront.net/Successful_stories/Jeshurun.mp4"
  ];
  const thumbnails = [
    
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
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Student Voices</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">What mentoring at FOCAS looks like</h2>
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
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    dialCode: "+91",
    phone: campaignPhone || "",
    caStatus: "",
    route: "",        // Direct Entry / Foundation Entry
    lastExam: "",     // free text — when they last sat for CA exams
    studentType: "",  // Full Time CA Student / College Goer / Working Professional
    attempt: "",      // upcoming attempt — Sep 26 / Jan 27 / May 27
    company: "", // honeypot — must stay empty for real users
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!form.fullName.trim() || !form.phone || !form.caStatus || !form.route ||
        !form.lastExam || !form.studentType || !form.attempt) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (form.dialCode === "+91" && form.phone.length !== 10) {
      setErrorMsg("Valid phone number must be exactly 10 digits.");
      return;
    }

    const { source, campaign } = getAttribution();

    const payload = {
      name:        form.fullName.trim(),
      phone:       `${form.dialCode}${form.phone}`.trim(),
      caStatus:    form.caStatus,
      route:       form.route,
      lastExam:    form.lastExam.trim(),
      studentType: form.studentType,
      attempt:     form.attempt,
      counsellingDate: COUNSELLING_DATE,
      slotWindow:      SLOT_WINDOW,
      source,
      campaign,
      company:     form.company, // honeypot
      utm:         captureUtms(),
    };

    setStatus("loading");
    try {
      // Free session — no payment step. The lead is saved straight away so the
      // team can confirm the mentor slot over a call.
      const res = await fetch(`${BACKEND}/api/counselling/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Submission failed. Please try again.");
      }

      // Hand the answers to the success page so it can enrich the conversion
      // event without re-fetching the lead.
      try {
        sessionStorage.setItem("focas_counselling", JSON.stringify({
          name: payload.name,
          phone: payload.phone,
          caStatus: payload.caStatus,
          route: payload.route,
          studentType: payload.studentType,
          attempt: payload.attempt,
          counsellingDate: payload.counsellingDate,
          slotWindow: payload.slotWindow,
        }));
      } catch {
        /* sessionStorage may be unavailable (private mode) — non-fatal */
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "counselling_slot_booked",
        ca_level: payload.caStatus,
        ca_route: payload.route,
        student_type: payload.studentType,
        attempt: payload.attempt,
        source,
        campaign,
      });

      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: "Free Counselling Session 2026",
          content_type: "product",
        });
      }
      if (typeof window.gtag === "function") {
        window.gtag("event", "counselling_slot_booked", {
          event_category: "engagement",
          event_label: "Free 1:1 Counselling — 2nd August",
        });
      }

      navigate("/counselling-success");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const inputCls = "w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-16">
        <button onClick={onClose} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">← Back</button>
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>100% Free</span>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Book your free 1:1 slot</h2>
          <p className="text-gray-500">Takes only 2 minutes. No payment required.</p>
        </div>
        <div className="flex flex-col gap-4">
          {/* honeypot — invisible to real users, bots fill it and the server drops it */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
            value={form.company} onChange={set("company")}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

          <input type="text" placeholder="Your Full Name" value={form.fullName} onChange={set("fullName")} className={inputCls} />

          <div>
            <div className="flex gap-3">
              <select value={form.dialCode} onChange={set("dialCode")} aria-label="Country code"
                className="px-3 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:border-[#1D9E75] transition-all bg-white">
                {DIAL_CODES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="tel" placeholder="10 digit phone number" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 15) }))}
                className={`flex-1 px-5 py-3.5 border-2 rounded-2xl text-sm font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 ${form.phone.length === 10 ? "border-[#1D9E75]" : "border-gray-200 focus:border-red-400"}`} />
            </div>
            {form.dialCode === "+91" && form.phone && form.phone.length < 10 && (
              <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits ({form.phone.length}/10)</p>
            )}
            {form.dialCode === "+91" && form.phone.length === 10 && (
              <p className="text-xs text-green-600 mt-1">✓ Valid phone number</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Your CA level</p>
            <div className="flex gap-3">
              {CA_STATUS_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, caStatus: opt }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${form.caStatus === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 text-gray-500"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Route of joining CA</p>
            <div className="flex gap-3">
              {ROUTE_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, route: opt }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${form.route === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 text-gray-500"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">When was the last time you gave CA exams?</p>
            <input type="text" placeholder="e.g. May 2026, or never appeared" value={form.lastExam} onChange={set("lastExam")} className={inputCls} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Are you a</p>
            <div className="flex flex-col gap-3">
              {STUDENT_TYPE_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, studentType: opt }))}
                  className={`w-full py-3 rounded-2xl text-sm font-bold border-2 transition-all ${form.studentType === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#e8f8f2]" : "border-gray-200 text-gray-500"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">When are you giving CA exams?</p>
            <select value={form.attempt} onChange={set("attempt")}
              className={`${inputCls} bg-white ${form.attempt ? "" : "text-gray-400"}`}>
              <option value="" disabled>-Select your attempt-</option>
              {ATTEMPT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {errorMsg && <p className="text-center text-sm font-semibold text-red-500">{errorMsg}</p>}

          <button onClick={handleSubmit} disabled={status === "loading"}
            className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-70"
            style={{ background: GREEN }}>
            {status === "loading" ? "Booking..." : "Book My Free Slot — ₹0 →"}
          </button>
          <p className="text-center text-xs text-gray-400">No payment. Our team will call you to confirm your slot timing.</p>
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
            <p className="text-white font-black text-lg">Free 1:1 Counselling</p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">Ask. Clarify. Strategize.<br />A CA mentor session for Sep 2026.</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Quick Links</div>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Why Counselling", id: "why" },
                { label: "What to Expect", id: "curriculum" },
                { label: "Same Day as RTI Day", id: "same-day" },
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
              <li className="flex gap-3"><span>🌐</span><a href="https://www.focasedu.com/counselling" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">www.focasedu.com/counselling</a></li>
              <li className="flex gap-3">
                <span>📍</span>
                <a href="https://share.google/13I896gB9ftR3hOI5" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">
                  Bharathiya Vidhya Bhavan, Mylapore, Chennai
                </a>
              </li>
              <li className="flex gap-3"><span>⏰</span><span>Free session: 2nd Aug, 10 AM – 12 PM</span></li>
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
export default function Counselling() {
  const [scrolled, setScrolled]           = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [showFloat, setShowFloat]         = useState(false);
  const [showRegister, setShowRegister]   = useState(false);
  const [campaignPhone, setCampaignPhone] = useState("");

  // Tag Manager / analytics page view. GTM, GA4 and the Meta Pixel are loaded
  // globally in index.html; this pushes the route-specific event so GTM can
  // fire counselling-only tags and triggers.
  useEffect(() => {
    const { source, campaign } = getAttribution();

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "counselling_page_view",
      page_path: "/counselling",
      page_title: "Free 1:1 Mentor Counselling — FOCAS Edu",
      source,
      campaign,
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_title: "Free 1:1 Mentor Counselling",
        page_path: "/counselling",
      });
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, []);

  // Campaign tracking — runs once on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phone  = params.get("phone");
    const { source, campaign } = getAttribution();

    if (!phone) return;

    // Store phone to pre-fill the booking form
    setCampaignPhone(phone.replace(/^\+91/, ""));

    const payload = { phone, source, campaign, page: "counselling", timestamp: new Date().toISOString() };

    fetch(`${BACKEND}/api/rti/track`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    }).catch(err => console.error("❌ [Campaign Track] Failed:", err.message));
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
        content_name: "Free Counselling Session 2026",
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

      {showRegister && <RegisterPage onClose={() => setShowRegister(false)} campaignPhone={campaignPhone} />}

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onRegister={openRegister} />
      <Hero onRegister={openRegister} />
      <Ticker />
      <WhyCounselling />
      <Curriculum />
      <SameDayNote />
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
          Book Free Slot
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
