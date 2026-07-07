import { useState, useEffect } from "react";
const sections = [
    {
        id: 1,
        title: "Personalized Sales Outreach with AI",
        subtitle: "REACH PROSPECTS WITH RELEVANCE",
        points: [
            "Generate up to 3000 leads research and mail content monthly with AI-enhanced targeting for better lead quality.",
            "Scrape and personalize data from Websites, events, and more for tailored, effective messaging.",
            "Prioritize top-performing campaigns to maximize conversion rates.",
        ],
        image: "/sales-video-placeholder.png", // Replace with your actual image or video thumbnail
        navLabel: "Personalized Sales",
    },
    {
        id: 2,
        title: "Automated Outreach",
        subtitle: "STREAMLINE YOUR COMMUNICATION",
        points: [
            "Automate email sequences with intelligent follow-up scheduling.",
            "Customize templates based on prospect behavior and engagement.",
            "Scale your outreach without sacrificing personalization.",
        ],
        image: "/automated-outreach.png",
        navLabel: "Automated Outreach",
    },
    {
        id: 3,
        title: "Real-Time Campaign Analytics",
        subtitle: "TRACK EMAIL OUTREACH PERFORMANCE WITH OPTIMIZED INSIGHTS",
        points: [
            "Monitor monthly campaigns created with live metrics for effective lead tracking.",
            "Analyze emails sent to prospects with actionable, real-time reporting.",
            "Evaluate reply rate instantly to improve email marketing conversion and campaign success.",
        ],
        image: "/analytics-dashboard.png",
        navLabel: "Real-Time Analytics",
    },
];
export default function SalesOutreachUI() {
    const [activeSection, setActiveSection] = useState(0);
    const [direction, setDirection] = useState("right");
    const handleNavigation = (index) => {
        setDirection(index > activeSection ? "right" : "left");
        setActiveSection(index);
    };
    useEffect(() => {
        const timer = setInterval(() => {
            setDirection("right");
            setActiveSection((prev) => (prev + 1) % sections.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    return (<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:px-16 bg-white">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text */}
          <div key={`content-${activeSection}`} className={`hidden md:block transition-all duration-700 ${direction === "right"
            ? "animate-slideInLeft"
            : "animate-slideInRight"}`}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {sections[activeSection].title}
            </h1>
            <h2 className="text-[#0f0098] font-semibold tracking-wide text-lg mt-4">
              {sections[activeSection].subtitle}
            </h2>

            <ul className="mt-6 space-y-4">
              {sections[activeSection].points.map((point, idx) => (<li key={idx} className="flex items-start text-gray-700 text-base md:text-lg leading-relaxed" style={{
                animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
            }}>
                  <span className="w-2 h-2 bg-[#0f0098] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {point}
                </li>))}
            </ul>
          </div>

          {/* Right Side - Image/Video */}
          <div className="relative">
            <div key={`image-${activeSection}`} className={`transition-all duration-700 ${direction === "right"
            ? "animate-slideInRight"
            : "animate-slideInLeft"}`}>
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
                {/* Replace this with <video> or <iframe> if needed */}
                <img src={sections[activeSection].image} alt={sections[activeSection].title} className="w-full h-[450px] object-contain bg-gray-50"/>
              </div>
            </div>

          
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-center items-center gap-6 md:gap-10">
            {sections.map((section, index) => (<button key={section.id} onClick={() => handleNavigation(index)} className="relative group">
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-lg md:text-xl font-bold ${activeSection === index
                ? "text-[#0f0098] scale-110"
                : "text-gray-400 group-hover:text-gray-600"}`}>
                    0{section.id}.
                  </span>
                  <span className={`hidden md:block text-sm md:text-base font-semibold ${activeSection === index
                ? "text-gray-900"
                : "text-gray-400 group-hover:text-gray-600"}`}>
                    {section.navLabel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full bg-[#0f0098] rounded-full transition-all duration-500 ${activeSection === index ? "w-full" : "w-0"}`} style={{
                animation: activeSection === index ? "expandWidth 5s linear" : "",
            }}></div>
                </div>
              </button>))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandWidth {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }
      `}</style>
    </div>);
}
