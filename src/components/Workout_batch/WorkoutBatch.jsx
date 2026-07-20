import { useState, useEffect, useRef } from "react";
import logo from "../../../public/logo.png";
import React from "react";
import WorkoutBatchForm from "./WorkoutBatchForm";

const GREEN = "#1D9E75";
const ORANGE = "#FFA500";

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
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Why Workout Batch", href: "#why" },
  { label: "What's Included", href: "#curriculum" },
  { label: "FAQs", href: "#faq" },
];

const KIT_ITEMS = [
  { emoji: "📚", label: "Curated Question Banks", desc: "Hand-picked questions covering high-yield exam topics, sorted by chapter and difficulty." },
  { emoji: "🏃", label: "Weekly MCQ Marathons", desc: "Timed weekly sessions to sharpen speed, accuracy and recall before the exam." },
  { emoji: "📝", label: "Regular Tests", desc: "Full-syllabus and chapter-wise tests mirroring the actual CA Inter exam pattern." },
  { emoji: "🎥", label: "Tests with Video Evaluations", desc: "Your test answers are evaluated and explained on video so you know exactly where you lost marks." },
  { emoji: "👥", label: "Last Attempt Community Access", desc: "Study alongside students who are serious about making this their final attempt." },
  { emoji: "🗺️", label: "Syllabus Coverage Guide", desc: "A structured guide to help you cover the entire syllabus within the one-month workout window." },
];

const COMPARE_ROWS = [
  { label: "1:10 Personalized Tutor Attention", other: "❌", wb: "✅" },
  { label: "Question Banks", other: "Generic", wb: "Curated" },
  { label: "Weekly MCQ Marathons", other: "❌", wb: "✅" },
  { label: "Tests with Video Evaluations", other: "❌", wb: "✅" },
  { label: "Last Attempt Community", other: "❌", wb: "✅" },
  { label: "Complete Syllabus in 1 Month", other: "❌", wb: "✅" },
  {label:"Class Type", other:"Lecture", wb:"Workout"},
];

const TESTIMONIALS = [
  { name: "Yashika", batch: "2024 Batch", text: "The method of teaching followed by Focas academy is perfect and Trust me I was able to score 82 just by enrolling in their fasttrack then imagine how their regular course would be." },
  { name: "Naveen", batch: "2023 Batch", text: "I was able to complete preparation in Class itself, because it was live studying and NO procrastination. Got rid of confusions in the class itself as there were discussions of Q&A at the end of every topic. Was able to recall at least 75% in the exams because of the cumulative revisions we did in the class." },
  { name: "Mercy", batch: "2025 Batch", text: "Really happy and satisfied with the tutors we have is really good, the way of teaching here is enough+only one time oversee that effective. The concept behind deep focas grb is too good and gained confidence which I always wanted for." },
  { name: "Jagadeesh", batch: "2025 Batch", text: "FOCAS helped me to study at the best possible way. Their tutor session was really helpful for me to get out of vicious circle of audit! I thought of quiting CA because of audit, but because of them, I can able to study it. Thanks FOCAS team!" },
  { name: "Aravindha Lochanan", batch: "2023 Batch", text: "Best mentorship with coaching for struggling students with last minute pending syllabus and repeaters. Can trust FOCAS for best ever preparation for upcoming attempt. Join FOCAS make it ur last attempt." },
];

const FAQS = [
  { q: "Who is the Workout Batch for?", a: "CA Intermediate students who have pending syllabus or are repeaters and want to complete a full-fledged workout within a month before their exam." },
  { q: "What does 1:10 Personalized Tutor mean?", a: "One tutor gives personalized attention to a batch of ≤10 students, making you work out selective sums in the class to make you exam ready — not a 100-student lecture." },
  { q: "What is The Last Attempt Kit?", a: "It includes Curated Question Banks, Weekly MCQ Marathons, Regular Tests, Tests with Video Evaluations, Syllabus Coverage Guide, and access to the Last Attempt Community." },
  { q: "What is the G1 / G2 Combo offer?", a: "Enroll for all 3 papers in a group at a discounted combo price — G1 Combo is ₹10,000 and G2 Combo is ₹10,000, saving you ₹5,000 compared to individual paper prices." },
  { q: "What is the Unit 2D Combo?", a: "A special combo for Group II students appearing for Unit 2D, priced at ₹8,000." },
  { q: "How do I enroll?", a: "Click the Enquire Now button on this page to fill out our quick enrollment form. Our team will get back to you immediately." },
  { q: "Who is conducting the Workout Batch?", a: "FOCAS Edu — an institute that has guided 300+ students in their journey to realizing their CA dreams." },
  { q: "What language are the sessions held in?", a: "Sessions are conducted in both English and Hindi (हिंदी) so every student feels comfortable." },
];

