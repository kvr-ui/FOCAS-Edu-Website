import React from "react";
import { FaYoutube, FaLinkedin, FaWhatsapp } from "react-icons/fa6";
// Mock logo - replace with your actual logo import
const logo = "/logoblack.png";
const Footer = () => {
    React.useEffect(() => {
        // Simple fade-in animation without GSAP dependency
        const footerItems = document.querySelectorAll(".footer-item");
        footerItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            }, index * 200);
        });
    }, []);
    return (<footer className="bg-black text-white pt-16 pb-10 relative md:mt-[13rem] mt-[5rem]">
      {/* Centered Blue Box */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[85%] md:w-[80%] border border-black rounded-lg bg-blue-500 overflow-hidden
        -top-[80px] h-[200px]
        xs:-top-[90px] xs:h-[210px]
        sm:-top-[100px] sm:h-[220px]
        md:-top-[120px] md:h-[240px]
        lg:-top-[140px] lg:h-[260px]
        xl:-top-[150px] xl:h-[280px]
        2xl:-top-[160px] 2xl:h-[300px]">
        {/* Zigzag Grid Background for Blue Box */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg width="100%" height="100%" className="w-full h-full">
            <defs>
              <pattern id="zigzag-grid-footer" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                {/* Vertical lines */}
                <line x1="0" y1="0" x2="0" y2="30" stroke="white" strokeWidth="0.5"/>
                <line x1="15" y1="0" x2="15" y2="30" stroke="white" strokeWidth="0.5"/>
                <line x1="30" y1="0" x2="30" y2="30" stroke="white" strokeWidth="0.5"/>

                {/* Horizontal lines */}
                <line x1="0" y1="0" x2="30" y2="0" stroke="white" strokeWidth="0.5"/>
                <line x1="0" y1="15" x2="30" y2="15" stroke="white" strokeWidth="0.5"/>
                <line x1="0" y1="30" x2="30" y2="30" stroke="white" strokeWidth="0.5"/>

                {/* Zigzag diagonal lines */}
                <path d="M0,0 L7.5,7.5 L15,0 L22.5,7.5 L30,0" stroke="white" strokeWidth="0.5" fill="none"/>
                <path d="M0,15 L7.5,22.5 L15,15 L22.5,22.5 L30,15" stroke="white" strokeWidth="0.5" fill="none"/>
                <path d="M0,30 L7.5,22.5 L15,30 L22.5,22.5 L30,30" stroke="white" strokeWidth="0.5" fill="none"/>

                {/* Reverse zigzag */}
                <path d="M0,7.5 L7.5,0 L15,7.5 L22.5,0 L30,7.5" stroke="white" strokeWidth="0.5" fill="none"/>
                <path d="M0,22.5 L7.5,15 L15,22.5 L22.5,15 L30,22.5" stroke="white" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#zigzag-grid-footer)"/>
          </svg>
        </div>

        {/* Content inside the blue box - responsive flex container */}
        <div className="relative z-10 flex items-center h-full text-white px-4 sm:px-6 lg:px-10">
          {/* Left: Text content - centered on mobile/tablet, left-aligned on desktop */}
          <div className="flex-grow text-center lg:text-left w-full lg:w-[60%]">
            <h2 className="font-extrabold text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 leading-tight">
              Learn Like Never Before
            </h2>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg opacity-90 mb-4 sm:mb-6 max-w-xl mx-auto lg:mx-0">
              Engaging video classes by top Faculty for CA / ACCA / CMA / CS /
              CFA
            </p>
            <button className="bg-white text-blue-600 font-semibold rounded-full px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm md:text-base hover:bg-gray-100 transition" type="button">
              Enroll in Free Course
            </button>
          </div>

          {/* Right: Person image - Hidden on tablet (md), visible on desktop (lg+) */}
          <div className="flex-shrink-0 w-[40%] pr-0 hidden lg:block">
            <img src="/footer.png" alt="Happy student" className="w-full h-auto object-contain" draggable={false}/>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Enhanced Responsive Layout */}
      <div className="container w-[80%] mx-auto pt-20 sm:pt-24 md:pt-28">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
          {/* Logo and Description */}
          <div className="flex-1 lg:min-w-[250px] lg:max-w-[400px] mb-4 lg:mb-0">
            <img src={logo} alt="FOCAS Logo" className="h-[40px] sm:h-[50px] mb-4"/>
            <p className="text-sm footer-item mb-2 opacity-0 transform translate-y-4 transition-all duration-500">
              Your last attempt
            </p>
            <p className="text-sm footer-item opacity-0 transform translate-y-4 transition-all duration-500 leading-relaxed">
              Providing CA students with precise, high-quality question banks
              and reviewers. Dedicated to spreading knowledge and supporting
              your success.
            </p>
          </div>

          {/* Links Section - Enhanced Grid Layout */}
          <div className="flex-1 lg:flex-none">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8 footer-item opacity-0 transform translate-y-4 transition-all duration-500">
              <div className="min-w-0">
                <h4 className="text-sm sm:text-md font-medium mb-3 text-white">
                  Links
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#home" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#courses" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      Courses
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="tel:+916383514285" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              <div className="min-w-0">
                <h4 className="text-sm sm:text-md font-medium mb-3 text-white">
                  Courses
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#courses" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      CA Inter Audit
                    </a>
                  </li>
                  <li>
                    <a href="#courses" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      ACCA - L1
                    </a>
                  </li>
                  <li>
                    <a href="#courses" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      CA Final
                    </a>
                  </li>
                  <li>
                    <a href="#courses" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      CA Foundation
                    </a>
                  </li>
                </ul>
              </div>

              <div className="min-w-0">
                <h4 className="text-sm sm:text-md font-medium mb-3 text-white">
                  Company
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/pdf/Privacy Policy of Focas Edu.docx.pdf" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/pdf/Terms and Condition of Focas Edu.docx.pdf" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block" target="_blank" rel="noopener noreferrer">
                      Terms of Use
                    </a>
                  </li>
                 {/*  <li>
                    <a href="#" className="text-xs sm:text-sm hover:text-gray-300 transition-colors block">
                      Refund Policy
                    </a>
                  </li> */}
                </ul>
              </div>

              <div className="min-w-0">
                <h4 className="text-sm sm:text-md font-medium mb-3 text-white">
                  Follow Us
                </h4>
                <div className="space-y-2">
                  <div>
                    <a href="https://wa.me/916383514285" className="text-xs sm:text-sm hover:text-gray-300 transition-colors flex items-center gap-2">
                      <FaWhatsapp className="flex-shrink-0"/>
                      <span className="truncate">WhatsApp</span>
                    </a>
                  </div>
                  <div>
                    <a href="https://www.linkedin.com/company/focasedu" className="text-xs sm:text-sm hover:text-gray-300 transition-colors flex items-center gap-2">
                      <FaLinkedin className="flex-shrink-0"/>
                      <span className="truncate">LinkedIn</span>
                    </a>
                  </div>
                  <div>
                    <a href="https://youtube.com/@focasedu?si=wnyUdMYnN43Jw9xM" className="text-xs sm:text-sm hover:text-gray-300 transition-colors flex gap-2 items-center">
                      <FaYoutube className="flex-shrink-0"/>
                      <span className="truncate">YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - Enhanced Responsive */}
        <div className="text-center mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-700">
          <p className="text-xs sm:text-sm footer-item opacity-0 transform translate-y-4 transition-all duration-500">
            Copyright Focus 2026 @ all rights reserved
          </p>
        </div>
      </div>
    </footer>);
};
export default Footer;
