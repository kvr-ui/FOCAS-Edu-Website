import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
const beforeItems = [
    "Attempting CA Inter again and again",
    "Buried in 200+ student lecture halls",
    "Complex topics like Costing/Law still confusing",
    "No one tracking my progress or weak areas",
    "Unstructured preparation, missing key topics",
    "Freezing up during exams",
    "One-size-fits-all teaching doesn't work for me",
    "Running out of time and motivation"
];
const afterItems = [
    "Making this my last attempt with proven system",
    "One of just 10 students—tutor knows my name",
    "Complex subjects broken down with clarity",
    "Personal mentor tracking every step",
    "Question Banks + Tests + Marathons cover everything",
    "Scoring 60+ with exam strategies that work",
    "Personalized attention fixes my weak spots",
    "Flexible timings keep me consistent and motivated"
];
const BeforeAfterSection = () => {
    return (<section className="py-20 px-2 sm:px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="section-title mb-12">
          See How FOCAS Transforms CA Journeys
          <br className="hidden md:block"/>
          
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {/* Before Card */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="before-card">
            <div className="bg-destructive/15 px-5 py-4 flex items-center gap-2.5">
              <span className="text-xl">😟</span>
              <h3 className="font-bold font-sora text-foreground text-sm">Before FOCAS</h3>
            </div>
            <div className="p-5 space-y-3.5">
              {beforeItems.map((item, index) => (<motion.div key={index} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-white"/>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                </motion.div>))}
            </div>
          </motion.div>

          {/* After Card */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} className="after-card">
            <div className="bg-primary/15 px-5 py-4 flex items-center gap-2.5">
              <span className="text-xl">😊</span>
              <h3 className="font-bold font-sora text-foreground text-sm">After FOCAS</h3>
            </div>
            <div className="p-5 space-y-3.5">
              {afterItems.map((item, index) => (<motion.div key={index} initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white"/>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                </motion.div>))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>);
};
export default BeforeAfterSection;
