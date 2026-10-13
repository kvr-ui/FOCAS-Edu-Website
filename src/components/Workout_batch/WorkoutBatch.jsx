import { useState, useEffect, useRef } from "react";
import logo from "../../../public/logo.png";
import WorkoutBatchForm from "./WorkoutBatchForm";

/* ──────────────────────────────────────────────────────────────
   MEDIA SLOTS — drop real media in here.
   Each item: { type: "embed" | "video" | "image", src, poster?, caption? }
   - "embed": an iframe URL (Bunny / YouTube embed link)
   - "video": a direct .mp4 path, e.g. "/lp/workout-batch/demo1.mp4"
   - "image": an image path, e.g. "/lp/workout-batch/class1.jpg"
   Empty lists show placeholders in dev and are hidden in production.
   ────────────────────────────────────────────────────────────── */
const HERO_VIDEO = {
  type: "embed",
  src: "https://iframe.mediadelivery.net/embed/680244/5e284d12-237f-46cb-aadf-bb0752d7b986?autoplay=true&loop=true&muted=true&preload=true",
};

// "How our workout batch looks like": highlighted online-session shots, then
// classroom photos in a bento grid, then session videos.
// Photos are self-hosted in public/lp/workout-batch/ (no CDN dependency).
const ONLINE_PHOTOS = [
  { src: "/lp/workout-batch/online-faculty.webp", alt: "CS Shreevidhya teaching FEMA live in an online workout session" },
  { src: "/lp/workout-batch/online-meet.webp", alt: "Students attending the FOCAS Last Attempt Workout Batch on Google Meet" },
  { src: "/lp/workout-batch/online-class.webp", alt: "Faculty walking through highlighted study material in an online class" },
];

// `tile` holds the grid placement classes — mobile flows in list order (2 cols),
// desktop places each tile explicitly on a 4×2 grid.
const DEMO_PHOTOS = [
  { src: "/lp/workout-batch/session-4.webp", alt: "Students listening in a workout session", tile: "row-span-2 md:col-start-1 md:row-start-1" },
  { src: "/lp/workout-batch/session-2.webp", alt: "Mentor discussing answers with a student", tile: "md:col-start-3 md:row-start-1" },
  { src: "/lp/workout-batch/session-3.webp", alt: "Students working through questions on a laptop", tile: "md:col-start-4 md:row-start-1 md:row-span-2" },
  { src: "/lp/workout-batch/session-1.webp", alt: "Tutor explaining a problem to a student", tile: "md:col-start-2 md:row-start-1" },
  { src: "/lp/workout-batch/session-5.webp", alt: "Tutor going through a student's notes", tile: "md:col-span-2 md:col-start-2 md:row-start-2" },
];

const DEMO_VIDEOS = [
  { type: "embed", src: "https://www.youtube-nocookie.com/embed/4tQ_z7xxCA8?rel=0", subject: "Corporate Law", faculty: "CS Shreevidhya" },
  { type: "embed", src: "https://www.youtube-nocookie.com/embed/pFMnN8fLL6M?rel=0", subject: "Strategic Management", faculty: "Barath Kumar" },
];

// Bunny library 680244. Vertical (9:16) videos go in the carousel; set
// `landscape: true` for 16:9 videos so they get their own row below it.
const BUNNY_EMBED = "https://iframe.mediadelivery.net/embed/680244/";
const VIDEO_TESTIMONIALS = [
  { type: "embed", src: `${BUNNY_EMBED}4e9bf005-455f-411f-9b5b-ee21fab8eab0`, name: "Vamseedharan" },
  { type: "embed", src: `${BUNNY_EMBED}29a885c7-5eee-4275-bce5-c76007a100a9`, name: "Iyyappan" },
  { type: "embed", src: `${BUNNY_EMBED}5593646e-b695-4039-ac67-fef9af9ea32e`, name: "Samyuktha" },
  { type: "embed", src: `${BUNNY_EMBED}3137323d-7fbd-4a0d-8abd-e8f1cf1c97d0`, landscape: true },
  { type: "embed", src: `${BUNNY_EMBED}514590ff-a68a-4499-a9d5-6d1232d8de7a`, landscape: true },
  // { type: "embed", src: "https://iframe.mediadelivery.net/embed/...", name: "Student name", batch: "May 2025" },
  // Google Drive: { type: "embed", src: "https://drive.google.com/file/d/<FILE_ID>/preview", name: "Student name" }
  //   (the Drive file must be shared as "Anyone with the link")
];

