import { useState } from "react";
import { BsGithub } from "react-icons/bs";
import { IoIosMail } from "react-icons/io";
import { RiTerminalFill } from "react-icons/ri";

interface DesktopDockProps {
  isTerminalOpen: boolean;
  onTerminalClick: () => void;
}

export default function DesktopDock({
  isTerminalOpen,
  onTerminalClick,
}: DesktopDockProps) {
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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 hidden md:block z-50">
      <div className="relative mb-2 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-2xl rounded-2xl">
        <div className="flex items-end space-x-4">
          <button
            onClick={handleEmailClick}
            onMouseEnter={() => setHoveredIcon("email")}
            onMouseLeave={() => setHoveredIcon(null)}
            className="relative"
          >
            <div className="w-14 h-14 bg-gradient-to-t from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
              <IoIosMail size={45} className="text-white" />
            </div>
            {hoveredIcon === "email" && <Tooltip text="Email Me" />}
          </button>

          <button
            onClick={handleGithubClick}
            onMouseEnter={() => setHoveredIcon("github")}
            onMouseLeave={() => setHoveredIcon(null)}
            className="relative"
          >
            <div className="w-14 h-14  bg-gradient-to-t from-black to-black/60 rounded-xl flex items-center justify-center shadow-lg">
              <BsGithub size={45} className="text-gray-100" />
            </div>
            {hoveredIcon === "github" && <Tooltip text="My GitHub" />}
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

          <div className="flex items-center">
            <div className="w-px h-14 bg-white/20" />
          </div>

          <button
            onClick={onTerminalClick}
            onMouseEnter={() => setHoveredIcon("terminal")}
            onMouseLeave={() => setHoveredIcon(null)}
            className="relative"
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-500 rounded-xl"></div>
              <div className="absolute inset-[2px] rounded-xl bg-black">
                <div className="absolute top-1 left-2">
                  <RiTerminalFill size={20} className="text-white" />
                </div>
              </div>
            </div>
            {isTerminalOpen && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            )}
            {hoveredIcon === "terminal" && <Tooltip text="Terminal" />}
          </button>
        </div>
      </div>
    </div>
  );
}
