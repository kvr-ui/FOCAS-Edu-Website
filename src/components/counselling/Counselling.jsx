import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  GraduationCap,
  Phone,
  Play,
  Repeat,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Youtube,
  Instagram,
  Linkedin,
  Zap,
} from "lucide-react";
import { STATE_CITIES, STATES } from "@/data/indiaStatesCities";
import {
  CA_STATUS_OPTIONS,
  DIAL_CODES,
  Honeypot,
  captureUtms,
  trackLead,
} from "@/components/bigin/formKit";
import { sendToZohoFlow } from "@/components/fs/FsForm";

// Bigin "Lead Source" values sent through the FS Zoho Flow webhook.
// The Flow maps `source` to Bigin's Lead Source, so set both.
const ZOHO_LEAD = { source: "Counselling", leadSource: "Counselling" };

/**
 * /counselling — "Last Attempt Community Starter Kit" counselling landing page.
 *
 * Content mirrors kit.focasedu.com/pages/counselling; the UI (layout, colours,
 * Manrope / Lexend Deca type, card + form styling) replicates the
 * errormakesclever.com offline-fullstack-course page.
 *
 * Every form sends the lead to the Zoho Flow webhook (→ Bigin), then moves on
 * to /counselling-success, where the ad conversions fire.
 */

/* eslint-disable react-refresh/only-export-components -- shared with CounsellingSuccess */
export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Lexend+Deca:wght@400;500;600;700;800&display=swap";
export const MANROPE = { fontFamily: "'Manrope', sans-serif" };
export const LEXEND = { fontFamily: "'Lexend Deca', sans-serif" };

const CDN = "https://da3m0k666tznr.cloudfront.net";
const HERO_VIDEO = `${CDN}/audit/audit.mp4`;
const HERO_POSTER = "/counselling-assets/hero-thumbnail.jpeg";
export const PHONE_DISPLAY = "+91 63835 14285";
export const PHONE_TEL = "tel:+916383514285";

// EMC's two button styles.
const BTN_DARK =
  "bg-gradient-to-b from-[#425673] to-[#1C232D] text-white font-medium rounded-lg hover:from-[#1C232D] hover:to-[#425673] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300";
const BTN_BLUE =
  "bg-gradient-to-b from-blue-600 to-blue-900 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300";
const AI_BADGE =
  "inline-block rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-900 px-4 py-1 font-bold text-white shadow-2xl shadow-blue-500/40";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(49,52,59,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(49,52,59,.06) 1px, transparent 1px)",
  backgroundSize: "72px 72px",
  backgroundPosition: "center top",
};

const ATTEMPT_OPTIONS = ["Jan 2027", "May 2027", "Sept 2027"];
const LANGUAGE_OPTIONS = ["English", "Tamil", "Hindi"];

const HERO_STATS = [
  ["Online", "Live Classes"],
  ["Study Along", "with Tutor"],
  ["6 AM – 10 PM", "Flexible Timings"],
  ["English & Tamil", "Language"],
  ["25+ Faculty", "Qualified Experts"],
  ["15+ Tutors", "Daily Guidance"],
];

const TUTOR_SLOTS = [
  ["Early Morning", "06:00 AM - 09:00 AM"],
  ["Morning", "10:00 AM - 01:00 PM"],
  ["Afternoon", "02:00 PM - 05:00 PM"],
  ["Evening", "07:00 PM - 10:00 PM"],
];

const WHY_FOCAS = [
  { icon: Target, title: "Precision Practice", body: "Tutor Sessions — live small-group practice with your dedicated tutor", color: "text-red-500" },
  { icon: Brain, title: "Concept Mastery", body: "Faculty Videos — pre-recorded lectures structured for maximum clarity", color: "text-violet-600" },
  { icon: Repeat, title: "Deep FOCAS", body: "Revision Marathon — cover every topic again before the exam", color: "text-sky-600" },
  { icon: FileCheck, title: "Mentor Reviewed Tests", body: "Every test reviewed by a mentor so your weak areas are fixed", color: "text-emerald-600" },
  { icon: Zap, title: "MCQ Marathon", body: "Speed and accuracy drills for the MCQ section", color: "text-amber-500" },
  { icon: BookOpen, title: "FOCAS Planner & Manual", body: "A strategic planner so nothing is left to chance", color: "text-pink-600" },
];

const DESIGNED_FOR = [
  {
    title: "Repeaters",
    body: "Break the attempt-to-attempt cycle with personalized attention. With a 1:10 tutor-student ratio and the proven Last Attempt System, your preparation gaps are identified and fixed.",
    icon: Repeat,
    grad: "from-blue-400 to-blue-600 shadow-blue-500/40",
    glow: "from-blue-500/10",
  },
  {
    title: "First-Timers",
    body: "New to CA Intermediate? Or CA itself? Worry not. With our expert recorded lectures, you will be caught up with the syllabus in time for your Tutor sessions.",
    icon: GraduationCap,
    grad: "from-orange-400 to-orange-600 shadow-orange-500/40",
    glow: "from-orange-500/10",
  },
  {
    title: "College-goers / Working Professionals",
    body: "Prepare while going to college/working seamlessly. With flexible timings between 6 AM to 10 PM, you can maximize the limited study hours with strategic focus.",
    icon: CalendarDays,
    grad: "from-green-400 to-green-600 shadow-green-500/40",
    glow: "from-green-500/10",
  },
  {
    title: "Average Score 50+",
    body: "Based on past SUCCESSFUL FOCAS Students. 1,000+ students already learning with the Last Attempt System.",
    icon: Trophy,
    grad: "from-sky-400 to-sky-600 shadow-sky-500/40",
    glow: "from-sky-500/10",
  },
];