// Small student photo tiles in the "Practice like never before" section.
const PRACTICE_IMAGES = [
  // { type: "image", src: "/lp/workout-batch/practice-1.jpg", caption: "Student name" },
];

const SHOW_PLACEHOLDERS = import.meta.env.DEV;

/* ── Design tokens ── */
const INK = "#06140F";
const INK_2 = "#0C2019";
const GREEN = "#1D9E75";
const MINT = "#5BE3B0";
const AMBER = "#FFB547";

/* ── Content ── */
const NAV_LINKS = [
  { label: "What's Inside", id: "inside" },
  { label: "Why Us", id: "different" },
  { label: "Stories", id: "stories" },
  { label: "FAQs", id: "faq" },
];

const CONTAINS = [
  { n: "01", title: "Personalized Tutor Workout Sessions", desc: "Small-group sessions where a tutor makes you solve, not just listen — and corrects you on the spot." },
  { n: "02", title: "AI Question Bank", desc: "Curated, exam-relevant questions integrated with AI, so you practice exactly where you're weak." },
  { n: "03", title: "Video Reviewed Test Series", desc: "Every test you write is evaluated with video, so you know where marks were lost." },
  { n: "04", title: "Weekly Mentorship Sessions", desc: "A weekly check-in to fix your plan, your pace and your mindset before exam day." },
  { n: "05", title: "Last Attempt Community Access", desc: "Practice alongside students who are serious about making this their final attempt." },
  { n: "06", title: "Syllabus Coverage Guide", desc: "A map to finish the workout of a significant portion of the syllabus to make you exam-ready." },
];

const COMPARE_ROWS = [
  { label: "1:10 Personalized Tutor Attention", other: false, wb: true },
  { label: "Question Banks", other: "Generic", wb: "Curated + AI" },
  { label: "Weekly MCQ Marathons", other: false, wb: true },
  { label: "Tests with Video Evaluations", other: false, wb: true },
  { label: "Last Attempt Community", other: false, wb: true },
  { label: "Complete Syllabus in 1 Month", other: false, wb: true },
  { label: "Class Type", other: "Lecture", wb: "Workout" },
];

const TESTIMONIALS = [
  { name: "Sabitha", img: "/fs-assets/testimonials/Sabitha.webp", text: "I thought I knew the subjects. The only problem I felt was my presentation. But only after coming here, I understood that I actually know very little." },
  { name: "Tharun", text: "From my school days, I won't do much writing practice. I'll simply just see the notes repeatedly. Many tutors here told me that I have to do more practice, which is why I'm here." },
  { name: "Elakya", text: "I learnt that if I don't know some things, I should ensure not to get stuck on them. Practice is required for that." },
  { name: "Ragavi", img: "/fs-assets/testimonials/Ragavi.webp", text: "Being a self-study student, studying is hard. I realised how important this mentorship is in my journey." },
  { name: "Yashika", img: "/fs-assets/testimonials/Yashika.webp", text: "The method of teaching followed by FOCAS is perfect. Trust me, I was able to score 82 just by enrolling in their fast track — then imagine how their regular course would be." },
];

