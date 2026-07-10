import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
/* ── All your existing SVG Icons (keep same as before) ── */
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>);
const XIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
const UsersIcon = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const PlayIcon = ({ size = 24 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>);
const ArrowDownIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>);
const ArrowRightIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>);
const GraduationCapIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>);
const TargetIcon = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const RefreshCwIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>);
const BookOpenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const ClockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const LanguagesIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>);
const CalendarIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);
const FileTextIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>);
const ListChecksIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>);
const ChevronLeftIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>);
const ChevronRightIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>);
const UserCheckIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>);
const FileQuestionIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2"/><path d="M12 17h.01"/></svg>);
const CalendarCheckIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>);
const CheckIcon = ({ size = 12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>);
const BookMarkedIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><polyline points="10 2 10 10 13 7 16 10 16 2"/></svg>);
const LightbulbIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>);
const DumbbellIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></svg>);
const QuoteIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>);
const MessageCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>);
const BackArrowIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>);
const UserIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const PhoneIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.27 2 2 0 0 1 3.9 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const MapPinIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const ShieldCheckIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>);

const apiBaseUrl = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:7000"}`;

/* ── Static Data ── */
const trustBadges = [
  { icon: <GraduationCapIcon />, text: "CA Faculty Led" },
  { icon: <TargetIcon />, text: "Exam-Oriented Coverage" },
  { icon: <UsersIcon />, text: "Mentor + Tutor Support" },
  { icon: <RefreshCwIcon />, text: "For Repeat & Last-Attempt Students" },
];
const snapshots = [
  { icon: <BookOpenIcon />, title: "Subjects Covered", value: "All 8 Subjects", detail: "Costing, FM, Audit, Law, Tax, Accounts, EIS, SM" },
  { icon: <ClockIcon />, title: "Total Duration", value: "400+ Hours", detail: "Recorded + Live sessions" },
  { icon: <LanguagesIcon />, title: "Language", value: "Tamil + English", detail: "Tamil + English mix" },
  { icon: <CalendarIcon />, title: "Validity", value: "Until Exam", detail: "Full exam cycle access" },
  { icon: <FileTextIcon />, title: "Study Materials", value: "Included", detail: "Digital notes & question bank" },
  { icon: <TargetIcon size={20} />, title: "Ideal For", value: "May / Nov 2025", detail: "Attempt preparation" },
];

/* ── UPDATED: Demo Videos with Video URLs ── */
const demos = [
  { 
    icon: <BookOpenIcon />, 
    title: "Faculty Concept Explanation", 
    description: "Real class clip showing how complex topics are simplified", 
    duration: "12 min",
    // YouTube video URL - Replace with your actual video URLs
    videoUrl: "https://www.youtube.com/embed/IqZa3HWvf2I",
    // Or use direct video file URL:
    // videoUrl: "https://your-server.com/videos/demo1.mp4",
    // Or Vimeo:
    // videoUrl: "https://player.vimeo.com/video/123456789",
    thumbnail: "https://i.ytimg.com/vi/IqZa3HWvf2I/maxresdefault.jpg"
  },
  { 
    icon: <UsersIcon size={20} />, 
    title: "Tutor-Guided Practice", 
    description: "See how tutors guide you through problem-solving", 
    duration: "15 min",
    videoUrl: "https://www.youtube.com/embed/cYXn03oBBMA",
    thumbnail: "https://i.ytimg.com/vi/cYXn03oBBMA/maxresdefault.jpg"
  },
  { 
    icon: <ListChecksIcon />, 
    title: "MCQ & Exam Strategy", 
    description: "Exam-day techniques and MCQ approach walkthrough", 
    duration: "10 min",
    videoUrl: "https://www.youtube.com/embed/YSzg6zSzoRU",
    thumbnail: "https://img.youtube.com/vi/YSzg6zSzoRU/sddefault.jpg"
  },
];

