// =============================================================================
// LANDING PAGE REFERENCE CONFIG  (copy to src/landing-pages/<slug>.js)
// =============================================================================
// Files starting with "_" are never routed, validated by slug, or built into
// meta HTML. This file documents EVERYTHING a config may contain; delete what
// a page doesn't need. Section order = render order.
//
// Rules
//   - Plain JS only: no JSX, no React, no imports, no `custom` block.
//   - `slug` must equal the file name (kebab-case), must not end in
//     "-success", and must not collide with an existing route.
//   - Page lives at /<slug>, thank-you page at /<slug>-success.
//   - Images go in public/lp/<slug>/ and are referenced as "/lp/<slug>/x.jpg".
//   - Icons (`icon` props) are plain strings, usually an emoji ("🎯").
//   - Validate:  node scripts/validate-landing.mjs <slug>
//
// Every block also accepts `id` (anchor for nav / `target`) and ignores
// unknown keys. Most blocks take `label` or `eyebrow` as the small heading
// above `title`; both are shown where listed.
// =============================================================================

export default {
  // --- identity -------------------------------------------------------------
  slug: "template", // = file name without .js

  // --- SEO / share preview (used by the build to emit per-page meta HTML) ---
  meta: {
    title: "Page title | FOCAS Edu", // required
    description: "One-sentence description for search and share cards.", // required
    ogImage: "/lp/template/og.jpg", // optional path or absolute URL
  },

  // --- theme (optional; both default to FOCAS green / orange) ---------------
  theme: {
    accent: "#1D9E75",
    accent2: "#FFA500",
  },

  // --- chrome (all optional) -------------------------------------------------
  logo: "/logo.png", // default "/logo.png"
  logoAlt: "FOCAS Edu", // default "FOCAS Edu"
  ctaLabel: "Register Now", // navbar + sticky CTA label; default "Register Now"
  nav: [
    // Navbar links: `target` is a section `id`.
    { label: "Highlights", target: "highlights" },
    { label: "Agenda", target: "agenda" },
    { label: "FAQ", target: "faq" },
  ],

  // --- sections (render order) ------------------------------------------------
  sections: [
    // ---- hero -----------------------------------------------------------------
    {
      type: "hero",
      id: "hero",
      // badge: string, or { text, emphasis?, color?, background?, border? }
      badge: { text: "Live masterclass", emphasis: "Limited seats" },
      // headline: plain string (+ `highlight` substring rendered as gradient),
      //   OR { before, highlight, after },
      //   OR array of string | { text, highlight?: boolean, break?: boolean }.
      headline: "Crack CA Final with a proven plan",
      highlight: "proven plan",
      highlightFrom: "#1D9E75", // optional gradient start (default accent)
      highlightTo: "#FFA500", // optional gradient end (default accent2)
      sub: "Supporting copy under the headline.",
      emphasis: "Accent-coloured line under the sub copy.",
      // priceTable: { headers, values } | { rows: [[...], ...] } | [{ label, value }]
      priceTable: { headers: ["Regular", "Today"], values: ["₹999", "₹199"] },
      cta: "Reserve my seat", // string or { label }
      stats: [
        // { value | stat, label }
        { value: "5,000+", label: "Students" },
        { value: "4.9/5", label: "Rating" },
      ],
      // Media: use ONE of image / video / media.
      image: { src: "/lp/template/hero.jpg", alt: "Hero image", overlay: false }, // string or object
      // video: Bunny HLS URL string, or { src, poster, controls, autoPlay, muted, loop }
      // video: { src: "https://vz-xxxx.b-cdn.net/<id>/playlist.m3u8", poster: "/lp/template/poster.jpg", controls: true, autoPlay: false, muted: true, loop: false },
      // media: { type: "image" | "video", src, alt, poster, ctaColor }
      // media: { type: "image", src: "/lp/template/hero.jpg", alt: "Hero", ctaColor: "#1D9E75" },
      mediaCta: "Book now", // optional CTA button over the media
    },

    // ---- ticker: scrolling announcement strip --------------------------------
    {
      type: "ticker",
      id: "ticker",
      items: ["Live on 30 Nov", { text: "Only 100 seats" }, { label: "Certificate included" }], // string | { text | label }
      duration: "22s", // CSS animation duration (string or seconds number)
    },

    // ---- countdown: live timer; disappears when the date passes -----------------
    {
      type: "countdown",
      id: "countdown",
      date: "2026-11-30T19:00:00+05:30", // ISO date (alias: target)
      label: "Class starts in", // copy shown before the timer
      labels: ["Days", "Hours", "Minutes", "Seconds"],
    },

    // ---- highlights: compact icon / stat grid -----------------------------------
    {
      type: "highlights",
      id: "highlights",
      label: "At a glance", // eyebrow
      title: "Why attend",
      sub: "Optional supporting copy.",
      items: [
        // { icon, value | stat, label | text, desc }
        { icon: "🎯", value: "2 hours", label: "Live session" },
        { icon: "📚", value: "50+", label: "Practice questions", desc: "Optional detail line." },
      ],
    },

    // ---- whatYouGet: benefit cards + optional registration bar -------------------
    {
      type: "whatYouGet",
      id: "what-you-get",
      label: "Included",
      title: "What you get",
      sub: "Optional supporting copy.",
      cards: [
        // { icon, title, desc, colour | color | bg | border | accent }
        // colour: string, or { background, border, text }
        { icon: "🎥", title: "Live class", desc: "Two hours with a mentor.", colour: "#1D9E75" },
        {
          icon: "📝",
          title: "Study notes",
          desc: "Downloadable notes.",
          colour: { background: "#FFF7E6", border: "#FFD580", text: "#92400E" },
        },
      ],
      // bottomCta (alias ctaBar): string or { text, note, label, cta, icon: boolean }
      bottomCta: { text: "Ready to start?", note: "Seats are limited.", cta: "Register Now", icon: true },
    },

    // ---- howItWorks: vertical timeline + optional feature cards ------------------
    {
      type: "howItWorks",
      id: "how-it-works",
      label: "Process",
      title: "How it works",
      sub: "Optional supporting copy.",
      steps: [
        // { time | step, icon | emoji, label | title, desc }
        { time: "Step 1", icon: "📝", title: "Register", desc: "Fill the short form." },
        { time: "Step 2", icon: "💬", title: "Get the link", desc: "We WhatsApp you the joining link." },
      ],
      features: [
        // { icon, title, desc, color | colour | background }
        { icon: "🔒", title: "No spam", desc: "We only message about this class.", color: "#1D9E75" },
      ],
    },

    // ---- agenda: timeline of the session --------------------------------------
    {
      type: "agenda",
      id: "agenda",
      eyebrow: "Schedule", // (alias: label)
      title: "Session agenda",
      sub: "Optional supporting copy.",
      items: [
        // { time, title | item | label }
        { time: "7:00 PM", title: "Welcome and goals" },
        { time: "7:20 PM", title: "Core strategy" },
      ],
    },

    // ---- compare: "others vs us" table -----------------------------------------
    {
      type: "compare",
      id: "compare",
      eyebrow: "Comparison",
      title: "Others vs FOCAS",
      sub: "Optional supporting copy.",
      // headings: [feature, others, us]  OR  { feature, others, us }  (alias: columns)
      headings: ["", "Others", "FOCAS"],
      rows: [
        // { label | feature, others | other, us }
        { label: "Live doubt solving", others: "No", us: "Yes" },
        { label: "Price", others: "₹5,000", us: "₹199" },
      ],
    },

    // ---- testimonials: photo carousel ------------------------------------------
    {
      type: "testimonials",
      id: "testimonials",
      eyebrow: "Results", // (alias: label)
      title: "What students say",
      sub: "Optional supporting copy.",
      items: [
        // { photo | img, name | student, batch | batchLabel, quote | feedback, rating }
        {
          photo: "/lp/template/student-1.jpg",
          name: "Student Name",
          batch: "May 2026",
          quote: "Great session.",
          rating: 5,
        },
      ],
    },

    // ---- videoTestimonials: Bunny-hosted video carousel -------------------------
    {
      type: "videoTestimonials",
      id: "video-testimonials",
      eyebrow: "Watch",
      title: "Student stories",
      sub: "Optional supporting copy.",
      // videos: array of Bunny video ids (string) or { id | videoId | src | url, poster | thumbnail }
      // (alias: videoIds: ["id1", "id2"])
      videos: ["00000000-0000-0000-0000-000000000000"],
      // bunnyBaseUrl / cdnBaseUrl: optional override of the Bunny CDN base URL
    },

    // ---- gallery: responsive image grid ------------------------------------------
    {
      type: "gallery",
      id: "gallery",
      eyebrow: "Moments",
      title: "From past sessions",
      sub: "Optional supporting copy.",
      // images (alias: items): path string or { src | image, alt, caption }
      images: ["/lp/template/g1.jpg", { src: "/lp/template/g2.jpg", alt: "Alt text", caption: "Caption" }],
    },

    // ---- faq: accordion --------------------------------------------------------
    {
      type: "faq",
      id: "faq",
      eyebrow: "Questions",
      title: "FAQ",
      sub: "Optional supporting copy.",
      items: [{ q: "Is it free?", a: "No, it costs ₹199." }],
    },

    // ---- finalCta: closing banner ------------------------------------------------
    {
      type: "finalCta",
      id: "final-cta",
      eyebrow: "Last call",
      title: "Seats are filling fast",
      sub: "Optional supporting copy.",
      cta: "Reserve my seat", // string or { label, disabled }
      note: "Small print under the button.",
    },

    // ---- footer: brand, links, contact, legal ------------------------------------
    {
      type: "footer",
      id: "footer",
      logo: "/logo.png",
      logoAlt: "FOCAS Edu",
      brand: "FOCAS Edu",
      product: "Masterclass",
      tagline: "Short brand line.",
      linksHeading: "Quick links",
      links: [{ label: "Agenda", target: "agenda" }, { label: "Website", href: "https://focasedu.com" }], // { label, target | id | href }
      contactHeading: "Contact",
      // contact (alias: contacts): array of { icon, label, href } (or one object)
      contact: [{ icon: "📞", label: "+91 90000 00000", href: "tel:+919000000000" }],
      copyright: "© 2026 FOCAS Edu. All rights reserved.",
      legalLinks: [{ label: "Privacy Policy", href: "/privacy-policy" }],
    },

    // ---- custom: NOT for generated pages -----------------------------------------
    // Human-authored escape hatch (lazy-loads a one-off React component). The
    // new-landing-page skill must never emit it.
    // { type: "custom", id: "x", component: () => import("./custom/X.jsx"), props: {} },
  ],

  // --- lead form (modal opened by every CTA) ----------------------------------
  form: {
    // Fields, in order. Each entry is a name or an override object.
    // Names: name, phone, email, caStatus, attempt, language, city, state, address
    //   - state + city are dependent selects (city follows the chosen state)
    //   - address is a 5-part block (line1, line2, city, state, pincode)
    // Override keys: { field, key?, label?, options?, required? }
    //   key      = property name in the backend payload (default: the field name)
    //   options  = turns a text field into a select
    //   required = default true
    fields: [
      "name",
      "phone",
      "email",
      "caStatus",
      { field: "attempt", label: "Which attempt?", required: false },
      { field: "language", options: ["English", "Tamil"] },
      "state",
      "city",
      "address",
    ],

    // Form copy (all optional)
    badge: "Get Started",
    title: "Register now",
    subtitle: "Takes only 2 minutes to register.",
    cta: "Submit", // submit button label
    waitlistTitle: "Join the waitlist", // after expiry
    waitlistMessage: "Leave your details and we'll reach out when registrations reopen.",

    // Submit: pick ONE kind. `source` is the lead-source name stored on the lead
    // (a variant appends " - <suffix>"; a waitlist signup appends " - WAITLIST").
    //
    // 1) zoho - free pages: form-encoded post to the Zoho flow, then success page.
    submit: { kind: "zoho", source: "template-page" },
    //
    // 2) leadServer - JSON POST to the lead server (default base VITE_COUNSELING_API,
    //    or the env var named in `backend`) + `endpoint`; then success page.
    // submit: { kind: "leadServer", source: "template-page", endpoint: "/api/leads", backend: "VITE_COUNSELING_API" },
    //
    // 3) razorpay - paid pages: `register` creates the order, Razorpay checkout runs,
    //    `verify` confirms it, then success page. amount is in rupees (> 0).
    // submit: {
    //   kind: "razorpay",
    //   source: "template-page",
    //   amount: 199,
    //   register: "/api/template/register",
    //   verify: "/api/template/verify",
    //   backend: "VITE_BACKEND_URL", // env var holding the base URL (default VITE_BACKEND_URL)
    //   description: "Template masterclass", // shown in checkout
    //   themeColor: "#1D9E75", // checkout accent
    // },

    // Analytics names (optional). Pixel Lead and the dashboard lead always fire.
    events: { pixelName: "Template Masterclass", ga: "template_lead" },
  },

  // --- thank-you page (/<slug>-success) ----------------------------------------
  success: {
    heading: "You're in!", // required
    message: "We've received your registration.",
    steps: [
      // string, or { title, text, icon }
      "Check WhatsApp for the joining link.",
      { title: "Join on time", text: "The class starts at 7 PM.", icon: "⏰" },
    ],
    // whatsappGroup: URL string, or { url, label }
    whatsappGroup: { url: "https://chat.whatsapp.com/XXXXXXXX", label: "Join the WhatsApp group" },
  },

  // --- expiry (optional; afterExpiry is REQUIRED when expiresAt is set) ---------
  expiresAt: "2026-11-30T23:59:00+05:30", // ISO date with offset
  // waitlist: page keeps only the hero + a closed notice; the form becomes a waitlist signup.
  afterExpiry: {
    mode: "waitlist",
    message: "Registrations for this batch are closed. Join the waitlist.",
    cta: "Join the waitlist",
  },
  // redirect alternative (relative path or absolute URL):
  // afterExpiry: { mode: "redirect", redirectTo: "/manual" },

  // --- ad-angle variants: /<slug>?v=<name> --------------------------------------
  // A variant may override ONLY `hero` (deep-merged over every hero section) and
  // `sourceSuffix` (lead source becomes "<source> - <suffix>"; default: the name).
  // The choice is remembered for the session, so the success page matches.
  variants: {
    parents: {
      hero: {
        headline: "Help your child crack CA Final",
        highlight: "crack CA Final",
        sub: "Variant-specific supporting copy.",
      },
      sourceSuffix: "parents",
    },
  },
};
