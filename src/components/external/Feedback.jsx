import React, { useEffect, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
const Card = ({ student, batch, Userimage, feedback }) => {
    const [isMobileView, setIsMobileView] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 770) {
                setIsMobileView(true);
            }
            else {
                setIsMobileView(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return (<div className="w-[80vw] mx-auto sm:w-[45vw] lg:w-[40vw] min-h-[280px] sm:min-h-[320px] lg:min-h-[300px] rounded-xl flex items-center justify-around border border-black py-4 sm:py-6 px-3 sm:px-4 sm:mx-3 lg:mx-4">
      {!isMobileView ? (<div className="w-[40%] flex-shrink-0">
          <img src={Userimage} alt="" className="w-full h-[200px] sm:h-[250px] lg:h-[300px] border border-black rounded-lg object-cover"/>
        </div>) : ("")}
      <div className="w-full md:w-[55%] flex flex-col justify-between py-2 gap-4 sm:gap-6">
        <img src="/quote.png" alt="" className="w-[50px] sm:w-[60px] lg:w-[75px] object-fill hidden sm:block flex-shrink-0"/>
        <p className="font-light text-xs sm:text-sm lg:text-sm leading-relaxed flex-grow text-black">
          {feedback}
        </p>
        <div className="flex-shrink-0">
          <h1 className="font-bold text-base sm:text-lg lg:text-xl mb-1 text-black">
            {student}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mb-2">{batch} Batch</p>
          <h2 className="text-sm sm:text-base">⭐⭐⭐⭐⭐</h2>
        </div>
      </div>
    </div>);
};
const Feedback = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const mockData = [
        {
            student: "Yashika",
            batch: "2024",
            Userimage: "/Testimonial/Yakshika.jpeg",
            feedback: "The method of teaching followed by Focas academy is perfect and Trust me I was able to score 82 just by enrolling in their fasttrack then imagine how their regular course would be.",
        },
        {
            student: "Aravindha lochanan",
            batch: "2023",
            Userimage: "/Testimonial/Aravind lochan.jpg",
            feedback: "Best mentorship with coaching for struggling students with last minute pending syllabus and repeaters. Can trust FOCAS for best ever preparation for upcoming attempt. Friends in my close circle also greatly benefited from this individual attention led batches by the mentors. Join focas make it ur last attempt",
        },
        {
            student: "Mercy",
            batch: "2025",
            Userimage: "/Testimonial/Mercy.jpeg",
            feedback: "Really happy and satisfied with the tutors we have is really good,the way of teaching here is enough+only one time oversee that effective And the concept behind deep focas grb is too good and gained confidence Which I always wanted for, is the repetitive starting just 1 month prior to exams But lacked when I tried on my own pace",
        },
        {
            student: "Naveen",
            batch: "2023",
            Userimage: "/Testimonial/Naveen.jpeg",
            feedback: "I was able to complete preparation in Class itself, because it was live studying and NO procrastination. Got rid of confusions in the class itself as there were discussions of Q&A at the end of every topic. Was able to recall at least 75% in the exams because of the cumulative revisions we did in the class. FOCAS Classes is something that would work for me.",
        },
        {
            student: "Jagadeesh",
            batch: "2025",
            Userimage: "/Testimonial/Jagadeesh.jpeg",
            feedback: "FOCAS helped me to study at the best possible way .Their tutor session was really helpful for me to get out of vicious circle of audit! I thought of quiting CA because of audit, but because of them, I can able to study it.Thanks FOCAS team!",
        },
    ];
    // Determine cards per page based on screen size
    const getCardsPerPage = () => {
        if (window.innerWidth >= 1024)
            return 2; // lg screens: 2 cards
        if (window.innerWidth >= 640)
            return 1; // sm screens: 1 card
        return 1; // mobile: 1 card
    };
    const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage());
    // Update cards per page on window resize
    React.useEffect(() => {
        const handleResize = () => {
            setCardsPerPage(getCardsPerPage());
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const nextCards = () => {
        if (currentIndex + cardsPerPage < mockData.length && !isAnimating) {
            setIsAnimating(true);
            setCurrentIndex(currentIndex + 1);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };
    const prevCards = () => {
        if (currentIndex > 0 && !isAnimating) {
            setIsAnimating(true);
            setCurrentIndex(currentIndex - 1);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };
    return (<div className="w-full px-4 sm:px-6 lg:px-8">
      <h1 className="w-full text-center text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 sm:mt-5 text-black font-semibold">
        What Our Students Say
      </h1>
      <div className="w-full mt-3 sm:mt-4 py-8 sm:py-10 relative">
        <div className="overflow-hidden">
          <div className={`flex transition-transform duration-500 ease-out ${isAnimating ? "transform" : ""}`} style={{
            transform: `translateX(-${currentIndex * (100 / cardsPerPage)}%)`,
        }}>
            {mockData.map((card, index) => (<div key={index} className={`flex-shrink-0 w-full sm:w-1/2 lg:w-1/2 flex items-stretch`}>
                <Card student={card.student} batch={card.batch} Userimage={card.Userimage} feedback={card.feedback}/>
              </div>))}
          </div>
        </div>

        <div className="flex justify-center mt-6 sm:mt-8 space-x-4">
          <button onClick={prevCards} className="rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 focus:outline-none bg-[#a5ffaa] cursor-pointer border border-black border-b-4 shadow-lg" type="button">
            <HiChevronLeft className="w-5 h-5 md:w-6 md:h-6"/>
          </button>
          <button onClick={nextCards} className="rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110 focus:outline-none bg-[#a5ffaa] cursor-pointer border border-black border-b-4 shadow-lg" type="button">
            <HiChevronRight className="w-5 h-5 md:w-6 md:h-6"/>
          </button>
        </div>
      </div>
    </div>);
};
export default Feedback;