const features = [
  { icon: <GraduationCapIcon />, title: "Faculty-led Concept Clarity", description: "Recorded + Live sessions from experienced CA faculty." },
  { icon: <UserCheckIcon />, title: "Tutor-supervised Daily Practice", description: "Personal tutors ensure you complete practice daily." },
  { icon: <FileQuestionIcon />, title: "Exam-Oriented MCQs & Tests", description: "Practice with questions designed on actual exam patterns." },
  { icon: <CalendarCheckIcon />, title: "Structured Revision & Accountability", description: "Weekly progress tracking, revision schedules, and feedback." },
];
const inclusions = [
  "Faculty Recorded Concept Videos", "Precision Practice Tutor Sessions", "Mentor Reviewed Tests", "MCQ Marathon Sessions",
  "Deep FOCAS Revision Framework", "Digital Question Bank & Test Series", "FOCAS Planner & Study Manual", "Performance Tracking & Feedback",
];
const highlights = [
  { icon: <CalendarIcon />, label: "75–90 Day Structured Journey" },
  { icon: <BookMarkedIcon />, label: "12 Exam-Focused Modules" },
  { icon: <UsersIcon size={20} />, label: "For Working & Repeat Students" },
];
const phases = [
  { number: "1", icon: <LightbulbIcon />, title: "Concept Mastery", description: "Faculty-led concept videos" },
  { number: "2", icon: <DumbbellIcon />, title: "Guided Practice", description: "Tutor-supervised problem solving" },
  { number: "3", icon: <ListChecksIcon />, title: "MCQ + Test Training", description: "Exam-pattern practice & tests" },
  { number: "4", icon: <RefreshCwIcon />, title: "Deep Revision", description: "FOCAS revision framework" },
  { number: "5", icon: <TargetIcon size={24} />, title: "Exam-Day Strategy", description: "Writing techniques & confidence" },
];
const testimonials = [
  { name: "Priya Sharma", attempt: "3rd Attempt — Cleared", text: "Finally completed the syllabus properly. The daily practice with tutors made sure I wasn't just watching videos.", avatar: "PS" },
  { name: "Rahul Mehta", attempt: "2nd Attempt — Both Groups", text: "Reduced my panic completely. Knowing exactly what to study each day gave me control I never had before.", avatar: "RM" },
  { name: "Sneha Agarwal", attempt: "Working Professional — Cleared", text: "The 75-day plan was realistic for my schedule. Better exam control than my previous two attempts combined.", avatar: "SA" },
];
const forYou = ["You are a repeater or last-attempt student", "You struggle with consistency and completion", "You want exam-focused preparation", "You need accountability, not just motivation"];
const notForYou = ["You want shortcuts or quick fixes", "You don't want to follow a structured plan", "You only want recorded videos without guidance", "You prefer last-minute cramming"];

/* ── Carousel Hook ── */
function useCarousel(length) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const scrollToIndex = useCallback((index) => {
    const i = Math.max(0, Math.min(index, length - 1));
    if (ref.current) {
      ref.current.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setCurrentIndex(i);
    }
  }, [length]);
  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const cardWidth = ref.current.children[0]?.clientWidth || 300;
    setCurrentIndex(Math.min(Math.max(0, Math.round(ref.current.scrollLeft / (cardWidth + 16))), length - 1));
  }, [length]);
  return { ref, currentIndex, scrollToIndex, handleScroll };
}

function CarouselNav({ carousel, length }) {
  return (
    <>
      <button onClick={() => carousel.scrollToIndex(carousel.currentIndex - 1)} className={`absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10 text-[#1e3a5f] transition-opacity ${carousel.currentIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}><ChevronLeftIcon /></button>
      <button onClick={() => carousel.scrollToIndex(carousel.currentIndex + 1)} className={`absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10 text-[#1e3a5f] transition-opacity ${carousel.currentIndex === length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}><ChevronRightIcon /></button>
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length }).map((_, i) => (
          <button key={i} onClick={() => carousel.scrollToIndex(i)} className={`h-2 rounded-full transition-all ${i === carousel.currentIndex ? "bg-[#1e3a5f] w-6" : "bg-[#1e3a5f]/20 w-2"}`} />
        ))}
      </div>
    </>
  );
}