/* ── Enroll modal with native Bigin form ── */
function EnrolModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "min(96vw, 640px)", maxHeight: "95vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-bold"
        >
          ✕
        </button>
        {/* Header */}
        <div className="flex-shrink-0 px-7 pt-6 pb-4 border-b border-gray-100 flex items-center gap-4">
          <img src={logo} alt="FOCAS Edu" className="h-8" />
          <div>
            <p className="text-sm font-black text-gray-800">The Last Attempt Workout Batch</p>
            <p className="text-xs text-gray-400">Enrollment Form — CA Intermediate</p>
          </div>
        </div>
        {/* Native form (submits to Bigin via our server; redirects to success) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <WorkoutBatchForm />
        </div>
      </div>
    </div>
  );
}

function Navbar({ scrolled, menuOpen, setMenuOpen, onEnrol }) {
  const scroll = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-100" : "bg-white/90"}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scroll("home")}>
          <img src={logo} alt="FOCAS Edu" className="h-10" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => scroll(l.href.slice(1))} className="text-sm font-semibold text-gray-600 hover:text-[#1D9E75] transition-colors">
              {l.label}
            </button>
          ))}
          {/* Static language badge */}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 text-green-700 bg-green-50 whitespace-nowrap">
            🌐 English + हिंदी
          </span>
          <button onClick={onEnrol} className="text-sm font-bold text-white px-5 py-2 rounded-full shadow-md transition-all hover:scale-105 hover:shadow-lg uppercase tracking-widest" style={{ background: GREEN }}>
            ENQUIRE NOW
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
            <button key={l.label} onClick={() => scroll(l.href.slice(1))} className="text-left py-3 text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0 hover:text-[#1D9E75] transition-colors">
              {l.label}
            </button>
          ))}
          <span className="mt-2 mb-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 text-green-700 bg-green-50 self-start">
            🌐 English + हिंदी
          </span>
          <button onClick={() => { setMenuOpen(false); onEnrol(); }} className="mt-2 w-full py-3 rounded-full text-white font-bold text-sm uppercase tracking-widest" style={{ background: GREEN }}>
            ENQUIRE NOW
          </button>
        </div>
      )}
    </>
  );
}