const FAQS = [
  { q: "Who is the Last Attempt Workout Batch for?", a: "CA Intermediate students who already know the concepts but need PRACTICE — repeaters and students with pending practice who want to complete a full-fledged workout within a month before the Jan 2027 attempt." },
  { q: "When does the batch start?", a: "The batch starts soon for the CA Inter January 2027 attempt. Book your seat and our team will share the exact start date and schedule." },
  { q: "What is a 'workout session'?", a: "Instead of a lecture, a tutor gives a small group selective questions to solve in class, then reviews and corrects your approach right there — so you leave having practiced, not just watched." },
  { q: "What is the AI Question Bank?", a: "A curated bank of exam-relevant questions (RTP, MTP, PYP and more) integrated with AI, so your practice focuses on the areas where you lose the most marks." },
  { q: "How are tests reviewed?", a: "Each test in the series is evaluated and explained on video, showing you exactly where you lost marks and how to write a better answer." },
  { q: "What language are sessions held in?", a: "Sessions are conducted in English and Hindi (हिंदी)." },
  { q: "How do I enroll?", a: "Tap Book your Seat Now! on this page and fill the quick form. Our team will call you back with the details." },
];

/* ── Helpers ── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: `opacity .7s ease ${delay}s, transform .7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

function Media({ item, className = "", autoPlay = false }) {
  if (item.type === "embed") {
    return (
      <iframe
        src={item.src}
        title={item.caption || item.name || "FOCAS video"}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className={`w-full h-full block ${className}`}
        style={{ border: "none" }}
      />
    );
  }
  if (item.type === "video") {
    return (
      <video
        src={item.src}
        poster={item.poster}
        className={`w-full h-full object-cover block ${className}`}
        controls={!autoPlay}
        autoPlay={autoPlay}
        muted={autoPlay}
        loop={autoPlay}
        playsInline
        preload="metadata"
      />
    );
  }
  return <img src={item.src} alt={item.caption || ""} loading="lazy" className={`w-full h-full object-cover block ${className}`} />;
}

function Placeholder({ label, className = "" }) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 text-center p-4 ${className}`} style={{ background: "repeating-linear-gradient(135deg, rgba(91,227,176,.06) 0 12px, transparent 12px 24px)", border: "1.5px dashed rgba(91,227,176,.35)" }}>
      <span className="text-2xl">▶</span>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: MINT }}>{label}</span>
    </div>
  );
}

function Eyebrow({ children, dark = false }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: dark ? MINT : GREEN }}>
      <span className="w-6 h-px" style={{ background: dark ? MINT : GREEN }} />
      {children}
    </span>
  );
}

function CTA({ onClick, children = "Book your Seat Now!", variant = "solid", className = "" }) {
  const solid = variant === "solid";
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5 ${className}`}
      style={solid ? { background: MINT, color: INK, boxShadow: "0 10px 30px -10px rgba(91,227,176,.6)" } : { border: "1.5px solid rgba(255,255,255,.25)", color: "#fff" }}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </button>
  );
}

/* ── Enroll modal with native Bigin form ── */
function EnrolModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "min(96vw, 640px)", maxHeight: "95vh" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-bold"
        >
          ✕
        </button>
        <div className="flex-shrink-0 px-7 pt-6 pb-4 border-b border-gray-100 flex items-center gap-4">
          <img src={logo} alt="FOCAS Edu" className="h-8" />
          <div>
            <p className="text-sm font-black text-gray-800">The Last Attempt Workout Batch</p>
            <p className="text-xs text-gray-400">Enrollment Form — CA Intermediate · Jan 2027</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <WorkoutBatchForm />
        </div>
      </div>
    </div>
  );
}

