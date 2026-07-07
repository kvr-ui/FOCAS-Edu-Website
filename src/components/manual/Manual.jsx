import { useState, useEffect, useRef } from "react";
import logo from "../../../public/logo.png";
import React from "react";

const GREEN = "#1D9E75";
const ORANGE = "#FFA500";


// ─── Shared utilities ────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
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

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home",        href: "#home" },
  { label: "What You Get", href: "#offer" },
  { label: "How It Works", href: "#how" },
  { label: "FAQs",         href: "#faq" },
];

function Navbar({ scrolled, menuOpen, setMenuOpen, onRegister }) {
  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };
  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-100" : "bg-white/90"
        }`}
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scroll("home")}>
          <img src={logo} alt="FOCAS Edu" className="h-10" />
        </div>
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(l => (
            <button
              key={l.label}
              onClick={() => scroll(l.href.slice(1))}
              className="text-sm font-semibold text-gray-600 hover:text-[#1D9E75] transition-colors"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={onRegister}
            className="text-sm font-bold text-white px-5 py-2 rounded-full shadow-md transition-all hover:scale-105 hover:shadow-lg uppercase tracking-widest"
            style={{ background: GREEN }}
          >
            GET YOURS TODAY! — ₹299
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
            <button
              key={l.label}
              onClick={() => scroll(l.href.slice(1))}
              className="text-left py-3 text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0 hover:text-[#1D9E75] transition-colors"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={onRegister}
            className="mt-3 w-full py-3 rounded-full text-white font-bold text-sm uppercase tracking-widest"
            style={{ background: GREEN }}
          >
            GET YOURS TODAY! — ₹299
          </button>
        </div>
      )}
    </>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [
    "Stop Guessing. Start Scoring.",
    "FOCAS Manual",
    "CA Intermediate",
    "Personalized Tutor Session",
    "Make it yours at ₹299"
  ];
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ onRegister }) {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 px-6 lg:px-16 pt-16 lg:pt-24 pb-16"
      style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}
    >
      <div className="max-w-2xl w-full text-center lg:text-left flex flex-col">

        {/* Badge — desktop */}
        <div
          className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 mb-7 self-start"
          style={{ background: "#fff8ed", color: ORANGE }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
         <span>Limited stock available ! <span style={{ color: ORANGE, fontWeight: 900 }}>CA INTER Students</span></span>
        </div>

        {/* Heading */}
        <h1 className="mt-4 lg:mt-0 text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-gray-900 mb-3">
          Don't know where<br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg,#1D9E75,#0ea5e9)" }}
          >
            to start studying?
          </span><br />
          We'll show you exactly.
        </h1>


        <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-2 max-w-lg mx-auto lg:mx-0">
          Get A personalized CA tutor session + our FOCAS Manual — designed to break confusion and get you moving in the right direction.
        </p>

        <p className="text-base md:text-lg font-bold mb-4 max-w-lg mx-auto lg:mx-0" style={{ color: GREEN }}>
          Less than the cost of one food delivery order.
        </p>

        {/* Badge — mobile */}
        <div
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 mb-5 w-full justify-center"
          style={{ background: "#fff8ed", color: ORANGE }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Limited stock available ! <span style={{ color: ORANGE, fontWeight: 900 }}>CA INTER Students</span></span>
        </div>

        {/* Mobile video */}
        <div className="lg:hidden w-full rounded-3xl overflow-hidden shadow-2xl relative mb-5">
          <video
            src="https://vz-1b4abbd6-5f1.b-cdn.net/ea3a27e1-7239-4cda-8418-e2e78f49f6b5/playlist.m3u8"
            autoPlay muted loop playsInline
            className="w-full object-cover"
            style={{ height: "calc(100dvh - 380px)", minHeight: "200px" }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onRegister}
            className="absolute bottom-0 left-0 right-0 py-3 font-black text-sm tracking-widest uppercase text-center z-10"
            style={{ background: "#41C9EB", color: "#ffffff" }}
            onMouseOver={e => e.currentTarget.style.background = "#2bb8d9"}
            onMouseOut={e => e.currentTarget.style.background = "#41C9EB"}
          >
            GET YOURS NOW !
          </button>
        </div>

        {/* Price table */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-5">
          <div className="inline-grid grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden shadow-sm text-sm font-bold">
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-r border-gray-200">Session + Manual</div>
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-gray-200">Delivered to you</div>
            <div className="px-5 py-3 text-gray-900 border-r border-gray-100">₹299 only</div>
            <div className="px-5 py-3 text-gray-900">PAN India</div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-5">
          <button
            onClick={onRegister}
            className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: GREEN }}
          >
            GET YOURS TODAY! — ₹299 <span>→</span>
          </button>
        </div>

        {/* Stat cards */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {[
            ["1:1", "Tutor Session"],
            ["FOCAS", "Manual"],
            ["₹299", "All Inclusive"],
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

      {/* Desktop right side — video full height */}
      <div className="hidden lg:block relative w-full max-w-lg lg:w-[520px] xl:w-[580px] flex-shrink-0" style={{ height: "560px" }}>
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
          <video
            src="https://vz-1b4abbd6-5f1.b-cdn.net/ea3a27e1-7239-4cda-8418-e2e78f49f6b5/playlist.m3u8"
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onRegister}
            className="absolute bottom-0 left-0 right-0 py-4 font-black text-sm tracking-widest uppercase text-center transition-all z-10"
            style={{ background: "#41C9EB", color: "#ffffff" }}
            onMouseOver={e => e.currentTarget.style.background = "#2bb8d9"}
            onMouseOut={e => e.currentTarget.style.background = "#41C9EB"}
          >
            GET YOURS NOW !
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── What You Get ─────────────────────────────────────────────────────────────

const OFFER_ITEMS = [
  {
    icon: "🎯",
    title: "Personalized Tutor Session",
    desc: "A dedicated 1:1 session with a CA mentor who understands your current level, identifies your weak areas, and gives you a concrete action plan for the exam.",
    bg: "#F0FFF4", border: "#C6F6D5", accent: "#276749",
  },
  {
    icon: "📖",
    title: "FOCAS Manual",
    desc: "A personal, hold-in-hand, to keep you company and act as a guide to navigate through the sea of concepts.",
    bg: "#FFF5F5", border: "#FED7D7", accent: "#E53E3E",
  },
  {
    icon: "📊",
    title: "Clarity on how to FOCAS ahead",
    desc: "Come in confused and go back with clarity and direction.",
    bg: "#FFFFF0", border: "#FEFCBF", accent: "#975A16",
  },
  {
    icon: "📅",
    title: "Time Planning Framework",
    desc: "A practical framework to structure your study schedule from today to exam day — chapter-by-chapter, day-by-day.",
    bg: "#E6FFFA", border: "#B2F5EA", accent: "#234E52",
  },
];

function WhatYouGet({ onRegister }) {
  return (
    <section id="offer" className="py-10 md:py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: "#e8f8f2", color: "#0f6e56" }}
          >
            What You Get
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Everything you need to stop<br />guessing and start scoring.
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            From confused to confident — one manual + one session
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {OFFER_ITEMS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col gap-3"
                style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
              >
                <span className="text-3xl">{c.icon}</span>
                <h3 className="text-base font-black leading-snug" style={{ color: c.accent }}>{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div
            className="rounded-full px-8 py-5 flex flex-wrap gap-5 justify-center"
            style={{ background: "#0f172a" }}
          >
            <span className="text-white text-sm font-bold flex items-center gap-2">
              <span style={{ color: GREEN }}>✓</span> Manual shipped! Slot booked! {" "}
              <span className="text-gray-400">– Click here to</span>
            </span>
            <button
              onClick={onRegister}
              className="px-6 py-2 rounded-full text-white font-black text-sm hover:scale-105 transition-all"
              style={{ background: GREEN }}
            >
              Get Started →
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    student: "Yashika",
    batch: "2024",
    img: "/Testimonial/Yakshika.jpeg",
    feedback: "The method of teaching followed by FOCAS academy is perfect and trust me I was able to score 82 just by enrolling in their fast-track — then imagine how their regular course would be.",
  },
  {
    student: "Aravindha Lochanan",
    batch: "2023",
    img: "/Testimonial/Aravind lochan.jpg",
    feedback: "Best mentorship for struggling students with last-minute pending syllabus and repeaters. You can trust FOCAS for the best preparation for your upcoming attempt. Join FOCAS, make it your last attempt.",
  },
  {
    student: "Mercy",
    batch: "2025",
    img: "/Testimonial/Mercy.jpeg",
    feedback: "Really happy and satisfied with the tutors — the way of teaching here is effective. The concept behind Deep FOCAS is too good and I gained the confidence I always wanted.",
  },
  {
    student: "Naveen",
    batch: "2023",
    img: "/Testimonial/Naveen.jpeg",
    feedback: "I was able to complete preparation in class itself, because it was live studying and NO procrastination. Was able to recall at least 75% in the exams because of the cumulative revisions we did.",
  },
  {
    student: "Jagadeesh",
    batch: "2025",
    img: "/Testimonial/Jagadeesh.jpeg",
    feedback: "FOCAS helped me study in the best possible way. Their tutor session was really helpful to get out of the vicious circle of Audit! I thought of quitting CA, but because of them I could study it. Thanks FOCAS team!",
  },
];

function Testimonials() {
  const [index, setIndex] = useState(0);
  const [perPage, setPerPage] = useState(1);

  useEffect(() => {
    const update = () => setPerPage(window.innerWidth >= 1024 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS.length - perPage);
  const clamped = Math.min(index, maxIndex);

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  return (
    <section id="testimonials" className="py-10 md:py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8 md:mb-12">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: "#e8f8f2", color: "#0f6e56" }}
          >
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            What Our Students Say
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Real results from students who made it their last attempt.
          </p>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${clamped * (100 / perPage)}%)` }}
            >
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="flex-shrink-0 w-full lg:w-1/2 px-0 lg:px-3">
                  <div className="h-full bg-white border-[1.5px] border-green-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 md:p-7 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={t.img}
                        alt={t.student}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 flex-shrink-0"
                        style={{ borderColor: GREEN }}
                      />
                      <div>
                        <h3 className="font-black text-base md:text-lg text-gray-900 leading-tight">{t.student}</h3>
                        <p className="text-xs text-gray-400 font-semibold">{t.batch} Batch</p>
                        <div className="text-sm mt-0.5">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                      <span className="text-2xl font-black mr-1 align-top leading-none" style={{ color: GREEN }}>“</span>
                      {t.feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              disabled={clamped === 0}
              aria-label="Previous"
              className="w-11 h-11 rounded-full flex items-center justify-center font-black text-lg transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
              style={{ background: "#e8f8f2", color: "#0f6e56" }}
            >
              ‹
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: clamped === i ? 24 : 8,
                    background: clamped === i ? GREEN : "#cbd5e1",
                  }}
                />
              ))}
            </div>
            <button
              onClick={next}
              disabled={clamped === maxIndex}
              aria-label="Next"
              className="w-11 h-11 rounded-full flex items-center justify-center font-black text-lg transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
              style={{ background: "#e8f8f2", color: "#0f6e56" }}
            >
              ›
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  { emoji: "💳", time: "Step 1", label: "Pay ₹299 and complete your registration in under 2 minutes." },
  { emoji: "📞", time: "Step 2", label: "Your Manual is dispatched and delivered within 7 days" },
  { emoji: "🎯", time: "Step 3", label: "Get a call from our team to schedule your personalized tutor session" },
  { emoji: "📦", time: "Step 4", label: "Attend the tutor session and understand how your preparation needs to be done" },
  { emoji: "🚀", time: "Step 5", label: "Walk back with clarity to FOCAS ahead!" },
];

