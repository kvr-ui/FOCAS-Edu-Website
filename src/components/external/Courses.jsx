import { useState, useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import bulb from "/bulb.png";
const tabs = ["CA Foundation", "CA Intermediate", "CA Final"];
const coursesData = {
    "CA Foundation": [
        {
            title: "Paper 1: Principles & Practice of Accounting",
            rating: "5.0",
            image: "/Posters/foundation/Course Header-02.jpg",
            description: "The ABC of business accounting. Learn how businesses record transactions, prepare accounts, and calculate profits — the foundation of all accounting.",
        },
        {
            title: "Paper 2: Business Laws",
            rating: "4.9",
            image: "/Posters/foundation/Course Header-03.jpg",
            description: "Know the rules that guide businesses. Understand essential business laws like contracts and sales of goods.",
        },
        {
            title: "Paper 3: Business Mathematics, Logical Reasoning & Statistics",
            rating: "4.8",
            image: "/Posters/foundation/Course Header-04.jpg",
            description: "Numbers that make decisions smarter. Develop problem-solving skills with maths, reasoning, and statistics.",
        },
        {
            title: "Paper 4: Business Economics",
            rating: "4.7",
            image: "/Posters/foundation/Course Header-05.jpg",
            description: "Why markets move and how businesses respond. Learn demand & supply, pricing, and market structures.",
        },
        {
            title: "Paper 5: All in one",
            rating: "4.7",
            image: "/Posters/foundation/Course Header-01.jpg",
            description: "Complete coverage of all foundation subjects in one structured program.",
        },
    ],
    "CA Intermediate": [
        {
            title: "Paper 1: Advanced Accounting",
            rating: "5.0",
            image: "/Posters/inter/Course Header-09.jpg",
            description: "Learn how companies prepare and present financial statements and follow accounting standards.",
        },
        {
            title: "Paper 2: Corporate & Other Laws",
            rating: "4.9",
            image: "/Posters/inter/Course Header-10.jpg",
            description: "Understand the Companies Act and essential business laws for compliance.",
        },
        {
            title: "Paper 3: Taxation",
            rating: "4.8",
            image: "/Posters/inter/Taxation-11.jpg",
            description: "Master Income Tax and GST concepts for individuals and businesses.",
        },
        {
            title: "Paper 4: Cost and Management Accounting",
            rating: "4.7",
            image: "/Posters/inter/Course Header-11.jpg",
            description: "Learn budgeting, cost control, and financial decision-making.",
        },
        {
            title: "Paper 5: Auditing and Ethics",
            rating: "4.8",
            image: "/Posters/inter/Course Header-12.jpg",
            description: "Understand auditing standards, ethics, and risk assessment.",
        },
        {
            title: "Paper 6: Financial Management and Strategic Management",
            rating: "4.9",
            image: "/Posters/inter/Course Header-13.jpg",
            description: "Plan funds, investments, and strategies for long-term growth.",
        },
    ],
    "CA Final": [
        {
            title: "Advanced Auditing",
            rating: "4.8",
            image: "/Posters/final/Course Header-16.jpg",
            description: "Advanced auditing techniques, compliance, and risk management.",
        },
    ],
};
const Courses = () => {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const courses = coursesData[activeTab];
    const handleMouseDown = (e) => {
        if (!scrollContainerRef.current)
            return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };
    const handleMouseMove = (e) => {
        if (!isDragging || !scrollContainerRef.current)
            return;
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollContainerRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
    };
    return (<section id="courses" className="w-full pb-8 sm:pb-10 flex flex-col items-center px-4 scroll-mt-28">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold relative text-black font-semibold">
        Courses
        <img src={bulb} alt="" className="absolute -top-8 -right-12 w-24"/>
      </h1>

      {/* Tabs */}
      <div className="w-[90%] flex justify-center mt-6">
        <div className="flex flex-col lg:flex-row gap-2 border rounded-xl p-2">
          {tabs.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm ${activeTab === tab
                ? "bg-[#507cf4] text-white"
                : "text-black"}`}>
              {tab}
            </button>))}
        </div>
      </div>

      {/* Cards */}
      <div ref={scrollContainerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} className="w-full h-[420px] sm:h-[450px] lg:h-[540px] mt-8 flex overflow-x-auto scrollbar-hide cursor-grab">
        <div className="flex gap-6 px-6 min-w-max">
          {courses.map((course, index) => (<div key={index} className="border border-black h-full w-[300px] sm:w-[350px] lg:w-[450px] flex-shrink-0 flex justify-center items-center">
              <div className="w-[90%] h-[90%] border rounded-lg flex flex-col p-4">
                {/* Image */}
                <div className="aspect-[16/10] border rounded-lg overflow-hidden">
                  <img src={course.image} alt="" className="w-full h-full object-cover"/>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col mt-3 gap-2">
                  {/* 🔹 CHANGE 1: title clamp */}
                  <h2 className="font-bold text-base sm:text-lg min-h-[3em] text-black" style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
            }}>
                    {course.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400 flex-1" style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
            }}>
                    {course.description}
                  </p>

                  {/* 🔹 CHANGE 2: mt-auto keeps button fixed */}
                  <div className="mt-auto flex justify-center pt-3">
                    <button className="border rounded-full px-6 py-2 w-full max-w-[180px] text-sm text-black" onClick={() => window.open('https://wa.me/916383514285', '_blank')}>
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-6">
        <button onClick={() => scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" })} className="p-3 border rounded-full bg-green-300">
          <HiChevronLeft />
        </button>
        <button onClick={() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" })} className="p-3 border rounded-full bg-green-300">
          <HiChevronRight />
        </button>
      </div>
    </section>);
};
export default Courses;