/* ── Sections ── */
function Navbar({ scrolled, menuOpen, setMenuOpen, onEnrol }) {
  const scroll = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 h-16 transition-all duration-300" style={{ background: scrolled || menuOpen ? "rgba(6,20,15,.92)" : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "1px solid transparent" }}>
        <button onClick={() => scroll("home")} aria-label="FOCAS Edu home">
          <img src={logo} alt="FOCAS Edu" className="h-9 brightness-0 invert" />
        </button>
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => scroll(l.id)} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
              {l.label}
            </button>
          ))}
          <button onClick={onEnrol} className="text-xs font-bold px-5 py-2.5 rounded-full uppercase tracking-widest transition-all hover:-translate-y-0.5" style={{ background: MINT, color: INK }}>
            Book your Seat Now!
          </button>
        </div>
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 flex flex-col px-5 py-4 gap-1 md:hidden" style={{ background: "rgba(6,20,15,.97)" }}>
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => scroll(l.id)} className="text-left py-3 text-sm font-semibold text-white/80 border-b border-white/5 last:border-0">
              {l.label}
            </button>
          ))}
          <button onClick={() => { setMenuOpen(false); onEnrol(); }} className="mt-3 w-full py-3 rounded-full font-bold text-sm uppercase tracking-widest" style={{ background: MINT, color: INK }}>
            Book your Seat Now!
          </button>
        </div>
      )}
    </>
  );
}

