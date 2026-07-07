import { useState, useEffect, useRef } from "react";
const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
    return (<header className={`fixed left-1/2 transform -translate-x-1/2 w-[90%] h-[70px] px-4 sm:px-6 md:px-8 lg:px-10 rounded-xl shadow-lg flex items-center justify-between z-50 transition-all duration-300 ease-in-out backdrop-blur-md bg-white/30 border border-white/40 ${isScrolled ? "top-4" : "top-10"}`}>
      {/* Glossy Shine Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

      {/* Logo */}
      <div className="flex-shrink-0 relative z-10">
        <img src="/Focus-logo-tag.png" alt="Logo" className="h-[30px] md:h-[50px] cursor-pointer"/>
      </div>

      {/* Dropdown Button */}
      <div className="relative z-20" ref={dropdownRef}>
        <button onClick={toggleDropdown} className="bg-white/70 backdrop-blur-sm border border-black border-b-[5px] rounded-full px-5 py-2 text-blue-700 font-semibold hover:bg-white/90 transition-all duration-300 flex items-center gap-2 cursor-pointer">
          Click Here
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (<div className="absolute -right-3 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
            {[
                /* { name: "About Us", link: "#" }, */
                { name: "Last Attempt Kit", link: "https://kit.focasedu.com" },
                { name: "CA Guru.AI", link: "https://caguru.ai" },
                /*  { name: "Free Resources", link: "#" }, */
            ].map((item, index) => (<a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                {item.name}
              </a>))}
          </div>)}
      </div>
    </header>);
};
export default Header;
