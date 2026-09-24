import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  GraduationCap,
  Laptop,
  PlayCircle,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import {
  Footer,
  INK,
  MARKSHEETS,
  Register,
  Reveal,
  Roadmap,
  StickyMobileCTA,
  Testimonials,
  YouTube,
  openForm,
} from "./shared";

/**
 * /fs/parents — parent-facing version of the Foundation for School Students
 * page. Same program and registration form as /fs; copy speaks to parents
 * about their child. CTA sources are prefixed "parents-" in gtag.
 */

const HERO_IMG = "/fs/parents/hero.webp";

// TODO: YouTube video IDs. Sections render only once an ID is filled in.
const WHAT_IS_CA_VIDEO_ID = "";
const VIDEO_TESTIMONIALS = [
  // { id: "xxxxxxxxxxx", name: "Student name" },
];

const GALLERY = [
  { src: "/fs/gallery/tuition-1.webp", alt: "Tutor going through answers with a student" },
  { src: "/fs/gallery/tuition-2.webp", alt: "One-on-one doubt clearing session" },
  { src: "/fs/gallery/tuition-3.webp", alt: "Students working through problems with a tutor" },
  { src: "/fs/gallery/tuition-4.webp", alt: "Small-group tutoring session at FOCAS" },
  { src: "/fs/gallery/workshop-session.webp", alt: "Students at a FOCAS workshop session" },
  { src: "/fs/gallery/tuition-5.webp", alt: "Tutor guiding a student at the table" },
  { src: "/fs/gallery/tuition-6.webp", alt: "Students learning together with a FOCAS tutor" },
  { src: "/fs/gallery/tuition-7.webp", alt: "Tutor reviewing answers with students" },
  { src: "/fs/gallery/tuition-8.webp", alt: "Focused study session at FOCAS" },
];

const TRUST_PILLARS = [
  { icon: ShieldCheck, label: "Trust" },
  { icon: Target, label: "Structure" },
  { icon: BarChart3, label: "Results" },
];

const DELIVERY = [
  { icon: Video, title: "Live & recorded sessions", text: "Concepts explained simply, and available to rewatch any time." },
  { icon: Users, title: "Small-group tutoring", text: "Fewer than 10 students per classroom, so no child gets lost." },
  { icon: BarChart3, title: "Mentorship & progress check-ins", text: "By CA K Venkat Ramanan, with students and parents." },
];

const cta = (source) => () => openForm(`parents-${source}`);

// ─── Sections ────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#0b3d33]/10 bg-[#faf7f0]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/fs">
          <img src="/fs/logo.webp" alt="FOCAS Edu — Your First and Last Attempt" className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/fs"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-[#0f6e56] transition-colors hover:bg-[#0f6e56]/10 sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" /> For Students
          </Link>
          <button
            type="button"
            onClick={cta("nav")}
            className="rounded-full bg-[#0f6e56] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0b5745]"
          >
            Register now
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#0b3d33] bg-[#d6f0e6] shadow-[8px_8px_0_#0f6e56]">
      <img
        src={HERO_IMG}
        alt="A parent and their child studying together at home"
        className="aspect-[4/5] w-full object-cover object-[50%_20%] sm:aspect-[5/4] lg:aspect-[4/5]"
      />
    </div>
  );
}

