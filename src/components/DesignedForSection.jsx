import React from "react";
import { motion } from "framer-motion";
const audiences = [
    {
        title: "Second-Time Repeaters",
        description: "Break the attempts cycle with personal attention. 1 tutor for 10 students identifies your specific gaps and fixes them with the proven Last Attempt system.",
        position: "left",
    },
    {
        title: "College-Going Students",
        description: "Balance college and CA seamlessly. Live classes from 6AM-10PM, bilingual teaching (Tamil + English), and online flexibility fit your student schedule perfectly.",
        position: "right",
    },
    {
        title: "Working Professionals",
        description: "Prepare while working. Flexible 6AM-10PM timings, efficient 1:10 personal tutoring, and strategic focus maximize your limited study hours for success.",
        position: "left",
    },
    /*  {
       title: "Job Seekers",
       description: "Build strong fundamentals, projects, and portfolio to confidently start your career journey.",
       position: "right",
     }, */
];
const DesignedForSection = () => {
    return (<section className="relative  md:py-20 lg:py-24  bg-[#031614] overflow-hidden">
      {/*  <section className="relative py-16 md:py-20 lg:py-24 px-4 bg-[#031614] overflow-hidden"> */}
      <div className="container mx-auto max-w-6xl">
        {/* Title */}
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-2xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16 md:mb-20">
          FOCAS is Designed For
        </motion.h2>

        {/* Timeline Layout */}
        <div className="relative">
          {/* Desktop Central Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/20 -translate-x-1/2"/>

          {/* Mobile Left Timeline Line */}
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-[2px] bg-white/20"/>

          {audiences.map((audience, index) => (<motion.div key={audience.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: [0.25, 0.1, 0.25, 1]
            }} className={`relative flex items-start md:items-center mb-12 md:mb-16 last:mb-0 ${audience.position === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
              {/* Mobile Dot (Left Side) */}
              <motion.div className="flex md:hidden flex-shrink-0 w-8 h-8 rounded-full bg-white border-4 border-[#031614] mr-4 mt-2" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{
                duration: 0.4,
                delay: index * 0.2 + 0.2,
                type: "spring",
                stiffness: 300,
                damping: 20
            }}/>

              {/* Card Container */}
              <div className={`flex-1 ${audience.position === "left"
                ? "md:pr-12 md:flex md:justify-end"
                : "md:pl-12 md:flex md:justify-start"}`}>
                <motion.div className="w-full md:max-w-md bg-[#0a4743] rounded-3xl p-6 md:p-8 shadow-2xl border border-emerald-900/20" whileHover={{
                scale: 1.03,
                boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
            }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {audience.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                    {audience.description}
                  </p>
                </motion.div>
              </div>

              {/* Desktop Timeline Dot (Center) */}
              <motion.div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg z-10" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{
                duration: 0.4,
                delay: index * 0.2 + 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20
            }}/>

              {/* Empty Space for Desktop Alternating Layout */}
              <div className="flex-1 hidden md:block"/>
            </motion.div>))}
        </div>
      </div>
    </section>);
};
export default DesignedForSection;
