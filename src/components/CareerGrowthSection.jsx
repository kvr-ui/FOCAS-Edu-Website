import { motion } from "framer-motion";
import { useState } from "react";
const careers = [
    {
        title: "Precision Practice (Tutor Sessions)",
        emoji: "🎯",
        icon: (<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>),
        animation: 'target-pulse'
    },
    {
        title: "Concept Mastery (Faculty Recorded Videos)",
        emoji: "🧠",
        icon: (<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>),
        animation: 'brain-glow'
    },
    {
        title: "Deep FOCAS (Revision Marathon)",
        emoji: "🔁",
        icon: (<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>),
        animation: 'spin-cycle'
    },
    {
        title: "Mentor Reviewed Tests",
        emoji: "📝",
        icon: (<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>),
        animation: 'paper-float'
    },
    {
        title: "MCQ Marathon",
        emoji: "⚡",
        icon: (<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>),
        animation: 'lightning-strike'
    },
    {
        title: "FOCAS Planner & Manual",
        emoji: "📘",
        icon: (<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>),
        animation: 'book-flip'
    },
];
const CareerGrowthSection = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    return (<section className="py-20 px-0 relative overflow-hidden">
      <style>{`
        @keyframes target-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes brain-glow {
          0%, 100% { filter: drop-shadow(0 0 3px hsl(163 82% 32%)); }
          50% { filter: drop-shadow(0 0 15px hsl(163 82% 32%)); }
        }
        
        @keyframes paper-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes lightning-strike {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.2) rotate(-5deg); opacity: 0.8; }
          50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
          75% { transform: scale(1.15) rotate(-3deg); opacity: 0.9; }
        }
        
        @keyframes spin-cycle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes book-flip {
          0%, 100% { transform: perspective(400px) rotateY(0deg); }
          50% { transform: perspective(400px) rotateY(10deg); }
        }
        
        .animate-target-pulse { animation: target-pulse 0.6s ease-in-out infinite; }
        .animate-brain-glow { animation: brain-glow 1s ease-in-out infinite; }
        .animate-paper-float { animation: paper-float 1s ease-in-out infinite; }
        .animate-lightning-strike { animation: lightning-strike 0.3s ease-in-out infinite; }
        .animate-spin-cycle { animation: spin-cycle 2s linear infinite; }
        .animate-book-flip { animation: book-flip 1s ease-in-out infinite; }
      `}</style>

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="section-title mb-14">
          Why Join FOCAS to make it 
          <br />
        Your Last Attempt
        
        </motion.h2>

        {/* Career Map Layout */}
        <div className="relative">
          {/* Mobile Grid - 2x3 */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {careers.map((career, index) => (<motion.div key={career.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="career-card flex flex-col items-center text-center group">
                <div className="career-icon w-12 h-12 mb-3 relative overflow-visible">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 scale-150"></div>
                  
                  <div className={`relative w-full h-full flex items-center justify-center ${hoveredIndex === index ? `animate-${career.animation}` : ''}`}>
                    {/* Emoji - always visible */}
                    <span className="absolute text-2xl">
                      {career.emoji}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground whitespace-pre-line leading-tight">{career.title}</p>
              </motion.div>))}
          </div>

          {/* Desktop Grid - 2x3 with salary in center */}
          <div className="hidden md:grid grid-cols-3 gap-5">
            {/* Left Column - First 3 careers */}
            <div className="space-y-4 md:col-span-1">
              {careers.slice(0, 3).map((career, index) => (<motion.div key={career.title} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }} whileHover={{ scale: 1.02, y: -3 }} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="career-card group">
                  <div className="career-icon relative overflow-visible">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 scale-150"></div>
                    
                    <div className={`relative w-full h-full flex items-center justify-center ${hoveredIndex === index ? `animate-${career.animation}` : ''}`}>
                      {/* Emoji - always visible */}
                      <span className="absolute text-xl">
                        {career.emoji}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground whitespace-pre-line leading-tight">{career.title}</p>
                </motion.div>))}
            </div>

            {/* Center Column - Salary Display */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="flex flex-col items-center justify-center text-center py-10">
              <p className="text-muted-foreground text-sm mb-3">Average Score 
    </p>
              <motion.p className="text-5xl lg:text-6xl font-bold font-sora text-primary" initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}>
                50<span>+</span>
              </motion.p>
              <p className="text-xs text-muted-foreground mt-4 max-w-[200px] leading-relaxed">Based on Past Successful FOCAS Students</p>
            </motion.div>

            {/* Right Column - Last 3 careers */}
            <div className="space-y-4 md:col-span-1">
              {careers.slice(3, 6).map((career, index) => {
            const actualIndex = index + 3;
            return (<motion.div key={career.title} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }} whileHover={{ scale: 1.02, y: -3 }} onMouseEnter={() => setHoveredIndex(actualIndex)} onMouseLeave={() => setHoveredIndex(null)} className="career-card group">
                    <div className="career-icon relative overflow-visible">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 scale-150"></div>
                      
                      <div className={`relative w-full h-full flex items-center justify-center ${hoveredIndex === actualIndex ? `animate-${career.animation}` : ''}`}>
                        {/* Emoji - always visible */}
                        <span className="absolute text-xl">
                          {career.emoji}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground whitespace-pre-line leading-tight">{career.title}</p>
                  </motion.div>);
        })}
            </div>
          </div>

          {/* Mobile Salary Display */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="md:hidden flex flex-col items-center justify-center text-center py-10 mt-4">
            <p className="text-muted-foreground text-sm mb-2">Average Score</p>
            <p className="text-4xl font-bold font-sora text-primary">50<span className="">+</span></p>
            <p className="text-xs text-muted-foreground mt-2">Based on Past Successful FOCAS Students</p>
          </motion.div>

          {/* Mountain Graph Decoration */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-10 h-28 relative overflow-hidden">
            <svg viewBox="0 0 800 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(163 82% 32% / 0.35)"/>
                  <stop offset="100%" stopColor="hsl(163 82% 32% / 0)"/>
                </linearGradient>
              </defs>
              <motion.path d="M0 100 L80 75 L160 65 L240 55 L320 45 L400 35 L480 40 L560 25 L640 30 L720 20 L800 25 L800 100 Z" fill="url(#mountainGrad)" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}/>
              <motion.path d="M0 100 L80 75 L160 65 L240 55 L320 45 L400 35 L480 40 L560 25 L640 30 L720 20 L800 25" stroke="hsl(163 82% 32%)" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}/>
              {/* Data points with animation */}
              {[
            { cx: 80, cy: 75, delay: 0.3 },
            { cx: 240, cy: 55, delay: 0.5 },
            { cx: 400, cy: 35, delay: 0.7 },
            { cx: 560, cy: 25, delay: 0.9 },
            { cx: 720, cy: 20, delay: 1.1 },
        ].map((point) => (<motion.circle key={point.cx} cx={point.cx} cy={point.cy} r="5" fill="hsl(163 82% 32%)" initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: point.delay }}/>))}
            </svg>
          </motion.div>
        </div>
      </div>
    </section>);
};
export default CareerGrowthSection;
