const CTA = "GET YOURS TODAY! — ₹299";

const config = {
  slug: "manual",
  meta: {
    title: "FOCAS Manual Pro | Personalized CA Inter Guidance at ₹299",
    description:
      "Get the FOCAS physical manual and a personalized CA tutor session for ₹299, with delivery across India.",
    ogImage: "/lp/manual/manual-pro-og.png",
  },
  theme: {
    accent: "#1D9E75",
    accent2: "#FFA500",
  },
  logo: "/logo.png",
  logoAlt: "FOCAS Edu",
  ctaLabel: CTA,
  nav: [
    { label: "Home", target: "home" },
    { label: "What You Get", target: "offer" },
    { label: "How It Works", target: "how" },
    { label: "FAQs", target: "faq" },
  ],
  sections: [
    {
      type: "hero",
      id: "home",
      badge: {
        text: "Limited stock available !",
        emphasis: "CA INTER Students",
        color: "#FFA500",
        background: "#fff8ed",
        border: "#fed7aa",
      },
      headline: [
        { text: "Don't know where", break: true },
        { text: "to start studying?", highlight: true, break: true },
        { text: "We'll show you exactly." },
      ],
      highlightFrom: "#1D9E75",
      highlightTo: "#0ea5e9",
      sub: "Get A personalized CA tutor session + our FOCAS Manual — designed to break confusion and get you moving in the right direction.",
      emphasis: "Less than the cost of one food delivery order.",
      video: {
        src: "https://vz-1b4abbd6-5f1.b-cdn.net/ea3a27e1-7239-4cda-8418-e2e78f49f6b5/playlist.m3u8",
        autoPlay: true,
        muted: true,
        loop: true,
        mobileHeight: "calc(100dvh - 380px)",
        ctaColor: "#41C9EB",
      },
      mediaCta: "GET YOURS NOW !",
      revealMedia: false,
      priceTable: {
        headers: ["Session + Manual", "Delivered to you"],
        values: ["₹299 only", "PAN India"],
      },
      cta: CTA,
      stats: [
        { value: "1:1", label: "Tutor Session" },
        { value: "FOCAS", label: "Manual" },
        { value: "₹299", label: "All Inclusive" },
      ],
    },
    {
      type: "ticker",
      items: [
        "Stop Guessing. Start Scoring.",
        "FOCAS Manual",
        "CA Intermediate",
        "Personalized Tutor Session",
        "Make it yours at ₹299",
      ],
      duration: "22s",
    },
    {
      type: "whatYouGet",
      id: "offer",
      label: "What You Get",
      title: "Everything you need to stop\nguessing and start scoring.",
      sub: "From confused to confident — one manual + one session",
      cards: [
        {
          icon: "🎯",
          title: "Personalized Tutor Session",
          desc: "A dedicated 1:1 session with a CA mentor who understands your current level, identifies your weak areas, and gives you a concrete action plan for the exam.",
          bg: "#F0FFF4",
          border: "#C6F6D5",
          accent: "#276749",
        },
        {
          icon: "📖",
          title: "FOCAS Manual",
          desc: "A personal, hold-in-hand, to keep you company and act as a guide to navigate through the sea of concepts.",
          bg: "#FFF5F5",
          border: "#FED7D7",
          accent: "#E53E3E",
        },
        {
          icon: "📊",
          title: "Clarity on how to FOCAS ahead",
          desc: "Come in confused and go back with clarity and direction.",
          bg: "#FFFFF0",
          border: "#FEFCBF",
          accent: "#975A16",
        },
        {
          icon: "📅",
          title: "Time Planning Framework",
          desc: "A practical framework to structure your study schedule from today to exam day — chapter-by-chapter, day-by-day.",
          bg: "#E6FFFA",
          border: "#B2F5EA",
          accent: "#234E52",
        },
      ],
      bottomCta: {
        text: "Manual shipped! Slot booked!",
        note: "– Click here to",
        label: "Get Started →",
      },
    },
    {
      type: "testimonials",
      id: "testimonials",
      label: "Testimonials",
      title: "What Our Students Say",
      sub: "Real results from students who made it their last attempt.",
      items: [
        {
          student: "Yashika",
          batch: "2024",
          img: "/Testimonial/Yakshika.jpeg",
          feedback:
            "The method of teaching followed by FOCAS academy is perfect and trust me I was able to score 82 just by enrolling in their fast-track — then imagine how their regular course would be.",
        },
        {
          student: "Aravindha Lochanan",
          batch: "2023",
          img: "/Testimonial/Aravind lochan.jpg",
          feedback:
            "Best mentorship for struggling students with last-minute pending syllabus and repeaters. You can trust FOCAS for the best preparation for your upcoming attempt. Join FOCAS, make it your last attempt.",
        },
        {
          student: "Mercy",
          batch: "2025",
          img: "/Testimonial/Mercy.jpeg",
          feedback:
            "Really happy and satisfied with the tutors — the way of teaching here is effective. The concept behind Deep FOCAS is too good and I gained the confidence I always wanted.",
        },
        {
          student: "Naveen",
          batch: "2023",
          img: "/Testimonial/Naveen.jpeg",
          feedback:
            "I was able to complete preparation in class itself, because it was live studying and NO procrastination. Was able to recall at least 75% in the exams because of the cumulative revisions we did.",
        },
        {
          student: "Jagadeesh",
          batch: "2025",
          img: "/Testimonial/Jagadeesh.jpeg",
          feedback:
            "FOCAS helped me study in the best possible way. Their tutor session was really helpful to get out of the vicious circle of Audit! I thought of quitting CA, but because of them I could study it. Thanks FOCAS team!",
        },
      ],
    },
    {
      type: "howItWorks",
      id: "how",
      title: "How It Works",
      sub: "Simple. Fast. Effective.",
      steps: [
        { emoji: "💳", time: "Step 1", label: "Pay ₹299 and complete your registration in under 2 minutes." },
        { emoji: "📞", time: "Step 2", label: "Your Manual is dispatched and delivered within 7 days" },
        { emoji: "🎯", time: "Step 3", label: "Get a call from our team to schedule your personalized tutor session" },
        { emoji: "📦", time: "Step 4", label: "Attend the tutor session and understand how your preparation needs to be done" },
        { emoji: "🚀", time: "Step 5", label: "Walk back with clarity to FOCAS ahead!" },
      ],
      features: [
        {
          icon: "🎯",
          title: "Tutor Session",
          desc: "A CA Mentor sits with you and with guides you on how to study for concentrate your exams. mindset.",
          background: "linear-gradient(135deg,#1D9E75,#0ea47a)",
        },
        {
          icon: "📦",
          title: "Physical Manual",
          desc: "A physical guide — to help you syllabus planning, areas to and hone the last-attempt",
          background: "linear-gradient(135deg,#0ea5e9,#0369a1)",
        },
      ],
    },
    {
      type: "compare",
      id: "compare",
      title: "Why our Counseling is Different",
      sub: "Not all prep resources give you what actually matters.",
      headings: {
        feature: "Feature",
        others: "General Counseling",
        us: "FOCAS Manual Pro ✓",
      },
      mobileHeadings: {
        feature: "Feature",
        others: "Others",
        us: "₹299 Pack ✓",
      },
      rows: [
        { label: "Personalized Tutor Session", other: "❌", rti: "✅" },
        { label: "Study Along with an expert tutor", other: "❌", rti: "✅" },
        { label: "Scoring Analysis", other: "❌", rti: "✅" },
        { label: "Attempt-specific action plan", other: "❌", rti: "✅" },
        { label: "Guidance and strategy for Sep26", other: "Generic", rti: "PERSONALIZED" },
        { label: "Access to an Expert CA Mentor", other: "❌", rti: "✅" },
        { label: "Physical FOCAS Manual", other: "❌", rti: "✅" },
      ],
    },
    {
      type: "faq",
      id: "faq",
      title: "Questions Asked by Students",
      sub: "Get your doubts cleared before you buy.",
      items: [
        {
          q: "Who is this for?",
          a: "CA Inter students who are confused about where to start, what to study and how to plan their preparation. If you’re feeling lost or overwhelmed, this is for you.",
        },
        {
          q: "What exactly is the tutor session?",
          a: "A personalized session with a CA mentor who will make you study along with them and also review your current situation and give you a personalized study strategy.",
        },
        {
          q: "What is in the physical manual?",
          a: "A printed guide covering chapter-wise importance, a time plan framework, exam tips and study cheat codes.",
        },
        {
          q: "How is the manual delivered?",
          a: "It is shipped directly to the address you provide during registration. Delivery fee is included in the ₹299 price.",
        },
        {
          q: "Why ₹299?",
          a: "We believe every CA student — regardless of their budget — deserves proper guidance. At a cost less than a single food delivery order.",
        },
        {
          q: "How long does the tutor session take?",
          a: "1 hour. That is all it takes for the tutor to make you study and give you direction and clarity.",
        },
        {
          q: "Who is conducting the sessions?",
          a: "Sessions will be conducted by the expert CA tutors of FOCAS Edu — an institute which has guided 1,000+ students in their CA journey to make it their last attempt.",
        },
        {
          q: "How do I register?",
          a: "Just click on Get Started, Fill in Your details, and pay ₹299. That is it.",
        },
      ],
    },
    {
      type: "footer",
      logo: "/logo.png",
      logoAlt: "FOCAS Edu",
      brand: "Presents",
      product: "Personalized Session + Manual @ ₹299",
      tagline: "Stop guessing. Start scoring.\nPersonalized Expert guidance.",
      links: [
        { label: "Testimonials", target: "testimonials" },
        { label: "How It Works", target: "how" },
        { label: "Why Different", target: "compare" },
        { label: "FAQs", target: "faq" },
      ],
      contact: {
        phone: "+91 63835 14285",
        website: "https://www.focasedu.com",
        websiteLabel: "www.focasedu.com",
      },
      copyright: "© 2026 FOCAS Edu. All rights reserved.",
      legalLinks: [
        { label: "Privacy Policy", href: "/pdf/Privacy%20Policy%20of%20Focas%20Edu.docx.pdf" },
        { label: "Terms", href: "/pdf/Terms%20and%20Condition%20of%20Focas%20Edu.docx.pdf" },
      ],
    },
  ],
  form: {
    badge: "Get Started",
    title: "FOCAS Manual Pro",
    subtitle: "Takes only 2 minutes to register.",
    cta: "Pay ₹299 & Get Started →",
    fields: [
      "name",
      "phone",
      {
        field: "caStatus",
        key: "groupSelection",
        label: "Group Selection",
        options: ["Group 1", "Group 2"],
      },
      "address",
    ],
    submit: {
      kind: "razorpay",
      source: "manual-class",
      amount: 299,
      register: "/api/manual-class/register",
      verify: "/api/manual-class/payment-success",
      backend: "VITE_BACKEND_URL",
      description: "₹299 Trial — Session + Physical Manual",
      themeColor: "#1D9E75",
    },
    events: {
      ga: "manual_form_submit",
      pixelName: "Manual ₹299",
    },
  },
  success: {
    heading: "You're all set!",
    message: "Payment received. Here's what happens next.\nYou'll receive a confirmation on WhatsApp shortly.",
    steps: [
      {
        icon: "📞",
        title: "Mentor will call you",
        text: "A CA mentor will reach out within 24 hours to schedule your personalized 1:1 tutor session.",
      },
      {
        icon: "📦",
        title: "Manual will be shipped",
        text: "Your physical study manual will be dispatched to the address you provided. Expect delivery within 3–5 working days.",
      },
    ],
  },
};

export default config;
