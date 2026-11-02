import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircleQuestion,
  Navigation,
  Phone,
  PlayCircle,
  Quote,
  Repeat,
  Star,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { FONTS_HREF, LEXEND, MANROPE, PHONE_DISPLAY, PHONE_TEL } from "@/components/counselling/Counselling";
import { sendToZohoFlow } from "@/components/fs/FsForm";
import { DIAL_CODES, Honeypot, captureUtms, trackLead } from "@/components/bigin/formKit";

/**
 * /f2f-class — Face to Face offline / live / hybrid Regular Batch for CA Inter
 * Sep 2027 at the Mylapore, Chennai centre.
 *
 * Same look as /counselling (Manrope / Lexend Deca, green #1D9E75 palette, card
 * + form styling) with Chennai touches: kolam dot pattern, gopuram line art and
 * the Mylapore centre photo.
 *
 * The form sends the lead to the Zoho Flow webhook (leadSource "F2F") and the
 * follow-up dashboard, fires Meta/GA Lead, then moves on to /f2f-class-success,
 * which fires the Meta Purchase + CompleteRegistration conversions — no payment step.
 */

/* eslint-disable react-refresh/only-export-components -- shared with F2fClassSuccess */
// Set on submit, consumed by /f2f-class-success to fire the conversions once.
export const F2F_CONVERSION_KEY = "focas_f2f_conversion";
// Lead details carried to /f2f-class-success (router state → sessionStorage fallback).
export const F2F_LEAD_KEY = "focas_f2f_lead";
export const META_PIXEL_ID = "525895529970374"; // same pixel as index.html
export const TERMS_HREF = "/pdf/Terms%20and%20Condition%20of%20Focas%20Edu.docx.pdf";
export const PRIVACY_HREF = "/privacy-policy";

// Meta advanced matching: re-calling init with user data attaches it (hashed by
// the pixel) to this and later events, so Lead/Purchase match more people.
const setMetaUserData = ({ firstName, lastName, phone, city }) =>
  window.fbq?.("init", META_PIXEL_ID, {
    fn: firstName.toLowerCase(),
    ln: lastName.toLowerCase(),
    ph: phone.replace(/\D/g, ""),
    ct: city.toLowerCase().replace(/[^a-z]/g, ""),
    country: "in",
  });

const ASSETS = "/f2f-assets";
const BATCH_START = "December 16, 2026";
const ADDRESS_LINES = [
  "#11, First Floor, TSV Kovil Street",
  "Alamelumanga Puram, Sankara Puram,",
  "Mylapore, Chennai - 600004",
];
const MAP_QUERY = encodeURIComponent("TSV Kovil Street, Alamelumanga Puram, Mylapore, Chennai 600004");
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
const MAP_EMBED = `https://maps.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`;

const BTN_DARK =
  "bg-gradient-to-b from-[#1D9E75] to-[#0f6e56] text-white font-medium rounded-lg hover:from-[#0f6e56] hover:to-[#1D9E75] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300";
const AI_BADGE =
  "inline-block rounded-2xl border border-[#1D9E75]/30 bg-gradient-to-br from-[#2bc48f] via-[#1D9E75] to-[#0f6e56] px-4 py-1 font-bold text-white shadow-2xl shadow-[#1D9E75]/40";

// Kolam-style dot grid — the Chennai take on /counselling's line grid.
const KOLAM_BG = {
  backgroundImage: "radial-gradient(rgba(29,158,117,.22) 1.5px, transparent 1.6px)",
  backgroundSize: "28px 28px",
  backgroundPosition: "center top",
};

const HERO_STATS = [
  ["Face to Face", "Offline Classes"],
  ["Live + Hybrid", "Recorded Lectures"],
  ["1 : 10", "Tutor : Students"],
  ["All 7 Days", "6 AM – 8 PM"],
  ["Mylapore", "Chennai"],
  ["Dec 16, 2026", "Batch Starts"],
];

