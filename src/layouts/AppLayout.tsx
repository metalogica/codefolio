import type { JSX } from "react";

import { useEffect, useState } from "react";
import MacToolbar from "../components/global/MacToolbar";
import MacTerminal from "../components/global/MacTerminal";
import MobileDock from "../components/global/MobileDock";
import DesktopDock from "../components/global/DesktopDock";
import AboutWindow from "../components/global/AboutWindow";
import SocialsWindow from "../components/global/SocialsWindow";
import SpotifyWindow from "../components/global/SpotifyWindow";
import { FaRegFileAlt, FaInfoCircle, FaShareAlt } from "react-icons/fa";

interface AppLayoutProps {
  initialBg: string;
  backgroundMap: Record<string, string>;
}

interface DesktopIcon {
  id: string;
  name: string;
  icon: JSX.Element;
  type: "folder" | "file" | "app";
  onClick?: () => void;
}

const CV_URI = "/rj-cv-2025-02-18.pdf" as const;

export default function Desktop({ initialBg, backgroundMap }: AppLayoutProps) {
  const [currentBg] = useState<string>(initialBg);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);

  const desktopIcons: DesktopIcon[] = [
    {
      id: "about",
      name: "About Me",
      icon: <FaInfoCircle className="text-blue-400" size={36} />,
      type: "app",
      onClick: () => setIsAboutOpen(true),
    },
    {
      id: "resume",
      name: "cv.pdf",
      icon: <FaRegFileAlt className="text-gray-500" size={36} />,
      type: "file",
      onClick: () => window.open(CV_URI, "_blank"),
    },
    {
      id: "socials",
      name: "Socials",
      icon: <FaShareAlt className="text-green-400" size={36} />,
      type: "app",
      onClick: () => setIsSocialsOpen(true),
    },
    {
      id: "ideosphere",
      name: "Ideosphere",
      icon: (
        <img
          src="/ideosphere-logo.png"
          alt="Ideosphere"
          className="w-9 h-9 object-contain"
        />
      ),
      type: "app",
      onClick: () => window.open("https://ideosphere.io", "_blank"),
    },
    {
      id: "dreamtable",
      name: "Dreamtable",
      icon: (
        <img
          src="/dreamtable-logo.png"
          alt="Dreamtable"
          className="w-9 h-9 object-contain"
        />
      ),
      type: "app",
      onClick: () => window.open("https://www.dreamtable.io", "_blank"),
    },
  ];

  useEffect(() => {
    localStorage.setItem("lastBackground", currentBg);
  }, [currentBg]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
      />

      <div className="relative z-10">
        <MacToolbar />
      </div>

      <div className="relative z-0 px-6 pt-6 h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 md:gap-8">
          {desktopIcons.map((icon) => (
            <div
              key={icon.id}
              className="flex flex-col items-center group cursor-pointer"
              onClick={icon.onClick}
            >
              <div className="p-3 rounded-lg transition-colors duration-200 group-hover:bg-white/10">
                {icon.icon}
              </div>
              <div className="mt-2 px-2 py-1 rounded text-white text-center text-xs font-medium max-w-[90px] truncate bg-black/30 backdrop-blur-sm group-hover:bg-black/50">
                {icon.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isTerminalOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <MacTerminal onClose={() => setIsTerminalOpen(false)} />
          </div>
        </div>
      )}

      {isAboutOpen && (
        <div className="absolute inset-0 z-25 pointer-events-auto">
          <div
            className="absolute inset-0"
            onClick={() => setIsAboutOpen(false)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsAboutOpen(false);
            }}
          />
          <div className="relative pointer-events-auto">
            <AboutWindow onClose={() => setIsAboutOpen(false)} />
          </div>
        </div>
      )}

      {isSocialsOpen && (
        <div className="absolute inset-0 z-25 pointer-events-auto">
          <div
            className="absolute inset-0"
            onClick={() => setIsSocialsOpen(false)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsSocialsOpen(false);
            }}
          />
          <div className="relative pointer-events-auto">
            <SocialsWindow onClose={() => setIsSocialsOpen(false)} />
          </div>
        </div>
      )}

      {isSpotifyOpen && (
        <div className="absolute inset-0 z-25 pointer-events-auto">
          <div
            className="absolute inset-0"
            onClick={() => setIsSpotifyOpen(false)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsSpotifyOpen(false);
            }}
          />
          <div className="relative pointer-events-auto">
            <SpotifyWindow onClose={() => setIsSpotifyOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative z-30">
        <MobileDock onTerminalClick={() => setIsTerminalOpen(!isTerminalOpen)} />
        <DesktopDock
          isTerminalOpen={isTerminalOpen}
          onTerminalClick={() => setIsTerminalOpen(!isTerminalOpen)}
          isSpotifyOpen={isSpotifyOpen}
          onSpotifyClick={() => setIsSpotifyOpen(!isSpotifyOpen)}
        />
      </div>
    </div>
  );
}