const KIT_ITEMS = [
  ["📚", "Enhanced Study Material", "INCLUDED", "bg-yellow-100 text-yellow-800"],
  ["🤝", "Exclusive Access to the Last Attempt Community", "INCLUDED", "bg-yellow-100 text-yellow-800"],
  ["📞", "Get a chance to talk to one of our experts for FREE!", "FREE", "bg-green-100 text-green-800"],
];

const STORIES = [
  { name: "Gayathri", file: "Gayathri" },
  { name: "Harini Aiswariya", file: "HariniAiswariya" },
  { name: "Jeshurun", file: "Jeshurun" },
  { name: "Marimuthu", file: "Marimuthu" },
  { name: "Sai Shruthi", file: "Saishruthi" },
  { name: "Sridevi", file: "Sridevi" },
];

const RESULTS = [
  { name: "Mathumetha", src: `${CDN}/images/certificate/Mathumetha.jpeg` },
  { name: "Gowtham", src: `${CDN}/images/certificate/Gowtham.jpeg` },
  { name: "Kavitha", src: `${CDN}/images/certificate/kavitha.jpeg` },
  { name: "Manjunath", src: `${CDN}/images/certificate/ManjunathMarksheet.jpeg` },
];

const BEFORE = [
  "Attempting CA Inter again and again",
  "Buried in 200+ student lecture halls",
  "Complex topics like Costing/Law still confusing",
  "No one tracking my progress or weak areas",
  "Unstructured preparation, missing key topics",
  "Freezing up during exams",
  "One-size-fits-all teaching doesn't work for me",
  "Running out of time and motivation",
];

const AFTER = [
  "Making this my last attempt with proven system",
  "One of just 10 students—tutor knows my name",
  "Complex subjects broken down with clarity",
  "Personal mentor tracking every step",
  "Question Banks + Tests + Marathons cover everything",
  "Scoring 60+ with exam strategies that work",
  "Personalized attention fixes my weak spots",
  "Flexible timings keep me consistent and motivated",
];

const FAQS = [
  {
    q: "What does the Last Attempt Community Starter Kit Include?",
    a: "The Kit includes exclusive access to the Last Attempt Community and also, a FREE call with one of our experts.",
  },
  {
    q: "What are Faculty Sessions?",
    a: "Faculty sessions are conceptual lectures designed to help you understand the subject thoroughly. At FOCAS, all faculty lectures are pre-recorded and structured for maximum clarity.",
  },
  {
    q: "What is a Tutor Session?",
    a: "Tutor sessions are live sessions focused on accountability and completion. Each student is part of a small group (maximum of 10 students) guided by a dedicated tutor who ensures progress and clarity.",
  },
  {
    q: "What are the Tutor Session Timings?",
    a: "Tutor sessions are conducted in 4 daily slots: 6 AM – 9 AM, 10 AM – 1 PM, 2 PM – 5 PM, 7 PM – 10 PM",
  },
  {
    q: "What Language Are the Classes In?",
    a: "Classes are conducted in both English and Tamil to ensure ease of understanding.",
  },
  {
    q: "Which Attempt is this batch meant for?",
    a: "Our batches are exam-oriented and ideal for the targeted attempt and subsequent ones. For example: If the batch is designed for Jan 2027, students appearing in May 2027 can also enroll and benefit.",
  },
  {
    q: "Who Will Be Teaching and Guiding Me?",
    a: "You'll learn from a team of 25+ qualified professionals handling the faculty lectures and 15+ dedicated tutors guiding you through daily sessions and progress tracking.",
  },
  {
    q: "Can I Purchase Only the Tutor Sessions Separately?",
    a: "No, tutor sessions cannot be purchased separately. At FOCAS, every subject is offered as a combined package—faculty lectures followed by tutor sessions. The tutor sessions are structured to complement the faculty lectures, ensuring complete understanding and consistent follow-through.",
  },
];

const LIKE_MOST = [
  "1:10 Personal Tutoring",
  "Mentor-Reviewed Tests",
  "Question Banks & Marathons",
  "Daily mentorship",
  "6 AM – 10 PM timings",
  "English & Tamil",
];

/* ─────────────────────────── Lead form (antd look) ─────────────────────────── */

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  dialCode: "+91",
  phone: "",
  caStatus: "",
  attempt: "",
  state: "",
  city: "",
  language: "",
  company: "", // honeypot — must stay empty for real users
};

// Ant Design "large" input replica: 40px tall, #d9d9d9 border, 8px radius.
const fieldCls =
  "h-10 rounded-lg border border-[#d9d9d9] bg-white px-[11px] text-base text-black/90 outline-none transition placeholder:text-black/25 hover:border-[#4096ff] focus:border-[#1677ff] focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)] disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/25";
const inputCls = `w-full ${fieldCls}`;

// Module scope so inputs keep focus across renders (see formKit Row).
const Field = ({ label, error, children }) => (
  <div className="mb-4">
    <label className="block pb-2 text-sm font-medium text-black/90">
      <span className="mr-1 text-[#ff4d4f]">*</span>
      {label}
    </label>
    {children}
    {error && <div className="mt-1 text-sm text-[#ff4d4f]">{error}</div>}
  </div>
);

