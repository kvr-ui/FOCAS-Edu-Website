import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Users } from "lucide-react";
import logo from "../../public/focas.jpeg";

const StickyCTA = () => {
    const [isCounselingOpen, setIsCounselingOpen] = useState(false);
    return (<>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 1, ease: "easeOut" }} className="fixed bottom-0 left-0 right-0 z-50 bg-transparent border-t border-emerald-900/30 shadow-2xl backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6">

            {/* Left Side: Avatar + Text */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 w-full sm:w-auto">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-[2.5px] sm:border-[3px] border-emerald-500"/>
                <div className="absolute inset-[3px] sm:inset-[4px] rounded-full bg-[#0a4743] overflow-hidden">
                  <img src={logo} alt="Mentor" className="w-full h-full object-cover"/>
                </div>
              </div>
              <div className="text-white flex-1 sm:flex-initial">
                <p className="font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-0.5 leading-tight">
                  1,000+ students already learning.
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-400 leading-tight">
                  Still Confused? Request a call back
                </p>
              </div>
            </div>

            <motion.button onClick={() => {
                setIsCounselingOpen(true);
                if (typeof window.gtag === 'function') {
                  window.gtag('event', 'counseling_form_open', {
                    event_category: 'engagement',
                    event_label: 'Sticky CTA - Book 1 on 1 Counseling Session',
                  });
                }
              }} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 text-sm sm:text-base md:text-lg shadow-lg shadow-emerald-500/20 transition-all duration-300 whitespace-nowrap" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              Book 1 on 1 Counseling Session
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Counseling Form Modal */}
      {isCounselingOpen && (<div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-3 sm:p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 rounded-2xl w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto relative">
            <div className="p-5 sm:p-6 md:p-8">
              <button onClick={() => setIsCounselingOpen(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10" aria-label="Close">
                <X className="w-5 h-5 text-gray-600"/>
              </button>

              <div className="text-center mb-5 sm:mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white"/>
                </motion.div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-sora text-gray-900 mb-1 sm:mb-2">
                  Enter Details
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Book your 1-on-1 counseling session
                </p>
              </div>

              {/* Bigin Form */}
            <div className="w-full h-[600px] mt-4 bg-transparent rounded-xl overflow-hidden">
                <iframe
                  srcDoc={"<!DOCTYPE html>\n<html>\n<head>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<style>\nbody, html { margin: 0; padding: 0; height: 100%; width: 100%; background: transparent; }\n::-webkit-scrollbar { width: 8px; }\n::-webkit-scrollbar-track { background: transparent; }\n::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }\n</style>\n</head>\n<body>\n<script id='formScript1190292000000478002' src='https://in.bigin.online/org60068257282/forms/book-your-1on1-counseling-session?script=$sYG'></script>\n</body>\n</html>"}
                  style={{ width: '100%', height: '100%', border: 'none', minHeight: '600px' }}
                  title="Book Counseling Session"
                />
              </div>
            </div>
          </motion.div>
        </div>)}
    </>);
};
export default StickyCTA;
