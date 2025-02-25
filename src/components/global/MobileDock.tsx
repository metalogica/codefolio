import { useState } from "react";
import { BsGithub } from "react-icons/bs";
import { IoIosMail } from "react-icons/io";

export default function MobileDock() {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const handleEmailClick = () => {
    window.location.href = "mailto:rjarram@me.com";
  };

  const handleGithubClick = () => {
    window.open("https://github.com/metalogica", "_blank");
  };

  const handleCalendarClick = () => {
    window.open("https://calendly.com/rjarram/30min", "_blank");
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className="absolute -top-14 left-1/2 -translate-x-1/2">
      <div className="relative px-3 py-1 bg-[#1d1d1f]/80 backdrop-blur-sm text-white text-sm rounded-lg whitespace-nowrap border border-px border-gray-600">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-[#1d1d1f]/80 backdrop-blur-sm rotate-45 border-b border-r border-gray-600" />
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden">
      <div className=" mb-4 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-xl rounded-3xl flex justify-around items-center max-w-[400px] mx-auto">
        <button
          onClick={handleEmailClick}
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="w-18 h-18 bg-gradient-to-t from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center">
            <IoIosMail size={60} className="text-white" />
          </div>
        </button>

        <button
          onClick={handleGithubClick}
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="w-18 h-18 bg-gradient-to-t from-black to-black/60 rounded-2xl flex items-center justify-center">
            <BsGithub size={55} className="text-white" />
          </div>
        </button>

        <button
          onClick={handleCalendarClick}
          onMouseEnter={() => setHoveredIcon("calendar")}
          onMouseLeave={() => setHoveredIcon(null)}
          className="relative"
        >
          <div className="w-14 h-14 overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-200 rounded-xl"></div>

            <div className="absolute top-0 inset-x-0 h-5 bg-red-500 flex items-center justify-center rounded-t-xl">
              <span className="text-xs font-semibold text-white uppercase">
                {new Date().toLocaleString("en-US", { month: "short" })}
              </span>
            </div>

            <div className="absolute inset-0 flex items-end justify-center">
              <span className="text-3xl font-light text-black">
                {new Date().getDate()}
              </span>
            </div>
          </div>
          {hoveredIcon === "calendar" && <Tooltip text="Book a Call" />}
        </button>
      </div>
    </div>
  );
}
