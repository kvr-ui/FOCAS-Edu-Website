import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check } from "lucide-react";
const images = [
    {src:"https://da3m0k666tznr.cloudfront.net/images/certificate/Mathumetha.jpeg"},
    {src:"https://da3m0k666tznr.cloudfront.net/images/certificate/Gowtham.jpeg"},
    {src:"https://da3m0k666tznr.cloudfront.net/images/certificate/kavitha.jpeg"},
    {src:"https://da3m0k666tznr.cloudfront.net/images/certificate/ManjunathMarksheet.jpeg"},
    {src:"https://da3m0k666tznr.cloudfront.net/images/certificate/Mathumetha.jpeg"},
    
];
const SWIPE_THRESHOLD = 120;
const CertificateSection = () => {
    // animationKey never repeats → no freeze
    const [[animationKey, index], setState] = useState([0, 0]);
    const total = images.length;
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-120px" });
    const hasAutoPlayedRef = useRef(false);
    const current = images[((index % total) + total) % total];
    const next = images[((index + 1) % total + total) % total];
    const paginate = (dir) => {
        setState(([key, idx]) => [key + 1, idx + dir]);
    };
    /* ================= AUTO MOVE (ONLY WHEN VIEWED, ONLY ONCE) ================= */
    useEffect(() => {
        if (!isInView || hasAutoPlayedRef.current)
            return;
        hasAutoPlayedRef.current = true;
        const t1 = setTimeout(() => paginate(1), 700);
        const t2 = setTimeout(() => paginate(1), 1400);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isInView]);
    /* ================= DESKTOP CLICK TO NEXT ================= */
    const handleDesktopClick = () => {
        if (window.matchMedia("(hover: hover)").matches) {
            paginate(1);
        }
    };
    return (<section ref={sectionRef} className="py-8 sm:py-16 px-3 sm:px-4">
      <div className="container mx-auto max-w-6xl">

        {/* SECTION TITLE */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sora leading-tight">
            From Dream to{" "}
            <span className="text-coral">Reality</span>
          </h2>
        </motion.div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">

          {/* ================= SWIPE / CLICK IMAGE ================= */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} className="order-1 lg:order-2 flex justify-center">
            <div className="
                relative overflow-hidden
                w-[300px] h-[360px]
                md:w-[360px] md:h-[440px]
                lg:w-[420px] lg:h-[520px]
                bg-white rounded-2xl shadow-xl
              " onClick={handleDesktopClick}>
              {/* Background Card */}
              <div className="absolute inset-0 scale-95 translate-y-3 opacity-60">
                <img src={next.src} className="w-full h-full object-contain p-3" draggable={false}/>
              </div>

              <AnimatePresence initial={false}>
                <motion.div key={animationKey} className="absolute inset-0 cursor-grab active:cursor-grabbing bg-white" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.7} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{
            x: 380,
            rotate: 15,
            opacity: 0,
        }} transition={{
            type: "spring",
            stiffness: 260,
            damping: 30,
        }} onDragEnd={(e, { offset }) => {
            if (offset.x > SWIPE_THRESHOLD)
                paginate(1);
            else if (offset.x < -SWIPE_THRESHOLD)
                paginate(-1);
        }}>
                  <div className="w-full h-full flex items-center justify-center p-3">
                    <img src={current.src} className="w-full h-full object-contain rounded-xl" draggable={false}/>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ================= TEXT CONTENT (UNCHANGED) ================= */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* BENEFIT 1 */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }} className="flex items-start gap-3 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-muted-foreground">
                <span className="text-foreground font-bold">
                  Personal Tutoring That Works:
                </span>{" "}
                1 tutor for just 10 students means your doubts get solved, not ignored.
              </p>
            </motion.div>

            {/* BENEFIT 2 */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }} className="flex items-start gap-3 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-muted-foreground">
                <span className="text-foreground font-bold">
                  Complete Last Attempt System:
                </span>{" "}
                Question Banks, Mentor-Reviewed Tests, Strategic Planner & Marathons — nothing left to chance.
              </p>
            </motion.div>

            {/* BENEFIT 3 */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }} className="flex items-start gap-3 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-muted-foreground">
                <span className="text-foreground font-bold">
                  Accountability + Flexibility:
                </span>{" "}
                Daily mentorship keeps you consistent while 6AM–10PM timings fit your schedule.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>);
};
export default CertificateSection;
