import React, { useEffect, useRef } from "react";
const About = () => {
    const aboutRef = useRef(null);
    const scrollRef = useRef(null);
    const statsRef = useRef(null);
    const tutorsRef = useRef(null);
    const titleRef = useRef(null);
    const textRef = useRef(null);
    const shapeRef = useRef(null);
    useEffect(() => {
        // Title animation
        if (titleRef.current) {
            titleRef.current.style.opacity = "0";
            titleRef.current.style.transform = "translateY(50px) scale(0.8)";
            setTimeout(() => {
                if (titleRef.current) {
                    titleRef.current.style.transition = "all 1.2s ease-out";
                    titleRef.current.style.opacity = "1";
                    titleRef.current.style.transform = "translateY(0) scale(1)";
                }
            }, 200);
        }
        // Text animation
        if (textRef.current) {
            textRef.current.style.opacity = "0";
            textRef.current.style.transform = "translateY(30px)";
            setTimeout(() => {
                if (textRef.current) {
                    textRef.current.style.transition = "all 1s ease-out";
                    textRef.current.style.opacity = "1";
                    textRef.current.style.transform = "translateY(0)";
                }
            }, 500);
        }
        // Shape animation
        if (shapeRef.current) {
            shapeRef.current.style.opacity = "0";
            shapeRef.current.style.transform = "translateY(30px) scale(0.5)";
            setTimeout(() => {
                if (shapeRef.current) {
                    shapeRef.current.style.transition = "all 1.2s ease-out";
                    shapeRef.current.style.opacity = "1";
                    shapeRef.current.style.transform = "translateY(0) scale(1)";
                }
            }, 800);
        }
        // Stats animation
        if (statsRef.current) {
            Array.from(statsRef.current.children).forEach((child, index) => {
                if (child instanceof HTMLElement) {
                    child.style.opacity = "0";
                    child.style.transform = "translateY(40px) scale(0.8)";
                    setTimeout(() => {
                        child.style.transition = "all 0.8s ease-out";
                        child.style.opacity = "1";
                        child.style.transform = "translateY(0) scale(1)";
                    }, 1000 + index * 150);
                }
            });
        }
        // Tutors animation
        if (tutorsRef.current) {
            Array.from(tutorsRef.current.children).forEach((child, index) => {
                if (child instanceof HTMLElement) {
                    child.style.opacity = "0";
                    child.style.transform = "translateY(60px)";
                    setTimeout(() => {
                        child.style.transition = "all 0.8s ease-out";
                        child.style.opacity = "1";
                        child.style.transform = "translateY(0)";
                    }, 1500 + index * 200);
                }
            });
        }
        // Floating animation for stats
        if (statsRef.current) {
            const statsNumbers = statsRef.current.querySelectorAll("h2");
            statsNumbers.forEach((element, index) => {
                if (element instanceof HTMLElement) {
                    let direction = 1;
                    let currentY = 0;
                    const float = () => {
                        currentY += direction * 0.1;
                        if (currentY >= 5)
                            direction = -1;
                        if (currentY <= -5)
                            direction = 1;
                        element.style.transform = `translateY(${currentY}px)`;
                        requestAnimationFrame(float);
                    };
                    setTimeout(() => float(), index * 300);
                }
            });
        }
        // Infinite scroll animation
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current;
            const setupScroll = () => {
                const scrollElements = Array.from(scrollContainer.children);
                scrollElements.forEach((element) => {
                    const clone = element.cloneNode(true);
                    scrollContainer.appendChild(clone);
                });
                let totalWidth = 0;
                scrollElements.forEach((element) => {
                    const style = window.getComputedStyle(element);
                    const marginLeft = parseFloat(style.marginLeft) || 0;
                    const marginRight = parseFloat(style.marginRight) || 0;
                    totalWidth += element.offsetWidth + marginLeft + marginRight;
                });
                let currentX = 0;
                const speed = 1;
                const animate = () => {
                    currentX -= speed;
                    if (currentX <= -totalWidth) {
                        currentX += totalWidth;
                    }
                    scrollContainer.style.transform = `translateX(${currentX}px)`;
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            };
            const timeoutId = setTimeout(setupScroll, 100);
            return () => clearTimeout(timeoutId);
        }
    }, []);
    return (<div ref={aboutRef} id="about" className="w-full bg-blue-500 py-4 sm:py-6 md:py-8 lg:py-10 mb-28 relative scroll-mt-28">
      {/* Zigzag Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern id="zigzag-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="0.5"/>
              <line x1="20" y1="0" x2="20" y2="40" stroke="white" strokeWidth="0.5"/>
              <line x1="40" y1="0" x2="40" y2="40" stroke="white" strokeWidth="0.5"/>
              <line x1="0" y1="0" x2="40" y2="0" stroke="white" strokeWidth="0.5"/>
              <line x1="0" y1="20" x2="40" y2="20" stroke="white" strokeWidth="0.5"/>
              <line x1="0" y1="40" x2="40" y2="40" stroke="white" strokeWidth="0.5"/>
              <path d="M0,0 L10,10 L20,0 L30,10 L40,0" stroke="white" strokeWidth="0.5" fill="none"/>
              <path d="M0,20 L10,30 L20,20 L30,30 L40,20" stroke="white" strokeWidth="0.5" fill="none"/>
              <path d="M0,40 L10,30 L20,40 L30,30 L40,40" stroke="white" strokeWidth="0.5" fill="none"/>
              <path d="M0,10 L10,0 L20,10 L30,0 L40,10" stroke="white" strokeWidth="0.5" fill="none"/>
              <path d="M0,30 L10,20 L20,30 L30,20 L40,30" stroke="white" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#zigzag-grid)"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row w-[90%] sm:w-[85%] md:w-[80%] mx-auto">
          {/* Mobile: Image first, Desktop: Image second */}
          <div className="w-full lg:w-1/2 min-h-[35vh] flex-center order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="w-full h-full relative">
              {/* <div
          ref={shapeRef}
          className="abs-center w-[60%] h-[250px] lg:w-[50%] lg:h-[380px] bg-[#a5ffaa] border-2 border-black rounded-t-full before:w-[100%] before:h-[100%] before:rounded-t-full before:bg-white before:absolute before:-top-[0.5rem] sm:before:-top-[0.75rem] md:before:-top-[1rem] before:-left-[0.5rem] sm:before:-left-[0.75rem] md:before:-left-[1rem]"
        ></div> */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <img src="/Tutor/Group.png" alt="Tutor illustration" className="w-[90%] h-[230px] lg:w-[80%] lg:h-[380px] abs-center object-cover"/>
              </div>
            </div>
          </div>

          {/* Mobile: Content second, Desktop: Content first */}
          <div className="w-full lg:w-1/2 min-h-[35vh] sm:min-h-[40vh] md:min-h-[45vh] flex flex-col justify-start order-2 lg:order-1">
            <div className="w-full text-white mx-auto">
              <h1 ref={titleRef} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-1">
                About Our Tutor
              </h1>
              <p ref={textRef} className="mt-3 sm:mt-4 md:mt-5 font-light text-xs sm:text-sm md:text-base leading-relaxed">
                At <span className="font-semibold">FOCAS</span>, our Academic
                Team is the backbone of student success. These are not just
                subject experts—they're dedicated faculties, tutors, mentors who
                track your progress, clear every doubt, and guide you with
                strategy and precision. With structured faculty videos,
                personalised tutor sessions and a results-driven approach, they
                ensure your preparation is complete and confident.
              </p>
              <div ref={statsRef} className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="flex gap-2 sm:gap-3 items-center mt-3">
                  <div className="w-[12vw] sm:w-[10vw] bg-violet-100 md:w-[8vw] lg:w-[6vw] h-[12vw] sm:h-[10vw] md:h-[8vw] lg:h-[6vw] max-w-[80px] max-h-[80px] min-w-[50px] min-h-[50px] flex items-center justify-center border border-black rounded-lg overflow-hidden flex-shrink-0">
                    <img src="/graduateCap.svg" alt="Instructors" className="w-[80%] h-[80%] object-cover"/>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                      30+
                    </h2>
                    <p className="text-light text-xs sm:text-sm">Educators</p>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 items-center mt-3">
                  <div className="w-[12vw] bg-white sm:w-[10vw] md:w-[8vw] lg:w-[6vw] h-[12vw] sm:h-[10vw] md:h-[8vw] lg:h-[6vw] max-w-[80px] max-h-[80px] min-w-[50px] min-h-[50px] flex items-center justify-center border border-black rounded-lg overflow-hidden flex-shrink-0">
                    <img src="/video.svg" alt="Videos" className="w-[80%] h-[80%] object-cover"/>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                      1,000+
                    </h2>
                    <p className="text-light text-xs sm:text-sm">
                      Hours Taught
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 items-center mt-3">
                  <div className="w-[12vw] sm:w-[10vw] bg-green-100 md:w-[8vw] lg:w-[6vw] h-[12vw] sm:h-[10vw] md:h-[8vw] lg:h-[6vw] max-w-[80px] max-h-[80px] min-w-[50px] min-h-[50px] flex items-center justify-center border border-black rounded-lg overflow-hidden flex-shrink-0">
                    <img src="/graduateCap.svg" alt="Students" className="w-[80%] h-[80%] object-cover"/>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                      300+
                    </h2>
                    <p className="text-light text-xs sm:text-sm">
                      Students Taught
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 items-center mt-3">
                  <div className="w-[12vw] bg-violet-100 sm:w-[10vw] md:w-[8vw] lg:w-[6vw] h-[12vw] sm:h-[10vw] md:h-[8vw] lg:h-[6vw] max-w-[80px] max-h-[80px] min-w-[50px] min-h-[50px] flex items-center justify-center border border-black rounded-lg overflow-hidden flex-shrink-0">
                    <img src="/groupPeople.svg" alt="Users" className="w-[80%] h-[80%] object-cover"/>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                      70%
                    </h2>
                    <p className="text-light text-xs sm:text-sm">
                      Students PASS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Tutors Section */}
        <div className="w-full mt-8 sm:mt-10 md:mt-12 lg:mt-16">
          <h1 className="w-full text-center font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-6 sm:mb-8 md:mb-10">
            Our Tutors
          </h1>

          <div className="w-[90%] sm:w-[85%] md:w-[80%] mx-auto">
            <div ref={tutorsRef} className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-2">
              {[
            {
                name: "Shree Krishna",
                role: "Tutor",
                image: "/Tutor/Shree_Krishna.png",
            },
            {
                name: "Ramya",
                role: "Tutor",
                image: "/Tutor/Ramya_1.png",
            },
            {
                name: "Vishalini",
                role: "Tutor",
                image: "/Tutor/vishalini.png",
            },
        ].map((tutor, index) => (<div key={index} className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-105">
                  {/* Profile Image Container */}
                  <div className="relative mb-3 sm:mb-4">
                    <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-3 border-white shadow-lg transition-all duration-300 group-hover:border-yellow-300 group-hover:shadow-xl">
                      <img src={tutor.image} alt={tutor.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 object-top"/>
                    </div>
                  </div>

                  {/* Tutor Info */}
                  <div className="text-center max-w-[140px] sm:max-w-[160px] md:max-w-[180px]">
                    <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-1 transition-colors duration-300 group-hover:text-yellow-300">
                      {tutor.name}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm leading-tight">
                      {tutor.role}
                    </p>
                  </div>
                </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* Infinite scroll section */}
      <div className="w-full h-[90px] bg-black text-white absolute left-0 -bottom-20">
        <div ref={scrollRef} className="flex items-center h-full whitespace-nowrap absolute scroll-container" style={{ willChange: "transform" }}>
          <div className="flex items-center gap-2 mx-4 sm:mx-5 md:mx-6 flex-shrink-0">
            <div className="w-[6vw] sm:w-[5vw] md:w-[4vw] h-[6vw] sm:h-[5vw] md:h-[4vw] max-w-[40px] max-h-[40px] min-w-[24px] min-h-[24px] rounded-full bg-blue-500 flex-shrink-0"></div>
            <h2 className="text-white font-semibold text-base sm:text-base md:text-lg">
              Study Like Never Before with FOCAS
            </h2>
          </div>
          <div className="flex items-center gap-2 mx-4 sm:mx-5 md:mx-6 flex-shrink-0">
            <div className="w-[6vw] sm:w-[5vw] md:w-[4vw] h-[6vw] sm:h-[5vw] md:h-[4vw] max-w-[40px] max-h-[40px] min-w-[24px] min-h-[24px] rounded-full bg-green-500 flex-shrink-0"></div>
            <h2 className="text-white font-semibold text-base sm:text-base md:text-lg">
              Get mentored by top-tier teachers for CA Foundation, CA
              Intermediate, and CA Final
            </h2>
          </div>
          <div className="flex items-center gap-2 mx-4 sm:mx-5 md:mx-6 flex-shrink-0">
            <div className="w-[6vw] sm:w-[5vw] md:w-[4vw] h-[6vw] sm:h-[5vw] md:h-[4vw] max-w-[40px] max-h-[40px] min-w-[24px] min-h-[24px] rounded-full bg-yellow-500 flex-shrink-0"></div>
            <h2 className="text-white font-semibold text-base sm:text-base md:text-lg">
              Structured videos. Personal tutors. Zero guesswork.
            </h2>
          </div>
          <div className="flex items-center gap-2 mx-4 sm:mx-5 md:mx-6 flex-shrink-0">
            <div className="w-[6vw] sm:w-[5vw] md:w-[4vw] h-[6vw] sm:h-[5vw] md:h-[4vw] max-w-[40px] max-h-[40px] min-w-[24px] min-h-[24px] rounded-full bg-purple-500 flex-shrink-0"></div>
            <h2 className="text-white font-semibold text-base sm:text-base md:text-lg">
              At FOCAS, every student is tracked. Every doubt, cleared. Every
              attempt, your best.
            </h2>
          </div>
        </div>
      </div>
    </div>);
};
export default About;
