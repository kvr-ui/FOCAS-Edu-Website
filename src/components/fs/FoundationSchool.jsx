import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  GraduationCap,
  Quote,
  Phone,
  Trophy,
} from "lucide-react";
import FsForm from "./FsForm";

/**
 * /fs — "Foundation for School Students" landing page.
 * Audience: parents of 11th/12th students. Pitch: prepare for CA Foundation
 * alongside school and become a CA at 21. CTAs lead to the FsForm below.
 */

const INK = "#0b3d33";

// ─── Scroll reveal (same pattern as manual/Manual.jsx) ───────────────────────

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
  }, [threshold]);
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
        transform: visible ? "none" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const scrollToForm = (source) => {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (typeof window.gtag === "function")
    window.gtag("event", "fs_cta_click", { event_category: "engagement", event_label: source });
};

// ─── Content ─────────────────────────────────────────────────────────────────

// TODO: drop the FS brochure PDF at public/pdf/FS-Brochure.pdf
const BROCHURE_URL = "/pdf/FS-Brochure.pdf";

const HERO_STUDENTS = [
  { name: "Dharani", img: "/fs/students/Dharani.webp" },
  { name: "Aravindhan", img: "/fs/students/Aravindhan.webp" },
  { name: "Keerthana", img: "/fs/students/Keerthana.webp" },
  { name: "Jagadeeshwaran", img: "/fs/students/Jagadeeshwaran.webp" },
];

// Per-tile tint + tilt for the hero collage (photos have white backgrounds, so
// mix-blend-multiply lets the tint show through as a cut-out backdrop).
const HERO_TILES = [
  "bg-[#d6f0e6] -rotate-2",
  "bg-[#fbe7b0] rotate-2 translate-y-8",
  "bg-[#fbe7b0] rotate-1",
  "bg-[#d6f0e6] -rotate-1 translate-y-8",
];

const GALLERY = [
  { src: "/fs/gallery/tuition-1.webp", alt: "Tutor explaining a concept to a small group" },
  { src: "/fs/gallery/tuition-2.webp", alt: "One-on-one doubt clearing session" },
  { src: "/fs/gallery/tuition-3.webp", alt: "Students working through problems with a tutor" },
  { src: "/fs/gallery/workshop-session.webp", alt: "Students at a FOCAS workshop session" },
  { src: "/fs/gallery/tuition-5.webp", alt: "Tutor guiding a student at the table" },
];

const MARKSHEETS = [
  { name: "Kwaja", img: "/fs/marksheets/Kwaja-photo.webp", sheet: "/fs/marksheets/Kwaja.webp" },
  { name: "Mathumetha", img: "/fs/marksheets/Mathumetha-photo.webp", sheet: "/fs/marksheets/Mathumetha.webp" },
  { name: "Anupriya", img: "/fs/marksheets/Anupriya-photo.webp", sheet: "/fs/marksheets/Anupriya.webp" },
  { name: "Kavitha", img: "/fs/marksheets/Kavitha-photo.webp", sheet: "/fs/marksheets/Kavitha.webp" },
  { name: "Gowtham", img: "/fs/marksheets/Gowtham-photo.webp", sheet: "/fs/marksheets/Gowtham.webp" },
  { name: "Manjunath", img: "/Students/Manjunath.jpeg", sheet: "/fs/marksheets/Manjunath.webp" },
];

// ─── Tile illustrations (inline so they stay on-palette) ─────────────────────

const TutoringArt = () => (
  <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
    <rect x="20" y="62" width="120" height="10" rx="5" fill="#0b3d33" />
    <circle cx="80" cy="30" r="12" fill="#e9b949" stroke="#0b3d33" strokeWidth="2.5" />
    <path d="M62 62 q18 -26 36 0" fill="#e9b949" stroke="#0b3d33" strokeWidth="2.5" />
    {[34, 54, 106, 126].map((x) => (
      <g key={x}>
        <circle cx={x} cy="44" r="8" fill="#1D9E75" stroke="#0b3d33" strokeWidth="2" />
        <path d={`M${x - 11} 62 q11 -18 22 0`} fill="#1D9E75" stroke="#0b3d33" strokeWidth="2" />
      </g>
    ))}
    <rect x="70" y="80" width="20" height="4" rx="2" fill="#0b3d33" opacity=".2" />
  </svg>
);

