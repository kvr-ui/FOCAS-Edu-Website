import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
const faqs = [
    {
        question: "What are Faculty Sessions?",
        answer: "Faculty sessions are conceptual lectures designed to help you understand the subject thoroughly. At FOCAS, all faculty lectures are pre-recorded and structured for maximum clarity.",
    },
    {
        question: "What is a Tutor Session?",
        answer: "Tutor sessions are live sessions focused on accountability and completion. Each student is part of a small group (maximum of 10 students) guided by a dedicated tutor who ensures progress and clarity.",
    },
    {
        question: "What are the Tutor Session Timings?",
        answer: "Tutor sessions are conducted in 4 daily slots: 6 AM – 9 AM, 10 AM – 1 PM, 2 PM – 5 PM, 7 PM – 10 PM",
    },
    {
        question: "What Language Are the Classes In?",
        answer: "Classes are conducted in both English and Tamil to ensure ease of understanding.",
    },
    {
        question: "Which Attempt Is This Batch Meant For?",
        answer: "Our batches are exam-oriented and ideal for the targeted attempt and subsequent ones. For example: If the batch is designed for May 2026, students appearing in Jan 2026 can also enroll and benefit.",
    },
    {
        question: "Who Will Be Teaching and Guiding Me?",
        answer: "You'll learn from a team of 25+ qualified professionals handling the faculty lectures and 15+ dedicated tutors guiding you through daily sessions and progress tracking.",
    },
    {
        question: "Can I Purchase Only the Tutor Sessions Separately?",
        answer: "No, tutor sessions cannot be purchased separately. At FOCAS, every subject is offered as a combined package—faculty lectures followed by tutor sessions. The tutor sessions are structured to complement the faculty lectures, ensuring complete understanding and consistent follow-through.",
    },
];
const FAQSection = () => {
    return (<section className="md:py-20 lg:py-24 pb-60 sm:pb-64 md:pb-52 lg:pb-56 bg-[#031614]">
      <div className="container mx-auto max-w-4xl">
        {/* Title */}
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-3">
          Frequently Asked Questions
        </motion.h2>
        
        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="text-center text-gray-400 text-base md:text-lg mb-12 md:mb-16">
          Answers to common questions about our FOCAS
        </motion.p>

        {/* FAQ Accordion */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (<motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: index * 0.05 }} className={index === faqs.length - 1 ? "mb-8" : ""}>
                <AccordionItem value={`item-${index}`} className="bg-[#0a4743]/50 backdrop-blur-sm border border-emerald-900/20 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[#0a4743]/70 hover:border-emerald-800/30">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline text-left font-semibold text-base md:text-lg text-white data-[state=open]:text-emerald-400 transition-colors duration-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 pt-1 text-gray-300 text-sm md:text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>))}
          </Accordion>
        </motion.div>
      </div>
    </section>);
};
export default FAQSection;