// Program details + CTA — sits under the headline on desktop, below the image on mobile.
function HeroDetails() {
  return (
    <>
      <Reveal delay={0.1}>
        <p className="mt-8 text-lg sm:text-xl text-[#0b3d33]/75">FOCAS Edu presents</p>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#0b3d33]/15 bg-white px-4 py-1.5 font-sora text-base font-bold sm:text-lg">
          <GraduationCap className="h-5 w-5 text-[#0f6e56]" />
          Foundation For School Students Program
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-[#0b3d33] bg-white p-4 shadow-[4px_4px_0_#e9b949] sm:max-w-md">
          <Laptop className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#0f6e56]" />
          <p className="text-lg sm:text-xl">
            <strong className="font-extrabold">COMPLETELY ONLINE</strong> — from the comfort of their homes.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="mt-8 font-sora text-lg font-bold">Have your doubts?</p>
        <button
          type="button"
          onClick={cta("hero")}
          className="group mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-all hover:bg-[#0b5745] active:scale-[.99]"
        >
          Book A Counselling Call Today
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </Reveal>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div aria-hidden className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-[#1D9E75]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-[-10%] h-[320px] w-[320px] rounded-full bg-[#e9b949]/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#0b3d33] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#e9b949]">
              <Users className="h-4 w-4" /> For Parents
            </p>
            <h1 className="mt-5 font-sora text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Want your child to become a{" "}
              <span className="relative whitespace-nowrap text-[#0f6e56]">
                CA at 21
                <svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none">
                  <path d="M2 9 Q 100 -2 198 7" stroke="#e9b949" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </span>{" "}
              years?
            </h1>
          </Reveal>
          <div className="hidden lg:block">
            <HeroDetails />
          </div>
        </div>

        <Reveal delay={0.2} className="relative mx-auto w-full max-w-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-3xl opacity-40"
            style={{ backgroundImage: "radial-gradient(#0f6e56 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }}
          />
          <HeroVisual />
        </Reveal>

        {/* On mobile the program details follow the image instead of preceding it. */}
        <div className="-mt-8 lg:hidden">
          <HeroDetails />
        </div>
      </div>
    </section>
  );
}

function SuccessStories() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">Real results</p>
          <h2 className="mt-3 font-sora text-4xl font-extrabold tracking-tight sm:text-5xl">
            Meet our <span className="text-[#0f6e56]">SUCCESSFUL</span> Students
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MARKSHEETS.map((m, i) => (
            <Reveal key={m.name} delay={(i % 3) * 0.08}>
              <figure className="overflow-hidden rounded-3xl border-2 border-[#0b3d33] bg-white shadow-[6px_6px_0_#0f6e56] transition-transform duration-300 hover:-translate-y-1">
                {/* Student photo composited over their CA marksheet */}
                <img src={m.img} alt={`${m.name} with their CA marksheet`} loading="lazy" className="aspect-square w-full object-cover" />
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

function WhatIsCA() {
  if (!WHAT_IS_CA_VIDEO_ID) return null;
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="flex items-center justify-center gap-3 font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            <PlayCircle className="h-9 w-9 text-[#0f6e56]" /> What is CA?
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <YouTube id={WHAT_IS_CA_VIDEO_ID} title="What is CA? — FOCAS Edu" />
        </Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="bg-[#faf7f0] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">About FOCAS</p>
          <h2 className="mt-3 font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            FOCAS Edu has built its reputation on
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {TRUST_PILLARS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#0b3d33] bg-white px-5 py-2 font-sora text-lg font-extrabold shadow-[3px_3px_0_#e9b949]"
              >
                <Icon className="h-5 w-5 text-[#0f6e56]" /> {label}
              </span>
            ))}
          </div>
          <p className="mt-8 text-lg sm:text-xl text-[#0b3d33]/75">
            Thousands of students trust FOCAS Edu to guide them through one of India's toughest professional courses —
            not with shortcuts, but with consistent, disciplined preparation that builds real understanding.
          </p>
          <p className="mt-4 text-lg sm:text-xl text-[#0b3d33]/75">
            Parents choose FOCAS Edu because we don't just teach — we{" "}
            <strong className="text-[#0b3d33]">track progress, stay accountable, and communicate clearly</strong> on how
            your child is doing.
          </p>
        </Reveal>

        <Reveal className="mt-10 text-center">
          <p className="font-sora text-xl font-bold sm:text-2xl">
            Enroll your ward with FOCAS Edu — where early preparation meets proven trust.
          </p>
          <button
            type="button"
            onClick={cta("about")}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-colors hover:bg-[#0b5745]"
          >
            Enroll your ward <ArrowRight className="h-5 w-5" />
          </button>
        </Reveal>

        {/* Classroom social proof */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={(i % 4) * 0.05} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                className={`w-full rounded-2xl object-cover ${i === 0 ? "aspect-[3/2] h-full" : "aspect-[3/2]"}`}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="overflow-hidden bg-white py-16 sm:py-24">
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#0b3d33] bg-white shadow-[6px_6px_0_#0f6e56]">
          {/* Below xl the text sits above the photo; from xl up it overlays the photo's empty top-left corner. */}
          <div className="p-6 sm:p-10 xl:absolute xl:left-0 xl:top-0 xl:w-[58%] xl:p-12">
            <h2 className="font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">Meet the Team behind FOCAS Edu</h2>
            <p className="mt-4 text-base text-[#0b3d33]/75 sm:text-lg">
              At FOCAS Edu, our Academic Team is the backbone of student success. They are not just subject experts —
              they are dedicated faculties, tutors, mentors who track your child's progress, clear every doubt, and
              guide your child with strategy and precision.
            </p>
            <div className="mt-6 grid max-w-sm grid-cols-2 gap-4">
              {[
                ["50+", "Tutors"],
                ["1000+", "Students taught"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl border-2 border-[#0b3d33] bg-white px-5 py-3 shadow-[4px_4px_0_#0f6e56]">
                  <p className="font-sora text-3xl font-extrabold text-[#0f6e56]">{n}</p>
                  <p className="text-base font-semibold text-[#0b3d33]/70">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <img src="/fs/team.webp" alt="The FOCAS Edu academic team" loading="lazy" className="w-full" />
        </div>
      </Reveal>
    </section>
  );
}

function Program() {
  return (
    <section className="bg-[#faf7f0] py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">About the program</p>
            <h2 className="mt-3 font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
              Designed by experienced CA faculty for Class 11 & 12 students
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-[#0b3d33]/75">
              Our <strong className="text-[#0b3d33]">Foundation For School Students Program</strong> is delivered through a carefully balanced mix of:
            </p>
          </Reveal>
          <ul className="mt-6 space-y-4">
            {DELIVERY.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <li className="flex items-start gap-4 rounded-2xl border border-[#0b3d33]/10 bg-white p-5">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8f8f2]">
                    <Icon className="h-6 w-6 text-[#0f6e56]" />
                  </span>
                  <span>
                    <span className="block font-sora text-lg font-bold">{title}</span>
                    <span className="text-lg text-[#0b3d33]/70">{text}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="mt-8 text-lg sm:text-xl text-[#0b3d33]/75">
              Every session, test, and practice question bank is mapped to the syllabus with discipline and consistency,
              so your child builds a strong foundation <strong className="text-[#0b3d33]">years before their peers even begin.</strong>
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-md">
          <div aria-hidden className="absolute inset-x-6 bottom-0 top-16 rounded-[2rem] bg-[#0f6e56]" />
          <div aria-hidden className="absolute inset-x-6 bottom-0 top-16 rounded-[2rem] opacity-30" style={{ backgroundImage: "radial-gradient(#e9b949 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }} />
          <img
            src="/fs/venkat-ramanan.webp"
            alt="CA K Venkat Ramanan, Founder & CEO of FOCAS Edu"
            loading="lazy"
            className="relative w-full"
          />
          <div className="relative -mt-10 mx-4 rounded-2xl border-2 border-[#0b3d33] bg-white px-5 py-4 text-center shadow-[4px_4px_0_#e9b949]">
            <p className="font-sora text-lg font-extrabold">CA K Venkat Ramanan</p>
            <p className="text-base font-semibold text-[#0b3d33]/70">Founder & CEO, FOCAS Edu</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FsParents = () => {
  useEffect(() => {
    document.title = "For Parents — Foundation for School Students | FOCAS Edu";
    window.scrollTo(0, 0);
    if (window.location.hash === "#register") openForm("parents-hash");
    // Larger type for parents: Tailwind sizes are rem-based, so bumping the root
    // font size scales the whole page. Restored when leaving the page.
    const root = document.documentElement;
    const prev = root.style.fontSize;
    root.style.fontSize = "112.5%";
    return () => { root.style.fontSize = prev; };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf7f0] font-urbanist" style={{ color: INK }}>
      <Nav />
      <main>
        <Hero />
        <SuccessStories />
        <Roadmap large ctaSource="parents-roadmap" />
        <WhatIsCA />
        <About />
        <Team />
        <Program />
        <Testimonials videos={VIDEO_TESTIMONIALS} />
        <Register />
      </main>
      <Footer />
      <StickyMobileCTA source="parents-sticky" />
    </div>
  );
};

export default FsParents;
