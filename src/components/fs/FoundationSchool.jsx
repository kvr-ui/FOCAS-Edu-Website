import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  GraduationCap,
  Trophy,
  Users,
} from "lucide-react";
import {
  Footer,
  HERO_STUDENTS,
  INK,
  MARKSHEETS,
  Register,
  Reveal,
  Roadmap,
  StickyMobileCTA,
  StudentPhoto,
  Testimonials,
  openForm,
} from "./shared";

/**
 * /fs — "Foundation for School Students" landing page.
 * Audience: 11th/12th students (parents have their own page at /fs/parents).
 * Pitch: prepare for CA Foundation alongside school and become a CA at 21.
 * CTAs lead to the FsForm below.
 */

// ─── Content ─────────────────────────────────────────────────────────────────

// TODO: drop the FS brochure PDF at public/pdf/FS-Brochure.pdf
const BROCHURE_URL = "/pdf/FS-Brochure.pdf";

// Per-tile tint + tilt for the hero collage (photos have white backgrounds, so
// mix-blend-multiply lets the tint show through as a cut-out backdrop).
const HERO_TILES = [
  "bg-[#d6f0e6] -rotate-2",
  "bg-[#fbe7b0] rotate-2 translate-y-8",
  "bg-[#fbe7b0] rotate-1",
  "bg-[#d6f0e6] -rotate-1 translate-y-8",
];

const GALLERY = [
  { src: "/fs-assets/gallery/tuition-1.webp", alt: "Tutor going through answers with a student" },
  { src: "/fs-assets/gallery/tuition-2.webp", alt: "One-on-one doubt clearing session" },
  { src: "/fs-assets/gallery/tuition-3.webp", alt: "Students working through problems with a tutor" },
  { src: "/fs-assets/gallery/workshop-session.webp", alt: "Students at a FOCAS workshop session" },
  { src: "/fs-assets/gallery/tuition-5.webp", alt: "Tutor guiding a student at the table" },
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

// ─── Sections ────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#0b3d33]/10 bg-[#faf7f0]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <img src="/fs-assets/logo.webp" alt="FOCAS Edu — Your First and Last Attempt" className="h-8 w-auto object-contain sm:h-10" />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/fs/parents"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#0f6e56] px-3 py-1.5 text-xs font-bold text-[#0f6e56] transition-colors hover:bg-[#0f6e56] hover:text-white sm:px-4 sm:text-sm"
          >
            <Users className="hidden h-4 w-4 sm:block" /> For Parents
          </Link>
          <button
            type="button"
            onClick={() => openForm("nav")}
            className="whitespace-nowrap rounded-full bg-[#0f6e56] px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm text-white transition-colors hover:bg-[#0b5745]"
          >
            Register now
          </button>
        </div>
      </div>
    </nav>
  );
}

// Program details + CTA — sits under the headline on desktop, below the image on mobile.
function HeroDetails() {
  return (
    <>
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
          onClick={() => openForm("hero")}
          className="group mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-all hover:bg-[#0b5745] active:scale-[.99]"
        >
          Book A Counselling Call Today
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="mt-4 text-sm text-[#0b3d33]/70">
          Are you a parent?{" "}
          <Link to="/fs/parents" className="font-bold text-[#0f6e56] underline underline-offset-4 hover:text-[#0b5745]">
            See the program from a parent's view →
          </Link>
        </p>
      </Reveal>
    </>
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
          <div className="hidden lg:block">
            <HeroDetails />
          </div>
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

        {/* On mobile the program details follow the image instead of preceding it. */}
        <div className="-mt-8 lg:hidden">
          <HeroDetails />
        </div>
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
            onClick={() => openForm("features")}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-colors hover:bg-[#0b5745]"
          >
            Enquire now <ArrowRight className="h-5 w-5" />
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
            <Reveal key={m.name} delay={i * 0.06} className="w-[85%] flex-shrink-0 snap-start sm:w-[calc((100%-2.5rem)/2.5)]">
              <figure className="overflow-hidden rounded-3xl border-2 border-[#0b3d33] bg-white">
                {/* Student photo composited over their CA marksheet */}
                <img
                  src={m.img}
                  alt={`${m.name} with their CA marksheet`}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="flex items-center gap-3 bg-[#0b3d33] px-5 py-4 text-white">
                  <span className="font-sora text-xl font-extrabold">{m.name}</span>
                  <Trophy className="ml-auto h-6 w-6 text-[#e9b949]" />
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
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#0b3d33] bg-white shadow-[6px_6px_0_#0f6e56]">
          {/* Below xl the text sits above the photo; from xl up it overlays the photo's empty top-left corner. */}
          <div className="p-6 sm:p-10 xl:absolute xl:left-0 xl:top-0 xl:w-[58%] xl:p-12">
            <h2 className="font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">Meet the Team behind FOCAS Edu</h2>
            <p className="mt-4 text-base text-[#0b3d33]/75 sm:text-lg">
              At FOCAS Edu, our Academic Team is the backbone of student success. They are not just subject experts —
              they are dedicated faculties, tutors, mentors who track your progress, clear every doubt, and guide you
              with strategy and precision.
            </p>
            <div className="mt-6 grid max-w-sm grid-cols-2 gap-4">
              {[
                ["50+", "Tutors"],
                ["1000+", "Students taught"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl border-2 border-[#0b3d33] bg-white px-5 py-3 shadow-[4px_4px_0_#0f6e56]">
                  <p className="font-sora text-3xl font-extrabold text-[#0f6e56]">{n}</p>
                  <p className="text-sm font-semibold text-[#0b3d33]/70">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <img src="/fs-assets/team.webp" alt="The FOCAS Edu academic team" loading="lazy" className="w-full" />
        </div>
      </Reveal>
    </section>
  );
}

function CareerBanner() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0b3d33] text-white md:min-h-[420px]">
          <img
            src="/fs-assets/aravindha-banner.webp"
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

const FoundationSchool = () => {
  useEffect(() => {
    document.title = "Foundation for School Students | FOCAS Edu";
    if (window.location.hash === "#register") openForm("hash");
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
        <Register forStudents />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default FoundationSchool;
