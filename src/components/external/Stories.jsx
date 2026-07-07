import React, { useState, useEffect, useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
const cap = "/cap.png";
const Card = ({ name, batch, 
// percent,
personImage, certificateImage, }) => {
    return (<div className="bg-gray-100 rounded-2xl gap-2 py-3 relative w-full min-h-[400px] border border-black px-2 flex flex-col sm:flex-row justify-evenly items-center flex-shrink-0 animate-fadeIn">
  
      <div className="person-image w-full sm:w-[48%] border border-black h-[300px] sm:h-[380px] rounded-lg relative overflow-hidden mb-3 sm:mb-0 flex items-center justify-center bg-white">
        <img src={personImage} alt="img" className="w-full h-full object-cover sm:object-contain" loading="lazy" decoding="async"/>
        <span className="person-info w-full min-h-[50px] bg-white absolute bottom-0 px-3 sm:px-5 py-2">
          <h3 className="font-semibold text-sm sm:text-base text-black">{name}</h3>
          <p className="text-gray-400 font-light text-xs sm:text-sm">
            {batch} Batch
          </p>
        </span>
      </div>
    <div className="certificate-image w-full sm:w-[75%] border border-black h-[240px] sm:h-[380px] rounded-lg overflow-hidden bg-white p-2">
  <img src={certificateImage} alt="Certificate" className="w-full h-full object-contain rounded-md" loading="lazy" decoding="async"/>
    </div>

    </div>);
};
const Stories = () => {
    const titleRef = useRef(null);
    const capRef = useRef(null);
    const cardsContainerRef = useRef(null);
    const buttonsRef = useRef(null);
    const [cardWidth, setCardWidth] = useState(0);
    const cardData = [
        {
            name: "Anupriya",
            batch: "2023",
            percent: 81,
            personImage: "/Students/Anupriya.jpg",
            certificateImage: "/Certificates/Anupriya.jpg",
        },
        {
            name: "Gowtham",
            batch: "2024",
            percent: 54,
            personImage: "/Students/Gowtham.jpg",
            certificateImage: "/Certificates/Gowtham.jpeg",
        },
        {
            name: "Kavitha",
            batch: "2024",
            percent: 76,
            personImage: "/Students/Kavitha.jpg",
            certificateImage: "/Certificates/kavitha.jpeg",
        },
        {
            name: "Manjunath",
            batch: "2024",
            percent: 95,
            personImage: "/Students/Manjunath.jpeg",
            certificateImage: "/Certificates/Manjunath Marksheet  (1).jpeg",
        },
        {
            name: "Mathumetha",
            batch: "2025",
            percent: 97,
            personImage: "/Students/MathumethImg.jpeg",
            certificateImage: "/Certificates/Mathumetha.jpeg",
        },
    ];
    const calculateDimensions = () => {
        if (typeof window !== "undefined") {
            const viewportWidth = window.innerWidth;
            const gap = 12;
            let cardW = 0;
            if (viewportWidth < 640) {
                cardW = viewportWidth * 0.8; // mobile width
            }
            else if (viewportWidth < 1024) {
                cardW = (viewportWidth - gap * 2.4) / 1.4; // 2 cards
            }
            else {
                cardW = (viewportWidth - gap * 3.5) / 2.5; // 3 cards
            }
            setCardWidth(cardW);
        }
    };
    useEffect(() => {
        calculateDimensions();
        window.addEventListener("resize", calculateDimensions);
        return () => window.removeEventListener("resize", calculateDimensions);
    }, []);
    useEffect(() => {
        const initAnimations = () => {
            if (titleRef.current) {
                titleRef.current.style.opacity = "1";
                titleRef.current.style.transform = "translateY(0)";
            }
            if (capRef.current) {
                capRef.current.style.opacity = "1";
                capRef.current.style.transform = "translateY(0) rotate(0deg)";
            }
            if (buttonsRef.current) {
                buttonsRef.current.style.opacity = "1";
                buttonsRef.current.style.transform = "translateY(0)";
            }
        };
        if (titleRef.current) {
            titleRef.current.style.opacity = "0";
            titleRef.current.style.transform = "translateY(50px)";
            titleRef.current.style.transition =
                "opacity 0.8s ease, transform 0.8s ease";
        }
        if (capRef.current) {
            capRef.current.style.opacity = "0";
            capRef.current.style.transform = "translateY(-30px) rotate(-15deg)";
            capRef.current.style.transition = "opacity 1s ease, transform 1s ease";
        }
        if (buttonsRef.current) {
            buttonsRef.current.style.opacity = "0";
            buttonsRef.current.style.transform = "translateY(20px)";
            buttonsRef.current.style.transition =
                "opacity 0.6s ease, transform 0.6s ease";
        }
        setTimeout(initAnimations, 100);
    }, []);
    const handlePrevious = () => {
        if (cardsContainerRef.current) {
            const gap = 12;
            const scrollDistance = cardWidth + gap;
            cardsContainerRef.current.scrollBy({
                left: -scrollDistance,
                behavior: "smooth",
            });
        }
    };
    const handleNext = () => {
        if (cardsContainerRef.current) {
            const gap = 12;
            const scrollDistance = cardWidth + gap;
            cardsContainerRef.current.scrollBy({
                left: scrollDistance,
                behavior: "smooth",
            });
        }
    };
    return (<div className="mb-10 lg:mb-20 w-full mt-10">
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="w-full flex flex-col items-center">
        <h1 ref={titleRef} className="font-semibold text-3xl sm:text-4xl lg:text-5xl relative text-black">
          <img ref={capRef} src={cap} alt="Cap" className="absolute -top-8 sm:-top-12 -left-6 sm:-left-10 w-[20%] sm:w-[25%]"/>
          Success Stories
        </h1>
        <hr className="border-t-4 border-black w-[10%] mt-4"/>
      </div>

      <div className="mt-8 sm:mt-12 w-[90%] mx-auto">
        <div ref={cardsContainerRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-4" style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
        }}>
          {cardData.map((card, index) => (<div key={`${card.name}-${index}`} className={`flex-shrink-0 ${cardWidth < 640 ? "mx-auto" : ""}`} style={{ width: `${cardWidth}px` }}>
              <Card {...card}/>
            </div>))}
        </div>
      </div>

      <div ref={buttonsRef} className="flex justify-center items-center gap-4 mt-6 sm:mt-8">
        <button onClick={handlePrevious} className="bg-[#a5ffaa] cursor-pointer p-2 sm:p-3 rounded-full border border-black transition-all duration-200 flex items-center justify-center hover:scale-110 hover:shadow-lg" aria-label="Previous cards">
          <HiChevronLeft size={20} className="sm:w-6 sm:h-6"/>
        </button>

        <button onClick={handleNext} className="bg-[#a5ffaa] cursor-pointer p-2 sm:p-3 rounded-full border border-black transition-all duration-200 flex items-center justify-center hover:scale-110 hover:shadow-lg" aria-label="Next cards">
          <HiChevronRight size={20} className="sm:w-6 sm:h-6"/>
        </button>
      </div>
    </div>);
};
export default Stories;