const VideoArt = () => (
  <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
    <rect x="30" y="14" width="100" height="64" rx="8" fill="#fff" stroke="#0b3d33" strokeWidth="2.5" />
    <circle cx="80" cy="46" r="16" fill="#0f6e56" />
    <path d="M75 38 L89 46 L75 54 Z" fill="#fff" />
    <rect x="40" y="68" width="80" height="4" rx="2" fill="#0b3d33" opacity=".15" />
    <rect x="40" y="68" width="34" height="4" rx="2" fill="#e9b949" />
    <rect x="66" y="78" width="28" height="8" fill="#0b3d33" />
    <rect x="54" y="86" width="52" height="5" rx="2.5" fill="#0b3d33" />
  </svg>
);

const TestArt = () => (
  <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
    <rect x="42" y="8" width="62" height="84" rx="6" fill="#fff" stroke="#0b3d33" strokeWidth="2.5" />
    {[24, 40, 56].map((y) => (
      <g key={y}>
        <path d={`M52 ${y} l4 4 l7 -8`} stroke="#1D9E75" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="68" y={y - 2} width="26" height="4" rx="2" fill="#0b3d33" opacity=".2" />
      </g>
    ))}
    <path d="M52 72 l10 10 M62 72 l-10 10" stroke="#d9534f" strokeWidth="3" strokeLinecap="round" />
    <rect x="86" y="50" width="48" height="34" rx="6" fill="#0f6e56" stroke="#0b3d33" strokeWidth="2.5" />
    <path d="M105 60 L117 67 L105 74 Z" fill="#e9b949" />
  </svg>
);

const CrashCourseArt = () => (
  <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
    <rect x="38" y="70" width="70" height="14" rx="3" fill="#0f6e56" stroke="#0b3d33" strokeWidth="2.5" />
    <rect x="44" y="56" width="62" height="14" rx="3" fill="#e9b949" stroke="#0b3d33" strokeWidth="2.5" />
    <rect x="34" y="42" width="66" height="14" rx="3" fill="#1D9E75" stroke="#0b3d33" strokeWidth="2.5" />
    <path d="M122 12 L108 46 H120 L112 80 L136 38 H123 L132 12 Z" fill="#e9b949" stroke="#0b3d33" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const FEATURES = [
  {
    art: TutoringArt,
    title: "Weekly Tutoring",
    highlight: "One tutor sits with <10 students ONLY.",
    points: ["Personalized attention where the student is always monitored."],
  },
  {
    art: VideoArt,
    title: "Recorded Video Lectures",
    highlight: "Understanding level in line with your school syllabus.",
    points: ["Learning complex topics in a simple manner.", "They will aid your school studies as well."],
  },
  {
    art: TestArt,
    title: "Regular Tests Scheduled",
    highlight: "Evaluated with VIDEO REVIEW by our Expert CA Evaluators.",
    points: ["Know exactly what lost you marks."],
  },
  {
    photo: "/Tutor/VenkatRamanan.png",
    title: "Regular Mentorship & Progress Check-ins",
    highlight: "By CA K Venkat Ramanan, Founder & CEO, FOCAS Edu.",
    points: ["With students & parents."],
  },
  {
    art: CrashCourseArt,
    title: "Post-Board Exams Crash Course",
    highlight: "Revise whatever has been studied and covered until then.",
    points: ["Get thorough with all the subjects."],
  },
];

const ROADMAP = [
  { age: 17, without: null, with: "Student clears Foundation." },
  { age: 18, without: "Starts figuring out Foundation.", with: "Student clears Inter." },
  { age: 19, without: "Starts preparing for Inter.", with: "Student is in the Articleship period." },
  { age: 20, without: "Begins Articleship.", with: "Starts preparing for Final." },
  { age: 21, without: "Still in Articleship.", with: "Student becomes a CA.", final: true },
];

const TESTIMONIALS = [
  {
    name: "Ragavi",
    img: "/fs/testimonials/Ragavi.webp",
    text: "Being a self study student, studying is hard. I realised how important this mentorship is in my journey.",
  },
  {
    name: "Sabitha",
    img: "/fs/testimonials/Sabitha.webp",
    text: "I thought I knew the subjects. The only problem I felt was my presentation. But only after coming here, I understood that I actually know very little.",
  },
  {
    name: "Yashika",
    img: "/fs/testimonials/Yashika.webp",
    text: "The method of teaching followed by FOCAS academy is perfect. Trust me, I was able to score 82 just by enrolling in their fast track — then imagine how their regular course would be.",
  },
  {
    name: "Naveen",
    img: "/fs/testimonials/Naveen.webp",
    text: "I was able to complete preparation in class itself, because it was live studying and NO procrastination. Got rid of confusions in the class itself as there were Q&A discussions at the end of every topic.",
  },
  {
    name: "Mercy",
    img: "/fs/testimonials/Mercy.webp",
    text: "Really happy and satisfied with the tutors — the way of teaching here is effective. The concept behind Deep FOCAS is too good and I gained the confidence I always wanted.",
  },
];

// ─── Sections ────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#0b3d33]/10 bg-[#faf7f0]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <img src="/fs/logo.webp" alt="FOCAS Edu — Your First and Last Attempt" className="h-10 w-auto object-contain" />
        <button
          type="button"
          onClick={() => scrollToForm("nav")}
          className="rounded-full bg-[#0f6e56] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0b5745]"
        >
          Register now
        </button>
      </div>
    </nav>
  );
}