const LeadForm = ({ onSuccess }) => {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  // Changing the state resets the dependent city selection.
  const setState = (e) => {
    const state = e.target.value;
    setValues((v) => ({ ...v, state, city: "" }));
    setErrors((er) => ({ ...er, state: undefined }));
  };

  const validate = () => {
    const e = {};
    const name = (k, label) => {
      const v = values[k].trim();
      if (!v) e[k] = `Please enter your ${label}.`;
      else if (/\d/.test(v)) e[k] = "Only letters are allowed.";
    };
    name("firstName", "first name");
    name("lastName", "last name");
    if (!/^[0-9]{10}$/.test(values.phone.trim())) e.phone = "Enter a 10 digit phone number.";
    if (!values.caStatus) e.caStatus = "Please select your CA status.";
    if (!values.attempt) e.attempt = "Please enter your attempt.";
    if (!values.state || !values.city) e.state = "Please select your state and city.";
    if (!values.language) e.language = "Please select a language.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: `${values.dialCode}${values.phone}`.trim(),
      caStatus: values.caStatus,
      attempt: values.attempt,
      city: values.city,
      state: values.state,
      language: values.language,
      company: values.company, // honeypot
      utm: captureUtms(),
    };

    setSubmitting(true);
    try {
      // The lead goes to the Zoho Flow webhook (skipped for bots that filled
      // the honeypot — they still see the normal success state).
      if (!payload.company) {
        sendToZohoFlow(payload, ZOHO_LEAD);
        trackLead("counselling", payload);
      }

      if (typeof window.gtag === "function")
        window.gtag("event", "counselling_form_submit", {
          event_category: "engagement",
          event_label: "Last Attempt Community Starter Kit",
        });
      window.dataLayer?.push({ event: "counselling_form_submit", page_path: "/counselling" });

      setValues(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="relative mt-2">
      <Honeypot value={values.company} onChange={set("company")} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" error={errors.firstName}>
          <input className={inputCls} maxLength={40} placeholder="Enter first name" value={values.firstName} onChange={set("firstName")} />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <input className={inputCls} maxLength={80} placeholder="Enter last name" value={values.lastName} onChange={set("lastName")} />
        </Field>
      </div>

      <Field label="Phone (or) Whatsapp Number" error={errors.phone}>
        <div className="flex">
          <select
            aria-label="Country code"
            className={`${fieldCls} w-[96px] shrink-0 rounded-r-none border-r-0 px-2`}
            value={values.dialCode}
            onChange={set("dialCode")}
          >
            {DIAL_CODES.map((c) => (
              <option key={c} value={c}>
                {c === "+91" ? "🇮🇳 +91" : c}
              </option>
            ))}
          </select>
          <input
            className={`${inputCls} min-w-0 rounded-l-none`}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            value={values.phone}
            onChange={(e) => set("phone")({ target: { value: e.target.value.replace(/\D/g, "").slice(0, 10) } })}
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="CA Status" error={errors.caStatus}>
          <select className={inputCls} value={values.caStatus} onChange={set("caStatus")}>
            <option value="" disabled>Select</option>
            {CA_STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Attempt" error={errors.attempt}>
          <select className={inputCls} value={values.attempt} onChange={set("attempt")}>
            <option value="" disabled>Select</option>
            {ATTEMPT_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="State & City" error={errors.state}>
        <div className="grid grid-cols-2 gap-3">
          <select className={inputCls} value={values.state} onChange={setState}>
            <option value="" disabled>State</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className={inputCls} value={values.city} onChange={set("city")} disabled={!values.state}>
            <option value="" disabled>{values.state ? "City" : "Select state first"}</option>
            {(STATE_CITIES[values.state] || []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </Field>

      <Field label="Preferred Language" error={errors.language}>
        <select className={inputCls} value={values.language} onChange={set("language")}>
          <option value="" disabled>Select your language</option>
          {LANGUAGE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>

      {submitError && <p className="mb-3 text-sm text-[#ff4d4f]">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="h-10 w-full rounded-lg bg-gradient-to-b from-[#425673] to-[#1C232D] text-base text-white shadow-[0_2px_0_rgba(5,145,255,0.1)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Request a call back"}
      </button>
    </form>
  );
};

/* ─────────────────────────── Modals (antd look) ─────────────────────────── */

const Modal = ({ open, onClose, children, label }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-10 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="relative w-full max-w-[520px] rounded-[20px] bg-white p-7 shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]"
        style={MANROPE}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-black/45 transition hover:bg-black/5 hover:text-black/90"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

const ModalIcon = ({ children }) => (
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffbd3b] shadow-[0_8px_20px_-6px_rgba(255,189,59,0.7)]">
    {children}
  </div>
);

/* ─────────────────────────── Sections ─────────────────────────── */

const Header = ({ onCta }) => (
  <div className="sticky top-0 z-50 w-full bg-white shadow" style={LEXEND}>
    <div className="container mx-auto flex items-center justify-between py-2">
      <a href="/" className="flex items-center gap-2 xl:gap-5">
        <img src="/fs-assets/logo.webp" alt="FOCAS Edu" className="h-9 w-auto sm:h-10" />
      </a>
      <div className="flex h-full items-center gap-2 xl:gap-6">
        <nav className="hidden h-full items-center gap-4 text-[#1c232d] lg:flex">
          {[["#kit", "Starter Kit"], ["#why", "Why FOCAS"], ["#stories", "Student Stories"], ["#results", "Results"], ["#faq", "FAQs"]].map(([href, label]) => (
            <a key={href} href={href} className="transition-all duration-300 hover:text-[#ffbd3b]">
              {label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={onCta}
          className="hidden rounded-md p-2 px-6 font-semibold text-white lg:flex"
          style={{ background: "linear-gradient(rgb(66, 86, 115), rgb(28, 35, 45))" }}
        >
          Request a call back
        </button>
        <a
          href={PHONE_TEL}
          aria-label="Call FOCAS Edu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/90 text-white lg:hidden"
        >
          <Phone className="h-4 w-4" />
        </a>
      </div>
    </div>
  </div>
);

const NumberTile = ({ children }) => (
  <span className="mx-1 inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border border-blue-200 bg-white px-2 font-bold text-blue-800 shadow-[0_0_10px_rgba(37,99,235,0.6)] sm:h-12 md:h-14 lg:h-16 lg:px-3">
    {children}
  </span>
);

const Hero = ({ onCta, onSuccess }) => (
  <section className="w-full pb-4" style={GRID_BG}>
    <div className="container mx-auto mt-10 xl:mt-16">
      <div className="mb-6 flex">
        <div className="group relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-blue-500/40 blur-xl" />
          <div className="relative flex items-center gap-3 rounded-full border border-blue-300 bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-5 py-3 shadow-[0_10px_30px_rgba(37,99,235,0.16)] backdrop-blur-xl">
            <div className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-blue-700 md:text-lg">Last Attempt Community Starter Kit</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 xl:gap-10">
        <div className="col-span-12 xl:col-span-8">
          <div className="text-xl font-medium leading-snug text-[#31343B] sm:text-3xl md:text-4xl lg:text-5xl lg:leading-normal">
            1 Tutor for every
            <span className={`${AI_BADGE} mx-3 text-xl sm:text-3xl md:text-4xl`}>10</span>
            Students
          </div>
          <h1 className="mt-3 text-xl font-medium leading-snug text-[#31343B] md:text-4xl lg:text-5xl lg:leading-normal">
            <span className="text-3xl font-bold text-blue-800 sm:text-4xl md:text-5xl lg:text-6xl">FOCAS Personalised</span>
            <br />
            <span className="text-3xl font-bold text-blue-800 sm:text-4xl md:text-5xl lg:text-6xl">Classes</span>{" "}
            <span className="mr-2">for</span>
          </h1>
          <div className="mt-3 text-xl font-medium text-[#31343B] md:text-4xl lg:text-5xl">
            <NumberTile>Jan</NumberTile>
            <NumberTile>2027</NumberTile>
            <span className="mx-2">Attempt!</span>
          </div>

          <div className="mt-6 pt-4 md:pt-6 xl:mt-10">
            <div className="rounded-b-2xl border border-gray-200/50 bg-white py-3 shadow transition-all duration-300 sm:rounded-b-3xl md:shadow-[0_4px_20px_rgba(0,0,0,0.12)] md:hover:shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
              <div className="grid grid-cols-12">
                {HERO_STATS.map(([top, bottom], i) => (
                  <div
                    key={top}
                    className={`col-span-6 flex flex-col justify-center border-gray-200 px-3 py-2 sm:px-4 lg:col-span-4 xl:col-span-2 ${i % 2 === 0 ? "border-r" : ""} lg:border-r ${i === HERO_STATS.length - 1 ? "lg:border-r-0" : ""}`}
                  >
                    <p className="text-xs font-semibold text-gray-900 sm:text-sm">{top}</p>
                    <p className="text-xs text-gray-600 sm:text-sm">{bottom}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row lg:mt-28">
            <button type="button" onClick={onCta} className={`${BTN_DARK} relative w-full px-8 py-3`}>
              <span className="absolute -top-14 left-6 hidden rotate-[-1deg] rounded-md bg-gradient-to-b from-blue-600 to-blue-900 px-3 py-2 text-xs font-medium text-white shadow-lg md:block">
                give it a try
                <br />
                buddy
              </span>
              <span className="flex items-center justify-center gap-2">
                Free Counselling Call <Phone className="h-4 w-4" />
              </span>
            </button>
            <a href="#kit" className={`${BTN_BLUE} w-full px-8 py-3 text-center`}>
              <span className="flex items-center justify-center gap-2">
                Get Starter Kit <span>→</span>
              </span>
            </a>
          </div>
        </div>

        <div id="register" className="col-span-12 mt-8 scroll-mt-24 xl:col-span-4 xl:mt-4">
          <div className="rounded-lg border border-[#ECECEC] bg-[#F8F8F8] sm:rounded-xl">
            <div className="p-4">
              <h3 className="mb-4 text-center text-lg font-bold text-gray-900 sm:mb-6 sm:text-xl md:text-2xl">
                Want to know more
              </h3>
              <LeadForm onSuccess={onSuccess} />
            </div>
          </div>
          <div className="flex w-full justify-center">
            <div className="flex items-center gap-3 rounded-b-full border-b border-[#ECECEC] bg-[#F8F8F8] px-6 py-3 shadow-sm">
              {["Tamil", "English", "Online"].map((t) => (
                <span key={t} className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  <Check className="h-4 w-4 text-green-600" strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Hand-drawn style arrow, like EMC's "Arrow.png" under "next".
const ScribbleArrow = () => (
  <svg viewBox="0 0 120 50" className="absolute -right-6 top-8 hidden w-28 md:block" fill="none" stroke="#31343B" strokeWidth="2.5" strokeLinecap="round">
    <path d="M110 6 C 95 30, 60 42, 18 38" />
    <path d="M30 28 L 16 38 L 30 46" />
  </svg>
);

const VideoSection = ({ onCta }) => (
  <div className="relative md:pb-10">
    <div className="absolute inset-0 z-0 h-[280px] w-full bg-gradient-to-r from-[#6C63FF] via-[#FF6EC7] to-[#FFB347] opacity-80 blur-[80px] md:h-[500px]" />
    <div className="container relative z-10 mx-auto w-fit md:px-4">
      <h2 className="my-7 text-center text-2xl font-bold leading-snug text-[#31343B] md:text-4xl lg:leading-normal">
        Confused about your{" "}
        <span className="relative">
          last attempt
          <ScribbleArrow />
        </span>
        <br />
        strategy ?
      </h2>
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl border border-white/50 bg-white/5 shadow-2xl backdrop-blur-lg" />
        <div className="relative z-10 mx-auto max-w-5xl bg-transparent p-3 md:p-5">
          <div className="relative z-10 w-full overflow-hidden rounded-2xl">
            <video
              className="h-auto w-full rounded-2xl bg-black object-contain"
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              controls
              playsInline
              preload="none"
            />
          </div>
        </div>
      </div>
      <div className="mt-7 flex items-center justify-center">
        <button
          type="button"
          onClick={onCta}
          className="flex items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-[#425673] to-[#1C232D] px-6 py-3 text-white transition-all duration-300 hover:scale-105 md:px-8"
        >
          Talk to an Expert
        </button>
      </div>
    </div>
  </div>
);

const ScheduleBand = () => (
  <section className="relative mt-10 overflow-hidden border border-blue-400/20 bg-[linear-gradient(135deg,#111827_0%,#172554_50%,#1d4ed8_100%)] shadow-[0_24px_70px_rgba(30,64,175,0.28)] sm:px-7 sm:py-7 lg:px-8">
    <div className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-blue-500/25 blur-[90px]" />
    <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-[100px]" />
    <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-[80px]" />
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
    <div className="container relative z-10 mx-auto py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-3.5 py-2 backdrop-blur-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-50">Live Tutor Sessions</span>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/15 px-3.5 py-2 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-orange-300" />
          <span className="text-xs font-bold text-orange-50">Max 10 Students per Tutor</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Daily Tutor Slots</span>
          </div>
          <h3 className="max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">Study along with your tutor every day</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-[15px]">
            Tutor sessions are live sessions focused on accountability and completion. Each student is part of a small
            group guided by a dedicated tutor who ensures progress and clarity.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TUTOR_SLOTS.map(([label, time]) => (
            <article
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-300/40 hover:bg-white/[0.14] hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:p-5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-100">{label}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/15 ring-1 ring-blue-300/20">
                      <Clock className="h-4 w-4 text-blue-200" />
                    </div>
                    <p className="whitespace-nowrap text-base font-bold text-white sm:text-lg">{time}</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-200">
                  Live
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5">
        {["Dedicated Tutor", "Progress Tracking", "Doubt Clearing"].map((t) => (
          <div key={t} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
            <span className="text-sm font-medium text-slate-200">{t}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const WhyFocas = ({ onCta, onSuccess }) => (
  <section id="why" className="relative scroll-mt-20 py-14 lg:py-20">
    <div className="mb-10 w-full px-4 text-center">
      <h2 className="mb-4 text-3xl font-bold leading-snug text-black lg:text-4xl">
        Why Join FOCAS Edu to make it
        <br className="hidden md:block" />
        <span className={`${AI_BADGE} ml-2 mt-2 -rotate-2 px-4 py-2.5 text-2xl shadow-xl shadow-blue-500/30 lg:text-4xl`}>
          Your Last Attempt?
        </span>
      </h2>
      <p className="text-base leading-relaxed text-[#272E37]">
        Personal tutoring, a complete system and daily accountability — everything you need to clear CA Inter.
      </p>
    </div>
    <div className="container mx-auto items-center lg:grid lg:grid-cols-12 lg:gap-12">
      <div className="space-y-8 lg:col-span-7">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {WHY_FOCAS.map(({ icon: Icon, title, body, color }) => (
            <div key={title} className="h-full rounded-xl border border-[#F1F1F1] bg-[#FAFAFA] p-5 backdrop-blur-sm transition-all duration-300">
              <div className="mb-5">
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
              <h3 className="mb-2 text-base font-medium text-black">{title}</h3>
              <p className="text-sm text-[#272E37]">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden justify-center lg:col-span-5 xl:flex">
        <div className="w-full rounded-2xl bg-[conic-gradient(from_180deg,#60a5fa,#f472b6,#fbbf24,#34d399,#60a5fa)] p-[2px]">
          <div className="rounded-2xl bg-white/90 p-2 backdrop-blur-xl">
            <div className="rounded-xl border border-gray-100 bg-white shadow-lg">
              <div className="p-6">
                <h3 className="mb-4 text-center text-xl font-bold text-gray-900">I&apos;m Interested</h3>
                <LeadForm onSuccess={onSuccess} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 flex w-full flex-col items-center justify-center gap-4 sm:flex-row xl:hidden">
        <button type="button" onClick={onCta} className={`${BTN_DARK} w-full px-8 py-3`}>
          <span className="flex items-center justify-center gap-2">
            Free Counselling Call <Phone className="h-4 w-4" />
          </span>
        </button>
        <a href="#kit" className={`${BTN_BLUE} w-full px-8 py-3 text-center`}>
          Get Starter Kit →
        </a>
      </div>
    </div>
  </section>
);

const DesignedFor = () => (
  <section className="relative overflow-hidden bg-[#0e0e13] py-20 md:py-24">
    <div
      className="pointer-events-none absolute -left-16 -top-20 h-[420px] w-[420px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(120,40,140,0.6) 0%, transparent 70%)", filter: "blur(60px)" }}
    />
    <div
      className="pointer-events-none absolute -bottom-16 right-[5%] h-[380px] w-[380px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(100,20,60,0.55) 0%, transparent 70%)", filter: "blur(60px)" }}
    />
    <div
      className="pointer-events-none absolute left-[40%] top-[40%] h-[300px] w-[300px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(30,40,100,0.35) 0%, transparent 70%)", filter: "blur(60px)" }}
    />
    <div className="container relative z-10 mx-auto">
      <div className="mb-14">
        <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">FOCAS is Designed For</h2>
        <p className="max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
          Whether this is your first attempt or your next one, the Last Attempt System meets you where you are.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DESIGNED_FOR.map(({ title, body, icon: Icon, grad, glow }) => (
          <div key={title} className="group relative cursor-default overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md">
            <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-2/5 rounded-b-2xl bg-gradient-to-t ${glow} to-transparent`} />
            <div className={`relative z-10 mb-6 flex h-[52px] w-[52px] -rotate-[4deg] items-center justify-center rounded-[14px] bg-gradient-to-br shadow-lg ${grad}`}>
              <Icon className="h-6 w-6 rotate-[4deg] text-white" />
            </div>
            <h3 className="relative z-10 mb-2.5 text-[1.05rem] font-bold tracking-tight text-white">{title}</h3>
            <p className="relative z-10 text-sm leading-relaxed text-white/55">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const StarterKit = ({ onCta }) => {
  const [open, setOpen] = useState(true);
  return (
    <section id="kit" className="scroll-mt-20">
      <div className="container mx-auto mt-10 md:max-w-4xl md:p-6">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-4xl">What you get with the Starter Kit</h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-600 md:text-lg">
            What do you get with FOCAS Edu&apos;s Last Attempt Community Starter Kit?
          </p>
        </div>

        <div className="mb-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="border-b border-gray-100">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full p-4 text-left md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  <h3 className="text-sm font-semibold text-gray-900 md:text-lg">Last Attempt Community Starter Kit</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 md:text-sm">
                  <BookOpen className="h-4 w-4" /> 3 items
                </div>
              </div>
            </button>
            {open && (
              <div className="px-4 pb-4 md:px-6 md:pb-6">
                {KIT_ITEMS.map(([emoji, title, tag, tagCls]) => (
                  <div key={title} className="flex items-center justify-between gap-3 py-3 pl-7 md:pl-8">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{emoji}</span>
                      <span className="text-sm text-gray-700 md:text-base">{title}</span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold md:px-3 md:py-1 md:text-xs ${tagCls}`}>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div id="results" className="mt-6 flex w-full scroll-mt-24 justify-center px-4 md:px-0">
          <div className="flex w-full flex-col justify-center rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
            <div className="rounded-2xl border border-gray-200 p-3 md:p-4">
              <h2 className="mb-6 px-2 text-center text-xs font-medium tracking-wide text-gray-700 md:mb-8 md:text-base">
                From Dream to Reality — results of FOCAS students
              </h2>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:gap-6">
                {RESULTS.map((r) => (
                  <a key={r.name} href={r.src} target="_blank" rel="noopener noreferrer" className="group block">
                    <img
                      src={r.src}
                      alt={`${r.name}'s CA result`}
                      loading="lazy"
                      className="h-auto w-full rounded-lg border border-gray-100 transition group-hover:scale-[1.02]"
                    />
                    <p className="mt-2 text-center text-xs font-semibold text-gray-700 md:text-sm">{r.name}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="my-6 flex justify-center px-4 md:px-0">
          <button
            type="button"
            onClick={onCta}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#425673] to-[#1C232D] px-4 py-2 text-sm text-white transition-all duration-300 hover:scale-105 md:gap-3 md:px-8 md:py-3 md:text-base"
          >
            Get your Starter Kit today
          </button>
        </div>
      </div>
    </section>
  );
};

const Transform = () => {
  const [tab, setTab] = useState("after");
  const list = tab === "after" ? AFTER : BEFORE;
  return (
    <section className="w-full bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a] to-[#41312e] py-16 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold md:text-4xl">See How FOCAS Transforms CA Journeys</h2>
          <p className="text-lg text-gray-300">From attempting again and again to making this your last attempt</p>
        </div>
        <div className="mb-12 flex flex-wrap justify-center gap-4 px-4">
          {[["before", "😟 Before FOCAS"], ["after", "😊 After FOCAS"]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-xl border px-6 py-2 font-medium transition-all duration-200 ${
                tab === key ? "border-white bg-white text-black" : "border-gray-600 bg-[#232323] hover:border-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {list.map((t) => (
            <div key={t} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              {tab === "after" ? (
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-400" strokeWidth={3} />
              ) : (
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-400" strokeWidth={3} />
              )}
              <span className="text-sm text-gray-200 md:text-base">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StoryCard = ({ name, file }) => {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const play = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.controls = true;
    v.play();
    setPlaying(true);
  };
  return (
    <div className="flex h-full w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md sm:w-[280px]">
      <div className="relative bg-black">
        <video
          ref={ref}
          className="aspect-[9/16] w-full object-cover object-top"
          src={`${CDN}/Successful_stories/${file}.mp4#t=0.5`}
          muted
          playsInline
          preload="metadata"
        />
        {!playing && (
          <button
            type="button"
            onClick={play}
            aria-label={`Play ${name}'s story`}
            className="absolute inset-0 flex items-center justify-center bg-black/10"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl">
              <Play className="ml-1 h-6 w-6 fill-[#106EE2] text-[#106EE2]" />
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-col p-5">
        <div className="mb-3 flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-[#106EE2] text-[#106EE2]" />
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3">
          <h4 className="text-base font-semibold text-gray-800 sm:text-lg">{name}</h4>
          <p className="text-xs text-gray-500 sm:text-sm">Success Story</p>
        </div>
      </div>
    </div>
  );
};

const Stories = () => {
  const track = useRef(null);
  const scroll = (dir) => track.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  return (
    <section id="stories" className="relative scroll-mt-20 bg-[#F6F5F4] pb-10 md:pb-20">
      <div className="container mx-auto overflow-hidden px-0 py-8 md:px-4 md:py-16">
        <div className="mb-8 flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-0">
          <h2 className="text-2xl font-bold text-gray-800 md:text-4xl">Inspiring Student Stories</h2>
          <div className="flex justify-end gap-3">
            {[[-1, ChevronLeft, "Previous"], [1, ChevronRight, "Next"]].map(([d, Icon, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => scroll(d)}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 sm:h-11 sm:w-11"
              >
                <Icon className="h-5 w-5 text-gray-700" />
              </button>
            ))}
          </div>
        </div>
        <div ref={track} className="flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:px-0">
          {STORIES.map((s) => (
            <StoryCard key={s.file} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Faq = () => {
  const [open, setOpen] = useState(-1);
  return (
    <div id="faq" className="container scroll-mt-20">
      <div className="mx-auto max-w-4xl bg-white py-16">
        <div className="mb-8 text-center lg:mb-12">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 lg:text-4xl">FAQs: Everything You&apos;d Like to Know</h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 lg:text-lg">Answers to common questions about our sessions</p>
        </div>
        <div className="space-y-0 overflow-hidden rounded-lg border-b border-gray-200">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-gray-200 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between px-6 py-6 text-left transition-colors duration-200"
                >
                  <h3 className="pr-4 text-base font-semibold text-gray-900 transition-colors duration-200 group-hover:text-gray-700 lg:text-lg">
                    {f.q}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>
                {isOpen && <p className="px-6 pb-6 text-base leading-relaxed text-gray-600">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StillConfused = ({ onCta }) => (
  <section className="w-full bg-gray-100 py-16">
    <div className="container mx-auto grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <h2 className="text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
          1,000+ students already learning.
          <br className="hidden md:block" /> Still Confused? Request a call back
        </h2>
        <p className="mt-5 max-w-2xl text-sm text-gray-600 md:text-base">
          Attempting Jan 27 or May 27? Register today! Our counselling team will call you within one working day and get
          you access to the Last Attempt Community.
        </p>
        <button type="button" onClick={onCta} className={`${BTN_DARK} mt-6 px-8 py-3`}>
          Request a call back
        </button>
      </div>
      <a
        href={PHONE_TEL}
        className="flex w-full max-w-md items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-200 via-purple-200 to-yellow-200 p-6 transition-transform duration-300 hover:scale-[1.02] md:p-7 lg:ml-auto"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black">
          <Phone className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-700">For any doubts about the Starter Kit</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{PHONE_DISPLAY}</p>
        </div>
      </a>
    </div>
    <ul className="container mx-auto mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-800 md:text-base">
      {LIKE_MOST.map((t) => (
        <li key={t} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-black" /> {t}
        </li>
      ))}
    </ul>
  </section>
);

const EMAIL = "kvr@focasedu.com";

const FOOTER_COLUMNS = [
  {
    title: "Our Programs",
    links: [
      ["Personalised Classes", "/focas"],
      ["Workout Batch", "/workout-batch"],
      ["RTI Day", "/rti"],
      ["Audit", "/audit"],
      ["FOCAS Manual", "/manual"],
      ["Mentor Counselling", "/mentor-counselling"],
      ["Career Guidance", "/career-guidance"],
      ["Foundation for School", "/fs"],
    ],
  },
  {
    title: "Quick Links",
    links: [
      ["Home", "/"],
      ["Starter Kit", "#kit"],
      ["Why FOCAS", "#why"],
      ["Student Stories", "#stories"],
      ["Results", "#results"],
      ["FAQs", "#faq"],
    ],
  },
  {
    title: "FOCAS Edu",
    links: [
      ["Contact", PHONE_TEL],
      ["Email Us", `mailto:${EMAIL}`],
      ["Privacy Policy", "/privacy-policy"],
      ["Request a call back", "#register"],
    ],
  },
];

const SOCIALS = [
  ["YouTube", "https://youtube.com/@focasedu", Youtube],
  ["Instagram", "https://instagram.com/focasedu", Instagram],
  ["LinkedIn", "https://www.linkedin.com/company/focasedu", Linkedin],
];

const Footer = () => (
  <footer className="w-full bg-[#110D03]" style={LEXEND}>
    <section className="container overflow-hidden">
      <ul className="flex justify-center py-6" style={MANROPE}>
        {"FOCAS EDU".split("").map((ch, i) =>
          ch === " " ? (
            <li key={i} className="px-1 text-2xl md:text-5xl lg:text-[90px] xl:px-2 xl:text-[116px]">&nbsp;</li>
          ) : (
            <li
              key={i}
              className="cursor-pointer text-2xl font-extrabold text-[#3F3A2D] transition-colors hover:text-[#ffbd3b] md:text-5xl lg:text-[90px] xl:text-[116px]"
            >
              {ch}
            </li>
          )
        )}
      </ul>

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1.2fr]">
        {FOOTER_COLUMNS.map(({ title, links }) => (
          <div key={title}>
            <h4 className="mb-5 font-semibold text-white">{title}</h4>
            <ul className="space-y-1">
              {links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="inline-block py-1 text-[#D9D4C7] transition-colors hover:text-[#ffbd3b]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 flex flex-col gap-3 md:col-span-3 md:flex-row lg:col-span-1 lg:flex-col lg:items-end">
          <div className="flex w-full max-w-[224px] items-center gap-3 rounded-lg border border-white/80 px-4 py-3 text-white">
            <Award className="h-8 w-8 shrink-0 text-[#ffbd3b]" />
            <div className="text-sm leading-tight">
              <div className="font-semibold">Average Score 50+</div>
              <div className="text-[#D9D4C7]">FOCAS students</div>
            </div>
          </div>
          <div className="flex w-full max-w-[224px] items-center gap-3 rounded-lg border border-white/80 px-4 py-3 text-white">
            <Users className="h-8 w-8 shrink-0 text-[#ffbd3b]" />
            <div className="text-sm leading-tight">
              <div className="font-semibold">1,000+ students</div>
              <div className="text-[#D9D4C7]">already learning</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-[#3F3A2D] py-8 text-sm text-[#D9D4C7] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>© {new Date().getFullYear()} FOCAS Edu</span>
          <span className="hidden sm:inline">•</span>
          <a href="/privacy-policy" className="hover:text-[#ffbd3b]">Privacy Policy</a>
          <span className="hidden sm:inline">•</span>
          <a href={`mailto:${EMAIL}`} className="hover:text-[#ffbd3b]">{EMAIL}</a>
          <span className="hidden sm:inline">•</span>
          <a href={PHONE_TEL} className="hover:text-[#ffbd3b]">{PHONE_DISPLAY}</a>
        </div>
        <div className="flex items-center gap-2">
          {SOCIALS.map(([label, href, Icon]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-[#ffbd3b]"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  </footer>
);

/* ─────────────────────────── Page ─────────────────────────── */

// Set once the visitor submits the form, so the popup stops auto-opening for them.
const SUBMITTED_KEY = "focas_counselling_submitted";
// Set on submit, consumed by /counselling-success to fire the ad conversions once.
export const CONVERSION_KEY = "focas_counselling_conversion";

export default function Counselling() {
  const navigate = useNavigate();
  // "form" = popup lead form, null = closed.
  const [modal, setModal] = useState(null);

  const openForm = () => setModal("form");
  const showThanks = () => {
    try {
      localStorage.setItem(SUBMITTED_KEY, "1");
      sessionStorage.setItem(CONVERSION_KEY, "1");
    } catch {
      /* non-fatal */
    }
    navigate("/counselling-success");
  };
  const close = () => setModal(null);

  // Page-only fonts (Manrope + Lexend Deca), same as the EMC page.
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    document.title = "Counselling – FOCAS Edu";
    window.dataLayer?.push({ event: "counselling_page_view", page_path: "/counselling" });
    window.fbq?.("track", "ViewContent", { content_name: "Last Attempt Community Starter Kit" });

    // Auto-open the popup form on every visit, shortly after landing —
    // unless this visitor has already submitted it.
    let submitted = false;
    try {
      submitted = localStorage.getItem(SUBMITTED_KEY) === "1";
    } catch {
      /* storage blocked — show it */
    }
    if (submitted) return;
    const t = setTimeout(() => setModal((m) => m ?? "form"), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black antialiased" style={MANROPE}>
      <Header onCta={openForm} />
      <main>
        <Hero onCta={openForm} onSuccess={showThanks} />
        <VideoSection onCta={openForm} />
        <ScheduleBand />
        <WhyFocas onCta={openForm} onSuccess={showThanks} />
        <DesignedFor />
        <StarterKit onCta={openForm} />
        <Transform />
        <Stories />
        <Faq />
        <StillConfused onCta={openForm} />
      </main>
      <Footer />

      <Modal open={modal === "form"} onClose={close} label="Request a call back">
        <ModalIcon>
          <GraduationCap className="h-8 w-8 text-white" />
        </ModalIcon>
        <h3 className="mt-4 text-xl font-bold text-[#1c232d]">Get Free CA Inter Counselling</h3>
        <p className="mt-1 text-sm text-[#696969]">One quick call with our counselor. Completely free.</p>
        <LeadForm onSuccess={showThanks} />
      </Modal>
    </div>
  );
}
