import { useEffect, useState } from "react";
import PixelIcon, { type PixelIconName } from "./icons/PixelIcon";

const CLOCK_TICK_MS = 60 * 1000;
const CV_URI = "/rj-cv-2025-02-18.pdf";
const MAIL_URI = "mailto:rjarram@me.com";
const GITHUB_URL = "https://github.com/metalogica";
const CALENDLY_URL = "https://calendly.com/rjarram/30min";

export type WindowId =
  | "terminal"
  | "about"
  | "socials"
  | "spotify"
  | "ideosphere"
  | "dreamtable";

const WINDOW_META: Record<WindowId, { label: string; icon: PixelIconName }> = {
  terminal: { label: "TERMINAL", icon: "terminal" },
  about: { label: "ABOUT", icon: "info" },
  socials: { label: "SOCIALS", icon: "share" },
  spotify: { label: "SPOTIFY", icon: "music" },
  ideosphere: { label: "IDEOSPHERE", icon: "globe" },
  dreamtable: { label: "DREAMTABLE", icon: "globe" },
};

interface TaskbarProps {
  openWindows: Record<WindowId, boolean>;
  onToggleWindow: (id: WindowId) => void;
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Taskbar({ openWindows, onToggleWindow }: TaskbarProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const interval = setInterval(tick, CLOCK_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const runningWindows = (
    Object.keys(WINDOW_META) as WindowId[]
  ).filter((id) => openWindows[id]);

  return (
    <div className="fixed bottom-0 inset-x-0 h-12 md:h-10 bg-pc98-face bevel-out font-bitmap flex items-center gap-1.5 px-1.5">
      <button
        type="button"
        onClick={() => onToggleWindow("terminal")}
        className="shrink-0 h-8 md:h-7 px-2 bevel-out active:bevel-in bg-pc98-face text-black text-sm flex items-center gap-1.5 cursor-pointer"
      >
        <PixelIcon name="terminal" size={20} />
        <span className="font-bold">REI</span>
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto">
        {runningWindows.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onToggleWindow(id)}
            className="shrink-0 h-8 md:h-7 px-2 bevel-in bg-pc98-face-lt text-black text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <PixelIcon name={WINDOW_META[id].icon} size={16} />
            <span className="hidden md:inline">{WINDOW_META[id].label}</span>
          </button>
        ))}
      </div>

      <div className="shrink-0 h-8 md:h-7 bevel-in px-2 flex items-center gap-2 text-black">
        <a href={MAIL_URI} aria-label="Email" className="flex items-center">
          <PixelIcon name="mail" size={18} />
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="flex items-center"
        >
          <PixelIcon name="github" size={18} />
        </a>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a call"
          className="flex items-center"
        >
          <PixelIcon name="calendar" size={18} />
        </a>
        <a
          href={CV_URI}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open CV"
          className="flex items-center md:hidden"
        >
          <PixelIcon name="document" size={18} />
        </a>
        <span className="text-sm tabular-nums select-none">{clock}</span>
      </div>
    </div>
  );
}
