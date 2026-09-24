import { useEffect, useRef, useState } from "react";
import { ArrowRight, Award, Check, Phone, PlayCircle, Quote, Trophy, Video, X } from "lucide-react";
import FsForm from "./FsForm";

/**
 * Pieces shared by the /fs (students) and /fs/parents landing pages.
 */

export const INK = "#0b3d33";

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

export function Reveal({ children, delay = 0, className = "" }) {
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

// Every booking CTA opens the registration form in a popup (<FormModal>, rendered by <Register>).
const OPEN_FORM_EVENT = "fs:open-form";

export const openForm = (source) => {
  window.dispatchEvent(new Event(OPEN_FORM_EVENT));
  if (typeof window.gtag === "function")
    window.gtag("event", "fs_cta_click", { event_category: "engagement", event_label: source });
};

// ─── Content ─────────────────────────────────────────────────────────────────

export const HERO_STUDENTS = [
  { name: "Dharani", img: "/fs-assets/students/Dharani.webp" },
  { name: "Aravindhan", img: "/fs-assets/students/Aravindhan.webp" },
  { name: "Keerthana", img: "/fs-assets/students/Keerthana.webp" },
  { name: "Jagadeeshwaran", img: "/fs-assets/students/Jagadeeshwaran.webp" },
];

export const MARKSHEETS = [
  { name: "Kwaja", img: "/fs-assets/marksheets/Kwaja-result.webp" },
  { name: "Mathumetha", img: "/fs-assets/marksheets/Mathumetha-result.webp" },
  { name: "Anupriya", img: "/fs-assets/marksheets/Anupriya-result.webp" },
  { name: "Kavitha", img: "/fs-assets/marksheets/Kavitha-result.webp" },
  { name: "Gowtham", img: "/fs-assets/marksheets/Gowtham-result.webp" },
  { name: "Manjunath", img: "/fs-assets/marksheets/Manjunath-result.webp" },
];

const ROADMAP = [
  { age: "15/16", without: "Student studying only 11th or 12th.", with: "Student begins preparing for Foundation side by side." },
  { age: 17, without: "Student only clears 12th board exams.", with: "Student clears Foundation." },
  { age: 18, without: "Starts figuring out Foundation.", with: "Student clears Inter." },
  { age: 19, without: "Starts preparing for Inter.", with: "Student is in the Articleship period." },
  { age: 20, without: "Begins Articleship.", with: "Starts preparing for Final." },
  { age: 21, without: "Still in Articleship.", with: "Student becomes a CA.", final: true },
];

const TESTIMONIALS = [
  {
    name: "Ragavi",
    img: "/fs-assets/testimonials/Ragavi.webp",
    text: "Being a self study student, studying is hard. I realised how important this mentorship is in my journey.",
  },
  {
    name: "Sabitha",
    img: "/fs-assets/testimonials/Sabitha.webp",
    text: "I thought I knew the subjects. The only problem I felt was my presentation. But only after coming here, I understood that I actually know very little.",
  },
  {
    name: "Yashika",
    img: "/fs-assets/testimonials/Yashika.webp",
    text: "The method of teaching followed by FOCAS academy is perfect. Trust me, I was able to score 82 just by enrolling in their fast track — then imagine how their regular course would be.",
  },
  {
    name: "Naveen",
    img: "/fs-assets/testimonials/Naveen.webp",
    text: "I was able to complete preparation in class itself, because it was live studying and NO procrastination. Got rid of confusions in the class itself as there were Q&A discussions at the end of every topic.",
  },
  {
    name: "Mercy",
    img: "/fs-assets/testimonials/Mercy.webp",
    text: "Really happy and satisfied with the tutors — the way of teaching here is effective. The concept behind Deep FOCAS is too good and I gained the confidence I always wanted.",
  },
];

// ─── Sections ────────────────────────────────────────────────────────────────

export function StudentPhoto({ name, img, className = "" }) {
  const [broken, setBroken] = useState(!img);
  return broken ? (
    <span className={`flex items-center justify-center bg-[#1D9E75] font-sora text-4xl font-extrabold text-white ${className}`}>
      {name[0]}
    </span>
  ) : (
    <img src={img} alt={name} onError={() => setBroken(true)} className={`object-cover object-top ${className}`} />
  );
}

/** Responsive 16:9 YouTube embed. */
export function YouTube({ id, title }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-2 border-[#0b3d33] bg-black shadow-[6px_6px_0_#0f6e56]">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

export function Roadmap({ large = false, ctaSource = "roadmap" }) {
  const badge = large ? "h-20 w-20" : "h-14 w-14";
  const cols = large ? "md:grid-cols-[1fr_120px_1fr]" : "md:grid-cols-[1fr_88px_1fr]";
  const text = large ? "text-lg sm:text-xl" : "text-base";
  const card = large ? "px-6 py-5 sm:px-7 sm:py-6" : "px-5 py-4";

  return (
    <section className="relative overflow-hidden bg-[#faf7f0] py-16 sm:py-24">
      <div className={`mx-auto px-4 sm:px-6 ${large ? "max-w-6xl" : "max-w-5xl"}`}>
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">The Ultimate Roadmap</p>
          <h2 className={`mt-3 font-sora font-extrabold tracking-tight ${large ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>
            Becoming a CA at 21 years
          </h2>
        </Reveal>

        {/* Column headers (desktop) */}
        <div className={`mt-12 hidden items-center gap-4 md:grid ${cols}`}>
          <p className={`text-right font-sora font-bold text-[#0b3d33]/45 ${large ? "text-2xl" : "text-lg"}`}>Without FOCAS</p>
          <span />
          <p className={`font-sora font-bold text-[#0f6e56] ${large ? "text-2xl" : "text-lg"}`}>With FOCAS</p>
        </div>

        {/* Mobile: vertical timeline — spine on the left, one card per age leading with the FOCAS outcome */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 md:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f6e56] px-3 py-1 text-xs font-bold text-white">
            <Check className="h-3.5 w-3.5" /> With FOCAS
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#0b3d33]/30 px-3 py-1 text-xs font-semibold text-[#0b3d33]/55">
            <X className="h-3.5 w-3.5" /> Without FOCAS
          </span>
        </div>
        <ol className="relative mt-8 md:hidden">
          <span aria-hidden className="absolute bottom-12 left-7 top-7 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#1D9E75]/30 via-[#1D9E75] to-[#e9b949]" />
          {ROADMAP.map((row, i) => (
            <Reveal key={row.age} delay={i * 0.06} className="pb-5 last:pb-0">
              <li className="relative pl-[4.5rem]">
                <span
                  className={`absolute left-0 top-0 z-10 flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 font-sora leading-none ${
                    row.final ? "border-[#0b3d33] bg-[#e9b949] text-[#0b3d33]" : "border-[#0f6e56] bg-white text-[#0f6e56]"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">Age</span>
                  <span className={`font-extrabold ${String(row.age).length > 2 ? "text-sm" : "text-xl"}`}>{row.age}</span>
                </span>
                <div
                  className={`overflow-hidden rounded-2xl ${
                    row.final ? "bg-[#0b3d33] text-white shadow-lg" : "border border-[#0f6e56]/25 bg-white shadow-sm"
                  }`}
                >
                  <p className={`flex items-start gap-2 px-4 py-3.5 font-semibold ${large ? "text-lg" : "text-base"} ${row.final ? "font-sora" : ""}`}>
                    {row.final ? (
                      <Trophy className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#e9b949]" />
                    ) : (
                      <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#1D9E75]" />
                    )}
                    {row.with}
                  </p>
                  {row.without && (
                    <p
                      className={`flex items-start gap-2 border-t border-dashed px-4 py-2.5 text-sm ${
                        row.final ? "border-white/20 text-white/60" : "border-[#0b3d33]/15 bg-[#faf7f0] text-[#0b3d33]/55"
                      }`}
                    >
                      <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>
                        <span className="font-semibold">Without FOCAS:</span> {row.without}
                      </span>
                    </p>
                  )}
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        {/* Desktop: three-column comparison around a central spine */}
        <ol className="relative mt-6 hidden md:block">
          {/* spine */}
          <span aria-hidden className="absolute bottom-6 left-1/2 top-6 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#1D9E75]/30 via-[#1D9E75] to-[#e9b949]" />

          {ROADMAP.map((row, i) => (
            <Reveal key={row.age} delay={i * 0.08}>
              <li className={`relative mb-6 grid items-center gap-4 ${cols}`}>
                {/* Age badge */}
                <div className="order-2 flex justify-center">
                  <span
                    className={`relative z-10 flex ${badge} flex-shrink-0 flex-col items-center justify-center rounded-full border-2 font-sora leading-none ${
                      row.final
                        ? "border-[#0b3d33] bg-[#e9b949] text-[#0b3d33]"
                        : "border-[#0f6e56] bg-white text-[#0f6e56]"
                    }`}
                  >
                    <span className={`font-semibold uppercase ${large ? "text-xs" : "text-[10px]"}`}>Age</span>
                    <span className={`font-extrabold ${
                        String(row.age).length > 2 ? (large ? "text-xl" : "text-sm") : large ? "text-3xl" : "text-xl"
                      }`}>
                      {row.age}
                    </span>
                  </span>
                </div>

                {/* Without */}
                <div className="order-1">
                  <div
                    className={`rounded-2xl border border-dashed ${card} text-right ${
                      row.without ? "border-[#0b3d33]/20 bg-white/60 text-[#0b3d33]/60" : "border-[#0b3d33]/10 bg-transparent text-[#0b3d33]/30"
                    }`}
                  >
                    <p className={text}>{row.without || "—"}</p>
                  </div>
                </div>

                {/* With */}
                <div className="order-3">
                  <div
                    className={`rounded-2xl ${card} ${
                      row.final
                        ? "border-2 border-[#0b3d33] bg-[#0b3d33] text-white shadow-lg"
                        : "border border-[#0f6e56]/25 bg-white text-[#0b3d33] shadow-sm"
                    }`}
                  >
                    <p className={`flex items-center gap-2 font-semibold ${text} ${row.final ? "font-sora" : ""}`}>
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
            onClick={() => openForm(ctaSource)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-colors hover:bg-[#0b5745]"
          >
            Start the right-side journey <ArrowRight className="h-5 w-5" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/** `videos` is an optional list of { id, name } YouTube testimonials shown above the text ones. */
export function Testimonials({ videos = [] }) {
  return (
    <section className="bg-[#0b3d33] py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hear what our students have to say
          </h2>
        </Reveal>

        {videos.length > 0 && (
          <>
            <Reveal>
              <h3 className="mt-10 flex items-center gap-2 font-sora text-xl font-bold text-[#e9b949]">
                <PlayCircle className="h-6 w-6" /> Video Testimonials
              </h3>
            </Reveal>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {videos.map((v, i) => (
                <Reveal key={v.id} delay={i * 0.08}>
                  <YouTube id={v.id} title={`${v.name} — FOCAS Edu testimonial`} />
                  <p className="mt-3 font-sora font-bold">{v.name}</p>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <h3 className="mt-14 flex items-center gap-2 font-sora text-xl font-bold text-[#e9b949]">
                <Quote className="h-6 w-6" /> Text Testimonials
              </h3>
            </Reveal>
          </>
        )}

        <div className={`${videos.length ? "mt-6" : "mt-10"} grid gap-5 md:grid-cols-2`}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 0.08}
              className={i === TESTIMONIALS.length - 1 && TESTIMONIALS.length % 2 ? "md:col-span-2" : ""}
            >
              <figure className="flex h-full flex-col gap-5 rounded-3xl bg-white p-6 text-slate-800 shadow-lg ring-1 ring-black/5 sm:flex-row sm:items-center sm:gap-7 sm:p-8">
                {t.img ? (
                  <img
                    src={t.img}
                    alt={t.name}
                    loading="lazy"
                    className="h-44 w-44 shrink-0 self-center object-contain object-bottom sm:h-52 sm:w-52"
                  />
                ) : (
                  <span className="flex h-44 w-44 shrink-0 items-center justify-center rounded-full bg-[#1D9E75] font-sora text-6xl font-bold text-white sm:h-52 sm:w-52">
                    {t.name[0]}
                  </span>
                )}
                <div className="flex flex-1 flex-col">
                  <Quote className="h-8 w-8 text-[#1D9E75]" />
                  <blockquote className="mt-3 text-lg leading-relaxed text-slate-700">{t.text}</blockquote>
                  <figcaption className="mt-4 font-sora font-bold text-[#0b3d33]">{t.name}</figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Pass `forStudents` on the student page; the default copy addresses parents. */
export function Register({ forStudents = false }) {
  const who = forStudents ? "your parent" : "your child";
  const steps = [
    forStudents ? "Fill in your details" : "Fill in your child's details",
    "Pick a convenient slot & pay ₹9",
    "Talk with CA K Venkat Ramanan",
  ];
  return (
    <section id="register" className="scroll-mt-16 bg-[#faf7f0] py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1D9E75]">Get started</p>
          <h2 className="mt-3 font-sora text-3xl font-extrabold tracking-tight sm:text-4xl">
            {forStudents ? "Get a 3-year head start." : "Give your child a 3-year head start."}
          </h2>
          <p className="mt-4 text-lg text-[#0b3d33]/70">
            Register and book a one-on-one counselling call with CA K Venkat Ramanan — for you and {who} —
            for just <strong className="text-[#0b3d33]">₹9</strong>.
          </p>
          <ol className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#0b3d33] bg-white font-sora font-bold">
                  {i + 1}
                </span>
                <span className="text-base font-semibold">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-center gap-5 rounded-2xl border-2 border-[#0b3d33] bg-white p-5 shadow-[4px_4px_0_#e9b949] sm:gap-6 sm:p-6">
            <div className="flex flex-shrink-0 flex-col items-center text-[#0f6e56]">
              <Award className="h-6 w-6" />
              <span className="mt-1 font-sora text-5xl font-extrabold leading-none sm:text-6xl">85%</span>
              <span className="mt-1 text-xs font-bold uppercase tracking-[0.15em]">&amp; above</span>
            </div>
            <p className="text-base font-semibold text-[#0b3d33] sm:text-lg">
              We only accept students with <strong className="font-extrabold text-[#0f6e56]">85% or above</strong> in
              their recent board examinations.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[2rem] border-2 border-[#0b3d33] bg-white p-6 text-center shadow-[8px_8px_0_#0f6e56] sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d6f0e6]">
              <Video className="h-7 w-7 text-[#0f6e56]" />
            </span>
            <p className="mt-5 font-sora text-2xl font-extrabold">1-on-1 counselling call</p>
            <p className="mt-2 text-[#0b3d33]/70">with CA K Venkat Ramanan</p>
            <p className="mt-6 font-sora text-6xl font-extrabold text-[#0f6e56]">₹9</p>
            <button
              type="button"
              onClick={() => openForm("register-section")}
              className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f6e56] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#0f6e56]/25 transition-all hover:bg-[#0b5745] active:scale-[.99]"
            >
              Book 1-on-1 Counselling
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-[#0b3d33]/60">
              <Phone className="h-4 w-4" /> Questions? Call{" "}
              <a href="tel:+916383514285" className="font-semibold text-[#0f6e56]">+91 63835 14285</a>
            </p>
          </div>
        </Reveal>
      </div>
      <FormModal forStudents={forStudents} />
    </section>
  );
}

function FormModal({ forStudents }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_FORM_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_FORM_EVENT, onOpen);
  }, []);

  // While open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book 1-on-1 counselling"
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#0b3d33]/60 p-4 backdrop-blur-sm sm:items-center sm:py-10"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="relative my-auto w-full max-w-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#faf7f0] text-[#0b3d33] transition-colors hover:bg-[#0b3d33]/10"
        >
          <X className="h-5 w-5" />
        </button>
        <FsForm forStudents={forStudents} />
      </div>
    </div>
  );
}

export function StickyMobileCTA({ source = "sticky" }) {
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
        onClick={() => openForm(source)}
        className="w-full rounded-xl bg-[#0f6e56] py-3.5 text-base font-bold text-white"
      >
        Book 1-on-1 Counselling
      </button>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0b3d33] px-4 py-8 pb-24 text-center text-sm text-white/60 md:pb-8">
      <img src="/fs-assets/logo-white.webp" alt="FOCAS Edu" loading="lazy" className="mx-auto mb-4 h-10 w-auto" />
      © {new Date().getFullYear()} FOCAS Edu. All rights reserved.
    </footer>
  );
}