function Ticker() {
  const items = ["CA Intermediate", "FOCAS Edu", "The Last Attempt Workout Batch", "Make It Your Last Attempt", "1:10 Personalized Tutor", "≤10 Students Per Batch", "English + हिंदी", "Complete Syllabus in 1 Month"];
  const all = [...items, ...items];
  return (
    <div className="overflow-hidden py-3" style={{ background: GREEN }}>
      <div className="flex w-max" style={{ animation: "ticker 26s linear infinite" }}>
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

function Hero({ onEnrol }) {
  return (
    <section id="home" className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 lg:px-16 pt-16 lg:pt-24 pb-16" style={{ background: "linear-gradient(160deg,rgba(232,248,242,.97) 0%,#fff 50%,rgba(232,248,242,.97) 100%)" }}>
      <div className="max-w-xl w-full text-center lg:text-left flex flex-col">

        {/* Desktop badge */}
        <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 mb-7 self-start" style={{ background: "#fff8ed", color: ORANGE }}>
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Now Open for Enrollment. <span style={{ color: ORANGE, fontWeight: 900 }}>CA INTER Batch</span></span>
        </div>

        <h1 className="mt-4 lg:mt-0 text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-gray-900 mb-3">
        Solve RTP MTP PYP <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#1D9E75,#0ea5e9)" }}>
            Questions with a 
          </span><br />
          Personal Tutor
        </h1>

        <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-2 max-w-lg mx-auto lg:mx-0">
          1:10 personalized tutor sessions with ≤10 students — working out selective sums to make you exam-ready, hosted by FOCAS Edu.
        </p>

        <p className="text-base md:text-lg font-bold mb-4 max-w-lg mx-auto lg:mx-0" style={{ color: GREEN }}>
          Complete a full-fledged workout within a month.
        </p>

        {/* Language availability badge */}
        <div className="flex justify-center lg:justify-start mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-green-200 bg-green-50 text-green-700">
            🌐 Sessions available in <span className="font-black">English</span> + <span className="font-black">हिंदी</span>
          </span>
        </div>

        {/* Mobile video card */}
        <div className="lg:hidden w-full rounded-3xl overflow-hidden shadow-2xl relative mb-5">
          <iframe
            src="https://iframe.mediadelivery.net/embed/680244/2beebc97-5608-4eb3-9581-145ec11fd71a?autoplay=true&loop=true&muted=true&preload=true"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full block"
            style={{ height: "calc(100dvh - 340px)", minHeight: "220px", border: "none" }}
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <button
            onClick={onEnrol}
            className="absolute bottom-0 left-0 right-0 py-3 font-black text-sm tracking-widest uppercase text-center z-10"
            style={{ background: "#41C9EB", color: "#ffffff" }}
            onMouseOver={e => e.currentTarget.style.background = "#2bb8d9"}
            onMouseOut={e => e.currentTarget.style.background = "#41C9EB"}
          >
            ENQUIRE NOW
          </button>
        </div>

        {/* Mobile badge */}
        <div className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 mb-5 w-full justify-center" style={{ background: "#fff8ed", color: ORANGE }}>
          <span className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1.4s ease infinite" }} />
          <span>Now Open for Enrollment. <span style={{ color: ORANGE, fontWeight: 900 }}>CA INTER Batch</span></span>
        </div>

        {/* Price table */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-5">
          <div className="inline-grid grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden shadow-sm text-sm font-bold">
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-r border-gray-200">Per Paper</div>
            <div className="px-5 py-3 bg-gray-50 text-gray-500 border-b border-gray-200">G1 / G2 Combo</div>
            <div className="px-5 py-3 text-gray-900 border-r border-gray-100">₹5,000</div>
            <div className="px-5 py-3 text-gray-900">₹10,000</div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-5">
          <button onClick={onEnrol} className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl" style={{ background: GREEN }}>
            Enquire Now <span>→</span>
          </button>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm" style={{ background: GREEN }}>🎯 CA Intermediate</span>
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm">📞 +91 63835 14285</span>
        </div>

        {/* Stat cards */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {[["1:10", "Tutor Ratio"], ["≤10", "Students/Batch"], ["1 Month", "Full Workout"]].map(([num, label]) => (
            <div key={label} className="bg-white border border-green-100 rounded-2xl px-5 py-3 text-center shadow-sm min-w-[120px]">
              <div className="text-2xl font-black" style={{ color: GREEN }}>{num}</div>
              <div className="text-xs text-gray-500 font-semibold mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop video card */}
      <div className="hidden lg:block relative w-full max-w-md lg:w-[460px] h-[500px] rounded-3xl overflow-hidden shadow-2xl flex-shrink-0">
        <iframe
          src="https://iframe.mediadelivery.net/embed/680244/2beebc97-5608-4eb3-9581-145ec11fd71a?autoplay=true&loop=true&muted=true&preload=true"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <button
          onClick={onEnrol}
          className="absolute bottom-0 left-0 right-0 py-4 font-black text-sm tracking-widest uppercase text-center transition-all z-10"
          style={{ background: "#41C9EB", color: "#ffffff" }}
          onMouseOver={e => e.currentTarget.style.background = "#2bb8d9"}
          onMouseOut={e => e.currentTarget.style.background = "#41C9EB"}
        >
          ENQUIRE NOW
        </button>
      </div>
    </section>
  );
}

function WhyWorkoutBatch() {
  const cards = [
    { title: "1:10 Personalized Tutor", bg: "#FFF5F5", border: "#FED7D7", accent: "#E53E3E", dot: "#FC8181" },
    { title: "Selective Sums Workout", bg: "#F0FFF4", border: "#C6F6D5", accent: "#276749", dot: "#68D391" },
    { title: "Last Attempt Kit", bg: "#FFFFF0", border: "#FEFCBF", accent: "#975A16", dot: "#F6E05E" },
    { title: "FOCAS Edu's Trust", bg: "#E6FFFA", border: "#B2F5EA", accent: "#234E52", dot: "#4FD1C5" },
  ];
  return (
    <section id="why" className="py-10 md:py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Why Workout Batch?</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            A solution for CA students<br />who need to practice more 
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">1 month. Personalized tutor. Structured kit. Clarity on what to study.</p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="rounded-2xl px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col gap-2" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: c.dot, boxShadow: `0 0 0 3px ${c.border}`, animation: "pulse 2s infinite" }} />
                <h3 className="text-sm font-black leading-snug" style={{ color: c.accent }}>{c.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.35)}}`}</style>
        <Reveal>
          <p className="text-center text-gray-500 text-base mb-8">
            Backed by <span className="font-black text-gray-900">300+ students</span> who placed their trust in FOCAS Edu and made it their last attempt.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-4 rounded-full px-8 py-5 flex flex-wrap gap-5 justify-center" style={{ background: "#0f172a" }}>
            <span className="text-white text-sm font-bold flex items-center gap-2">
              <span style={{ color: GREEN }}>✓</span> Limited seats per batch!{" "}
              <span className="text-gray-400">Small batches. Big results.</span>
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
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">What's included in the Workout Batch?</h2>
          <p className="text-gray-500 text-lg">Everything is built so you finish exam-ready within a month.</p>
        </Reveal>
        <div className="relative">
          <div className="absolute left-[76px] top-5 bottom-5 w-0.5 rounded-full" style={{ background: `linear-gradient(to bottom, ${GREEN}, rgba(29,158,117,0.1))` }} />
          <div className="flex flex-col gap-4">
            {KIT_ITEMS.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.07}>
                <div className="flex items-center group">
                  <div className="w-20 text-right pr-4 text-xl flex-shrink-0">{item.emoji}</div>
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm group-hover:scale-125 transition-transform" style={{ background: GREEN }} />
                  </div>
                  <div className="ml-4 flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm group-hover:translate-x-1 group-hover:shadow-md transition-all">
                    <div className="text-sm font-black text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.1} className="flex flex-wrap gap-2 justify-center mt-10">
          {[["Question Banks", "bg-green-50 text-green-800 border-green-200"], ["MCQ Marathons", "bg-orange-50 text-orange-800 border-orange-200"], ["Regular Tests", "bg-blue-50 text-blue-800 border-blue-200"], ["Video Evaluations", "bg-purple-50 text-purple-800 border-purple-200"], ["Community", "bg-yellow-50 text-yellow-800 border-yellow-200"]].map(([label, cls]) => (
            <span key={label} className={`px-4 py-2 rounded-full text-xs font-bold border ${cls}`}>{label}</span>
          ))}
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Reveal delay={0.1}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#1D9E75,#0ea47a)" }}>
              <div className="text-3xl mb-3">🎯</div>
              <div className="font-black text-lg mb-2">1:10 Tutor Sessions</div>
              <div className="text-sm opacity-85 leading-relaxed">One tutor. ≤10 students. Personalized attention — working out selective sums that matter most for your exam.</div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="rounded-2xl p-7 text-white" style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
              <div className="text-3xl mb-3">🎒</div>
              <div className="font-black text-lg mb-2">The Last Attempt Kit</div>
              <div className="text-sm opacity-85 leading-relaxed">Your complete toolkit — question banks, marathons, tests, and video evaluations — all in one structured package.</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}


function Compare() {
  return (
    <section id="compare" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">Why Workout Batch is Different</h2>
          <p className="text-gray-500 text-base md:text-lg">Not all last-minute prep courses give you the same advantages.</p>
        </Reveal>
        <Reveal>
          <div className="md:hidden flex flex-col gap-3">
            <div className="grid grid-cols-[1fr_72px_120px] rounded-2xl overflow-hidden">
              <div className="px-3 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600">Feature</div>
              <div className="px-2 py-2.5 bg-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 text-center">Others</div>
              <div className="px-2 py-2.5 text-xs font-black uppercase tracking-wider text-white text-center" style={{ background: GREEN }}>Workout Batch ✓</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_72px_120px] items-center bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-3 py-4 text-xs font-semibold text-gray-700 leading-snug">{row.label}</div>
                <div className="px-2 py-4 text-center text-base text-red-400 border-l border-gray-100">{row.other}</div>
                <div className="px-2 py-4 text-center font-black border-l border-gray-100 overflow-hidden" style={{ color: GREEN, background: "rgba(29,158,117,0.06)", fontSize: row.wb === "SELECTIVE" ? "9px" : "14px" }}>{row.wb}</div>
              </div>
            ))}
          </div>
          <div className="hidden md:block rounded-3xl overflow-hidden border border-gray-200 shadow-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Feature</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">Self Study / Regular Coaching</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border-b text-white" style={{ background: GREEN }}>Workout Batch ✓</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{row.label}</td>
                    <td className="px-6 py-4 text-center text-lg text-red-400">{row.other}</td>
                    <td className="px-6 py-4 text-center text-lg font-black" style={{ color: GREEN, background: "rgba(29,158,117,0.04)" }}>{row.wb}</td>
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

function Testimonials() {
  const [current, setCurrent] = React.useState(0);
  const trackRef = React.useRef(null);
  const scrollTo = (i) => trackRef.current?.children[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  const prev = () => { const n = (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length; setCurrent(n); scrollTo(n); };
  const next = () => { const n = (current + 1) % TESTIMONIALS.length; setCurrent(n); scrollTo(n); };
  return (
    <section id="testimonials" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "#e8f8f2", color: "#0f6e56" }}>Student Stories</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">What our students say</h2>
        </Reveal>
        <style>{`.wb-gallery-track{display:flex;overflow-x:auto;gap:16px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px}.wb-gallery-track::-webkit-scrollbar{display:none}.wb-gallery-slide{flex:0 0 85vw;max-width:400px;scroll-snap-align:center}@media(min-width:768px){.wb-gallery-slide{flex:0 0 calc(40% - 10px);max-width:none}}.wb-gallery-nav-btn{width:44px;height:44px;border-radius:50%;border:none;background:#0f6e56;color:white;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s}.wb-gallery-nav-btn:hover{background:#0a5240;transform:scale(1.08)}.wb-gallery-nav-btn:active{transform:scale(.95)}`}</style>
        <Reveal>
          <div ref={trackRef} className="wb-gallery-track">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="wb-gallery-slide rounded-2xl overflow-hidden border border-gray-200 shadow-md flex-shrink-0 flex flex-col" style={{ background: "#fff", minHeight: "280px" }}>
                <div className="flex-1 p-6 flex flex-col gap-3">
                  <div className="text-3xl font-black" style={{ color: GREEN }}>"</div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{t.text}</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100" style={{ background: "#f8fffe" }}>
                  <div className="font-black text-gray-900 uppercase tracking-wide text-sm">{t.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: GREEN }}>{t.batch}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-5">
            <button className="wb-gallery-nav-btn" onClick={prev} aria-label="Previous">‹</button>
            <button className="wb-gallery-nav-btn" onClick={next} aria-label="Next">›</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">Questions Students Ask Us</h2>
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
            <img src={logo} alt="FOCAS Edu" className="h-8 brightness-0 invert mb-1" />
            <p className="text-xs text-slate-400 mb-1 mt-2">Presents</p>
            <p className="text-white font-black text-lg">The Last Attempt Workout Batch</p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">CA Intermediate · Group I &amp; II<br />Make It Your Last Attempt.</p>
            <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold border border-green-800 text-green-400 bg-green-900/20">
              🌐 English + हिंदी
            </span>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Quick Links</div>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Why Workout Batch", id: "why" },
                { label: "What's Included", id: "curriculum" },
                { label: "Student Stories", id: "testimonials" },
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
              <li className="flex gap-3"><span>🌐</span><a href="https://www.focasedu.com" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">www.focasedu.com</a></li>
              <li className="flex gap-3"><span>💬</span><a href="https://wa.me/916383514285" target="_blank" rel="noopener" className="hover:text-[#1D9E75] transition-colors">WhatsApp Us</a></li>
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

export default function WorkoutBatch() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [showEnrol, setShowEnrol] = useState(false);

  useEffect(() => {
    const handler = () => { setScrolled(window.scrollY > 40); setShowFloat(window.scrollY > 400); };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showEnrol ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showEnrol]);

  const onEnrol = () => {
    setShowEnrol(true);
    // Meta Pixel — user opened the enrollment form
    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_name: "Workout Batch Enrollment",
        content_category: "Workout Batch",
      });
    }
    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "workout_batch_enrol_open",
        content_name: "Workout Batch Enrollment",
      });
    }
  };

  return (
    <div className="font-sans overflow-x-hidden">
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} @keyframes ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.7);opacity:.4}}`}</style>

      {showEnrol && <EnrolModal onClose={() => setShowEnrol(false)} />}

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onEnrol={onEnrol} />
      <Hero onEnrol={onEnrol} />
      <Ticker />
      <WhyWorkoutBatch />
      <Curriculum />
      <Compare />
      <Testimonials />
      <FAQ />
      <Footer />

      {/* Floating Enroll CTA */}
      <div className={`fixed bottom-7 right-7 z-50 transition-all duration-300 ${showFloat ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
        <button onClick={onEnrol} className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl hover:-translate-y-0.5 hover:shadow-3xl transition-all" style={{ background: GREEN }}>
          <span className="w-2 h-2 rounded-full bg-white" style={{ animation: "ping 1.2s ease infinite" }} />
          Enquire Now
        </button>
      </div>
    </div>
  );
}
