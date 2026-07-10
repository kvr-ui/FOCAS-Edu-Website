import { useState, useRef, useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import bulb from "/bulb.png";

const tabs = ["Foundation", "Intermediate", "Final"];

const Courses = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();

  const apiBaseUrl = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:7000"}`;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/purchase/course?level=${encodeURIComponent(activeTab)}`
        );
        const data = await res.json();
        setCourses(data.products || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [activeTab]);

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollContainerRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
  };

  return (
    <section id="courses" className="w-full py-10 md:py-16 flex flex-col items-center scroll-mt-28">

      {/* Header */}
      <div className="text-center px-4 mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 relative inline-block">
          Courses
          <img src={bulb} alt="" className="absolute -top-8 -right-12 w-24" />
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
          Choose your CA level and explore expert-curated courses built for success.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 px-4">
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-gray-400 text-sm">
          <svg className="animate-spin w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading courses...
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          className="w-full flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex gap-5 px-6 md:px-8 min-w-max py-4">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-[80vw] py-16 text-center">
                <svg className="w-14 h-14 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-400 text-sm font-medium">No courses available for this level.</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="group flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[380px] bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="w-full h-[180px] lg:h-[220px] overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col items-center text-center p-5 gap-3 flex-1">
                    <h2 className="font-bold text-base lg:text-lg text-gray-900 line-clamp-2 leading-snug">
                      {course.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    <p className="text-blue-600 font-bold text-lg">
                      ₹{course.price}
                    </p>

                    <button
                      className="mt-auto w-full max-w-[200px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course._id}`);
                      }}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-8 px-4">
        <button
          onClick={() => scrollContainerRef.current?.scrollBy({ left: -340, behavior: "smooth" })}
          className="rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 focus:outline-none bg-white cursor-pointer border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300 hover:text-blue-600 text-gray-500"
        >
          <HiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={() => scrollContainerRef.current?.scrollBy({ left: 340, behavior: "smooth" })}
          className="rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 focus:outline-none bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md hover:shadow-lg text-white"
        >
          <HiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default Courses;