function Hero({ onEnrol }) {
  return (
    <section id="home" className="relative overflow-hidden px-5 md:px-10 pt-24 md:pt-32 pb-16 md:pb-24" style={{ background: INK }}>
      {/* backdrop */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(60% 50% at 80% 20%, rgba(29,158,117,.35), transparent 70%), radial-gradient(40% 40% at 0% 100%, rgba(255,181,71,.10), transparent 70%)` }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
        <div className="text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start gap-2.5 mb-7">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm md:text-lg font-bold" style={{ background: "rgba(255,181,71,.12)", color: AMBER, border: "1px solid rgba(255,181,71,.35)" }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: AMBER, animation: "wbPing 1.4s ease infinite" }} />
              Batch starts soon · CA Inter Jan 2027 attempt
            </div>
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">Limited Seats ONLY!</span>
          </div>

          <p className="text-sm md:text-base font-semibold tracking-wide text-white/60 mb-3">FOCAS Edu presents</p>
          <h1 className="font-sora font-extrabold text-white leading-[1.02] tracking-tight text-[2.6rem] sm:text-6xl lg:text-7xl mb-6">
            The Last Attempt{" "}
            <span className="relative inline-block" style={{ color: MINT }}>
              Workout
              <svg className="absolute left-0 -bottom-2 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 7 C 50 1, 150 1, 198 6" stroke={AMBER} strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            </span>{" "}
            Batch
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-2">
            Meant for students who need <span className="font-black text-white tracking-wider">PRACTICE.</span>
          </p>
          <p className="text-base md:text-lg font-semibold mb-8" style={{ color: MINT }}>
            Complete a full-fledged workout within a month.
          </p>

          {/* Mobile video */}
          <div className="lg:hidden mb-8">
            <HeroVideo onEnrol={onEnrol} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <CTA onClick={onEnrol} />
          </div>
        </div>

        <div className="hidden lg:block">
          <HeroVideo onEnrol={onEnrol} />
        </div>
      </div>
    </section>
  );
}

function HeroVideo({ onEnrol }) {
  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-[2rem] opacity-60 blur-2xl pointer-events-none" style={{ background: `linear-gradient(135deg, ${GREEN}, transparent 60%, ${AMBER})` }} />
      <div className="relative rounded-[1.75rem] overflow-hidden aspect-[4/5] max-h-[70vh] lg:max-h-[560px] mx-auto" style={{ background: INK_2, border: "1px solid rgba(255,255,255,.1)" }}>
        {HERO_VIDEO?.src ? <Media item={HERO_VIDEO} autoPlay /> : <Placeholder label="Hero video" />}
        <button
          onClick={onEnrol}
          className="absolute bottom-3 left-3 right-3 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest backdrop-blur-md transition-colors"
          style={{ background: "rgba(6,20,15,.75)", color: "#fff", border: "1px solid rgba(255,255,255,.15)" }}
        >
          Book your Seat Now! →
        </button>
      </div>
    </div>
  );
}

function Ticker() {
  const items = ["Practice like never before", "AI Question Bank", "Video Reviewed Tests", "Weekly Mentorship", "Workout all important questions", "Make it your LAST attempt"];
  const all = [...items, ...items];
  return (
    <div className="overflow-hidden py-4" style={{ background: MINT }}>
      <div className="flex w-max" style={{ animation: "wbTicker 30s linear infinite" }}>
        {all.map((t, i) => (
          <span key={i} className="flex items-center gap-6 px-6 font-sora font-bold text-sm md:text-base uppercase tracking-wide whitespace-nowrap" style={{ color: INK }}>
            {t}
            <span aria-hidden="true" className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: INK }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Inside({ onEnrol }) {
  return (
    <section id="inside" className="py-16 md:py-28 px-5 md:px-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <Reveal className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-10 md:mb-14">
          <div>
            <Eyebrow>What the batch contains</Eyebrow>
            <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight text-gray-900 leading-tight">
              Everything you need to<br className="hidden md:block" /> practice your way to clear.
            </h2>
          </div>
          <CTA onClick={onEnrol} className="hidden md:inline-flex" />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-3xl overflow-hidden" style={{ background: "#E5EDEA", border: "1px solid #E5EDEA" }}>
          {CONTAINS.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.05} className="bg-white">
              <div className="group h-full p-7 md:p-8 transition-colors hover:bg-[#F3FBF8]">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-sora font-extrabold text-sm" style={{ color: GREEN }}>{c.n}</span>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all group-hover:rotate-45" style={{ background: "#E8F8F2", color: GREEN }}>↗</span>
                </div>
                <h3 className="font-sora font-bold text-lg text-gray-900 mb-2 leading-snug">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const photos = DEMO_PHOTOS.length ? DEMO_PHOTOS : SHOW_PLACEHOLDERS ? Array.from({ length: 5 }, () => ({ placeholder: true })) : [];
  if (!photos.length && !DEMO_VIDEOS.length) return null;
  return (
    <section id="showcase" className="py-16 md:py-28 px-5 md:px-10" style={{ background: INK }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-10 md:mb-14">
          <Eyebrow dark>Inside a session</Eyebrow>
          <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight text-white mb-3">How our workout batch looks like</h2>
          <p className="text-white/60 text-base md:text-lg">Small groups. A tutor at your table. Questions solved, not just watched.</p>
        </Reveal>

        {ONLINE_PHOTOS.length > 0 && (
          <div className="mb-10 md:mb-14">
            <Reveal className="flex items-center gap-2.5 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: MINT }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: MINT }} />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: MINT }}>Live online sessions</p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-4 md:gap-5">
              {ONLINE_PHOTOS.map((m, i) => (
                <Reveal key={m.src} delay={i * 0.08}>
                  <div className="group rounded-2xl overflow-hidden relative aspect-[15/8]" style={{ background: INK_2, boxShadow: "0 0 0 1px rgba(91,227,176,.35), 0 18px 40px -18px rgba(91,227,176,.35)" }}>
                    <img src={m.src} alt={m.alt} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: "rgba(6,20,15,.75)", color: MINT }}>● Live</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[240px] gap-3 md:gap-4">
            {photos.map((m, i) => (
              <Reveal key={i} delay={i * 0.05} className={`${m.tile || ""} group rounded-2xl overflow-hidden relative`}>
                <div className="w-full h-full" style={{ background: INK_2 }}>
                  {m.placeholder
                    ? <Placeholder label="Session photo" />
                    : <img src={m.src} alt={m.alt} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(6,20,15,.35), transparent 45%)" }} />
              </Reveal>
            ))}
          </div>
        )}

        {DEMO_VIDEOS.length > 0 && (
          <div className="mt-14 md:mt-20">
            <Reveal className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: AMBER }}>Watch a session</p>
                <h3 className="font-sora font-bold text-2xl md:text-3xl text-white">Master Question faculty sessions</h3>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-5 md:gap-6">
              {DEMO_VIDEOS.map((v, i) => (
                <Reveal key={v.src} delay={i * 0.08}>
                  <div className="rounded-3xl overflow-hidden" style={{ background: INK_2, border: "1px solid rgba(255,255,255,.08)" }}>
                    <div className="aspect-video">
                      <Media item={{ ...v, caption: `${v.subject} · Master Question session` }} />
                    </div>
                    <div className="px-5 py-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm md:text-base">{v.subject}</p>
                        <p className="text-xs text-white/50 mt-0.5">{v.faculty}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: "rgba(91,227,176,.12)", color: MINT }}>CA Inter</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Proof({ onEnrol }) {
  const photos = PRACTICE_IMAGES.length ? PRACTICE_IMAGES : SHOW_PLACEHOLDERS ? Array.from({ length: 8 }, () => ({ placeholder: true })) : [];
  return (
    <section className="relative overflow-hidden py-20 md:py-32 px-5 md:px-10" style={{ background: GREEN }}>
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: "radial-gradient(50% 80% at 50% 0%, #fff, transparent 70%)" }} />
      <Reveal className="relative max-w-4xl mx-auto text-center">
        <h2 className="font-sora font-extrabold text-white text-4xl sm:text-5xl md:text-7xl tracking-tight leading-[1.02] mb-6">
          Practice like<br />never before.
        </h2>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Backed by <span className="font-black text-white">1000+ students</span> who trusted FOCAS to make it their <span className="font-black" style={{ color: INK }}>LAST ATTEMPT</span>.
        </p>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3 max-w-3xl mx-auto mb-10">
            {photos.map((m, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden" style={{ background: INK_2 }}>
                {m.placeholder ? <Placeholder label="Student photo" /> : <Media item={m} />}
              </div>
            ))}
          </div>
        )}
        <button onClick={onEnrol} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5" style={{ background: INK, color: "#fff" }}>
          Book your Seat Now! →
        </button>
      </Reveal>
    </section>
  );
}

function Mark({ value, highlight }) {
  if (value === true) return <span className="inline-flex w-7 h-7 md:w-8 md:h-8 rounded-full items-center justify-center text-sm md:text-base font-black" style={{ background: MINT, color: INK }}>✓</span>;
  if (value === false) return <span className="inline-flex w-7 h-7 md:w-8 md:h-8 rounded-full items-center justify-center text-sm md:text-base font-black bg-gray-100 text-gray-400">✕</span>;
  return <span className={`text-sm md:text-base font-bold ${highlight ? "" : "text-gray-400"}`} style={highlight ? { color: GREEN } : undefined}>{value}</span>;
}

function Different() {
  return (
    <section id="different" className="py-16 md:py-28 px-5 md:px-10 bg-white">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-10 md:mb-14">
          <Eyebrow>The difference</Eyebrow>
          <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight text-gray-900 leading-tight">
            Why The Last Attempt Workout Batch is different
          </h2>
        </Reveal>
        <Reveal>
          <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid #E5EDEA" }}>
            <div className="grid grid-cols-[1fr_88px_108px] md:grid-cols-[1fr_200px_200px] text-[11px] md:text-sm font-bold uppercase tracking-widest">
              <div className="px-4 md:px-7 py-4 text-gray-400 bg-gray-50">Feature</div>
              <div className="px-2 py-4 text-gray-400 bg-gray-50 text-center">Others</div>
              <div className="px-2 py-4 text-center" style={{ background: INK, color: MINT }}>Workout Batch</div>
            </div>
            {COMPARE_ROWS.map((r) => (
              <div key={r.label} className="grid grid-cols-[1fr_88px_108px] md:grid-cols-[1fr_200px_200px] items-center border-t" style={{ borderColor: "#EEF3F1" }}>
                <div className="px-4 md:px-7 py-4 md:py-6 text-[15px] md:text-lg font-semibold text-gray-800">{r.label}</div>
                <div className="px-2 py-4 text-center"><Mark value={r.other} /></div>
                <div className="px-2 py-4 md:py-5 text-center h-full flex items-center justify-center" style={{ background: "#F3FBF8" }}><Mark value={r.wb} highlight /></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function VideoStories() {
  const items = VIDEO_TESTIMONIALS.length ? VIDEO_TESTIMONIALS : SHOW_PLACEHOLDERS ? Array.from({ length: 4 }, () => ({ placeholder: true })) : [];
  if (!items.length) return null;
  const vertical = items.filter((v) => !v.landscape);
  const landscape = items.filter((v) => v.landscape);
  const caption = (v) => v.name && (
    <div className="mt-3 px-1">
      <p className="font-bold text-white text-sm">{v.name}</p>
      {v.batch && <p className="text-xs" style={{ color: MINT }}>{v.batch}</p>}
    </div>
  );
  return (
    <div className="mb-14 md:mb-20">
      {vertical.length > 0 && (
        <div className="wb-track wb-track-center">
          {vertical.map((v, i) => (
            <div key={i} className="wb-slide-video">
              <div className="rounded-3xl overflow-hidden aspect-[9/16]" style={{ background: INK_2 }}>
                {v.placeholder ? <Placeholder label="Testimonial video" /> : <Media item={v} />}
              </div>
              {caption(v)}
            </div>
          ))}
        </div>
      )}
      {landscape.length > 0 && (
        <div className={`grid md:grid-cols-2 gap-4 md:gap-5 ${vertical.length ? "mt-5 md:mt-6" : ""}`}>
          {landscape.map((v) => (
            <div key={v.src}>
              <div className="rounded-3xl overflow-hidden aspect-video" style={{ background: INK_2 }}>
                <Media item={v} />
              </div>
              {caption(v)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stories() {
  return (
    <section id="stories" className="py-16 md:py-28 px-5 md:px-10" style={{ background: INK }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-10 md:mb-14">
          <Eyebrow dark>Student stories</Eyebrow>
          <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight text-white">What our students say</h2>
        </Reveal>

        <VideoStories />

        {/* Same card layout as the Foundation School testimonials: photo left, quote right. */}
        <div className="grid md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className={i === TESTIMONIALS.length - 1 && TESTIMONIALS.length % 2 ? "md:col-span-2" : ""}>
              <figure className="h-full rounded-3xl bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7 shadow-lg">
                {t.img ? (
                  <img src={t.img} alt={t.name} loading="lazy" className="w-40 h-40 sm:w-48 sm:h-48 shrink-0 self-center object-contain object-bottom" />
                ) : (
                  <span className="w-40 h-40 sm:w-48 sm:h-48 shrink-0 self-center rounded-full flex items-center justify-center font-sora font-bold text-6xl text-white" style={{ background: GREEN }}>{t.name[0]}</span>
                )}
                <div className="flex-1 flex flex-col">
                  <span className="font-sora text-5xl leading-none" style={{ color: GREEN }}>“</span>
                  <blockquote className="mt-1 text-base md:text-lg leading-relaxed text-gray-700">{t.text}</blockquote>
                  <figcaption className="mt-4">
                    <span className="block font-sora font-bold" style={{ color: INK }}>{t.name}</span>
                    {t.batch && <span className="block text-xs" style={{ color: GREEN }}>{t.batch}</span>}
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-16 md:py-28 px-5 md:px-10 bg-white">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
        <Reveal>
          <Eyebrow>FAQs</Eyebrow>
          <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight text-gray-900 leading-tight mb-4">Questions students ask us</h2>
          <p className="text-gray-500 mb-6">Still unsure? Call or WhatsApp us — we'll help you decide.</p>
          <a href="https://wa.me/916383514285" target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: GREEN }}>
            💬 +91 63835 14285
          </a>
        </Reveal>
        <div className="flex flex-col">
          {FAQS.map((f, i) => (
            <div key={f.q} className="border-b" style={{ borderColor: "#E5EDEA" }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-5 text-left font-bold text-gray-900 text-base" aria-expanded={open === i}>
                {f.q}
                <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg transition-all duration-300" style={open === i ? { background: INK, color: MINT, transform: "rotate(45deg)" } : { background: "#F3F7F5", color: GREEN }}>+</span>
              </button>
              <div style={{ display: "grid", gridTemplateRows: open === i ? "1fr" : "0fr", transition: "grid-template-rows .35s ease" }}>
                <div className="overflow-hidden">
                  <p className="pb-5 text-sm text-gray-600 leading-relaxed pr-10">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onEnrol }) {
  return (
    <section className="px-5 md:px-10 pb-16 md:pb-24 bg-white">
      <Reveal className="max-w-6xl mx-auto rounded-[2rem] px-6 py-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden" style={{ background: INK }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(50% 120% at 100% 50%, rgba(29,158,117,.45), transparent 70%)" }} />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>Limited seats · Jan 2027 attempt</p>
          <h2 className="font-sora font-extrabold text-white text-3xl md:text-4xl tracking-tight">Make this your last attempt.</h2>
        </div>
        <CTA onClick={onEnrol} className="relative flex-shrink-0" />
      </Reveal>
    </section>
  );
}

function Footer() {
  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="py-14 px-5 md:px-10" style={{ background: INK }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          <div>
            <img src={logo} alt="FOCAS Edu" className="h-8 brightness-0 invert" />
            <p className="text-white font-sora font-bold text-lg mt-4">The Last Attempt Workout Batch</p>
            <p className="text-sm text-white/50 leading-relaxed mt-2">CA Intermediate · Group I &amp; II</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Quick Links</div>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map(l => (
                <li key={l.id}><button onClick={() => scroll(l.id)} className="text-sm text-white/70 hover:text-white transition-colors">{l.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Contact Us</div>
            <ul className="flex flex-col gap-4 text-sm text-white/70">
              <li className="flex gap-3"><span>📞</span><a href="tel:+916383514285" className="hover:text-white transition-colors">+91 63835 14285</a></li>
              <li className="flex gap-3"><span>🌐</span><a href="https://www.focasedu.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">www.focasedu.com</a></li>
              <li className="flex gap-3"><span>💬</span><a href="https://wa.me/916383514285" target="_blank" rel="noopener" className="hover:text-white transition-colors">WhatsApp Us</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6">
          <span className="text-xs text-white/40">© 2026 FOCAS Edu. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="/pdf/Privacy%20Policy%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="/pdf/Terms%20and%20Condition%20of%20Focas%20Edu.docx.pdf" target="_blank" rel="noopener" className="text-xs text-white/40 hover:text-white/70 transition-colors">Terms</a>
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
    const handler = () => { setScrolled(window.scrollY > 40); setShowFloat(window.scrollY > 600); };
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
    <div className="font-urbanist overflow-x-hidden" style={{ background: INK }}>
      <style>{`
        @keyframes wbTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes wbPing{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.8);opacity:.4}}
        .wb-track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px}
        .wb-track::-webkit-scrollbar{display:none}
        .wb-track-center>:first-child{margin-left:auto}.wb-track-center>:last-child{margin-right:auto}
        .wb-slide-video{flex:0 0 62%;scroll-snap-align:start}
        @media(min-width:640px){.wb-slide-video{flex-basis:calc(33.333% - 11px)}}
        @media(min-width:1024px){.wb-slide-video{flex-basis:calc(25% - 12px)}}
      `}</style>

      {showEnrol && <EnrolModal onClose={() => setShowEnrol(false)} />}

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onEnrol={onEnrol} />
      <Hero onEnrol={onEnrol} />
      <Ticker />
      <Showcase />
      <Inside onEnrol={onEnrol} />
      <Proof onEnrol={onEnrol} />
      <Different />
      <Stories />
      <FAQ />
      <FinalCTA onEnrol={onEnrol} />
      <Footer />

      {/* Floating Enroll CTA */}
      <div className={`fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50 transition-all duration-300 ${showFloat && !showEnrol ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
        <button onClick={onEnrol} className="flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-0.5" style={{ background: MINT, color: INK }}>
          <span className="w-2 h-2 rounded-full" style={{ background: INK, animation: "wbPing 1.2s ease infinite" }} />
          Book your Seat Now!
        </button>
      </div>
    </div>
  );
}
