import type { JSX } from "react";

import { useEffect, useState } from "react";
import AsciiRipple from "../components/global/AsciiRipple";
import MacTerminal from "../components/global/MacTerminal";
import AboutWindow from "../components/global/AboutWindow";
import SocialsWindow from "../components/global/SocialsWindow";
import SpotifyWindow from "../components/global/SpotifyWindow";
import Taskbar, { type WindowId } from "../components/global/Taskbar";
import PixelIcon from "../components/global/icons/PixelIcon";
import BootSequence from "../components/global/BootSequence";
import AppLauncherWindow, {
  type LauncherApp,
} from "../components/global/AppLauncherWindow";
import { MOBILE_BREAKPOINT } from "../components/global/useWindowControls";

interface AppLayoutProps {
  initialBg: string;
  backgroundMap: Record<string, string>;
  backgroundVideo?: string;
}

interface DesktopIcon {
  id: string;
  name: string;
  icon: JSX.Element;
  onClick?: () => void;
}

const CV_URI = "/rj-cv-2025-02-18.pdf" as const;

const LAUNCHER_APPS: Array<
  LauncherApp & { windowId: WindowId; desktopPosition: { x: number; y: number } }
> = [
  {
    id: "soulbound",
    windowId: "soulbound",
    name: "Soulbound Labs",
    exeName: "SOULBOUND.EXE",
    screenshotUrl: "/soulbound-labs.png",
    blurb: "An AI-native studio. Two operators, AI-native by default.",
    url: "https://soulboundlabs.com",
    desktopPosition: { x: 340, y: 180 },
  },
];

const CLOSED_WINDOWS: Record<WindowId, boolean> = {
  terminal: false,
  about: false,
  socials: false,
  spotify: false,
  soulbound: false,
};

export default function Desktop({
  initialBg,
  backgroundMap,
  backgroundVideo,
}: AppLayoutProps) {
  const [currentBg] = useState<string>(initialBg);
  const [openWindows, setOpenWindows] =
    useState<Record<WindowId, boolean>>(CLOSED_WINDOWS);

  const toggleWindow = (id: WindowId) => {
    setOpenWindows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const closeWindow = (id: WindowId) => {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
  };

  const desktopIcons: DesktopIcon[] = [
    {
      id: "about",
      name: "About Me",
      icon: <PixelIcon name="info" size={32} />,
      onClick: () => toggleWindow("about"),
    },
    {
      id: "resume",
      name: "cv.pdf",
      icon: <PixelIcon name="document" size={32} />,
      onClick: () => window.open(CV_URI, "_blank"),
    },
    {
      id: "socials",
      name: "Socials",
      icon: <PixelIcon name="share" size={32} />,
      onClick: () => toggleWindow("socials"),
    },
    // TODO: Music tab hidden until the Spotify account is updated. Keep the
    // SpotifyWindow wiring intact — just restore this icon to bring it back.
    // {
    //   id: "spotify",
    //   name: "Music",
    //   icon: <PixelIcon name="music" size={32} />,
    //   onClick: () => toggleWindow("spotify"),
    // },
    {
      id: "soulbound",
      name: "Soulbound Labs",
      icon: <PixelIcon name="globe" size={32} />,
      onClick: () => toggleWindow("soulbound"),
    },
  ];

  useEffect(() => {
    localStorage.setItem("lastBackground", currentBg);
  }, [currentBg]);

  // The terminal is the front door: open on every desktop-sized load. Mobile
  // keeps the icon grid (and the CV path) unobstructed.
  useEffect(() => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      setOpenWindows((prev) => ({ ...prev, terminal: true }));
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {backgroundVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={backgroundVideo}
          poster={backgroundMap[currentBg]}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
        />
      )}

      <AsciiRipple backgroundUrl={backgroundMap[currentBg]} />

      <div
        className="absolute inset-0 pointer-events-none scanlines"
        aria-hidden="true"
      />

      <div className="relative z-0 px-6 pt-6 h-[calc(100vh-3rem)] md:h-[calc(100vh-2.5rem)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 md:gap-8">
          {desktopIcons.map((icon) => (
            <div
              key={icon.id}
              className="flex flex-col items-center group cursor-pointer"
              onClick={icon.onClick}
            >
              <div className="w-12 h-12 flex items-center justify-center bevel-out bg-pc98-face group-hover:bg-pc98-face-lt group-active:bevel-in">
                {icon.icon}
              </div>
              <div
                className="mt-2 px-1.5 py-0.5 text-white text-center font-bitmap text-[11px] max-w-[90px] truncate group-hover:bg-pc98-title"
                style={{ textShadow: "1px 1px 0 #000" }}
              >
                {icon.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {openWindows.terminal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <MacTerminal onClose={() => closeWindow("terminal")} />
          </div>
        </div>
      )}

      {openWindows.about && (
        <div className="absolute inset-0 z-25 pointer-events-auto">
          <div
            className="absolute inset-0"
            onClick={() => closeWindow("about")}
            onTouchEnd={(e) => {
              e.preventDefault();
              closeWindow("about");
            }}
          />
          <div className="relative pointer-events-auto">
            <AboutWindow onClose={() => closeWindow("about")} />
          </div>
        </div>
      )}

      {openWindows.socials && (
        <div className="absolute inset-0 z-25 pointer-events-auto">
          <div
            className="absolute inset-0"
            onClick={() => closeWindow("socials")}
            onTouchEnd={(e) => {
              e.preventDefault();
              closeWindow("socials");
            }}
          />
          <div className="relative pointer-events-auto">
            <SocialsWindow onClose={() => closeWindow("socials")} />
          </div>
        </div>
      )}

      {openWindows.spotify && (
        <div className="absolute inset-0 z-25 pointer-events-auto">
          <div
            className="absolute inset-0"
            onClick={() => closeWindow("spotify")}
            onTouchEnd={(e) => {
              e.preventDefault();
              closeWindow("spotify");
            }}
          />
          <div className="relative pointer-events-auto">
            <SpotifyWindow onClose={() => closeWindow("spotify")} />
          </div>
        </div>
      )}

      {LAUNCHER_APPS.map(
        (app) =>
          openWindows[app.windowId] && (
            <div key={app.id} className="absolute inset-0 z-25 pointer-events-auto">
              <div
                className="absolute inset-0"
                onClick={() => closeWindow(app.windowId)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  closeWindow(app.windowId);
                }}
              />
              <div className="relative pointer-events-auto">
                <AppLauncherWindow
                  app={app}
                  desktopPosition={app.desktopPosition}
                  onClose={() => closeWindow(app.windowId)}
                />
              </div>
            </div>
          ),
      )}

      <div className="relative z-30">
        <Taskbar openWindows={openWindows} onToggleWindow={toggleWindow} />
      </div>

      <BootSequence />
    </div>
  );
}
