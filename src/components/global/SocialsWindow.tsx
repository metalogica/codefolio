import type { JSX } from "react";
import RetroWindow from "./RetroWindow";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const DESKTOP_POSITION = { x: 300, y: 150 };
const DESKTOP_SIZE = { width: 550, height: 350 };

interface SocialsWindowProps {
  onClose: () => void;
}

interface SocialLink {
  name: string;
  icon: JSX.Element;
  url: string;
}

export default function SocialsWindow({ onClose }: SocialsWindowProps) {
  const socialLinks: SocialLink[] = [
    {
      name: "Instagram",
      icon: <FaInstagram size={48} />,
      url: "https://instagram.com/moreofthesame",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={48} />,
      url: "https://linkedin.com/in/reinova",
    },
    {
      name: "Twitter",
      icon: <FaXTwitter size={48} />,
      url: "https://twitter.com/0xmoreofthesame",
    },
  ];

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
