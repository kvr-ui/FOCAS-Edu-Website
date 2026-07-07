import { useState, useRef, useCallback, useEffect } from "react";
// Inline SVG Icons as components
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>);
const XIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>);
const UsersIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>);
const PlayIcon = ({ size = 24 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 3 20 12 6 21 6 3"/>
  </svg>);
const ArrowDownIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
  </svg>);
const ArrowRightIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>);
const GraduationCapIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
  </svg>);
const TargetIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>);
const RefreshCwIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>);
const BookOpenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>);
const ClockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>);
const LanguagesIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
  </svg>);
const CalendarIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>);
const FileTextIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
  </svg>);
const ListChecksIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>
  </svg>);
const ChevronLeftIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>);
const ChevronRightIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>);
const UserCheckIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
  </svg>);
const FileQuestionIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2"/><path d="M12 17h.01"/>
  </svg>);
const CalendarCheckIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/>
  </svg>);
const CheckIcon = ({ size = 12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>);
const BookMarkedIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><polyline points="10 2 10 10 13 7 16 10 16 2"/>
  </svg>);
const LightbulbIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>);
const DumbbellIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>
  </svg>);
const QuoteIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>);
const MessageCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>);
const FOCASLandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showStickyCTA, setShowStickyCTA] = useState(false);
    // Demo carousel state
    const [demoCurrentIndex, setDemoCurrentIndex] = useState(0);
    const demoCarouselRef = useRef(null);
    // System carousel state
    const [systemCurrentIndex, setSystemCurrentIndex] = useState(0);
    const systemCarouselRef = useRef(null);
    // Testimonials carousel state
    const [testimonialCurrentIndex, setTestimonialCurrentIndex] = useState(0);
    const testimonialCarouselRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            setShowStickyCTA(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        }
        else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobileMenuOpen]);
    const scrollToSection = useCallback((id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setIsMobileMenuOpen(false);
    }, []);
    const scrollDemoToIndex = useCallback((index) => {
        const demos = [
            { title: "Faculty Concept Explanation", description: "Real class clip showing how complex topics are simplified", duration: "12 min" },
            { title: "Tutor-Guided Practice", description: "See how tutors guide you through problem-solving", duration: "15 min" },
            { title: "MCQ & Exam Strategy", description: "Exam-day techniques and MCQ approach walkthrough", duration: "10 min" },
        ];
        const clampedIndex = Math.max(0, Math.min(index, demos.length - 1));
        if (demoCarouselRef.current) {
            const card = demoCarouselRef.current.children[clampedIndex];
            if (card) {
                card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                setDemoCurrentIndex(clampedIndex);
            }
        }
    }, []);
    const scrollSystemToIndex = useCallback((index) => {
        const features = [
            { icon: <GraduationCapIcon />, title: "Faculty-led Concept Clarity", description: "Recorded + Live sessions from experienced CA faculty. Every concept explained for exam application." },
            { icon: <UserCheckIcon />, title: "Tutor-supervised Daily Practice", description: "Personal tutors ensure you complete practice daily — not just watch videos passively." },
            { icon: <FileQuestionIcon />, title: "Exam-Oriented MCQs & Tests", description: "Practice with questions designed on actual exam patterns. Mentor-reviewed tests with feedback." },
            { icon: <CalendarCheckIcon />, title: "Structured Revision & Accountability", description: "Weekly progress tracking, revision schedules, and honest feedback to keep you on course." },
        ];
        const clampedIndex = Math.max(0, Math.min(index, features.length - 1));
        if (systemCarouselRef.current) {
            const card = systemCarouselRef.current.children[clampedIndex];
            if (card) {
                card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                setSystemCurrentIndex(clampedIndex);
            }
        }
    }, []);
    const scrollTestimonialToIndex = useCallback((index) => {
        const testimonials = [
            { name: "Priya Sharma", attempt: "3rd Attempt — Cleared", text: "Finally completed the syllabus properly. The daily practice with tutors made sure I wasn't just watching videos.", avatar: "PS" },
            { name: "Rahul Mehta", attempt: "2nd Attempt — Both Groups", text: "Reduced my panic completely. Knowing exactly what to study each day gave me control I never had before.", avatar: "RM" },
            { name: "Sneha Agarwal", attempt: "Working Professional — Cleared", text: "The 75-day plan was realistic for my schedule. Better exam control than my previous two attempts combined.", avatar: "SA" },
        ];
        const clampedIndex = Math.max(0, Math.min(index, testimonials.length - 1));
        if (testimonialCarouselRef.current) {
            const card = testimonialCarouselRef.current.children[clampedIndex];
            if (card) {
                card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                setTestimonialCurrentIndex(clampedIndex);
            }
        }
    }, []);
    // Data arrays
    const demos = [
        { title: "Faculty Concept Explanation", description: "Real class clip showing how complex topics are simplified", duration: "12 min" },
        { title: "Tutor-Guided Practice", description: "See how tutors guide you through problem-solving", duration: "15 min" },
        { title: "MCQ & Exam Strategy", description: "Exam-day techniques and MCQ approach walkthrough", duration: "10 min" },
    ];
    const features = [
        { icon: <GraduationCapIcon />, title: "Faculty-led Concept Clarity", description: "Recorded + Live sessions from experienced CA faculty. Every concept explained for exam application." },
        { icon: <UserCheckIcon />, title: "Tutor-supervised Daily Practice", description: "Personal tutors ensure you complete practice daily — not just watch videos passively." },
        { icon: <FileQuestionIcon />, title: "Exam-Oriented MCQs & Tests", description: "Practice with questions designed on actual exam patterns. Mentor-reviewed tests with feedback." },
        { icon: <CalendarCheckIcon />, title: "Structured Revision & Accountability", description: "Weekly progress tracking, revision schedules, and honest feedback to keep you on course." },
    ];
    const testimonials = [
        { name: "Priya Sharma", attempt: "3rd Attempt — Cleared", text: "Finally completed the syllabus properly. The daily practice with tutors made sure I wasn't just watching videos.", avatar: "PS" },
        { name: "Rahul Mehta", attempt: "2nd Attempt — Both Groups", text: "Reduced my panic completely. Knowing exactly what to study each day gave me control I never had before.", avatar: "RM" },
        { name: "Sneha Agarwal", attempt: "Working Professional — Cleared", text: "The 75-day plan was realistic for my schedule. Better exam control than my previous two attempts combined.", avatar: "SA" },
    ];
    return (<div style={{ minHeight: "100vh", backgroundColor: "hsl(0, 0%, 100%)", fontFamily: "'Inter', system-ui, sans-serif", color: "hsl(215, 28%, 17%)", paddingBottom: "80px" }}>
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; align-items: center; gap: 24px; }
        }
      `}</style>

      {/* Header */}
      <header style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            transition: "all 0.3s",
            backgroundColor: isScrolled ? "rgba(255,255,255,0.95)" : "transparent",
            backdropFilter: isScrolled ? "blur(8px)" : "none",
            boxShadow: isScrolled ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "hsl(213, 56%, 24%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>F</span>
            </div>
            <span style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif", fontWeight: "bold", fontSize: "18px" }}>
              FOCAS <span style={{ color: "hsl(213, 56%, 24%)" }}>Edu</span>
            </span>
          </div>

          <nav style={{ display: "none" }} className="desktop-nav">
            <button onClick={() => scrollToSection("demo-videos")} style={{ fontSize: "14px", fontWeight: 500, color: "hsl(215, 16%, 47%)", background: "none", border: "none", cursor: "pointer", padding: "8px 16px" }}>Demo</button>
            <button onClick={() => scrollToSection("inclusions")} style={{ fontSize: "14px", fontWeight: 500, color: "hsl(215, 16%, 47%)", background: "none", border: "none", cursor: "pointer", padding: "8px 16px" }}>What's Included</button>
            <button onClick={() => scrollToSection("enrollment")} style={{ fontSize: "14px", fontWeight: 600, color: "white", backgroundColor: "hsl(213, 56%, 24%)", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: "6px" }}>Enroll Now</button>
          </nav>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ padding: "12px", background: "none", border: "none", cursor: "pointer" }} aria-label="Menu">
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (<>
          <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 }}/>
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "80%", maxWidth: "384px", backgroundColor: "white", zIndex: 50, boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", paddingTop: "80px" }}>
            <nav style={{ padding: "16px 24px" }}>
              <button onClick={() => scrollToSection("demo-videos")} style={{ width: "100%", padding: "16px", textAlign: "left", fontWeight: 500, background: "none", border: "none", cursor: "pointer", borderRadius: "8px" }}>Demo</button>
              <button onClick={() => scrollToSection("inclusions")} style={{ width: "100%", padding: "16px", textAlign: "left", fontWeight: 500, background: "none", border: "none", cursor: "pointer", borderRadius: "8px" }}>What's Included</button>
              <button onClick={() => scrollToSection("system")} style={{ width: "100%", padding: "16px", textAlign: "left", fontWeight: 500, background: "none", border: "none", cursor: "pointer", borderRadius: "8px" }}>Why FOCAS</button>
            </nav>
            <div style={{ padding: "0 24px 24px" }}>
              <button onClick={() => scrollToSection("enrollment")} style={{ width: "100%", backgroundColor: "hsl(213, 56%, 24%)", color: "white", fontWeight: 600, padding: "18px", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Enroll Now — ₹26,000
              </button>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", padding: "12px", background: "none", border: "none", cursor: "pointer" }}>
              <XIcon />
            </button>
          </div>
        </>)}

      {/* Hero Section */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "hsl(0, 0%, 100%)" }}>
        <div style={{ position: "relative", width: "100%", height: "50vh", background: "linear-gradient(135deg, hsl(214, 32%, 96%) 0%, hsl(45, 33%, 97%) 100%)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), transparent, hsl(0, 0%, 100%))" }}/>
          <div style={{ position: "absolute", top: "96px", left: "16px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid hsl(214, 32%, 91%)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "hsl(213, 56%, 24%)" }}/>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "hsl(213, 56%, 24%)" }}>CA Intermediate — May & November 2025</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 10, marginTop: "-32px", paddingBottom: "80px" }}>
          <div style={{ display: "grid", gap: "32px" }}>
            {/* Course Identity Card */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid hsl(214, 32%, 91%)" }}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", lineHeight: 1.3, marginBottom: "16px" }}>
                CA Intermediate Done Right — <span style={{ color: "hsl(213, 56%, 24%)" }}>With a System, Not Just Lectures</span>
              </h1>
              <p style={{ fontSize: "16px", color: "hsl(215, 16%, 47%)", marginBottom: "24px", lineHeight: 1.6 }}>
                FOCAS Edu helps you complete syllabus, revise smartly, and write exams with confidence — in 75–90 days.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
            { icon: <GraduationCapIcon />, text: "CA Faculty Led" },
            { icon: <TargetIcon />, text: "Exam-Oriented Coverage" },
            { icon: <UsersIcon />, text: "Mentor + Tutor Support" },
            { icon: <RefreshCwIcon />, text: "For Repeat & Last-Attempt Students" },
        ].map((badge, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "hsl(213, 56%, 24%, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(213, 56%, 24%)" }}>
                      {badge.icon}
                    </div>
                    <span style={{ fontSize: "13px", color: "hsl(215, 16%, 47%)" }}>{badge.text}</span>
                  </div>))}
              </div>
            </div>

            {/* CTA Card */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid hsl(214, 32%, 91%)", maxWidth: "400px", margin: "0 auto", width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <p style={{ fontSize: "14px", color: "hsl(215, 16%, 47%)", marginBottom: "8px" }}>Course Fee</p>
                <span style={{ fontSize: "32px", fontWeight: "bold" }}>₹26,000</span>
                <p style={{ fontSize: "14px", color: "hsl(215, 16%, 47%)", marginTop: "8px" }}>One-time • Full access until exam</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={() => scrollToSection("demo-videos")} style={{ width: "100%", backgroundColor: "hsl(213, 56%, 24%)", color: "white", fontWeight: 600, padding: "16px", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px" }}>
                  <PlayIcon size={20}/> Watch Demo Class
                </button>
                <button onClick={() => scrollToSection("inclusions")} style={{ width: "100%", backgroundColor: "transparent", color: "hsl(215, 28%, 17%)", fontWeight: 600, padding: "16px", border: "2px solid hsl(214, 32%, 91%)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px" }}>
                  <ArrowDownIcon /> See What's Included
                </button>
              </div>
              <p style={{ fontSize: "12px", textAlign: "center", color: "hsl(215, 16%, 47%)", marginTop: "24px" }}>Limited batches for personalized attention</p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Snapshot */}
      <section style={{ padding: "64px 0", backgroundColor: "hsl(214, 32%, 96%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", textAlign: "center", marginBottom: "40px" }}>Course at a Glance</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {[
            { icon: <BookOpenIcon />, title: "Subjects Covered", value: "All 8 Subjects", detail: "Costing, FM, Audit, Law, Tax, Accounts, EIS, SM" },
            { icon: <ClockIcon />, title: "Total Duration", value: "400+ Hours", detail: "Recorded + Live sessions" },
            { icon: <LanguagesIcon />, title: "Language", value: "Hinglish", detail: "English + Hindi mix" },
            { icon: <CalendarIcon />, title: "Validity", value: "Until Exam", detail: "Full exam cycle access" },
            { icon: <FileTextIcon />, title: "Study Materials", value: "Included", detail: "Digital notes & question bank" },
            { icon: <TargetIcon />, title: "Ideal For", value: "May / Nov 2025", detail: "Attempt preparation" },
        ].map((item, i) => (<div key={i} style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", border: "1px solid hsl(214, 32%, 91%)", textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "hsl(213, 56%, 24%, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "hsl(213, 56%, 24%)" }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "2px" }}>{item.value}</p>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "hsl(213, 56%, 24%)", marginBottom: "4px" }}>{item.title}</p>
                <p style={{ fontSize: "12px", color: "hsl(215, 16%, 47%)" }}>{item.detail}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* Demo Videos */}
      <section id="demo-videos" style={{ padding: "64px 0", backgroundColor: "hsl(0, 0%, 100%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", textAlign: "center", marginBottom: "16px" }}>See the Teaching Before You Decide</h2>
          <p style={{ fontSize: "16px", color: "hsl(215, 16%, 47%)", textAlign: "center", marginBottom: "40px" }}>Watch real classroom recordings — not promotional videos</p>
          <div style={{ position: "relative", maxWidth: "1024px", margin: "0 auto" }}>
            <div ref={demoCarouselRef} style={{ display: "flex", gap: "16px", overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: "16px", scrollbarWidth: "none" }}>
              {demos.map((demo, i) => (<div key={i} style={{ flexShrink: 0, width: "85%", scrollSnapAlign: "center" }}>
                  <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid hsl(214, 32%, 91%)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                    <div style={{ position: "relative", aspectRatio: "16/9", background: "linear-gradient(135deg, hsl(213, 56%, 24%), hsl(213, 60%, 18%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                        <PlayIcon size={24}/>
                      </div>
                      <div style={{ position: "absolute", bottom: "12px", right: "12px", padding: "4px 8px", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "4px", color: "white", fontSize: "12px", fontWeight: 500 }}>{demo.duration}</div>
                    </div>
                    <div style={{ padding: "20px" }}>
                      <h3 style={{ fontWeight: 600, marginBottom: "8px", fontSize: "16px" }}>{demo.title}</h3>
                      <p style={{ fontSize: "14px", color: "hsl(215, 16%, 47%)", lineHeight: 1.5 }}>{demo.description}</p>
                    </div>
                  </div>
                </div>))}
            </div>
            <button onClick={() => scrollDemoToIndex(demoCurrentIndex - 1)} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: demoCurrentIndex === 0 ? 0 : 1, pointerEvents: demoCurrentIndex === 0 ? "none" : "auto", color: "hsl(213, 56%, 24%)" }}>
              <ChevronLeftIcon />
            </button>
            <button onClick={() => scrollDemoToIndex(demoCurrentIndex + 1)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: demoCurrentIndex === demos.length - 1 ? 0 : 1, pointerEvents: demoCurrentIndex === demos.length - 1 ? "none" : "auto", color: "hsl(213, 56%, 24%)" }}>
              <ChevronRightIcon />
            </button>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
              {demos.map((_, i) => (<button key={i} onClick={() => scrollDemoToIndex(i)} style={{ height: "8px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: i === demoCurrentIndex ? "hsl(213, 56%, 24%)" : "hsl(213, 56%, 24%, 0.3)", width: i === demoCurrentIndex ? "24px" : "8px", transition: "all 0.2s" }}/>))}
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: "14px", color: "hsl(215, 16%, 47%)", marginTop: "32px" }}>These are actual class recordings from enrolled students' batches.</p>
        </div>
      </section>

      {/* System Section */}
      <section id="system" style={{ padding: "64px 0", backgroundColor: "hsl(214, 32%, 96%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", textAlign: "center", marginBottom: "16px" }}>Why FOCAS Is Not Just Another CA Course</h2>
          <p style={{ fontSize: "16px", color: "hsl(215, 16%, 47%)", textAlign: "center", marginBottom: "40px" }}>A system designed for completion, not just content delivery</p>
          <div style={{ position: "relative", maxWidth: "1024px", margin: "0 auto" }}>
            <div ref={systemCarouselRef} style={{ display: "flex", gap: "16px", overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: "16px", scrollbarWidth: "none" }}>
              {features.map((feature, i) => (<div key={i} style={{ flexShrink: 0, width: "85%", scrollSnapAlign: "center" }}>
                  <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid hsl(214, 32%, 91%)", height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "hsl(213, 56%, 24%, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(213, 56%, 24%)", flexShrink: 0 }}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: "18px", marginBottom: "8px" }}>{feature.title}</h3>
                        <p style={{ fontSize: "14px", color: "hsl(215, 16%, 47%)", lineHeight: 1.6 }}>{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>
            <button onClick={() => scrollSystemToIndex(systemCurrentIndex - 1)} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: systemCurrentIndex === 0 ? 0 : 1, pointerEvents: systemCurrentIndex === 0 ? "none" : "auto", color: "hsl(213, 56%, 24%)" }}>
              <ChevronLeftIcon />
            </button>
            <button onClick={() => scrollSystemToIndex(systemCurrentIndex + 1)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: systemCurrentIndex === features.length - 1 ? 0 : 1, pointerEvents: systemCurrentIndex === features.length - 1 ? "none" : "auto", color: "hsl(213, 56%, 24%)" }}>
              <ChevronRightIcon />
            </button>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
              {features.map((_, i) => (<button key={i} onClick={() => scrollSystemToIndex(i)} style={{ height: "8px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: i === systemCurrentIndex ? "hsl(213, 56%, 24%)" : "hsl(213, 56%, 24%, 0.3)", width: i === systemCurrentIndex ? "24px" : "8px", transition: "all 0.2s" }}/>))}
            </div>
          </div>
        </div>
      </section>

      {/* Inclusions */}
      <section id="inclusions" style={{ padding: "64px 0", backgroundColor: "hsl(0, 0%, 100%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", textAlign: "center", marginBottom: "48px" }}>
            Everything You Need — Nothing You Don't
          </h2>
          <div style={{ display: "grid", gap: "32px", maxWidth: "1024px", margin: "0 auto" }}>
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid hsl(214, 32%, 91%)" }}>
              <h3 style={{ fontWeight: 600, fontSize: "18px", marginBottom: "24px" }}>What's Included</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                {[
            "Faculty Recorded Concept Videos",
            "Precision Practice Tutor Sessions",
            "Mentor Reviewed Tests",
            "MCQ Marathon Sessions",
            "Deep FOCAS Revision Framework",
            "Digital Question Bank & Test Series",
            "FOCAS Planner & Study Manual",
            "Performance Tracking & Feedback",
        ].map((item, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "hsl(213, 56%, 24%, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(213, 56%, 24%)" }}>
                      <CheckIcon />
                    </div>
                    <span style={{ fontSize: "14px" }}>{item}</span>
                  </div>))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, hsl(213, 56%, 24%), hsl(213, 60%, 18%))", borderRadius: "16px", padding: "24px", color: "white" }}>
              <h3 style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif", fontWeight: "bold", fontSize: "20px", marginBottom: "24px" }}>Structured Journey</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
            { icon: <CalendarIcon />, label: "75–90 Day Structured Journey" },
            { icon: <BookMarkedIcon />, label: "12 Exam-Focused Modules" },
            { icon: <UsersIcon />, label: "For Working & Repeat Students" },
        ].map((h, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {h.icon}
                    </div>
                    <span style={{ fontWeight: 500, opacity: 0.9 }}>{h.label}</span>
                  </div>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: "64px 0", backgroundColor: "hsl(214, 32%, 96%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", textAlign: "center", marginBottom: "16px" }}>Your Journey With FOCAS</h2>
          <p style={{ fontSize: "16px", color: "hsl(215, 16%, 47%)", textAlign: "center", marginBottom: "40px" }}>From confusion to confident exam execution in 5 phases</p>
          <div style={{ maxWidth: "448px", margin: "0 auto" }}>
            {[
            { num: "1", icon: <LightbulbIcon />, title: "Concept Mastery", desc: "Faculty-led concept videos" },
            { num: "2", icon: <DumbbellIcon />, title: "Guided Practice", desc: "Tutor-supervised problem solving" },
            { num: "3", icon: <ListChecksIcon />, title: "MCQ + Test Training", desc: "Exam-pattern practice & tests" },
            { num: "4", icon: <RefreshCwIcon />, title: "Deep Revision", desc: "FOCAS revision framework" },
            { num: "5", icon: <TargetIcon />, title: "Exam-Day Strategy", desc: "Writing techniques & confidence" },
        ].map((phase, i, arr) => (<div key={i} style={{ display: "flex", gap: "16px", marginBottom: i < arr.length - 1 ? "16px" : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "white", border: "2px solid hsl(213, 56%, 24%)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(213, 56%, 24%)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                    {phase.icon}
                  </div>
                  {i < arr.length - 1 && <div style={{ width: "2px", flex: 1, backgroundColor: "hsl(213, 56%, 24%, 0.3)", marginTop: "8px", minHeight: "32px" }}/>}
                </div>
                <div style={{ flex: 1, paddingBottom: "16px", paddingTop: "8px" }}>
                  <span style={{ display: "inline-block", padding: "4px 10px", backgroundColor: "hsl(213, 56%, 24%)", color: "white", fontSize: "12px", fontWeight: "bold", borderRadius: "4px", marginBottom: "8px" }}>Phase {phase.num}</span>
                  <h3 style={{ fontWeight: 600, marginBottom: "4px", fontSize: "16px" }}>{phase.title}</h3>
                  <p style={{ fontSize: "14px", color: "hsl(215, 16%, 47%)" }}>{phase.desc}</p>
                </div>
              </div>))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "64px 0", backgroundColor: "hsl(0, 0%, 100%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", textAlign: "center", marginBottom: "16px" }}>Students Who Trusted the System</h2>
          <p style={{ fontSize: "16px", color: "hsl(215, 16%, 47%)", textAlign: "center", marginBottom: "40px" }}>Honest feedback from students who completed the course</p>
          <div style={{ position: "relative", maxWidth: "1024px", margin: "0 auto" }}>
            <div ref={testimonialCarouselRef} style={{ display: "flex", gap: "16px", overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: "16px", scrollbarWidth: "none" }}>
              {testimonials.map((t, i) => (<div key={i} style={{ flexShrink: 0, width: "85%", scrollSnapAlign: "center" }}>
                  <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid hsl(214, 32%, 91%)", height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ color: "hsl(213, 56%, 24%, 0.3)", marginBottom: "16px" }}><QuoteIcon /></div>
                    <p style={{ flex: 1, marginBottom: "24px", lineHeight: 1.6, fontSize: "15px" }}>"{t.text}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "16px", borderTop: "1px solid hsl(214, 32%, 91%)" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "hsl(213, 56%, 24%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 500, fontSize: "14px" }}>{t.avatar}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "14px" }}>{t.name}</p>
                        <p style={{ fontSize: "12px", color: "hsl(215, 16%, 47%)" }}>{t.attempt}</p>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>
            <button onClick={() => scrollTestimonialToIndex(testimonialCurrentIndex - 1)} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: testimonialCurrentIndex === 0 ? 0 : 1, pointerEvents: testimonialCurrentIndex === 0 ? "none" : "auto", color: "hsl(213, 56%, 24%)" }}>
              <ChevronLeftIcon />
            </button>
            <button onClick={() => scrollTestimonialToIndex(testimonialCurrentIndex + 1)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: testimonialCurrentIndex === testimonials.length - 1 ? 0 : 1, pointerEvents: testimonialCurrentIndex === testimonials.length - 1 ? "none" : "auto", color: "hsl(213, 56%, 24%)" }}>
              <ChevronRightIcon />
            </button>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
              {testimonials.map((_, i) => (<button key={i} onClick={() => scrollTestimonialToIndex(i)} style={{ height: "8px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: i === testimonialCurrentIndex ? "hsl(213, 56%, 24%)" : "hsl(213, 56%, 24%, 0.3)", width: i === testimonialCurrentIndex ? "24px" : "8px", transition: "all 0.2s" }}/>))}
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section style={{ padding: "64px 0", backgroundColor: "hsl(214, 32%, 96%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "'Sora', 'Inter', system-ui, sans-serif", textAlign: "center", marginBottom: "40px" }}>Is This Course For You?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "896px", margin: "0 auto" }}>
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid hsl(213, 56%, 24%, 0.3)", padding: "20px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "9999px", backgroundColor: "hsl(213, 56%, 24%, 0.15)", color: "hsl(213, 56%, 24%)", fontWeight: 500, fontSize: "14px", marginBottom: "24px" }}>
                <CheckIcon size={16}/> FOCAS Is For You If
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["You are a repeater or last-attempt student", "You struggle with consistency and completion", "You want exam-focused preparation", "You need accountability, not just motivation"].map((item, i) => (<li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: i < 3 ? "16px" : 0 }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "hsl(213, 56%, 24%, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(213, 56%, 24%)", flexShrink: 0, marginTop: "2px" }}>
                      <CheckIcon size={14}/>
                    </div>
                    <span style={{ fontSize: "15px", lineHeight: 1.5 }}>{item}</span>
                  </li>))}
              </ul>
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid hsl(214, 32%, 91%)", padding: "20px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "9999px", backgroundColor: "hsl(214, 32%, 96%)", color: "hsl(215, 16%, 47%)", fontWeight: 500, fontSize: "14px", marginBottom: "24px" }}>
                <XIcon /> FOCAS Is NOT For You If
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["You want shortcuts or quick fixes", "You don't want to follow a structured plan", "You only want recorded videos without guidance", "You prefer last-minute cramming"].map((item, i) => (<li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: i < 3 ? "16px" : 0 }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "hsl(214, 32%, 96%)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(215, 16%, 47%)", flexShrink: 0, marginTop: "2px" }}>
                      <XIcon />
                    </div>
                    <span style={{ fontSize: "15px", lineHeight: 1.5, color: "hsl(215, 16%, 47%)" }}>{item}</span>
                  </li>))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="enrollment" style={{ padding: "64px 0", backgroundColor: "hsl(213, 56%, 24%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}/>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 10 }}>
          <div style={{ maxWidth: "672px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "white", marginBottom: "16px", fontFamily: "'Sora', 'Inter', system-ui, sans-serif" }}>
              Don't Risk Another Attempt Without a System
            </h2>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", marginBottom: "32px" }}>
              Thousands study hard. Very few study right.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "9999px", padding: "12px 24px", marginBottom: "32px" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Course Fee:</span>
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>₹26,000</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center", marginBottom: "32px" }}>
              <button style={{ backgroundColor: "white", color: "hsl(213, 56%, 24%)", fontWeight: 600, padding: "16px 32px", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px" }}>
                Enroll in FOCAS Edu <ArrowRightIcon />
              </button>
              <button style={{ backgroundColor: "transparent", color: "white", fontWeight: 600, padding: "16px 32px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px" }}>
                <MessageCircleIcon /> Talk to a Mentor
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>Limited batches to ensure tutor accountability.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "hsl(215, 28%, 17%)", color: "white" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
          <div style={{ display: "grid", gap: "32px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "hsl(213, 56%, 24%)", fontWeight: "bold", fontSize: "14px" }}>F</span>
                </div>
                <span style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif", fontWeight: "bold", fontSize: "18px" }}>
                  FOCAS <span style={{ color: "hsl(43, 100%, 70%)" }}>Edu</span>
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.6, maxWidth: "384px" }}>
                Structured preparation courses for CA Intermediate students. Combining faculty teaching, tutor guidance, and exam-focused practice.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Course</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li><a href="#demo-videos" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Course Preview</a></li>
                  <li><a href="#inclusions" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Curriculum</a></li>
                  <li><a href="#enrollment" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Enrollment</a></li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Contact</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li><span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>hello@focasedu.com</span></li>
                  <li><span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>+91 98765 43210</span></li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>© {new Date().getFullYear()} FOCAS Edu. All rights reserved.</p>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="#" style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacy Policy</a>
              <a href="#" style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      {showStickyCTA && (<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, backgroundColor: "white", borderTop: "2px solid hsl(213, 56%, 24%, 0.15)", boxShadow: "0 -4px 20px rgba(0,0,0,0.15)", padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "hsl(215, 16%, 47%)" }}>
              <UsersIcon /> <span>Limited Seats Available</span>
            </div>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>₹26,000</span>
          </div>
          <button onClick={() => scrollToSection("enrollment")} style={{ width: "100%", backgroundColor: "hsl(213, 56%, 24%)", color: "white", fontWeight: 600, padding: "14px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>
            Enroll Now
          </button>
        </div>)}
    </div>);
};
export default FOCASLandingPage;