const FEATURES = [
  {
    icon: Users,
    title: "10 Students ONLY for 1 Tutor",
    body: "Get guidance with face to face personalized attention and instant doubt clarification.",
    grad: "from-blue-400 to-blue-600 shadow-blue-500/40",
    glow: "from-blue-500/10",
  },
  {
    icon: PlayCircle,
    title: "Recorded Videos",
    body: "Faculty lectures from expert CAs, which need to be watched before tutoring.",
    grad: "from-orange-400 to-orange-600 shadow-orange-500/40",
    glow: "from-orange-500/10",
  },
  {
    icon: BookOpen,
    title: "Last Attempt Kit",
    body: "Everything you need from first read to the exam hall.",
    grad: "from-green-400 to-green-600 shadow-green-500/40",
    glow: "from-green-500/10",
  },
];

const KIT = [
  { icon: Brain, title: "AI Integrated Question Bank", color: "text-violet-600" },
  { icon: PlayCircle, title: "Test Series with Video Reviews", color: "text-red-500" },
  { icon: Repeat, title: "Deep FOCAS 45-Day Revision", color: "text-sky-600" },
  { icon: Zap, title: "MCQ Marathons", color: "text-amber-500" },
  { icon: MessageCircleQuestion, title: "Constant Mentorship and Support", color: "text-emerald-600" },
];

const TIMINGS = [
  { label: "Morning", time: "06:00 AM - 08:00 AM", tag: "Class" },
  { label: "Morning Study Hours", time: "10:00 AM - 01:00 PM", tag: "Optional" },
  { label: "Afternoon", time: "03:00 PM - 08:00 PM", tag: "Class" },
];

const PRICING = {
  name: "CA Intermediate Sep 2027",
  note: "Group 1 + Group 2",
  mrp: "80,000",
  price: "75,000",
  save: "Save ₹5,000",
};

const PRICE_INCLUDES = [
  "Face to face tutor sessions (1 : 10)",
  "Recorded faculty lectures",
  "Last Attempt Kit",
  "Mentorship & support",
];

const TESTIMONIALS = [
  {
    name: "Yashika",
    img: "yashika",
    text: "The method of teaching followed by Focas academy is perfect and Trust me I was able to score 82 just by enrolling in their fasttrack then imagine how their regular course would be.",
  },
  {
    name: "Naveen",
    img: "naveen",
    text: "I was able to complete preparation in Class itself, because it was live studying and NO procrastination. Got rid of confusions in the class itself as there were discussions of Q&A at the end of every topic. Was able to recall at least 75% in the exams because of the cumulative revisions we did in the class. FOCAS Classes is something that would work for me.",
  },
  {
    name: "Mercy",
    img: "mercy",
    text: "Really happy and satisfied with the tutors we have is really good, the way of teaching here is enough + only one time oversee that effective And the concept behind deep focas grb is too good and gained confidence Which I always wanted for, is the repetitive starting just 1 month prior to exams But lacked when I tried on my own pace",
  },
  {
    name: "Keerthana",
    img: "keerthana",
    text: "Really grateful to FOCAS EDU for their constant support and guidance throughout my CA journey. After multiple attempts, I finally cleared CA Intermediate, and FOCAS EDU played an important role in helping me achieve it. Thank you for the motivation and support!",
  },
  {
    name: "Kavya Dharshini",
    img: "kavya",
    text: "I had a really good experience with Focas Edu, where they emphasised more on personalised attention and the effort they put into understanding my preparation and formulating strategies accordingly.",
  },
  {
    name: "Yokesh",
    img: "yokesh",
    text: "Focas Edu helps us to have one to one session with the faculty where they provide friendly platform so it makes us to ask our doubts without any hesitation. They makes us to memorize while studying itself thats one good thing i experienced here.",
  },
];

const FOUNDATION_STATUS_OPTIONS = [
  "Cleared CA Foundation – Sep 2026",
  "Appeared for CA Foundation – Sep 2026",
  "Cleared CA Foundation – Earlier Attempt",
  "Direct Entry",
];

/* ─────────────────────────── Lead form ─────────────────────────── */

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  dialCode: "+91",
  phone: "",
  caStatus: "",
  city: "",
  company: "", // honeypot — must stay empty for real users
};