function HowItWorks() {
  return (
    <section id="how" className="py-10 md:py-24 px-6" style={{ background: "linear-gradient(160deg,#f8fffe,#f0fdf8)" }}>
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 text-lg">Simple. Fast. Effective.</p>
        </Reveal>

        <div className="relative">
          <div className="absolute left-[76px] top-5 bottom-5 w-0.5 rounded-full" style={{ background: `linear-gradient(to bottom, ${GREEN}, rgba(29,158,117,0.1))` }} />
          <div className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Reveal delay={0.1}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#1D9E75,#0ea47a)" }}>
              <div className="text-3xl mb-3">🎯</div>
              <div className="font-black text-lg mb-2">Tutor Session</div>
              <div className="text-sm opacity-85 leading-relaxed">A CA Mentor sits with you and with guides you on how to study for concentrate your exams. mindset.</div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
              <div className="text-3xl mb-3">📦</div>
              <div className="font-black text-lg mb-2">Physical Manual</div>
              <div className="text-sm opacity-85 leading-relaxed">A physical guide — to help you syllabus planning, areas to and hone the last-attempt </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Compare ──────────────────────────────────────────────────────────────────

const COMPARE_ROWS = [
  { label: "Personalized Tutor Session",    other: "❌", rti: "✅" },
  { label: "Study Along with an expert tutor",       other: "❌", rti: "✅" },
  { label: "Scoring Analysis",            other: "❌", rti: "✅" },
  { label: "Attempt-specific action plan",    other: "❌", rti: "✅" },
  { label: "Guidance and strategy for Sep26",            other: "Generic", rti: "PERSONALIZED" },
  { label: "Access to an Expert CA Mentor",                 other: "❌", rti: "✅" },
  { label: "Physical FOCAS Manual",          other: "❌", rti: "✅" },
];

function Compare() {
  return (
    <section id="compare" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
           Why our Counseling is Different
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Not all prep resources give you what actually matters.
          </p>
        </Reveal>

        <Reveal>
          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            <div className="grid grid-cols-[1fr_72px_100px] rounded-2xl overflow-hidden">
              <div className="px-3 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600">Feature</div>
              <div className="px-2 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 text-center">Others</div>
              <div className="px-2 py-2.5 text-xs font-black uppercase tracking-wider text-white text-center" style={{ background: GREEN }}>₹299 Pack ✓</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_72px_100px] items-center bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-3 py-4 text-xs font-semibold text-gray-700 leading-snug">{row.label}</div>
                <div className="px-2 py-4 text-center text-base text-red-400 border-l border-gray-100">{row.other}</div>
                <div
                  className="px-2 py-4 text-center font-black border-l border-gray-100 whitespace-nowrap overflow-hidden"
                  style={{
                    color: GREEN,
                    background: "rgba(29,158,117,0.06)",
                    fontSize: row.rti === "PERSONALIZED" ? "9px" : "14px",
                  }}
                >
                  {row.rti}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block rounded-3xl overflow-hidden border border-gray-200 shadow-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Feature</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">General Counseling</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border-b text-white" style={{ background: GREEN }}>FOCAS Manual Pro ✓</th>
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

// ─── FAQs ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Who is this for?", a: "CA Inter students who are confused about where to start, what to study and how to plan their preparation. If you’re feeling lost or overwhelmed, this is for you." },
  { q: "What exactly is the tutor session?", a: "A personalized session with a CA mentor who will make you study along with them and also review your current situation and give you a personalized study strategy." },
  { q: "What is in the physical manual?", a: "A printed guide covering chapter-wise importance, a time plan framework, exam tips and study cheat codes." },
  { q: "How is the manual delivered?", a: " It is shipped directly to the address you provide during registration. Delivery fee is included in the ₹299 price." },
  { q: "Why ₹299?", a: " We believe every CA student — regardless of their budget — deserves proper guidance. At a cost less than a single food delivery order." },
  { q: "How long does the tutor session take?", a: "1 hour. That is all it takes for the tutor to make you study and give you direction and clarity." },
  { q: "Who is conducting the sessions?", a: "Sessions will be conducted by the expert CA tutors of FOCAS Edu — an institute which has guided 1,000+ students in their CA journey to make it their last attempt." },
  { q: "How do I register?", a: "Just click on Get Started, Fill in Your details, and pay ₹299. That is it." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">Questions Asked by Students</h2>
          <p className="text-gray-500 text-lg">Get your doubts cleared before you buy.</p>
        </Reveal>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className={`border-2 rounded-2xl overflow-hidden transition-all ${open === i ? "border-[#1D9E75]" : "border-gray-100"}`}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-bold text-gray-900 text-sm hover:bg-gray-50 transition-colors"
                >
                  {f.q}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                    style={{ background: "#e8f8f2", color: GREEN }}
                  >▾</span>
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

// ─── Register Page ────────────────────────────────────────────────────────────

// ─── Register Page ────────────────────────────────────────────────────────────

function RegisterPage({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    groupSelection:"",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:7000";

  const handleSubmit = async () => {
    setErrorMsg("");

    const name      = form.name.trim();
    const phone     = form.phone.trim();
    const line1     = form.line1.trim();
    const line2     = form.line2.trim();
    const city      = form.city.trim();
    const state     = form.state.trim();
    const pincode   = form.pincode.trim();

    if (!name || !phone || !form.groupSelection || !line1 || !city || !state || !pincode) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg("Phone number must be exactly 10 digits.");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setErrorMsg("Pincode must be exactly 6 digits.");
      return;
    }

    // Meta Pixel — user submitted the registration form
    if (window.fbq) {
      window.fbq("track", "Lead", { content_name: "Manual ₹299", currency: "INR", value: 299 });
    }

    const payload = {
      name,
      phone: `+91${phone}`,
      groupSelection: form.groupSelection.trim(),
      address: {
        line1,
        line2,
        city,
        state,
        pincode,
      },

    };

    setStatus("loading");

    try {
      const regRes = await fetch(`${BACKEND}/api/manual-class/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const regData = await regRes.json();

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
        description: "₹299 Trial — Session + Physical Manual",
        order_id:    order.id,
        prefill:     { name: payload.name, contact: payload.phone },
        theme:       { color: "#1D9E75" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${BACKEND}/api/manual-class/payment-success`, {
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
                window.fbq("track", "Purchase", { content_name: "Manual ₹299", currency: "INR", value: 299 });
              }
              window.location.href = "/manual-success";
            } else {
              setErrorMsg("Payment verification failed. Please contact support.");
              setStatus("idle");
            }
          } catch (err) {
            setErrorMsg("Payment verification failed. Please contact support.");
            setStatus("idle");
          }
        },
        modal: { ondismiss: () => setStatus("idle") },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pb-16">
        <button onClick={onClose} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          ← Back
        </button>
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Get Started</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">FOCAS Manual Pro</h2>
          <p className="text-gray-500">Takes only 2 minutes to register.</p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text" placeholder="Your Full Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400"
          />
           <div className="relative flex items-center">
            <span className="absolute left-5 text-sm font-bold text-gray-700">+91</span>
            <input
              type="tel" placeholder="10 digit phone number" value={form.phone}
              onChange={e => { const d = e.target.value.replace(/\D/g, "").slice(0, 10); setForm(f => ({ ...f, phone: d })); }}
              maxLength="10"
              className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400"
            />
          </div>
          <select
            value={form.groupSelection}
            onChange={e => setForm(f => ({ ...f, groupSelection: e.target.value }))}
            className={`w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1D9E75] transition-all bg-white appearance-none ${form.groupSelection ? "text-gray-700" : "text-gray-400"}`}
          >
            <option value="" disabled className="text-gray-400">Group Selection</option>
            <option value="Group 1" className="text-gray-700 bg-white">Group 1</option>
            <option value="Group 2" className="text-gray-700 bg-white">Group 2</option>
            <option value="Both Group" className="text-gray-700 bg-white">Both Group</option>
          </select> 
         

          <input
            type="text" placeholder="Address Line 1 (House no., Street)" value={form.line1}
            onChange={e => setForm(f => ({ ...f, line1: e.target.value }))}
            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400"
          />
          <input
            type="text" placeholder="Address Line 2 (optional)" value={form.line2}
            onChange={e => setForm(f => ({ ...f, line2: e.target.value }))}
            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400"
          />

          <div className="flex gap-3">
            <input
              type="text" placeholder="City" value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-1/2 px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400"
            />
            <input
              type="text" placeholder="State" value={form.state}
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              className="w-1/2 px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400"
            />
          </div>

          <input
            type="text" placeholder="Pincode" value={form.pincode}
            onChange={e => { const d = e.target.value.replace(/\D/g, "").slice(0, 6); setForm(f => ({ ...f, pincode: d })); }}
            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:border-[#1D9E75] transition-all placeholder:text-gray-400"
          />

          {errorMsg && <p className="text-center text-sm font-semibold text-red-500">{errorMsg}</p>}

          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-70"
            style={{ background: GREEN }}
          >
            {status === "loading" ? "Processing..." : "Pay ₹299 & Get Started →"}
          </button>
          <p className="text-center text-xs text-gray-400">You'll be redirected to the payment gateway. Manual shipped after payment.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="py-16 px-6" style={{ background: "#0f172a" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          <div>
            <img src={logo} alt="FOCAS Edu" className="h-8 brightness-0 invert mb-2" />
            <p className="text-xs text-slate-400 mb-1 mt-2">Presents</p>
            <p className="text-white font-black text-base sm:text-lg whitespace-nowrap">Personalized Session + Manual @ ₹299</p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">Stop guessing. Start scoring.<br />Personalized Expert guidance.</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Quick Links</div>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Testimonials",  id: "testimonials" },
                { label: "How It Works",  id: "how" },
                { label: "Why Different", id: "compare" },
                { label: "FAQs",          id: "faq" },
              ].map(l => (
                <li key={l.label}>
                  <button onClick={() => scroll(l.id)} className="text-sm text-slate-300 hover:text-[#1D9E75] capitalize transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Contact Us</div>
            <ul className="flex flex-col gap-4 text-sm text-slate-400">
              <li className="flex gap-3"><span>📞</span><a href="tel:+916383514285" className="hover:text-[#1D9E75] transition-colors">+91 63835 14285</a></li>
              <li className="flex gap-3"><span>🌐</span><a href="https://www.focasedu.com" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">www.focasedu.com</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6">
          <span className="text-xs text-slate-500">© 2026 FOCAS Edu. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="/pdf/Privacy%20Policy%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="/pdf/Terms%20and%20Condition%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Manual() {
  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]       = useState(false);
  const [showFloat,     setShowFloat]      = useState(false);
  const [showRegister,  setShowRegister]   = useState(false);

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
      window.fbq("track", "ViewContent", { content_name: "Manual ₹299 Registration", content_type: "product" });
    }
  };

  return (
    <div className="font-sans overflow-x-hidden">
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes ping   { 0%,100% { transform:scale(1);opacity:1 } 50% { transform:scale(1.7);opacity:.4 } }
      `}</style>

      {showRegister && <RegisterPage onClose={() => setShowRegister(false)} />}

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onRegister={openRegister} />
      <Hero onRegister={openRegister} />
      <Ticker />
      <WhatYouGet onRegister={openRegister} />
      <Testimonials />
      <HowItWorks />
      <Compare />
      <FAQ />
      <Footer />

      {/* Floating CTA */}
      <div className={`fixed bottom-7 right-7 z-50 transition-all duration-300 ${showFloat ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
        <button
          onClick={openRegister}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl hover:-translate-y-0.5 transition-all"
          style={{ background: GREEN }}
        >
          <span className="w-2 h-2 rounded-full bg-white" style={{ animation: "ping 1.2s ease infinite" }} />
          Get Started — ₹299
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