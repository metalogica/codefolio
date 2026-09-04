import type { JSX } from "react";
import RetroWindow from "./RetroWindow";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SOCIAL_LINKS } from "../../content/socials";
import { trackEvent } from "../../lib/analytics";

const DESKTOP_POSITION = { x: 300, y: 150 };
const DESKTOP_SIZE = { width: 550, height: 350 };

interface SocialsWindowProps {
  onClose: () => void;
}

const SOCIAL_ICONS: Record<string, JSX.Element> = {
  Instagram: <FaInstagram size={48} />,
  LinkedIn: <FaLinkedin size={48} />,
  Twitter: <FaXTwitter size={48} />,
};

export default function SocialsWindow({ onClose }: SocialsWindowProps) {
  const socialLinks = SOCIAL_LINKS.map((social) => ({
    ...social,
    icon: SOCIAL_ICONS[social.name],
  }));

  return (
    <RetroWindow
      title="A:\REI\SOCIALS.EXE"
      onClose={onClose}
      desktopPosition={DESKTOP_POSITION}
      desktopSize={DESKTOP_SIZE}
    >
      <div className="p-8 h-full flex items-center justify-center overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("social_click", { network: social.name })}
              className="flex flex-col items-center justify-center p-4 bevel-out active:bevel-in bg-pc98-face text-black hover:bg-pc98-title hover:text-white"
            >
              {social.icon}
              <span className="mt-3 text-sm font-bitmap">{social.name}</span>
            </a>
          ))}
        </div>
      </div>
    </RetroWindow>
  );
}