// Letters with single spaces, dots, apostrophes or hyphens between them.
const NAME_RE = /^[A-Za-z]+(?:[ .'-]+[A-Za-z]+)*\.?$/;
// "  priya  DHARSHINI " → "Priya Dharshini" — Bigin and the WhatsApp greeting read it as typed.
const titleCase = (s) =>
  s
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[ .'-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());

const fieldCls =
  "h-10 rounded-lg border border-[#d9d9d9] bg-white px-[11px] text-base text-black/90 outline-none transition placeholder:text-black/25 hover:border-[#1D9E75] focus:border-[#1D9E75] focus:shadow-[0_0_0_2px_rgba(29,158,117,0.15)]";
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

const LeadForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    const name = (k, label, min) => {
      const v = values[k].trim();
      if (!v) e[k] = `Please enter your ${label}.`;
      else if (!NAME_RE.test(v)) e[k] = "Use letters only.";
      else if (v.replace(/[^A-Za-z]/g, "").length < min) e[k] = `Enter your full ${label}.`;
      else if (/^(.)\1+$/i.test(v.replace(/[^A-Za-z]/g, ""))) e[k] = `Enter a valid ${label}.`;
    };
    name("firstName", "first name", 2);
    name("lastName", "last name", 1); // initials like "K" are common
    if (!/^[0-9]{10}$/.test(values.phone.trim())) e.phone = "Enter a 10 digit phone number.";
    else if (values.dialCode === "+91" && !/^[6-9]/.test(values.phone)) e.phone = "Enter a valid Indian mobile number.";
    if (!values.caStatus) e.caStatus = "Please select your CA Foundation status.";
    const city = values.city.trim();
    if (!city) e.city = "Please enter your city.";
    else if (!NAME_RE.test(city) || city.replace(/[^A-Za-z]/g, "").length < 3) e.city = "Enter a valid city name.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);

    const payload = {
      firstName: titleCase(values.firstName),
      lastName: titleCase(values.lastName),
      phone: `${values.dialCode}${values.phone}`.trim(),
      caStatus: values.caStatus,
      attempt: "Sept 2027",
      group: "Both Groups", // only one course on offer; kept so Zoho/analytics still get a value
      city: titleCase(values.city),
      company: values.company, // honeypot
      utm: captureUtms(),
    };

    // Skipped for bots that filled the honeypot — they still see the thank-you.
    if (!payload.company) {
      sendToZohoFlow(payload, { source: "F2F Class Mylapore", leadSource: "F2F" });
      trackLead("f2f-class", payload);
    }

    // One id per submission: Lead uses it and the success page's Purchase uses
    // `${id}-purchase`, so a future server-side (CAPI) copy can dedupe on them.
    const eventId = `f2f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setMetaUserData(payload);
    window.fbq?.(
      "track",
      "Lead",
      { content_name: "F2F Class Mylapore", content_category: "F2F Class" },
      { eventID: eventId }
    );
    window.gtag?.("event", "generate_lead", { event_category: "f2f_class", event_label: "F2F Class Mylapore" });
    window.dataLayer?.push({ event: "f2f_class_form_submit", page_path: "/f2f-class", group: payload.group });

    // eslint-disable-next-line no-unused-vars
    const { company, utm, ...lead } = payload;
    const state = { ...lead, eventId };
    try {
      sessionStorage.setItem(F2F_LEAD_KEY, JSON.stringify(state));
      sessionStorage.setItem(F2F_CONVERSION_KEY, "1");
    } catch {
      /* non-fatal — the success page falls back to router state */
    }
    navigate("/f2f-class-success", { state });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="relative mt-2">
      <Honeypot value={values.company} onChange={set("company")} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" error={errors.firstName}>
          <input className={inputCls} maxLength={40} autoComplete="given-name" placeholder="Enter first name" value={values.firstName} onChange={set("firstName")} />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <input className={inputCls} maxLength={80} autoComplete="family-name" placeholder="Enter last name" value={values.lastName} onChange={set("lastName")} />
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

      <Field label="CA Foundation Status" error={errors.caStatus}>
        <select className={inputCls} value={values.caStatus} onChange={set("caStatus")}>
          <option value="" disabled>Select your status</option>
          {FOUNDATION_STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field label="City" error={errors.city}>
        <input
          className={inputCls}
          maxLength={50}
          autoComplete="address-level2"
          placeholder="Enter your city"
          value={values.city}
          onChange={set("city")}
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="h-10 w-full rounded-lg bg-gradient-to-b from-[#1D9E75] to-[#0f6e56] text-base text-white shadow-[0_2px_0_rgba(29,158,117,0.15)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Reserve my seat"}
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-black/45">
        By submitting, you agree to FOCAS Edu&apos;s{" "}
        <a href={TERMS_HREF} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#0f6e56]">
          Terms &amp; Conditions
        </a>{" "}
        and{" "}
        <a href={PRIVACY_HREF} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#0f6e56]">
          Privacy Policy
        </a>
        , and to be contacted on call / WhatsApp.
      </p>
    </form>
  );
};

/* ─────────────────────────── Modal ─────────────────────────── */

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

/* ─────────────────────────── Sections ─────────────────────────── */

// Line-art temple gopuram — a nod to the Kapaleeshwarar temple down the road.
const Gopuram = ({ className = "" }) => (
  <svg viewBox="0 0 120 160" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M60 4 v10" />
    <circle cx="60" cy="18" r="4" />
    <path d="M44 34 h32 l-4 -12 h-24 z" />
    <path d="M38 52 h44 l-6 -18 h-32 z" />
    <path d="M32 72 h56 l-6 -20 h-44 z" />
    <path d="M26 94 h68 l-6 -22 h-56 z" />
    <path d="M20 118 h80 l-6 -24 h-68 z" />
    <path d="M14 156 h92 v-38 h-92 z" />
    <path d="M50 156 v-22 a10 10 0 0 1 20 0 v22" />
    {[48, 60, 72].map((x) => (
      <path key={x} d={`M${x} 80 v8`} />
    ))}
    {[40, 60, 80].map((x) => (
      <path key={x} d={`M${x} 102 v10`} />
    ))}
  </svg>
);

const Header = ({ onCta }) => (
  <div className="sticky top-0 z-50 w-full bg-white shadow" style={LEXEND}>
    <div className="container mx-auto flex items-center justify-between py-2">
      <a href="/" className="flex items-center gap-2 xl:gap-5">
        <img src="/fs-assets/logo.webp" alt="FOCAS Edu" className="h-9 w-auto sm:h-10" />
      </a>
      <div className="flex h-full items-center gap-2 xl:gap-6">
        <nav className="hidden h-full items-center gap-4 text-[#1c232d] lg:flex">
          {[["#features", "What You Get"], ["#timings", "Timings"], ["#pricing", "Fees"], ["#testimonials", "Testimonials"], ["#visit", "Visit Us"]].map(([href, label]) => (
            <a key={href} href={href} className="transition-all duration-300 hover:text-[#1D9E75]">
              {label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={onCta}
          className="hidden rounded-md p-2 px-6 font-semibold text-white lg:flex"
          style={{ background: "linear-gradient(#1D9E75, #0f6e56)" }}
        >
          Reserve my seat
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
  <span className="mx-1 inline-flex h-14 min-w-[3.5rem] items-center justify-center rounded-xl border-2 border-[#bfe9d9] bg-white px-3 text-3xl font-bold text-[#0f6e56] shadow-[0_0_14px_rgba(29,158,117,0.45)] sm:h-16 sm:text-4xl md:h-20 md:text-5xl lg:h-24 lg:px-5 lg:text-6xl">
    {children}
  </span>
);

const Hero = ({ onCta }) => (
  <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#e8f8f2] via-[#f8fffe] to-white pb-4" style={KOLAM_BG}>
    <Gopuram className="pointer-events-none absolute -right-6 bottom-0 hidden h-[420px] w-auto text-[#1D9E75]/10 xl:block" />
    <div className="container relative mx-auto mt-10 xl:mt-16">
      <div className="mb-6 flex">
        <div className="group relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-[#1D9E75]/30 blur-xl" />
          <div className="relative flex items-center gap-3 rounded-full border border-[#9fdcc5] bg-gradient-to-r from-[#e8f8f2] via-white to-[#f0fdf8] px-5 py-3 shadow-[0_10px_30px_rgba(29,158,117,0.18)] backdrop-blur-xl">
            <div className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-full bg-gradient-to-br from-[#1D9E75] to-[#0f6e56] text-white shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-[#0f6e56] md:text-lg">
              FOCAS Edu · <span className="font-semibold italic">Your First and Last Attempt</span> presents
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 xl:gap-10">
        <div className="col-span-12 xl:col-span-8">
          <h1 className="text-xl font-medium leading-snug text-[#31343B] sm:text-3xl md:text-4xl lg:text-5xl lg:leading-normal">
            <span className="text-4xl font-extrabold uppercase tracking-tight text-[#1D9E75] sm:text-5xl md:text-6xl lg:text-7xl">
              Face to Face
            </span>
            <br />
            <span className="mt-3 inline-block">
              Offline
              <span className={`${AI_BADGE} mx-3 -rotate-2 px-5 py-1.5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl`}>Live</span>
              Hybrid Classes
            </span>
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-y-2 text-xl font-medium text-[#31343B] md:text-4xl lg:text-5xl">
            <span className="mr-2">Regular Batch for CA Inter</span>
            <span className="whitespace-nowrap">
              <NumberTile>Sep</NumberTile>
              <NumberTile>2027</NumberTile>
            </span>
          </div>
          <p className="mt-6 text-lg font-semibold uppercase tracking-[0.12em] text-[#0f6e56] md:text-xl">
            Personalized Attention <span className="text-[#FFA500]">&</span> Expert Guidance
          </p>

          <div className="mt-6 pt-4 md:pt-6 xl:mt-8">
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

          <div className="mt-10 flex w-full flex-col items-center gap-4 sm:flex-row lg:mt-16">
            <button type="button" onClick={onCta} className={`${BTN_DARK} relative w-full px-10 py-3 text-lg sm:w-auto`}>
              <span className="absolute -top-14 left-6 hidden rotate-[-1deg] rounded-md bg-gradient-to-b from-[#FFA500] to-[#e08900] px-3 py-2 text-xs font-medium text-white shadow-lg md:block">
                {BATCH_START}
                <br />
                onwards
              </span>
              <span className="flex items-center justify-center gap-2">
                Reserve my seat <Users className="h-4 w-4" />
              </span>
            </button>
            <a href="#visit" className="flex items-center gap-2 font-semibold text-[#0f6e56] hover:underline">
              <MapPin className="h-4 w-4" /> In Mylapore, Chennai
            </a>
          </div>
        </div>

        <div id="register" className="col-span-12 mt-8 scroll-mt-24 xl:col-span-4 xl:mt-4">
          <div className="rounded-lg border border-[#ECECEC] bg-[#F8F8F8] sm:rounded-xl">
            <div className="p-4">
              <h3 className="mb-1 text-center text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Only 10 seats per tutor</h3>
              <p className="mb-4 text-center text-sm text-gray-600 sm:mb-6">Batch starts {BATCH_START}</p>
              <LeadForm />
            </div>
          </div>
          <div className="flex w-full justify-center">
            <div className="flex items-center gap-3 rounded-b-full border-b border-[#ECECEC] bg-[#F8F8F8] px-6 py-3 shadow-sm">
              {["Offline", "Live", "Hybrid"].map((t) => (
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

const Campus = () => (
  <div className="relative md:pb-10">
    <div className="absolute inset-0 z-0 h-[280px] w-full bg-gradient-to-r from-[#1D9E75] via-[#9fe3c8] to-[#FFD27a] opacity-60 blur-[80px] md:h-[500px]" />
    <div className="container relative z-10 mx-auto md:px-4">
      <h2 className="my-7 text-center text-2xl font-bold leading-snug text-[#31343B] md:text-4xl lg:leading-normal">
        Your classroom in the heart of
        <br />
        <span className="text-[#0f6e56]">Mylapore, Chennai</span>
      </h2>
      <div className="relative mx-auto max-w-5xl">
        <div className="absolute inset-0 rounded-2xl border border-white/50 bg-white/5 shadow-2xl backdrop-blur-lg" />
        <div className="relative z-10 p-3 md:p-5">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={`${ASSETS}/mylapore.webp`} alt="FOCAS Edu centre, Mylapore, Chennai" className="h-auto w-full object-cover" loading="lazy" />
            <div className="mt-3 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur md:absolute md:bottom-6 md:left-6 md:mt-0 md:max-w-sm md:p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#0f6e56]">
                <MapPin className="h-4 w-4" /> FOCAS Mylapore
              </p>
              <p className="mt-1 text-xs text-gray-700 md:text-sm">{ADDRESS_LINES.join(" ")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Features = ({ onCta }) => (
  <section id="features" className="relative scroll-mt-20 overflow-hidden bg-[#06241c] py-20 md:py-24">
    <div
      className="pointer-events-none absolute -left-16 -top-20 h-[420px] w-[420px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(29,158,117,0.45) 0%, transparent 70%)", filter: "blur(60px)" }}
    />
    <div
      className="pointer-events-none absolute -bottom-16 right-[5%] h-[380px] w-[380px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(255,165,0,0.22) 0%, transparent 70%)", filter: "blur(60px)" }}
    />
    <div className="container relative z-10 mx-auto">
      <div className="mb-14">
        <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">What You Get</h2>
        <p className="max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
          Personal tutoring in a classroom, expert CA lectures to watch beforehand, and the full Last Attempt Kit.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {FEATURES.map(({ title, body, icon: Icon, grad, glow }) => (
          <div key={title} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md">
            <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-2/5 rounded-b-2xl bg-gradient-to-t ${glow} to-transparent`} />
            <div className={`relative z-10 mb-6 flex h-[52px] w-[52px] -rotate-[4deg] items-center justify-center rounded-[14px] bg-gradient-to-br shadow-lg ${grad}`}>
              <Icon className="h-6 w-6 rotate-[4deg] text-white" />
            </div>
            <h3 className="relative z-10 mb-2.5 text-lg font-bold tracking-tight text-white">{title}</h3>
            <p className="relative z-10 text-sm leading-relaxed text-white/60">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <button type="button" onClick={onCta} className={`${BTN_DARK} px-10 py-3 text-lg`}>
          Reserve my seat
        </button>
      </div>
    </div>
  </section>
);

const LastAttemptKit = () => (
  <section className="relative py-14 lg:py-20">
    <div className="mb-10 w-full px-4 text-center">
      <h2 className="mb-4 text-3xl font-bold leading-snug text-black lg:text-4xl">
        Inside the
        <span className={`${AI_BADGE} ml-3 mt-2 -rotate-2 px-4 py-2.5 text-2xl shadow-xl shadow-[#1D9E75]/30 lg:text-4xl`}>
          Last Attempt Kit
        </span>
      </h2>
      <p className="text-base leading-relaxed text-[#272E37]">Built to make this your first — and last — attempt.</p>
    </div>
    <div className="container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {KIT.map(({ icon: Icon, title, color }) => (
        <div key={title} className="h-full rounded-xl border border-[#F1F1F1] bg-[#FAFAFA] p-5">
          <Icon className={`mb-5 h-8 w-8 ${color}`} />
          <h3 className="text-base font-medium text-black">{title}</h3>
        </div>
      ))}
    </div>
  </section>
);