/* ── Skeleton ── */
function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-[50vh] md:h-[60vh] bg-gray-200" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-12 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200/50 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-full mt-4" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/3 mx-auto" />
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-12 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ── VIDEO MODAL COMPONENT WITH FULLSCREEN ──
══════════════════════════════════════════ */
const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
  </svg>
);

function VideoModal({ video, onClose }) {
  const modalRef = useRef(null);
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !isFullscreen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose, isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchstart", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchstart", handleMouseMove);
      }
      clearTimeout(timeout);
    };
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        const element = videoContainerRef.current;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
        // For iOS Safari - try video element directly
        if (videoRef.current?.webkitEnterFullscreen) {
          videoRef.current.webkitEnterFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.log("Fullscreen error:", err);
    }
  };

  // Detect video type
  const isYouTube = video.videoUrl?.includes("youtube.com") || video.videoUrl?.includes("youtu.be");
  const isVimeo = video.videoUrl?.includes("vimeo.com");
  const isDirectVideo = video.videoUrl?.match(/\.(mp4|webm|ogg)$/i);

  // Format YouTube URL for better fullscreen support
  const getVideoUrl = () => {
    if (isYouTube) {
      const url = new URL(video.videoUrl);
      url.searchParams.set("autoplay", "1");
      url.searchParams.set("rel", "0");
      url.searchParams.set("modestbranding", "1");
      url.searchParams.set("fs", "1"); // Enable fullscreen button
      return url.toString();
    }
    if (isVimeo) {
      return `${video.videoUrl}?autoplay=1&fullscreen=1`;
    }
    return video.videoUrl;
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4" 
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div 
        ref={videoContainerRef}
        className={`relative bg-black overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? "w-full h-full rounded-none" 
            : "w-full max-w-5xl rounded-none sm:rounded-2xl"
        }`}
      >
        {/* Top Controls Bar */}
        <div 
          className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-start justify-between">
            {/* Video Info */}
            <div className="flex-1 pr-4">
              <h3 className="text-white font-semibold text-base sm:text-lg drop-shadow-lg line-clamp-1">{video.title}</h3>
              <p className="text-white/70 text-xs sm:text-sm">{video.duration}</p>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white transition-colors"
                title="Close"
              >
                <XIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className={`w-full ${isFullscreen ? "h-full" : "aspect-video"}`}>
          {isYouTube || isVimeo ? (
            <iframe
              src={getVideoUrl()}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen={true}
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              frameBorder="0"
            />
          ) : isDirectVideo ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // Fallback for other video sources (like Discord, Google Drive, etc.)
            <iframe
              src={video.videoUrl}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen={true}
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              frameBorder="0"
            />
          )}
        </div>

        {/* Bottom Info Bar */}
        <div 
          className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 ${
            showControls && !isFullscreen ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-white/80 text-sm line-clamp-2">{video.description}</p>
        </div>

        {/* Mobile Fullscreen Hint */}
        <div 
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-20 sm:hidden transition-opacity duration-300 ${
            showControls && !isFullscreen ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <FullscreenIcon />
            <span>Tap for Fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ── ENROLLMENT MODAL COMPONENT ──
══════════════════════════════════════════ */
function EnrollmentModal({ course, onClose }) {
  const [form, setForm] = useState({
    name: "", phoneNumber: "",
    line1: "", line2: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form"); // "form" | "processing" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter valid 10-digit Indian mobile number";
    if (!form.line1.trim()) e.line1 = "Address line 1 is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Load Razorpay Script ──
  const loadRazorpayScript = () => new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // ── Handle Payment Flow ──
  const handleProceedToPayment = async () => {
    if (!validate()) return;
    setStep("processing");

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch(`${apiBaseUrl}/api/purchase/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: [course._id],
          name: form.name,
          phoneNumber: form.phoneNumber,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // Step 2: Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your connection.");

      // Step 3: Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FOCAS Edu",
        description: course.name,
        order_id: orderData.orderId,
        prefill: {
          name: form.name,
          contact: form.phoneNumber,
        },
        theme: { color: "#1e3a5f" },

        // Step 4: On payment success → verify with backend
        handler: async (response) => {
          setStep("processing");
          try {
            const verifyRes = await fetch(`${apiBaseUrl}/api/purchase/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productIds: [course._id],
                currency: orderData.currency,
                name: form.name,
                phoneNumber: form.phoneNumber,
                address: {
                  line1: form.line1,
                  line2: form.line2,
                  city: form.city,
                  state: form.state,
                  pincode: form.pincode,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

            setStep("success");
          } catch (err) {
            setErrorMsg(err.message);
            setStep("error");
          }
        },

        modal: {
          ondismiss: () => {
            // User closed Razorpay without paying
            setStep("form");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setErrorMsg(response.error.description || "Payment failed. Please try again.");
        setStep("error");
      });
      rzp.open();

    } catch (err) {
      setErrorMsg(err.message);
      setStep("error");
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
        : "border-gray-200 bg-gray-50 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 focus:bg-white"
    }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step === "form" ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* ── Course Summary Banner ── */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] px-6 py-5 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                  CA {course.level}
                </span>
              </div>
              <h2 className="font-bold text-base sm:text-lg leading-snug" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>
                {course.name}
              </h2>
              <p className="text-2xl font-bold mt-2">
                ₹{course.price?.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-white/70 ml-2">one-time</span>
              </p>
            </div>
            {step === "form" && (
              <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition flex-shrink-0 mt-1">
                <XIcon />
              </button>
            )}
          </div>
        </div>

        {/* ── FORM STATE ── */}
        {step === "form" && (
          <div className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <UserIcon /> Personal Details
                </p>
                <div className="space-y-3">
                  <div>
                    <input
                      className={inputClass("name")}
                      placeholder="Full Name *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                      <input
                        className={`${inputClass("phoneNumber")} pl-12`}
                        placeholder="Phone Number *"
                        value={form.phoneNumber}
                        maxLength={10}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-xs text-red-500 mt-1 ml-1">{errors.phoneNumber}</p>}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPinIcon /> Address
                </p>
                <div className="space-y-3">
                  <div>
                    <input
                      className={inputClass("line1")}
                      placeholder="Address Line 1 * (House/Flat No, Street)"
                      value={form.line1}
                      onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    />
                    {errors.line1 && <p className="text-xs text-red-500 mt-1 ml-1">{errors.line1}</p>}
                  </div>
                  <input
                    className={inputClass("line2")}
                    placeholder="Address Line 2 (Landmark, Area - Optional)"
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        className={inputClass("city")}
                        placeholder="City *"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1 ml-1">{errors.city}</p>}
                    </div>
                    <div>
                      <input
                        className={inputClass("state")}
                        placeholder="State *"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                      />
                      {errors.state && <p className="text-xs text-red-500 mt-1 ml-1">{errors.state}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      className={inputClass("pincode")}
                      placeholder="Pincode *"
                      value={form.pincode}
                      maxLength={6}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })}
                    />
                    {errors.pincode && <p className="text-xs text-red-500 mt-1 ml-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex-shrink-0 border-t border-gray-100 pt-4">
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-colors"
              >
                Proceed to Pay ₹{course.price?.toLocaleString("en-IN")} <ArrowRightIcon />
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
                <ShieldCheckIcon />
                <span>Secured by Razorpay • 100% safe payment</span>
              </div>
            </div>
          </div>
        )}

        {/* ── PROCESSING STATE ── */}
        {step === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
            <div className="w-14 h-14 border-4 border-[#1e3a5f]/20 border-t-[#1e3a5f] rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Processing your payment…</p>
            <p className="text-xs text-gray-400 text-center">Please don't close this window</p>
          </div>
        )}

        {/* ── SUCCESS STATE ── */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Enrollment Successful!</h3>
              <p className="text-gray-500 text-sm">Welcome to FOCAS Edu. You'll receive access details on your phone shortly.</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-5 py-4 w-full text-left space-y-2 text-sm">
              <p className="text-gray-500">Course: <span className="text-gray-800 font-medium">{course.name}</span></p>
              <p className="text-gray-500">Amount Paid: <span className="text-gray-800 font-medium">₹{course.price?.toLocaleString("en-IN")}</span></p>
              <p className="text-gray-500">Phone: <span className="text-gray-800 font-medium">+91 {form.phoneNumber}</span></p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#1e3a5f] text-white font-semibold py-3 rounded-xl transition-colors hover:bg-[#2d5a8e]"
            >
              Done
            </button>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {step === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Failed</h3>
              <p className="text-gray-500 text-sm">{errorMsg}</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setStep("form")}
                className="flex-1 border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold py-3 rounded-xl hover:bg-[#1e3a5f]/5 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ── MAIN COURSE DETAIL PAGE ──
══════════════════════════════════════════ */
const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);  // ✅ Controls enrollment modal
  const [activeVideo, setActiveVideo] = useState(null);  // ✅ Controls video modal

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const demoCarousel = useCarousel(demos.length);
  const systemCarousel = useCarousel(features.length);
  const testimonialCarousel = useCarousel(testimonials.length);

  // ✅ Fetch course from API
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/api/purchase/course/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourse(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // ✅ Auto-open enrollment modal when link has ?pay=1 (direct payment link)
  useEffect(() => {
    if (course && (searchParams.get("pay") === "1" || searchParams.get("enroll") === "1")) {
      setShowModal(true);
    }
  }, [course, searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowStickyCTA(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isMobileMenuOpen || showModal || activeVideo) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen, showModal, activeVideo]);

  const scrollTo = useCallback((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white text-[#1e2d3d]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <HeroSkeleton />
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-red-400 text-lg">{error || "Course not found."}</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#1e3a5f] hover:underline text-sm">
        <BackArrowIcon /> Back to Courses
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#1e2d3d] pb-20 md:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ✅ Video Modal */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* ✅ Enrollment Modal */}
      {showModal && (
        <EnrollmentModal
          course={course}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1e3a5f] transition-colors">
            <BackArrowIcon /> Back
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo("demo-videos")} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Demo</button>
            <button onClick={() => scrollTo("inclusions")} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">What's Included</button>
            {/* ✅ Opens modal */}
            <button onClick={() => setShowModal(true)} className="text-sm bg-[#1e3a5f] hover:bg-[#3b5998] text-white font-semibold px-4 py-2 rounded-lg transition-colors">
              Enroll Now
            </button>
          </nav>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 -mr-3">
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      {isMobileMenuOpen && (
        <>
          <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
          <div className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-50 md:hidden shadow-xl pt-20">
            <nav className="px-6 py-4 flex flex-col">
              {[{ label: "Demo", id: "demo-videos" }, { label: "What's Included", id: "inclusions" }].map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="w-full py-4 px-4 text-left font-medium hover:bg-gray-100 rounded-lg">{item.label}</button>
              ))}
            </nav>
            <div className="px-6 pb-6">
              <button onClick={() => { setIsMobileMenuOpen(false); setShowModal(true); }} className="w-full bg-[#1e3a5f] text-white font-semibold py-4 rounded-lg">
                Enroll Now — ₹{course.price?.toLocaleString("en-IN")}
              </button>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-3"><XIcon /></button>
          </div>
        </>
      )}

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative w-full bg-[#1a1b63]">
          <img
            src={course.imageUrl || "https://uniqueacademyforcommerce.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-03-at-10.56.03-AM-2.webp"}
            alt={course.name}
            className="w-full block"
            style={{ display: "block", width: "100%", maxHeight: "55vh", objectFit: "contain", objectPosition: "center" }}
            fetchPriority="high"
            loading="eager"
          />
          <div className="absolute top-16 sm:top-20 md:top-24 left-4 md:left-8 lg:left-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#1e3a5f]/10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#1e3a5f] animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-[#1e3a5f]">CA {course.level} — May & September 2026</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-4 pb-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200/50">
              {/* ✅ API: name */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 md:mb-5" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>
                {course.name} — <span className="text-[#1e3a5f]">With a System, Not Just Lectures</span>
              </h1>
              {/* ✅ API: description */}
              <p className="text-base sm:text-lg text-gray-500 mb-6 leading-relaxed">{course.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center text-[#1e3a5f]">{badge.icon}</div>
                    <span className="text-sm text-gray-500">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Price card with Enroll Now → opens modal */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-2">Course Fee</p>
                  {/* ✅ API: price */}
                  <span className="text-3xl sm:text-4xl font-bold">₹{course.price?.toLocaleString("en-IN")}</span>
                  <p className="text-sm text-gray-500 mt-2">One-time • Full access until exam</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-[#1e3a5f] hover:bg-[#3b5998] text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Enroll Now — ₹{course.price?.toLocaleString("en-IN")}
                  </button>
                  <button
                    onClick={() => window.open('https://wa.me/916383514285?text=Send%20me%20the%20Brochure', '_blank')}
                    className="w-full border-2 border-gray-300 hover:border-[#1e3a5f] font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Download Brochure
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <ShieldCheckIcon />
                  <span>Secured by Razorpay</span>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">Limited batches for personalized attention</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSE SNAPSHOT ── */}
      <section className="py-6 md:py-8 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-5" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>How FOCAS made Last Attempt ?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {snapshots.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/50 text-center shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center mx-auto mb-2 text-[#1e3a5f]">{item.icon}</div>
                <p className="text-xl font-bold mb-0.5">{item.value}</p>
                <p className="text-sm font-semibold text-[#1e3a5f] mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEOS (UPDATED WITH VIDEO PLAYBACK) ── */}
      <section id="demo-videos" className="py-6 md:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 md:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>See How Tutors works ?</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto mt-2">Watch real classroom recordings — not promotional videos</p>
          </div>
          <div className="relative max-w-7xl mx-auto">
            <div ref={demoCarousel.ref} onScroll={demoCarousel.handleScroll} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: "none" }}>
              {demos.map((demo, i) => (
                <div key={i} className="flex-shrink-0 w-[90%] sm:w-[75%] md:w-[calc(33.333%-14px)] snap-center group cursor-pointer">
                  <div
                    className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full flex flex-col"
                    onClick={() => setActiveVideo(demo)}
                  >
                    {/* ✅ Video Thumbnail with Play Button */}
                    <div className="relative aspect-video bg-gradient-to-br from-[#1e3a5f] to-[#162d4a] overflow-hidden">
                      {/* Thumbnail Image */}
                      {demo.thumbnail && (
                        <img 
                          src={demo.thumbnail} 
                          alt={demo.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-[#1e3a5f] ml-1"><PlayIcon size={24} /></span>
                        </div>
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-white text-xs font-medium">{demo.duration}</div>
                      {/* Video Icon Badge */}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-full text-[#1e3a5f] text-xs font-medium flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4l4 4V8l-4 4V6a2 2 0 0 0-2-2H4z"/>
                        </svg>
                        Demo
                      </div>
                    </div>
                    <div className="p-5 flex-1">
                      <h3 className="font-bold mb-2 group-hover:text-[#1e3a5f] transition-colors text-lg md:text-xl">{demo.title}</h3>
                      <p className="text-sm md:text-base text-gray-500 leading-relaxed">{demo.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <CarouselNav carousel={demoCarousel} length={demos.length} />
          </div>
        </div>
      </section>

      {/* ── WHY FOCAS ── */}
      <section id="system" className="py-6 md:py-10 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 md:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>Why FOCAS Is Not Just Another CA Course</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto mt-2">A system designed for completion, not just content delivery</p>
          </div>
          <div className="relative max-w-7xl mx-auto">
            <div ref={systemCarousel.ref} onScroll={systemCarousel.handleScroll} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: "none" }}>
              {features.map((feature, i) => (
                <div key={i} className="flex-shrink-0 w-[90%] sm:w-[75%] md:w-[calc(50%-10px)] snap-center">
                  <div className="bg-white rounded-2xl p-7 lg:p-8 h-full border border-gray-200/50 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#1e3a5f]/5 flex items-center justify-center text-[#1e3a5f]">{feature.icon}</div>
                      <div>
                        <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-base">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <CarouselNav carousel={systemCarousel} length={features.length} />
          </div>
        </div>
      </section>

      {/* ── INCLUSIONS ── */}
      <section id="inclusions" className="py-6 md:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>Everything You Need — Nothing You Don't</h2>
          <div className="grid lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-3 bg-white rounded-2xl p-7 lg:p-10 border border-gray-200/50 shadow-sm">
              <h3 className="font-bold text-xl mb-5">What's Included</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {inclusions.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f]"><CheckIcon /></div>
                    <span className="text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="w-full bg-gradient-to-br from-[#1e3a5f] to-[#162d4a] rounded-2xl p-7 lg:p-10 text-white h-full">
                <h3 className="font-bold text-2xl mb-6" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>Structured Journey</h3>
                <div className="space-y-5">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">{h.icon}</div>
                      <span className="font-semibold text-lg text-white/90">{h.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-6 md:py-8 bg-gray-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 md:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>Your Journey With FOCAS</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto mt-2">From confusion to confident exam execution in 5 phases</p>
          </div>
          <div className="hidden lg:block max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#1e3a5f]/20 via-[#1e3a5f] to-[#1e3a5f]/20" />
              <div className="grid grid-cols-5 gap-4">
                {phases.map((phase, i) => (
                  <div key={i} className="relative text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-[#1e3a5f] flex items-center justify-center relative z-10 shadow-sm text-[#1e3a5f]">{phase.icon}</div>
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-[#1e3a5f] text-white text-xs font-bold rounded mb-2">Phase {phase.number}</span>
                    <h3 className="font-semibold text-sm mb-1">{phase.title}</h3>
                    <p className="text-xs text-gray-500">{phase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:hidden max-w-md mx-auto">
            {phases.map((phase, i) => (
              <div key={i} className="flex gap-4 mb-4 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#1e3a5f] flex items-center justify-center flex-shrink-0 shadow-sm text-[#1e3a5f]">{phase.icon}</div>
                  {i < phases.length - 1 && <div className="w-0.5 flex-1 bg-[#1e3a5f]/20 mt-2 min-h-[2rem]" />}
                </div>
                <div className="flex-1 pb-4 pt-2">
                  <span className="inline-block px-2.5 py-1 bg-[#1e3a5f] text-white text-xs font-bold rounded mb-2">Phase {phase.number}</span>
                  <h3 className="font-semibold mb-1 text-base">{phase.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-6 md:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 md:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>Students Who Trusted the System</h2>
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div ref={testimonialCarousel.ref} onScroll={testimonialCarousel.handleScroll} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: "none" }}>
              {testimonials.map((t, i) => (
                <div key={i} className="flex-shrink-0 w-[88%] sm:w-[72%] md:w-[calc(33.333%-14px)] snap-center">
                  <div className="bg-white rounded-2xl p-7 md:p-9 h-full flex flex-col border border-gray-200/50 shadow-sm">
                    <span className="text-[#1e3a5f]/20"><QuoteIcon /></span>
                    <p className="leading-relaxed flex-1 mb-6 text-sm sm:text-base mt-4">"{t.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200/50">
                      <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-medium text-sm">{t.avatar}</div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.attempt}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <CarouselNav carousel={testimonialCarousel} length={testimonials.length} />
          </div>
        </div>
      </section>

      {/* ── WHO IS THIS FOR ── */}
      <section className="py-6 md:py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>Is This Course For You?</h2>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="flex-1 bg-white rounded-2xl border-2 border-[#1e3a5f]/20 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium text-sm mb-6">
                <CheckIcon size={16} /> FOCAS Is For You If
              </div>
              <ul className="space-y-4">
                {forYou.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center mt-0.5 text-[#1e3a5f]"><CheckIcon size={14} /></div>
                    <span className="text-base sm:text-lg leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-gray-200/50 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-500 font-medium text-sm mb-6">
                <XIcon /> FOCAS Is NOT For You If
              </div>
              <ul className="space-y-4">
                {notForYou.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 text-gray-400"><XIcon /></div>
                    <span className="text-gray-500 text-base sm:text-lg leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="enrollment" className="py-10 md:py-16 bg-[#1e3a5f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>
              Don't Risk Another Attempt Without a System
            </h2>
            <p className="text-lg text-white/70 mb-8">Thousands study hard. Very few study right.</p>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-3 mb-8">
              <span className="text-white/70">Course Fee:</span>
              <span className="text-2xl font-bold text-white">₹{course.price?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {/* ✅ Opens modal */}
              <button
                onClick={() => setShowModal(true)}
                className="bg-white hover:bg-white/90 text-[#1e3a5f] font-semibold px-8 py-4 rounded-lg text-base flex items-center justify-center gap-2 transition-colors"
              >
                Enroll in {course.name} <ArrowRightIcon />
              </button>
              <button
                onClick={() => window.open("https://wa.me/916383514285", "_blank")}
                className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg text-base flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircleIcon /> Talk to a Mentor
              </button>
            </div>
            <p className="text-sm text-white/50">Limited batches to ensure tutor accountability.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1e2d3d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-[#1e3a5f] font-bold text-sm">F</span>
                </div>
                <span className="font-bold text-lg" style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>FOCAS <span className="text-amber-300">Edu</span></span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Structured preparation courses for CA {course.level} students.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Course</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollTo("demo-videos")} className="text-sm text-white/70 hover:text-white transition-colors">Course Preview</button></li>
                <li><button onClick={() => scrollTo("inclusions")} className="text-sm text-white/70 hover:text-white transition-colors">Curriculum</button></li>
                <li><button onClick={() => setShowModal(true)} className="text-sm text-white/70 hover:text-white transition-colors">Enrollment</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Contact</h4>
              <ul className="space-y-3">
               <li>
  <a 
    href="mailto:kvr@focasedu.com" 
    className="text-sm text-white/70 hover:text-white"
  >
    kvr@focasedu.com
  </a>
</li>

<li>
  <a 
    href="tel:+916383514285" 
    className="text-sm text-white/70 hover:text-white"
  >
    +91 6383514285
  </a>
</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">© {new Date().getFullYear()} FOCAS Edu. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY CTA ── */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-[#1e3a5f]/10 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <UsersIcon size={14} /><span>Limited Seats Available</span>
              </div>
              <span className="text-sm font-bold">₹{course.price?.toLocaleString("en-IN")}</span>
            </div>
            {/* ✅ Opens modal */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-[#1e3a5f] hover:bg-[#3b5998] text-white font-semibold py-4 text-base rounded-lg transition-colors"
            >
              Enroll Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
