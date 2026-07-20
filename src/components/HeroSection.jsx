import { Play, X, Users, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay, } from "@/components/ui/dialog";
import CounselingForm from "@/components/CounselingForm";
import thumnail from "../../public/thumnail.jpeg";
const HeroSection = () => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isCounselingOpen, setIsCounselingOpen] = useState(false);
    const availableSeats = 8; // Change this number dynamically
    const totalSeats = 20;
    return (<>
      <section className="pt-24 pb-12">
        <div className="container mx-auto max-w-7xl">
          {/* Enhanced Badge with Animation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex justify-center mb-4 sm:mb-6">
            <motion.div className="relative mt-16 sm:mt-6" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              {/* Animated Background Glow */}
              <motion.div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-full blur-xl" animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
        }} transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        }}/>
              
              {/* Main Badge */}
              <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full shadow-lg border-2 border-red-400/50">
                <div className="flex items-center gap-3">
                  {/* Pulsing Dot */}
                  <motion.div className="relative" animate={{
            scale: [1, 1.2, 1],
        }} transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
        }}>
                    <div className="w-2 h-2 bg-white rounded-full"/>
                    <motion.div className="absolute inset-0 bg-white rounded-full" animate={{
            scale: [1, 2.5],
            opacity: [0.8, 0],
        }} transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
        }}/>
                  </motion.div>

                  {/* Badge Text */}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4"/>
                    <span className="font-bold text-sm sm:text-base">
                      Only {availableSeats}/{totalSeats} Seats Left
                    </span>
                    <Zap className="w-4 h-4 animate-pulse"/>
                  </div>
                </div>

                {/* Urgency Indicator */}
                <motion.div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <div className="flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <Clock className="w-3 h-3"/>
                    <span>Filling Fast!</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Title - Fully Responsive */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} className="text-center mb-3 sm:mb-10 md:mb-12 mt-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold font-sora leading-tight tracking-tight px-2 pt-5">
              1 Tutor for Every 10 Students
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-4xl font-bold font-sora mt-2 sm:mt-3 px-2">
              <span className="text-primary tracking-wide">FOCAS</span>{" "}
              <span className="text-foreground">Personalised Classes for Sept 2026!</span>
            </p>
          </motion.div>

          {/* Content Grid - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start">
            
            {/* Video Card - Clean Thumbnail */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border cursor-pointer group shadow-lg hover:shadow-xl transition-shadow" onClick={() => setIsVideoOpen(true)}>
              {/* Video Thumbnail */}
              <div className="relative aspect-video">
                <img src={thumnail} alt="Course preview" className="absolute inset-0 h-full w-full object-cover"/>
                
                {/* Play Button with hover effect */}
                <motion.div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.button className="play-button z-20 group-hover:scale-110 transition-transform ml-32 mt-20" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }} aria-label="Play video">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white ml-0.5" fill="currentColor"/>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>

            {/* Info Cards Grid */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }} className="space-y-3 sm:space-y-4">
              {/* Row 1: Mode & Study Method */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <motion.div className="info-card p-3 sm:p-4 md:p-5" whileHover={{ scale: 1.02, borderColor: "hsl(163 82% 32% / 0.5)" }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <p className="text-muted-foreground text-[10px] xs:text-xs mb-1 sm:mb-1.5">Mode</p>
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-sora text-foreground leading-tight">
                    Online Live
                  </p>
                </motion.div>
                
                <motion.div className="info-card p-3 sm:p-4 md:p-5" whileHover={{ scale: 1.02, borderColor: "hsl(163 82% 32% / 0.5)" }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <p className="text-muted-foreground text-[10px] xs:text-xs mb-1 sm:mb-1.5">Study Method</p>
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-sora text-primary leading-tight">
                    Study with Tutor
                  </p>
                </motion.div>
              </div>
              
              {/* Row 2: Timings & Language */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <motion.div className="info-card p-3 sm:p-4 md:p-5" whileHover={{ scale: 1.02, borderColor: "hsl(163 82% 32% / 0.5)" }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <p className="text-muted-foreground text-[10px] xs:text-xs mb-1 sm:mb-1.5">Flexible Timings</p>
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-sora text-foreground leading-tight">
                    6AM-10PM
                  </p>
                </motion.div>
                
                <motion.div className="info-card p-3 sm:p-4 md:p-5" whileHover={{ scale: 1.02, borderColor: "hsl(163 82% 32% / 0.5)" }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <p className="text-muted-foreground text-[10px] xs:text-xs mb-1 sm:mb-1.5">Language</p>
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-sora text-foreground leading-tight">
                    English & தமிழ்
                  </p>
                </motion.div>
              </div>

              {/* CTA Button - Fully Responsive */}
             <motion.button className="w-full gradient-teal-button text-sm sm:text-base md:text-lg py-3 sm:py-3.5 md:py-4 mt-2 sm:mt-3 px-4 rounded-xl font-semibold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} onClick={() => {
                  setIsCounselingOpen(true);
                  if (typeof window.gtag === 'function') {
                    window.gtag('event', 'counseling_form_open', {
                      event_category: 'engagement',
                      event_label: 'Book 1 on 1 Counseling Session',
                    });
                  }
                }}>
                Book 1 on 1 Counseling Session
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Modal - Responsive */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 bg-black border-none overflow-hidden z-[100]">
          <div className="relative aspect-video w-full">
            <video src="https://da3m0k666tznr.cloudfront.net/audit/audit.mp4" className="w-full h-full" controls autoPlay playsInline/>
          </div>
        </DialogContent>
      </Dialog>

      {/* Counseling Form Modal */}
      <Dialog open={isCounselingOpen} onOpenChange={setIsCounselingOpen}>
        <DialogOverlay className="z-[100] bg-black/60"/>
        <DialogContent className="max-w-[95vw] sm:max-w-lg p-0 overflow-hidden z-[101] border-none max-h-[90vh] overflow-y-auto rounded-2xl">
          <div className="bg-gradient-to-br from-teal-50 via-white to-primary/5 p-6 sm:p-8 relative">
            {/* Close Button */}
            <button onClick={() => setIsCounselingOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10" aria-label="Close">
              <X className="w-5 h-5 text-gray-600"/>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-16 h-16 bg-gradient-to-br from-primary to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white"/>
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold font-sora text-gray-900 mb-2">
                Enter Details
              </h2>
              <p className="text-sm text-gray-600">
                Book your 1-on-1 counseling session
              </p>
            </div>

            {/* Counseling Form (native Bigin replica) */}
            <div className="w-full bg-transparent rounded-xl overflow-hidden">
              <CounselingForm />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>);
};
export default HeroSection;