const TimingsBand = () => (
  <section id="timings" className="relative scroll-mt-20 overflow-hidden border border-[#1D9E75]/20 bg-[linear-gradient(135deg,#06241c_0%,#0b3d33_50%,#0f6e56_100%)] shadow-[0_24px_70px_rgba(15,110,86,0.28)] sm:px-7 sm:py-7 lg:px-8">
    <div className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-emerald-500/25 blur-[90px]" />
    <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-[100px]" />
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.08]"
      style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.9) 1.2px, transparent 1.3px)", backgroundSize: "24px 24px" }}
    />
    <div className="container relative z-10 mx-auto py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3.5 py-2 backdrop-blur-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-50">Face to Face Classes</span>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/15 px-3.5 py-2 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-orange-300" />
          <span className="text-xs font-bold text-orange-50">All 7 Days of the Week</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Timings</span>
          </div>
          <h3 className="max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">Study with your tutor, in person, every day</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-[15px]">
            Pick the morning or afternoon class. The 10 AM – 1 PM study hours are optional — come in and study at the
            centre with help on hand.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIMINGS.map(({ label, time, tag }) => (
            <article
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-white/[0.14] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-emerald-100">{label}</p>
                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-200">
                  {tag}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-300/20">
                  <Clock className="h-4 w-4 text-emerald-200" />
                </div>
                <p className="text-base font-bold text-white">{time}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5">
        {["Instant Doubt Clarification", "Personalized Attention", "Starts " + BATCH_START].map((t) => (
          <div key={t} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span className="text-sm font-medium text-slate-200">{t}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = ({ onCta }) => (
  <section id="pricing" className="scroll-mt-20 bg-white py-16 lg:py-20">
    <div className="container mx-auto">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold text-gray-900 lg:text-4xl">Course Fees</h2>
        <p className="text-base text-gray-600 lg:text-lg">Regular Batch · CA Inter Sep 2027 · Mylapore, Chennai</p>
      </div>
      <div className="mx-auto max-w-4xl rounded-2xl bg-[conic-gradient(from_180deg,#1D9E75,#9fe3c8,#FFA500,#2bc48f,#1D9E75)] p-[2px]">
        <div className="relative grid gap-8 rounded-2xl bg-white p-7 shadow-xl sm:p-10 md:grid-cols-2 md:items-center">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#FFA500] to-[#e08900] px-3 py-1 text-xs font-bold text-white shadow">
            {PRICING.save}
          </span>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold uppercase tracking-wide text-gray-900 lg:text-2xl">{PRICING.name}</h3>
            <p className="text-sm text-gray-500">{PRICING.note}</p>
            <p className="mt-5 flex items-baseline justify-center gap-3 md:justify-start">
              <span className="text-2xl font-semibold text-gray-400 line-through decoration-2">₹{PRICING.mrp}</span>
              <span className="text-5xl font-extrabold text-[#0f6e56]">₹{PRICING.price}</span>
            </p>
            <button type="button" onClick={onCta} className={`mt-7 w-full py-3 md:max-w-xs ${BTN_DARK}`}>
              Reserve my seat
            </button>
          </div>
          <ul className="space-y-3 border-t border-gray-100 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            {PRICE_INCLUDES.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-gray-700 lg:text-base">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" strokeWidth={3} /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section id="testimonials" className="relative scroll-mt-20 bg-[#f0fdf8] py-14 md:py-20">
    <div className="container mx-auto">
      <h2 className="mb-10 text-center text-2xl font-bold text-gray-800 md:text-4xl">What FOCAS Students Say</h2>
      <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
        {TESTIMONIALS.map(({ name, img, text }) => (
          <figure key={name} className="mb-5 break-inside-avoid rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
            <Quote className="h-7 w-7 text-[#1D9E75]/30" />
            <blockquote className="mt-3 text-sm leading-relaxed text-gray-700 md:text-[15px]">{text}</blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
              <img
                src={`${ASSETS}/testimonials/${img}.webp`}
                alt={name}
                loading="lazy"
                className="h-12 w-12 rounded-full border-2 border-[#bfe9d9] object-cover object-top"
              />
              <div>
                <p className="font-semibold text-gray-900">{name}</p>
                <div className="mt-0.5 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#FFA500] text-[#FFA500]" />
                  ))}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

const VisitUs = ({ onCta }) => (
  <section id="visit" className="w-full scroll-mt-20 bg-[#e8f8f2] py-16">
    <div className="container mx-auto grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
          Come visit us in Mylapore.
          <br className="hidden md:block" /> Only 10 students per tutor.
        </h2>
        <address className="mt-6 flex items-start gap-3 not-italic text-gray-800 md:text-lg">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#1D9E75]" />
          <span>
            {ADDRESS_LINES.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </span>
        </address>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={onCta} className={`${BTN_DARK} px-8 py-3`}>
            Reserve my seat
          </button>
          <a
            href={MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-[#1D9E75] px-6 py-3 font-medium text-[#0f6e56] transition hover:bg-white"
          >
            <Navigation className="h-4 w-4" /> Get directions
          </a>
        </div>
        <a
          href={PHONE_TEL}
          className="mt-8 flex w-full max-w-md items-center gap-4 rounded-2xl bg-gradient-to-r from-[#c9f0e1] via-[#f0fdf8] to-[#ffe2b0] p-6 transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-700">For admissions & campus visits</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{PHONE_DISPLAY}</p>
          </div>
        </a>
      </div>
      <div className="min-h-[320px] overflow-hidden rounded-2xl border border-white shadow-lg">
        <iframe
          title="FOCAS Mylapore on Google Maps"
          src={MAP_EMBED}
          className="h-full min-h-[320px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </section>
);

const EMAIL = "kvr@focasedu.com";

const SOCIALS = [
  ["YouTube", "https://youtube.com/@focasedu", Youtube],
  ["Instagram", "https://instagram.com/focasedu", Instagram],
  ["LinkedIn", "https://www.linkedin.com/company/focasedu", Linkedin],
];

const Footer = () => (
  <footer className="w-full bg-[#06241c]" style={LEXEND}>
    <section className="container overflow-hidden">
      <ul className="flex justify-center py-6" style={MANROPE}>
        {"FOCAS EDU".split("").map((ch, i) =>
          ch === " " ? (
            <li key={i} className="px-1 text-2xl md:text-5xl lg:text-[90px] xl:px-2 xl:text-[116px]">&nbsp;</li>
          ) : (
            <li
              key={i}
              className="cursor-pointer text-2xl font-extrabold text-[#1f5446] transition-colors hover:text-[#FFA500] md:text-5xl lg:text-[90px] xl:text-[116px]"
            >
              {ch}
            </li>
          )
        )}
      </ul>
      <div className="flex flex-col gap-5 border-t border-[#1f5446] py-8 text-sm text-[#cfe9df] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>© {new Date().getFullYear()} FOCAS Edu</span>
          <span className="hidden sm:inline">•</span>
          <span>Mylapore, Chennai</span>
          <span className="hidden sm:inline">•</span>
          <a href={TERMS_HREF} target="_blank" rel="noopener noreferrer" className="hover:text-[#FFA500]">Terms &amp; Conditions</a>
          <span className="hidden sm:inline">•</span>
          <a href={PRIVACY_HREF} className="hover:text-[#FFA500]">Privacy Policy</a>
          <span className="hidden sm:inline">•</span>
          <a href={`mailto:${EMAIL}`} className="hover:text-[#FFA500]">{EMAIL}</a>
          <span className="hidden sm:inline">•</span>
          <a href={PHONE_TEL} className="hover:text-[#FFA500]">{PHONE_DISPLAY}</a>
        </div>
        <div className="flex items-center gap-2">
          {SOCIALS.map(([label, href, Icon]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-[#FFA500]"
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

export default function F2fClass() {
  const [open, setOpen] = useState(false);
  const openForm = () => setOpen(true);

  // Page-only fonts (Manrope + Lexend Deca), same as /counselling.
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    document.title = "Face to Face CA Inter Classes, Mylapore – FOCAS Edu";
    window.dataLayer?.push({ event: "f2f_class_page_view", page_path: "/f2f-class" });
    window.fbq?.("track", "ViewContent", { content_name: "F2F Class Mylapore" });
  }, []);

  return (
    <div className="min-h-screen bg-white text-black antialiased" style={MANROPE}>
      <Header onCta={openForm} />
      <main>
        <Hero onCta={openForm} />
        <Campus />
        <Features onCta={openForm} />
        <LastAttemptKit />
        <TimingsBand />
        <Pricing onCta={openForm} />
        <Testimonials />
        <VisitUs onCta={openForm} />
      </main>
      <Footer />

      <Modal open={open} onClose={() => setOpen(false)} label="Reserve my seat">
        <img src="/fs-assets/logo.webp" alt="FOCAS Edu" className="h-10 w-auto" />
        <h3 className="mt-4 text-xl font-bold text-[#1c232d]">Reserve your seat — F2F Regular Batch</h3>
        <p className="mt-1 text-sm text-[#696969]">CA Inter Sep 2027 · Mylapore, Chennai · Starts {BATCH_START}</p>
        <LeadForm />
      </Modal>
    </div>
  );
}