function StudentPhoto({ name, img, className = "" }) {
  const [broken, setBroken] = useState(!img);
  return broken ? (
    <span className={`flex items-center justify-center bg-[#1D9E75] font-sora text-4xl font-extrabold text-white ${className}`}>
      {name[0]}
    </span>
  ) : (
    <img src={img} alt={name} onError={() => setBroken(true)} className={`object-cover object-top ${className}`} />
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      {/* soft background shapes */}
      <div aria-hidden className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-[#1D9E75]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-[-10%] h-[320px] w-[320px] rounded-full bg-[#e9b949]/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <Reveal>
            <h1 className="font-sora text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Becoming a{" "}
              <span className="relative whitespace-nowrap text-[#0f6e56]">
                CA by 21
                <svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none">
                  <path d="M2 9 Q 100 -2 198 7" stroke="#e9b949" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </span>{" "}
              years feels hard?
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-xl font-semibold sm:text-2xl">
              It is challenging, but <span className="whitespace-nowrap rounded-md bg-[#e9b949] px-2 font-extrabold">NOT IMPOSSIBLE!</span>
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 text-lg text-[#0b3d33]/75">Make it Possible with the</p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#0b3d33]/15 bg-white px-4 py-1.5 font-sora text-base font-bold">
              <GraduationCap className="h-5 w-5 text-[#0f6e56]" />
              Foundation For School Students Program
            </p>
            <p className="mt-1 text-sm font-semibold text-[#0b3d33]/60">by FOCAS Edu</p>
            <ul className="mt-6 space-y-3">
              {[
                "Begin preparing for CA Foundation while in 11th/12th",
                "Get personalized attention with our fool-proof tutor model",
                "Appear for Foundation immediately after your 12th Board Exams",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-base sm:text-lg">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1D9E75]" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-8 font-sora text-lg font-bold">Get ahead of the curve with FOCAS Edu.</p>
            <button
              type="button"
              onClick={() => scrollToForm("hero")}
              className="group mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-all hover:bg-[#0b5745] active:scale-[.99]"
            >
              Book A Counselling Call Today
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="relative mx-auto w-full max-w-xl">
          {/* dotted accent + glow behind the collage */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-3xl opacity-40"
            style={{ backgroundImage: "radial-gradient(#0f6e56 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }}
          />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e9b949]/30 blur-3xl" />

          <div className="relative grid grid-cols-2 gap-4 sm:gap-5">
            {HERO_STUDENTS.map((s, i) => (
              <figure
                key={s.name}
                className={`group overflow-hidden rounded-[2rem] border-2 border-[#0b3d33] shadow-[6px_6px_0_#0f6e56] transition-transform duration-500 hover:-translate-y-1 hover:rotate-0 ${HERO_TILES[i]}`}
              >
                <StudentPhoto
                  name={s.name}
                  img={s.img}
                  className="aspect-[4/5] w-full mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </figure>
            ))}
          </div>

          {/* centre badge tying the photos back to the pitch */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-float flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#0b3d33] bg-white px-4 py-2 font-sora text-sm font-extrabold shadow-[4px_4px_0_#e9b949] sm:px-5 sm:text-base">
              <GraduationCap className="h-5 w-5 text-[#0f6e56]" />
              Class 11 <ArrowRight className="h-4 w-4" /> CA by 21
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WhatYouGet() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">What do you get?</h2>
          <p className="mt-3 max-w-2xl text-lg text-[#0b3d33]/70">
            Every week has a rhythm — video sessions, tutor sessions, and practice — so you always know what's next and
            never feel behind.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {FEATURES.map(({ art: Art, photo, title, highlight, points }, i) => (
            <Reveal key={title} delay={i * 0.08} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#0b3d33]/10 bg-[#faf7f0] transition-shadow hover:shadow-lg">
                <div className="flex h-44 items-center justify-center bg-[#e8f8f2] px-6">
                  {photo ? (
                    <img src={photo} alt="CA K Venkat Ramanan" loading="lazy" className="h-full w-auto object-contain object-bottom" />
                  ) : (
                    <Art />
                  )}
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="font-sora text-xl font-bold">{title}</h3>
                  <p className="mt-3 font-semibold text-[#0f6e56]">{highlight}</p>
                  <ul className="mt-2 space-y-1.5 text-[#0b3d33]/70">
                    {points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <p className="font-sora text-xl font-bold sm:text-2xl">Enquire now and see how early you can get ahead.</p>
          <button
            type="button"
            onClick={() => scrollToForm("features")}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-colors hover:bg-[#0b5745]"
          >
            Enquire now <ArrowRight className="h-5 w-5" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="relative overflow-hidden bg-[#faf7f0] py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">The Ultimate Roadmap</p>
          <h2 className="mt-3 font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            Becoming a CA at 21 years
          </h2>
        </Reveal>

        {/* Column headers (desktop) */}
        <div className="mt-12 hidden grid-cols-[1fr_88px_1fr] items-center gap-4 md:grid">
          <p className="text-right font-sora text-lg font-bold text-[#0b3d33]/45">Without FOCAS</p>
          <span />
          <p className="font-sora text-lg font-bold text-[#0f6e56]">With FOCAS</p>
        </div>

        <ol className="relative mt-8 md:mt-6">
          {/* spine */}
          <span aria-hidden className="absolute bottom-6 left-1/2 top-6 hidden w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#1D9E75]/30 via-[#1D9E75] to-[#e9b949] md:block" />

          {ROADMAP.map((row, i) => (
            <Reveal key={row.age} delay={i * 0.08}>
              <li className="relative mb-5 grid gap-3 md:mb-6 md:grid-cols-[1fr_88px_1fr] md:items-center md:gap-4">
                {/* Age badge */}
                <div className="flex items-center gap-3 md:order-2 md:justify-center">
                  <span
                    className={`relative z-10 flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-full border-2 font-sora leading-none ${
                      row.final
                        ? "border-[#0b3d33] bg-[#e9b949] text-[#0b3d33]"
                        : "border-[#0f6e56] bg-white text-[#0f6e56]"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase">Age</span>
                    <span className="text-xl font-extrabold">{row.age}</span>
                  </span>
                  <span className="h-px flex-1 bg-[#0b3d33]/10 md:hidden" />
                </div>

                {/* Without */}
                <div className="md:order-1">
                  <div
                    className={`rounded-2xl border border-dashed px-5 py-4 md:text-right ${
                      row.without ? "border-[#0b3d33]/20 bg-white/60 text-[#0b3d33]/60" : "border-[#0b3d33]/10 bg-transparent text-[#0b3d33]/30"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#0b3d33]/40 md:hidden">Without FOCAS</p>
                    <p className="text-base">{row.without || "—"}</p>
                  </div>
                </div>

                {/* With */}
                <div className="md:order-3">
                  <div
                    className={`rounded-2xl px-5 py-4 ${
                      row.final
                        ? "border-2 border-[#0b3d33] bg-[#0b3d33] text-white shadow-lg"
                        : "border border-[#0f6e56]/25 bg-white text-[#0b3d33] shadow-sm"
                    }`}
                  >
                    <p className={`text-[11px] font-bold uppercase tracking-wider md:hidden ${row.final ? "text-[#e9b949]" : "text-[#0f6e56]"}`}>
                      With FOCAS
                    </p>
                    <p className={`flex items-center gap-2 text-base font-semibold ${row.final ? "font-sora text-lg" : ""}`}>
                      {row.final && <Trophy className="h-5 w-5 flex-shrink-0 text-[#e9b949]" />}
                      {row.with}
                    </p>
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-10 text-center">
          <button
            type="button"
            onClick={() => scrollToForm("roadmap")}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-colors hover:bg-[#0b5745]"
          >
            Start the right-side journey <ArrowRight className="h-5 w-5" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">About FOCAS</p>
          <h2 className="mt-3 font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            Thinking about Chartered Accountancy?
          </h2>
          <p className="mt-5 text-lg text-[#0b3d33]/75">
            FOCAS Edu helps students like you build a real head start — starting right from Class 11 or 12, well before
            the crowd even begins.
          </p>
          <p className="mt-4 text-lg text-[#0b3d33]/75">
            Thousands of students trust FOCAS Edu to guide them through one of India's toughest professional courses —
            not with shortcuts, but with consistent, disciplined preparation that builds real understanding. Whether
            you're just getting curious about CA or ready to commit early, this is where serious CA aspirants start.
          </p>
        </Reveal>

        {/* Classroom social proof */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={i * 0.05} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                className={`w-full rounded-2xl object-cover ${i === 0 ? "aspect-[3/2] h-full" : "aspect-[3/2]"}`}
              />
            </Reveal>
          ))}
        </div>

        {/* Marksheet social proof */}
        <Reveal className="mt-16">
          <h3 className="font-sora text-2xl font-extrabold tracking-tight sm:text-3xl">Marksheet success</h3>
          <p className="mt-2 text-[#0b3d33]/70">Real results from FOCAS students.</p>
        </Reveal>
        <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
          {MARKSHEETS.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06} className="w-72 flex-shrink-0 snap-start sm:w-80">
              <figure className="overflow-hidden rounded-3xl border-2 border-[#0b3d33] bg-[#faf7f0]">
                <img src={m.sheet} alt={`${m.name}'s CA marksheet`} loading="lazy" className="h-56 w-full bg-white object-contain p-2" />
                <figcaption className="flex items-center gap-3 border-t-2 border-[#0b3d33] bg-white px-4 py-3">
                  <img src={m.img} alt={m.name} loading="lazy" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#e9b949]" />
                  <span className="font-sora font-bold">{m.name}</span>
                  <Trophy className="ml-auto h-5 w-5 text-[#e9b949]" />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="overflow-hidden bg-[#faf7f0] py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">Meet the Team behind FOCAS Edu</h2>
          <p className="mt-5 text-lg text-[#0b3d33]/75">
            At FOCAS Edu, our Academic Team is the backbone of student success. They are not just subject experts — they
            are dedicated faculties, tutors, mentors who track your progress, clear every doubt, and guide you with
            strategy and precision.
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-2 gap-4">
            {[
              ["50+", "Tutors"],
              ["1000+", "Students taught"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl border-2 border-[#0b3d33] bg-white px-5 py-4 shadow-[4px_4px_0_#0f6e56]">
                <p className="font-sora text-3xl font-extrabold text-[#0f6e56]">{n}</p>
                <p className="text-sm font-semibold text-[#0b3d33]/70">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-[2rem] border-2 border-[#0b3d33] bg-white shadow-[6px_6px_0_#0f6e56]">
            <img src="/fs/team.webp" alt="The FOCAS Edu academic team" loading="lazy" className="w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CareerBanner() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0b3d33] text-white md:min-h-[420px]">
          <img
            src="/fs/aravindha-banner.webp"
            alt="Aravindha Lochanan, FOCAS student"
            loading="lazy"
            className="aspect-[2/1] w-full object-cover object-left md:absolute md:inset-0 md:aspect-auto md:h-full"
          />
          <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-[#0b3d33]/40 to-[#0b3d33]/95 md:block" />
          <div className="relative p-8 text-center sm:p-12 md:ml-auto md:flex md:min-h-[420px] md:w-1/2 md:flex-col md:items-start md:justify-center md:text-left">
            <p className="font-sora text-3xl font-extrabold leading-tight sm:text-4xl">Start your Career Path TODAY.</p>
            <p className="mt-2 font-sora text-2xl font-bold text-[#e9b949] sm:text-3xl">FOCAS and clear CA by 21.</p>
            <a
              href={BROCHURE_URL}
              download
              onClick={() => {
                if (typeof window.gtag === "function")
                  window.gtag("event", "fs_brochure_download", { event_category: "engagement" });
              }}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-[#0b3d33] transition-colors hover:bg-[#e9b949]"
            >
              <Download className="h-5 w-5" /> Download our Brochure here
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-[#0b3d33] py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hear what our students have to say
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 0.08}
              className={i === TESTIMONIALS.length - 1 && TESTIMONIALS.length % 2 ? "md:col-span-2" : ""}
            >
              <figure className="flex h-full flex-col rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 sm:p-8">
                <Quote className="h-8 w-8 text-[#e9b949]" />
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-white/90">{t.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.img ? (
                    <img src={t.img} alt={t.name} loading="lazy" className="h-12 w-12 rounded-full object-cover ring-2 ring-[#e9b949]" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1D9E75] font-sora text-lg font-bold ring-2 ring-[#e9b949]">
                      {t.name[0]}
                    </span>
                  )}
                  <span className="font-sora font-bold">{t.name}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Register() {
  return (
    <section id="register" className="scroll-mt-16 bg-[#faf7f0] py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">Get started</p>
          <h2 className="mt-3 font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            Give your child a 3-year head start.
          </h2>
          <p className="mt-4 text-lg text-[#0b3d33]/70">
            Register below and book a one-on-one counselling call with CA K Venkat Ramanan — for you and your child —
            for just <strong className="text-[#0b3d33]">₹9</strong>.
          </p>
          <ol className="mt-8 space-y-4">
            {["Fill in your child's details", "Pick a convenient slot & pay ₹9", "Talk with CA K Venkat Ramanan"].map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#0b3d33] bg-white font-sora font-bold">
                  {i + 1}
                </span>
                <span className="text-base font-semibold">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex items-center gap-2 text-sm text-[#0b3d33]/60">
            <Phone className="h-4 w-4" /> Questions? Call{" "}
            <a href="tel:+916383514285" className="font-semibold text-[#0f6e56]">+91 63835 14285</a>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <FsForm />
        </Reveal>
      </div>
    </section>
  );
}

function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const form = document.getElementById("register");
      const pastHero = window.scrollY > 500;
      const atForm = form && form.getBoundingClientRect().top < window.innerHeight;
      setShow(pastHero && !atForm);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#0b3d33]/10 bg-white/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <button
        type="button"
        onClick={() => scrollToForm("sticky")}
        className="w-full rounded-xl bg-[#0f6e56] py-3.5 text-base font-bold text-white"
      >
        Book counselling for ₹9
      </button>
    </div>
  );
}

const FoundationSchool = () => {
  useEffect(() => {
    document.title = "Foundation for School Students | FOCAS Edu";
    if (window.location.hash === "#register") scrollToForm("hash");
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf7f0] font-urbanist" style={{ color: INK }}>
      <Nav />
      <main>
        <Hero />
        <Roadmap />
        <About />
        <Team />
        <CareerBanner />
        <Testimonials />
        <WhatYouGet />
        <Register />
      </main>
      <footer className="bg-[#0b3d33] px-4 py-8 pb-24 text-center text-sm text-white/60 md:pb-8">
        <img src="/fs/logo-white.webp" alt="FOCAS Edu" loading="lazy" className="mx-auto mb-4 h-10 w-auto" />
        © {new Date().getFullYear()} FOCAS Edu. All rights reserved.
      </footer>
      <StickyMobileCTA />
    </div>
  );
};

export default FoundationSchool;
