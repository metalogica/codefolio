import type { JSX } from "react";

import { useEffect, useState } from "react";
import MacToolbar from "../components/global/MacToolbar";
import MacTerminal from "../components/global/MacTerminal";
import MobileDock from "../components/global/MobileDock";
import DesktopDock from "../components/global/DesktopDock";
import { FaRegFileAlt } from "react-icons/fa";

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

const desktopIcons: DesktopIcon[] = [
  {
    id: "resume",
    name: "cv.pdf",
    icon: <FaRegFileAlt className="text-gray-500" size={36} />,
    type: "file",
    onClick: () => window.open(CV_URI, "_blank"),
  },
];

export default function Desktop({ initialBg, backgroundMap }: AppLayoutProps) {
  const [currentBg, setCurrentBg] = useState<string>(initialBg);

  useEffect(() => {
    const lastBg = localStorage.getItem("lastBackground");
    if (lastBg === initialBg) {
      const bgKeys = Object.keys(backgroundMap);
      const availableBgs = bgKeys.filter((bg) => bg !== lastBg);
      const newBg =
        availableBgs[Math.floor(Math.random() * availableBgs.length)];
      setCurrentBg(newBg);
    }
    localStorage.setItem("lastBackground", currentBg);
  }, [initialBg, backgroundMap, currentBg]);

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

      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <MacTerminal />
        </div>
      </div>

      <div className="relative z-30">
        <MobileDock />
        <DesktopDock />
      </div>
    </div>
  );
}
