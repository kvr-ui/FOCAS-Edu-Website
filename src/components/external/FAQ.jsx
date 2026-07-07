import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
const FAQ = () => {
    const [openItem, setOpenItem] = useState(0); // First item open by default
    const faqData = [
        {
            id: 1,
            question: "What are Faculty Sessions?",
            answer: "Faculty sessions are conceptual lectures designed to help you understand the subject thoroughly. At FOCAS, all faculty lectures are pre-recorded and structured for maximum clarity.",
        },
        {
            id: 2,
            question: "What is a Tutor Session?",
            answer: "Tutor sessions are live sessions focused on accountability and completion. Each student is part of a small group (maximum of 10 students) guided by a dedicated tutor who ensures progress and clarity.",
        },
        {
            id: 3,
            question: "What are the Tutor Session Timings?",
            answer: "Tutor sessions are conducted in 4 daily slots:  6 AM – 9 AM, 10 AM – 1 PM, 2 PM – 5 PM, 7 PM – 10 PM",
        },
        {
            id: 4,
            question: "What Language Are the Classes In?",
            answer: "Classes are conducted in both English and Tamil to ensure ease of understanding.",
        },
        {
            id: 5,
            question: "Which Attempt Is This Batch Meant For?",
            answer: "Our batches are exam-oriented and ideal for the targeted attempt and subsequent ones. For example: If the batch is designed for May 2026, students appearing in Jan 2026 can also enroll and benefit.",
        },
        {
            id: 6,
            question: "Who Will Be Teaching and Guiding Me?",
            answer: "You’ll learn from a team of 25+ qualified professionals handling the faculty lectures and 15+ dedicated tutors guiding you through daily sessions and progress tracking.",
        },
        {
            id: 7,
            question: "Can I Purchase Only the Tutor Sessions Separately?",
            answer: "No, tutor sessions cannot be purchased separately. At FOCAS, every subject is offered as a combined package—faculty lectures followed by tutor sessions. The tutor sessions are structured to complement the faculty lectures, ensuring complete understanding and consistent follow-through.",
        },
    ];
    const toggleItem = (id) => {
        setOpenItem(openItem === id ? null : id);
    };
    return (<div id="faq" className="pt-0 relative overflow-hidden scroll-mt-28">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
      </div>
      <div className="w-full"></div>

      {/* FAQ Items */}
      <div className="space-y-4 w-[90%] sm:w-[80%] mx-auto mt-10 px-2 sm:px-0">
        {faqData.map((item) => (<div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <button onClick={() => toggleItem(item.id)} className="w-full px-6 py-5 text-left focus:outline-none">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-xl font-semibold text-gray-900 pr-4">
                  {item.question}
                </h3>
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 border border-black border-b-3 rounded-lg flex-center cursor-pointer transition-all duration-300 ${openItem === item.id
                ? "bg-green-500"
                : "bg-green-100 hover:bg-green-200"}`}>
                    {openItem === item.id ? <FaMinus /> : <FaPlus />}
                  </div>
                </div>
              </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openItem === item.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-6 pb-5 border-t border-black">
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 text-gray-200 opacity-50">
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 32 }).map((_, i) => (<div key={i} className="w-1 h-1 bg-current rounded-full"></div>))}
        </div>
      </div>

      <div className="absolute bottom-20 right-10 text-gray-200 opacity-50">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 18 }).map((_, i) => (<div key={i} className="w-1 h-1 bg-current rounded-full"></div>))}
        </div>
      </div>
    </div>);
};
export default FAQ;
